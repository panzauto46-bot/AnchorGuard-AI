import * as vscode from 'vscode';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface Vulnerability {
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'safe';
    title: string;
    description: string;
    line: number;
    category: string;
    originalCode: string;
    fixedCode: string;
    explanation: string;
    computeImpact?: string;
}

export interface AuditResult {
    vulnerabilities: Vulnerability[];
    summary: {
        critical: number;
        high: number;
        medium: number;
        safe: number;
        totalIssues: number;
        securityScore: number;
        computeOptimizations: number;
    };
    gasOptimizations: {
        id: string;
        title: string;
        description: string;
        estimatedSaving: string;
        suggestion: string;
    }[];
}

export class AuditService {
    private outputChannel: vscode.OutputChannel;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
    }

    // Speed Layer: Groq Llama 3 for thinking trace
    async generateThinkingTrace(code: string, apiKey: string): Promise<string[]> {
        try {
            const groq = new Groq({ apiKey });

            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: `You are the kernel of a Solana Audit AI. Output 6-8 short, technical log lines describing the security checks being performed. The code may contain MULTIPLE programs separated by file markers. If multiple programs are detected, include cross-program analysis. Do NOT find bugs yet. Just describe the scan. Output ONLY lines separated by newlines.`
                    },
                    { role: 'user', content: code }
                ],
                model: 'llama3-70b-8192',
                temperature: 0.5,
                max_tokens: 200,
            });

            const text = completion.choices[0]?.message?.content || '';
            return text.split('\n').filter(line => line.trim().length > 0);
        } catch (error) {
            this.outputChannel.appendLine(`⚠️ Groq thinking trace failed, using fallback.`);
            return [
                'Initializing static analysis engine...',
                'Parsing AST structure...',
                'Checking access control constraints...',
                'Verifying account ownership...',
                'Scanning for arithmetic vulnerabilities...',
                'Analyzing CPI calls...',
                'Finalizing security report...',
            ];
        }
    }

    // Brain Layer: Gemini 1.5 Pro for deep audit
    async auditSmartContract(code: string, apiKey: string): Promise<AuditResult> {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `
        You are an elite Solana Smart Contract Security Auditor.
        Analyze the following Anchor/Rust code for security vulnerabilities.

        IMPORTANT: The code may contain MULTIPLE programs separated by file markers like:
        // === FILE: program_name.rs ===
        If multiple programs are present, also analyze cross-program invocation security.

        Focus on:
        1. Missing Signer checks
        2. Missing Owner/Authority checks (has_one)
        3. Integer Overflow/Underflow
        4. PDA Validation (seeds, bump)
        5. Reentrancy
        6. Unchecked AccountInfo usage
        7. Cross-Program Invocation vulnerabilities (if multiple programs)

        Output a JSON object matching this interface:

        interface AuditResult {
          vulnerabilities: {
            id: string;
            severity: 'critical' | 'high' | 'medium' | 'safe';
            title: string;
            description: string;
            line: number;
            category: string;
            originalCode: string;
            fixedCode: string;
            explanation: string;
            computeImpact?: string;
          }[];
          summary: {
            critical: number;
            high: number;
            medium: number;
            safe: number;
            totalIssues: number;
            securityScore: number;
            computeOptimizations: number;
          };
          gasOptimizations: {
            id: string;
            title: string;
            description: string;
            estimatedSaving: string;
            suggestion: string;
          }[];
        }

        Return ONLY raw JSON. No markdown formatting.

        CODE TO AUDIT:
        ${code}
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonString) as AuditResult;
        } catch (error: any) {
            throw new Error(`Gemini audit failed: ${error.message}`);
        }
    }
}
