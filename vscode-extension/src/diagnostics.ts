import * as vscode from 'vscode';
import { Vulnerability } from './auditService';

export class DiagnosticsManager implements vscode.Disposable {
    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('anchorguard');
    }

    updateDiagnostics(
        uri: vscode.Uri,
        vulnerabilities: Vulnerability[],
        severityFilter: string = 'all'
    ) {
        const diagnostics: vscode.Diagnostic[] = [];

        const filteredVulns = vulnerabilities.filter(v => {
            if (severityFilter === 'all') return true;
            if (severityFilter === 'critical') return v.severity === 'critical';
            if (severityFilter === 'high') return v.severity === 'critical' || v.severity === 'high';
            if (severityFilter === 'medium') return v.severity !== 'safe';
            return true;
        });

        for (const vuln of filteredVulns) {
            const line = Math.max(0, vuln.line - 1); // VS Code is 0-indexed
            const range = new vscode.Range(line, 0, line, Number.MAX_VALUE);

            const severity = this.mapSeverity(vuln.severity);
            const diagnostic = new vscode.Diagnostic(range, vuln.description, severity);

            diagnostic.source = 'AnchorGuard AI';
            diagnostic.code = {
                value: vuln.id,
                target: vscode.Uri.parse('https://anchor-guard-ai.vercel.app')
            };

            // Add related information
            if (vuln.explanation) {
                diagnostic.relatedInformation = [
                    new vscode.DiagnosticRelatedInformation(
                        new vscode.Location(uri, range),
                        `💡 Fix: ${vuln.explanation}`
                    )
                ];
            }

            diagnostics.push(diagnostic);
        }

        this.diagnosticCollection.set(uri, diagnostics);
    }

    private mapSeverity(severity: string): vscode.DiagnosticSeverity {
        switch (severity) {
            case 'critical': return vscode.DiagnosticSeverity.Error;
            case 'high': return vscode.DiagnosticSeverity.Error;
            case 'medium': return vscode.DiagnosticSeverity.Warning;
            case 'safe': return vscode.DiagnosticSeverity.Information;
            default: return vscode.DiagnosticSeverity.Information;
        }
    }

    clear() {
        this.diagnosticCollection.clear();
    }

    dispose() {
        this.diagnosticCollection.dispose();
    }
}
