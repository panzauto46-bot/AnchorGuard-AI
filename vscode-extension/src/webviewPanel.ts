import * as vscode from 'vscode';
import { AuditResult } from './auditService';

export class AuditResultPanel {
    public static currentPanel: AuditResultPanel | undefined;
    private static readonly viewType = 'anchorguardResults';

    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(
        extensionUri: vscode.Uri,
        result: AuditResult,
        fileName: string
    ) {
        const column = vscode.ViewColumn.Beside;

        if (AuditResultPanel.currentPanel) {
            AuditResultPanel.currentPanel._panel.reveal(column);
            AuditResultPanel.currentPanel._update(result, fileName);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            AuditResultPanel.viewType,
            `🛡️ AnchorGuard: ${fileName}`,
            column,
            { enableScripts: true, retainContextWhenHidden: true }
        );

        AuditResultPanel.currentPanel = new AuditResultPanel(panel, result, fileName);
    }

    private constructor(
        panel: vscode.WebviewPanel,
        result: AuditResult,
        fileName: string
    ) {
        this._panel = panel;
        this._update(result, fileName);

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    private _update(result: AuditResult, fileName: string) {
        this._panel.title = `🛡️ AnchorGuard: ${fileName}`;
        this._panel.webview.html = this._getHtml(result, fileName);
    }

    private _getHtml(result: AuditResult, fileName: string): string {
        const { summary } = result;
        const scoreColor = summary.securityScore >= 80 ? '#14F195' :
            summary.securityScore >= 50 ? '#EAB308' : '#EF4444';
        const riskLevel = summary.securityScore < 30 ? 'CRITICAL RISK' :
            summary.securityScore < 50 ? 'HIGH RISK' :
                summary.securityScore < 80 ? 'MODERATE RISK' : 'LOW RISK';

        const vulnCards = result.vulnerabilities.map((v, i) => {
            const sevColor = v.severity === 'critical' ? '#EF4444' :
                v.severity === 'high' ? '#F97316' :
                    v.severity === 'medium' ? '#EAB308' : '#14F195';
            const sevBg = v.severity === 'critical' ? 'rgba(239,68,68,0.1)' :
                v.severity === 'high' ? 'rgba(249,115,22,0.1)' :
                    v.severity === 'medium' ? 'rgba(234,179,8,0.1)' : 'rgba(20,241,149,0.1)';

            return `
                <div class="vuln-card" style="border-left: 3px solid ${sevColor};">
                    <div class="vuln-header">
                        <span class="vuln-num">#${i + 1}</span>
                        <span class="vuln-title">${v.title}</span>
                        <span class="vuln-sev" style="background:${sevBg};color:${sevColor}">${v.severity.toUpperCase()}</span>
                    </div>
                    <p class="vuln-desc">${v.description}</p>
                    <div class="vuln-meta">
                        <span>📂 ${v.category}</span>
                        <span>📍 Line ~${v.line}</span>
                        ${v.computeImpact ? `<span>⚡ ${v.computeImpact}</span>` : ''}
                    </div>
                    <div class="code-diff">
                        <div class="code-block bad">
                            <div class="code-label">❌ Vulnerable</div>
                            <pre>${this._escapeHtml(v.originalCode)}</pre>
                        </div>
                        <div class="code-block good">
                            <div class="code-label">✅ Fixed</div>
                            <pre>${this._escapeHtml(v.fixedCode)}</pre>
                        </div>
                    </div>
                    <div class="vuln-explain">💡 ${v.explanation}</div>
                </div>
            `;
        }).join('');

        const gasCards = (result.gasOptimizations || []).map(g => `
            <div class="gas-card">
                <div class="gas-title">⚡ ${g.title}</div>
                <div class="gas-saving">Saving: ${g.estimatedSaving}</div>
                <p class="gas-desc">${g.suggestion}</p>
            </div>
        `).join('');

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AnchorGuard AI Results</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #09090B;
            color: #E4E4E7;
            padding: 20px;
            line-height: 1.6;
        }
        .header {
            display: flex; align-items: center; gap: 12px;
            margin-bottom: 24px; padding-bottom: 16px;
            border-bottom: 1px solid #27272A;
        }
        .header h1 { font-size: 18px; color: #fff; }
        .header .file { font-size: 12px; color: #71717A; }
        .header .brand { color: #9945FF; font-size: 12px; }

        .summary {
            display: grid; grid-template-columns: auto 1fr; gap: 24px;
            background: #111113; border: 1px solid #27272A;
            border-radius: 12px; padding: 20px; margin-bottom: 24px;
        }
        .score-circle {
            width: 100px; height: 100px;
            border-radius: 50%; display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            border: 4px solid ${scoreColor};
            background: rgba(0,0,0,0.3);
        }
        .score-num { font-size: 32px; font-weight: 800; color: ${scoreColor}; }
        .score-label { font-size: 10px; color: #71717A; }

        .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .stat {
            display: flex; align-items: center; gap: 8px;
            padding: 8px 12px; border-radius: 8px;
            background: rgba(255,255,255,0.03);
        }
        .stat-num { font-size: 20px; font-weight: 700; }
        .stat-label { font-size: 10px; color: #71717A; }
        .stat.critical .stat-num { color: #EF4444; }
        .stat.high .stat-num { color: #F97316; }
        .stat.medium .stat-num { color: #EAB308; }
        .stat.safe .stat-num { color: #14F195; }
        .risk { font-size: 11px; font-weight: 600; color: ${scoreColor}; margin-top: 8px; }

        .section-title {
            font-size: 13px; font-weight: 700;
            text-transform: uppercase; letter-spacing: 1px;
            color: #71717A; margin: 24px 0 12px;
        }

        .vuln-card {
            background: #111113; border: 1px solid #27272A;
            border-radius: 10px; padding: 16px; margin-bottom: 12px;
        }
        .vuln-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .vuln-num { font-size: 11px; color: #71717A; font-weight: 600; }
        .vuln-title { font-size: 14px; font-weight: 600; color: #fff; flex: 1; }
        .vuln-sev {
            font-size: 10px; font-weight: 700; padding: 2px 8px;
            border-radius: 4px; text-transform: uppercase;
        }
        .vuln-desc { font-size: 12px; color: #A1A1AA; margin-bottom: 10px; }
        .vuln-meta { display: flex; gap: 16px; font-size: 11px; color: #71717A; margin-bottom: 12px; }
        .vuln-explain {
            font-size: 11px; color: #A1A1AA; padding: 10px;
            background: rgba(153,69,255,0.06); border-radius: 6px;
            border-left: 2px solid #9945FF;
        }

        .code-diff { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
        .code-block {
            border-radius: 8px; overflow: hidden; font-size: 11px;
        }
        .code-block.bad { background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.15); }
        .code-block.good { background: rgba(20,241,149,0.06); border: 1px solid rgba(20,241,149,0.15); }
        .code-label {
            font-size: 10px; font-weight: 600; padding: 4px 10px;
            background: rgba(0,0,0,0.2);
        }
        .code-block pre {
            padding: 8px 10px; font-family: 'JetBrains Mono', 'Fira Code', monospace;
            font-size: 11px; white-space: pre-wrap; word-break: break-all;
            color: #D4D4D8;
        }

        .gas-card {
            background: #111113; border: 1px solid #27272A; border-left: 3px solid #9945FF;
            border-radius: 10px; padding: 14px; margin-bottom: 10px;
        }
        .gas-title { font-size: 13px; font-weight: 600; color: #fff; }
        .gas-saving { font-size: 11px; color: #14F195; margin: 4px 0; }
        .gas-desc { font-size: 12px; color: #A1A1AA; }

        .footer {
            text-align: center; font-size: 10px; color: #52525B;
            margin-top: 32px; padding-top: 16px; border-top: 1px solid #27272A;
        }
        .footer a { color: #9945FF; text-decoration: none; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛡️ AnchorGuard AI</h1>
        <span class="brand">Security Audit Report</span>
        <span class="file">${fileName}</span>
    </div>

    <div class="summary">
        <div class="score-circle">
            <span class="score-num">${summary.securityScore}</span>
            <span class="score-label">/ 100</span>
        </div>
        <div>
            <div class="stats">
                <div class="stat critical"><div><div class="stat-num">${summary.critical}</div><div class="stat-label">Critical</div></div></div>
                <div class="stat high"><div><div class="stat-num">${summary.high}</div><div class="stat-label">High</div></div></div>
                <div class="stat medium"><div><div class="stat-num">${summary.medium}</div><div class="stat-label">Medium</div></div></div>
                <div class="stat safe"><div><div class="stat-num">${summary.safe}</div><div class="stat-label">Safe</div></div></div>
            </div>
            <div class="risk">${riskLevel} — ${summary.totalIssues} total issues</div>
        </div>
    </div>

    <div class="section-title">🔍 Vulnerabilities (${result.vulnerabilities.length})</div>
    ${vulnCards || '<p style="color:#71717A;font-size:13px;">No vulnerabilities detected! ✅</p>'}

    ${gasCards ? `<div class="section-title">⚡ Compute Optimizations</div>${gasCards}` : ''}

    <div class="footer">
        Report generated by <a href="https://anchor-guard-ai.vercel.app">AnchorGuard AI</a> — The AI-Powered Reasoning Auditor for Solana
    </div>
</body>
</html>`;
    }

    private _escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    public dispose() {
        AuditResultPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const d = this._disposables.pop();
            if (d) d.dispose();
        }
    }
}
