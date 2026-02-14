import * as vscode from 'vscode';
import { AuditService } from './auditService';
import { DiagnosticsManager } from './diagnostics';
import { AuditResultPanel } from './webviewPanel';

let auditService: AuditService;
let diagnosticsManager: DiagnosticsManager;
let statusBarItem: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    // Initialize services
    outputChannel = vscode.window.createOutputChannel('AnchorGuard AI');
    auditService = new AuditService(outputChannel);
    diagnosticsManager = new DiagnosticsManager();

    // Status bar
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(shield) AnchorGuard';
    statusBarItem.tooltip = 'Click to audit current file';
    statusBarItem.command = 'anchorguard.auditFile';
    context.subscriptions.push(statusBarItem);

    // Show status bar for Rust files
    const updateStatusBar = () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'rust') {
            statusBarItem.show();
        } else {
            statusBarItem.hide();
        }
    };
    updateStatusBar();
    vscode.window.onDidChangeActiveTextEditor(updateStatusBar, null, context.subscriptions);

    // ==========================================
    // COMMAND: Audit Current File
    // ==========================================
    const auditFileCmd = vscode.commands.registerCommand('anchorguard.auditFile', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found.');
            return;
        }

        const code = editor.document.getText();
        const fileName = editor.document.fileName.split(/[/\\]/).pop() || 'unknown.rs';

        await runAudit(context, code, fileName, editor.document.uri);
    });

    // ==========================================
    // COMMAND: Audit Selection
    // ==========================================
    const auditSelectionCmd = vscode.commands.registerCommand('anchorguard.auditSelection', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.selection.isEmpty) {
            vscode.window.showWarningMessage('Please select code to audit.');
            return;
        }

        const code = editor.document.getText(editor.selection);
        const fileName = editor.document.fileName.split(/[/\\]/).pop() || 'selection.rs';

        await runAudit(context, code, `${fileName} (selection)`, editor.document.uri);
    });

    // ==========================================
    // COMMAND: Audit All Workspace Anchor Programs
    // ==========================================
    const auditWorkspaceCmd = vscode.commands.registerCommand('anchorguard.auditWorkspace', async () => {
        const rustFiles = await vscode.workspace.findFiles('**/programs/**/*.rs', '**/target/**');

        if (rustFiles.length === 0) {
            vscode.window.showWarningMessage('No Anchor program files found in workspace.');
            return;
        }

        const allCode: string[] = [];
        for (const file of rustFiles) {
            const doc = await vscode.workspace.openTextDocument(file);
            const name = file.path.split('/').pop() || 'unknown.rs';
            allCode.push(`// === FILE: ${name} ===\n${doc.getText()}`);
        }

        const combinedCode = allCode.join('\n\n');
        await runAudit(context, combinedCode, `Workspace (${rustFiles.length} files)`);
    });

    // ==========================================
    // COMMAND: Clear Diagnostics
    // ==========================================
    const clearDiagCmd = vscode.commands.registerCommand('anchorguard.clearDiagnostics', () => {
        diagnosticsManager.clear();
        vscode.window.showInformationMessage('AnchorGuard diagnostics cleared.');
    });

    // ==========================================
    // COMMAND: Open Web Dashboard
    // ==========================================
    const openDashboardCmd = vscode.commands.registerCommand('anchorguard.openDashboard', () => {
        vscode.env.openExternal(vscode.Uri.parse('https://anchor-guard-ai.vercel.app'));
    });

    // ==========================================
    // AUTO AUDIT ON SAVE
    // ==========================================
    const onSaveListener = vscode.workspace.onDidSaveTextDocument(async (doc) => {
        const config = vscode.workspace.getConfiguration('anchorguard');
        if (config.get('autoAuditOnSave') && doc.languageId === 'rust') {
            const code = doc.getText();
            const fileName = doc.fileName.split(/[/\\]/).pop() || 'unknown.rs';
            await runAudit(context, code, fileName, doc.uri);
        }
    });

    context.subscriptions.push(
        auditFileCmd,
        auditSelectionCmd,
        auditWorkspaceCmd,
        clearDiagCmd,
        openDashboardCmd,
        onSaveListener,
        diagnosticsManager
    );

    outputChannel.appendLine('🛡️ AnchorGuard AI extension activated!');
    outputChannel.appendLine('   Use Ctrl+Shift+A (Cmd+Shift+A on Mac) to audit Rust files.');
}

// ==========================================
// CORE AUDIT RUNNER
// ==========================================
async function runAudit(
    context: vscode.ExtensionContext,
    code: string,
    fileName: string,
    documentUri?: vscode.Uri
) {
    // Check API keys
    const config = vscode.workspace.getConfiguration('anchorguard');
    const groqKey = config.get<string>('groqApiKey');
    const deepseekKey = config.get<string>('deepseekApiKey');

    if (!deepseekKey) {
        const action = await vscode.window.showErrorMessage(
            'AnchorGuard: DeepSeek API Key is required for deep audit.',
            'Open Settings'
        );
        if (action === 'Open Settings') {
            vscode.commands.executeCommand('workbench.action.openSettings', 'anchorguard.deepseekApiKey');
        }
        return;
    }

    // Update status bar
    statusBarItem.text = '$(loading~spin) Auditing...';
    statusBarItem.tooltip = `Auditing ${fileName}...`;

    try {
        // Phase 1: Thinking Trace (Groq)
        const showThinking = config.get<boolean>('showThinkingProcess', true);

        if (groqKey && showThinking) {
            outputChannel.show(true);
            outputChannel.appendLine(`\n${'═'.repeat(60)}`);
            outputChannel.appendLine(`🛡️ AnchorGuard AI — Auditing: ${fileName}`);
            outputChannel.appendLine(`${'═'.repeat(60)}`);
            outputChannel.appendLine('⏳ Phase 1: AI Thinking Trace (Groq Llama 3)...\n');

            const thoughts = await auditService.generateThinkingTrace(code, groqKey);
            thoughts.forEach(t => outputChannel.appendLine(`  🔍 ${t}`));

            outputChannel.appendLine('\n✅ Thinking complete. Starting deep audit...\n');
        }

        // Phase 2: Deep Audit (DeepSeek V3)
        if (showThinking) {
            outputChannel.appendLine('⏳ Phase 2: Deep Security Audit (DeepSeek V3)...\n');
        }

        const result = await auditService.auditSmartContract(code, deepseekKey);

        // Update diagnostics
        if (documentUri) {
            const severityFilter = config.get<string>('severityFilter', 'all');
            diagnosticsManager.updateDiagnostics(documentUri, result.vulnerabilities, severityFilter);
        }

        // Show results panel
        AuditResultPanel.createOrShow(context.extensionUri, result, fileName);

        // Output summary
        if (showThinking) {
            outputChannel.appendLine(`\n${'─'.repeat(40)}`);
            outputChannel.appendLine(`📊 AUDIT SUMMARY`);
            outputChannel.appendLine(`   Security Score: ${result.summary.securityScore}/100`);
            outputChannel.appendLine(`   🔴 Critical: ${result.summary.critical}`);
            outputChannel.appendLine(`   🟠 High: ${result.summary.high}`);
            outputChannel.appendLine(`   🟡 Medium: ${result.summary.medium}`);
            outputChannel.appendLine(`   🟢 Safe: ${result.summary.safe}`);
            outputChannel.appendLine(`   Total Issues: ${result.summary.totalIssues}`);
            outputChannel.appendLine(`${'─'.repeat(40)}\n`);
        }

        // Status bar update
        const icon = result.summary.securityScore >= 80 ? '$(pass)' :
            result.summary.securityScore >= 50 ? '$(warning)' : '$(error)';
        statusBarItem.text = `${icon} Score: ${result.summary.securityScore}`;
        statusBarItem.tooltip = `AnchorGuard: ${result.summary.totalIssues} issues found`;

        // Notification
        const severity = result.summary.critical > 0 ? 'Critical' :
            result.summary.high > 0 ? 'High' : 'Low';

        if (result.summary.critical > 0 || result.summary.high > 0) {
            vscode.window.showWarningMessage(
                `AnchorGuard: ${severity} vulnerabilities found! Score: ${result.summary.securityScore}/100 (${result.summary.totalIssues} issues)`,
                'View Details'
            ).then(action => {
                if (action === 'View Details') {
                    AuditResultPanel.createOrShow(context.extensionUri, result, fileName);
                }
            });
        } else {
            vscode.window.showInformationMessage(
                `AnchorGuard: Audit complete. Score: ${result.summary.securityScore}/100 ✅`
            );
        }

    } catch (error: any) {
        statusBarItem.text = '$(shield) AnchorGuard';
        outputChannel.appendLine(`\n❌ ERROR: ${error.message}`);
        vscode.window.showErrorMessage(`AnchorGuard audit failed: ${error.message}`);
    }
}

export function deactivate() {
    diagnosticsManager?.dispose();
}
