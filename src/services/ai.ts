import { Groq } from 'groq-sdk';
import type { AuditResult } from '../types';

// ==========================================
// GROQ CLIENT — Primary AI Engine (FREE)
// ==========================================
const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

// Active model: llama-3.3-70b-versatile (replacement for deprecated llama3-70b-8192)
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// ==========================================
// DEEPSEEK CLIENT — Alternative Brain (FREE)
// Uses OpenAI-compatible API format
// ==========================================
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';

// 1. SPEED LAYER: Groq for Visual Thinking Trace
export async function generateThinkingTrace(code: string): Promise<string[]> {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are the kernel of a Solana Audit AI. Your job is to output 6-8 short, technical, 'hacker-style' log lines describing the security checks you are performing on the provided Rust code. The code may contain MULTIPLE programs separated by file markers like '// === FILE: name ==='. If multiple programs are detected, include cross-program analysis steps. Do NOT find bugs yet. Just describe the scan process. Examples: 'Parsing Anchor macros...', 'Verifying Signer constraints...', 'Checking arithmetic overflows...', 'Scanning for reentrancy...', 'Validating PDA seeds...', 'Analyzing cross-program invocations...', 'Checking shared PDA ownership...'. Output ONLY the lines, separated by newlines."
                },
                { role: "user", content: code }
            ],
            model: GROQ_MODEL,
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

// ==========================================
// AUDIT PROMPT (shared between engines)
// ==========================================
const buildAuditPrompt = (code: string) => `You are an elite Solana Smart Contract Security Auditor.
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

Return ONLY raw JSON. No markdown formatting. No explanation outside the JSON.

CODE TO AUDIT:
${code}`;

// ==========================================
// 2A. BRAIN LAYER: DeepSeek V3 (Primary — smarter)
// ==========================================
async function auditWithDeepSeek(code: string): Promise<AuditResult> {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                {
                    role: "system",
                    content: "You are a Solana security auditor. Respond with ONLY valid JSON matching the requested interface. No markdown, no code blocks, no explanation — just raw JSON."
                },
                {
                    role: "user",
                    content: buildAuditPrompt(code)
                }
            ],
            temperature: 0.3,
            max_tokens: 4096,
            response_format: { type: "json_object" },
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} — ${err}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString) as AuditResult;
}

// ==========================================
// 2B. BRAIN LAYER: Groq (Fallback — faster)
// ==========================================
async function auditWithGroq(code: string): Promise<AuditResult> {
    const completion = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are a Solana security auditor. Respond with ONLY valid JSON matching the requested interface. No markdown, no code blocks — just raw JSON."
            },
            {
                role: "user",
                content: buildAuditPrompt(code)
            }
        ],
        model: GROQ_MODEL,
        temperature: 0.3,
        max_tokens: 4096,
        response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content || "";
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString) as AuditResult;
}

// ==========================================
// MAIN AUDIT FUNCTION — Auto-fallback
// DeepSeek (smarter) → Groq (fallback)
// ==========================================
export async function auditSmartContract(code: string): Promise<AuditResult> {
    // Try DeepSeek first (smarter), fallback to Groq (faster)
    if (DEEPSEEK_API_KEY) {
        try {
            console.log('🧠 Using DeepSeek V3 for deep audit...');
            return await auditWithDeepSeek(code);
        } catch (error: any) {
            console.warn('⚠️ DeepSeek failed, falling back to Groq:', error.message);
        }
    }

    // Fallback: Groq
    try {
        console.log('⚡ Using Groq for deep audit...');
        return await auditWithGroq(code);
    } catch (error: any) {
        console.error("Groq Audit Error:", error);
        const detail = error?.message || 'Unknown error';
        throw new Error(`Failed to perform deep audit: ${detail}`);
    }
}
