import { Groq } from 'groq-sdk';
import type { AuditResult } from '../types';

// Initialize Groq Client — FREE, fast, handles everything
const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

// 1. SPEED LAYER: Groq (Llama 3 70B) for Visual Thinking Trace
export async function generateThinkingTrace(code: string): Promise<string[]> {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are the kernel of a Solana Audit AI. Your job is to output 6-8 short, technical, 'hacker-style' log lines describing the security checks you are performing on the provided Rust code. The code may contain MULTIPLE programs separated by file markers like '// === FILE: name ==='. If multiple programs are detected, include cross-program analysis steps. Do NOT find bugs yet. Just describe the scan process. Examples: 'Parsing Anchor macros...', 'Verifying Signer constraints...', 'Checking arithmetic overflows...', 'Scanning for reentrancy...', 'Validating PDA seeds...', 'Analyzing cross-program invocations...', 'Checking shared PDA ownership...'. Output ONLY the lines, separated by newlines."
                },
                {
                    role: "user",
                    content: code
                }
            ],
            model: "llama3-70b-8192",
            temperature: 0.5,
            max_tokens: 200,
        });

        const text = completion.choices[0]?.message?.content || "";
        return text.split('\n').filter(line => line.trim().length > 0);
    } catch (error) {
        console.error("Groq Thinking Error:", error);
        return [
            "Initializing static analysis engine...",
            "Parsing AST structure...",
            "Checking access control constraints...",
            "Verifying account ownership...",
            "Scanning for arithmetic vulnerabilities...",
            "Analyzing CPI calls...",
            "Finalizing security report..."
        ];
    }
}

// 2. BRAIN LAYER: Groq (Llama 3 70B) for Deep Security Audit
export async function auditSmartContract(code: string): Promise<AuditResult> {
    const prompt = `You are an elite Solana Smart Contract Security Auditor.
Analyze the following Anchor/Rust code for security vulnerabilities.

IMPORTANT: The code may contain MULTIPLE programs separated by file markers like:
// === FILE: program_name.rs ===
If multiple programs are present, you MUST also analyze:
- Cross-Program Invocation (CPI) security
- Shared PDA seed conflicts between programs
- Authority/ownership mismatches across programs
- Token account validation across program boundaries

Focus on:
1. Missing Signer checks
2. Missing Owner/Authority checks (has_one)
3. Integer Overflow/Underflow
4. PDA Validation (seeds, bump)
5. Reentrancy
6. Unchecked AccountInfo usage
7. Cross-Program Invocation vulnerabilities (if multiple programs)

Output a JSON object perfectly matching this TypeScript interface:

interface AuditResult {
  vulnerabilities: {
    id: string; // e.g., "vuln-1"
    severity: 'critical' | 'high' | 'medium' | 'safe';
    title: string;
    description: string;
    line: number; // Approximate line number
    category: string;
    originalCode: string; // The specific lines of buggy code
    fixedCode: string; // The corrected code
    explanation: string;
    computeImpact?: string; // e.g., "+200 CU"
  }[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    safe: number;
    totalIssues: number;
    securityScore: number; // 0-100
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

Return ONLY raw JSON. No markdown formatting. No explanation outside the JSON.

CODE TO AUDIT:
${code}`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a Solana security auditor. You MUST respond with ONLY valid JSON matching the requested interface. No markdown, no explanation, no code blocks — just raw JSON."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama3-70b-8192",
            temperature: 0.3,
            max_tokens: 4096,
            response_format: { type: "json_object" },
        });

        const text = completion.choices[0]?.message?.content || "";

        // Clean up just in case
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonString) as AuditResult;
    } catch (error: any) {
        console.error("Groq Audit Error:", error);
        const detail = error?.message || 'Unknown error';
        throw new Error(`Failed to perform deep audit: ${detail}`);
    }
}
