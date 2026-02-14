import type { ThinkingStep, AuditResult, Vulnerability, GasOptimization } from '../types';

const THINKING_STEPS: Omit<ThinkingStep, 'id' | 'timestamp'>[] = [
  { text: "🔄 Initializing AnchorGuard AI reasoning engine...", type: 'info' },
  { text: "📦 Parsing Anchor program structure...", type: 'info' },
  { text: "🔍 Detected program: vulnerable_vault", type: 'info' },
  { text: "📋 Found 4 instructions: initialize, deposit, withdraw, update_authority", type: 'info' },
  { text: "🧬 Analyzing #[derive(Accounts)] structs...", type: 'thinking' },
  { text: "✅ Initialize struct: Signer constraint found on authority — OK", type: 'success' },
  { text: "✅ Deposit struct: Signer constraint found on user — OK", type: 'success' },
  { text: "⚠️ Withdraw struct: 'user' is AccountInfo without Signer constraint!", type: 'warning' },
  { text: "🧠 REASONING: In withdraw(), ctx.accounts.user is typed as AccountInfo<'info> not Signer<'info>. This means ANY account can be passed as the recipient without signature verification. An attacker can drain the vault by passing their own account as 'user'.", type: 'error' },
  { text: "🔴 CRITICAL — Missing Signer Check on Withdraw (CWE-285: Improper Authorization)", type: 'error' },
  { text: "🔍 Analyzing arithmetic operations...", type: 'thinking' },
  { text: "📍 Line 20: vault.balance = vault.balance + amount", type: 'info' },
  { text: "⚠️ Potential integer overflow detected — no checked_add() used", type: 'warning' },
  { text: "📍 Line 42: vault.balance = vault.balance - amount", type: 'info' },
  { text: "⚠️ Potential integer underflow detected — no checked_sub() or balance >= amount check", type: 'warning' },
  { text: "🧠 REASONING: Rust in release mode does NOT panic on overflow. u64 overflow wraps around, meaning an attacker could deposit max_value and cause balance to wrap to a very large number, or withdraw more than deposited causing underflow.", type: 'error' },
  { text: "🟠 HIGH — Integer Overflow/Underflow Risk (CWE-190)", type: 'error' },
  { text: "🔍 Analyzing update_authority instruction...", type: 'thinking' },
  { text: "📍 Checking constraint: has_one or constraint macro for authority validation...", type: 'info' },
  { text: "⚠️ No has_one = authority constraint on vault account in UpdateAuthority struct!", type: 'warning' },
  { text: "🧠 REASONING: Although 'authority' is a Signer, there's no constraint verifying that the signer matches vault.authority. Any signer can call update_authority and take ownership of the vault. The #[account(mut)] on vault needs has_one = authority.", type: 'error' },
  { text: "🔴 CRITICAL — Missing Authority Validation (CWE-862: Missing Authorization)", type: 'error' },
  { text: "🔍 Scanning for Reentrancy patterns...", type: 'thinking' },
  { text: "📍 In withdraw(): State update (balance -= amount) happens BEFORE lamport transfer", type: 'info' },
  { text: "✅ State-before-transfer pattern detected — Reentrancy safe", type: 'success' },
  { text: "🔍 Checking PDA derivation and bump seeds...", type: 'thinking' },
  { text: "⚠️ Vault account in Withdraw has no seeds/bump constraint for PDA validation", type: 'warning' },
  { text: "🟡 MEDIUM — Missing PDA Validation on vault_account", type: 'warning' },
  { text: "⚡ Analyzing Compute Unit efficiency...", type: 'thinking' },
  { text: "💡 Vault struct is 41 bytes — small enough, Zero-Copy not needed", type: 'info' },
  { text: "💡 Suggestion: Use require!() macro instead of manual checks for cleaner error handling", type: 'info' },
  { text: "💡 Suggestion: Consider using checked_add/checked_sub to avoid unsafe arithmetic", type: 'info' },
  { text: "🏁 Audit complete. Found 2 CRITICAL, 1 HIGH, 1 MEDIUM vulnerabilities.", type: 'error' },
];

const VULNERABILITIES: Vulnerability[] = [
  {
    id: 'vuln-001',
    severity: 'critical',
    title: 'Missing Signer Check on Withdraw',
    description: 'The withdraw function accepts an unchecked AccountInfo for the user parameter. Any account can be passed as the withdrawal recipient without requiring a signature, allowing unauthorized fund extraction.',
    line: 38,
    category: 'Access Control',
    originalCode: `#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    /// CHECK: No validation
    pub user: AccountInfo<'info>,
    /// CHECK: Vault PDA
    #[account(mut)]
    pub vault_account: AccountInfo<'info>,
}`,
    fixedCode: `#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        has_one = authority,
        constraint = vault.balance >= amount @ ErrorCode::InsufficientFunds
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub authority: Signer<'info>,  // Changed to Signer
    /// CHECK: Vault PDA with proper seeds
    #[account(
        mut,
        seeds = [b"vault", authority.key().as_ref()],
        bump = vault.bump
    )]
    pub vault_account: AccountInfo<'info>,
}`,
    explanation: 'Changed user from AccountInfo to Signer type, added has_one = authority constraint on vault account, and added PDA seed validation. This ensures only the vault authority can initiate withdrawals.',
    computeImpact: 'Minimal CU increase (~200 CU) for signature verification',
  },
  {
    id: 'vuln-002',
    severity: 'critical',
    title: 'Missing Authority Validation on Update',
    description: 'The update_authority function has no constraint verifying that the signer is the current vault authority. Any signer can change the authority and take ownership of the vault.',
    line: 50,
    category: 'Access Control',
    originalCode: `#[derive(Accounts)]
pub struct UpdateAuthority<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    pub authority: Signer<'info>,
}`,
    fixedCode: `#[derive(Accounts)]
pub struct UpdateAuthority<'info> {
    #[account(
        mut,
        has_one = authority @ ErrorCode::Unauthorized
    )]
    pub vault: Account<'info, Vault>,
    pub authority: Signer<'info>,
}`,
    explanation: 'Added has_one = authority constraint to verify the signer matches the stored vault authority. This prevents unauthorized authority transfers.',
    computeImpact: 'Negligible CU increase (~100 CU) for constraint check',
  },
  {
    id: 'vuln-003',
    severity: 'high',
    title: 'Integer Overflow/Underflow on Balance Operations',
    description: 'Both deposit and withdraw use unchecked arithmetic (+ and -) on the balance field. In Rust release builds, these operations wrap around on overflow/underflow without panicking.',
    line: 20,
    category: 'Arithmetic Safety',
    originalCode: `// In deposit:
vault.balance = vault.balance + amount;

// In withdraw:
vault.balance = vault.balance - amount;`,
    fixedCode: `// In deposit:
vault.balance = vault.balance
    .checked_add(amount)
    .ok_or(ErrorCode::Overflow)?;

// In withdraw:
require!(vault.balance >= amount, ErrorCode::InsufficientFunds);
vault.balance = vault.balance
    .checked_sub(amount)
    .ok_or(ErrorCode::Underflow)?;`,
    explanation: 'Use checked_add() and checked_sub() which return None on overflow/underflow, and add explicit balance validation before withdrawal. Define custom error codes for better debugging.',
    computeImpact: 'Minimal CU increase (~50 CU) for safe math operations',
  },
  {
    id: 'vuln-004',
    severity: 'medium',
    title: 'Missing PDA Validation on Vault Account',
    description: 'The vault_account in Deposit and Withdraw structs lacks seeds/bump constraints for PDA derivation validation. A malicious account could be substituted.',
    line: 75,
    category: 'Account Validation',
    originalCode: `/// CHECK: Vault PDA account
#[account(mut)]
pub vault_account: AccountInfo<'info>,`,
    fixedCode: `/// CHECK: Vault PDA account with seed validation
#[account(
    mut,
    seeds = [b"vault", user.key().as_ref()],
    bump
)]
pub vault_account: AccountInfo<'info>,`,
    explanation: 'Added seeds and bump constraints to ensure the vault_account is derived from the expected PDA. This prevents account substitution attacks.',
    computeImpact: 'Adds ~300 CU for PDA derivation check',
  },
];

const GAS_OPTIMIZATIONS: GasOptimization[] = [
  {
    id: 'gas-001',
    title: 'Use require!() Macro for Validation',
    description: 'Replace manual if/else error handling with Anchor\'s require!() macro for cleaner and more gas-efficient validation.',
    estimatedSaving: '~100-200 CU per check',
    suggestion: 'require!(vault.balance >= amount, ErrorCode::InsufficientFunds);',
  },
  {
    id: 'gas-002',
    title: 'Minimize Account Reallocations',
    description: 'The Vault struct space allocation (8 + 32 + 8 + 1 = 49 bytes) is correctly sized. No wasted space detected.',
    estimatedSaving: 'Already optimal',
    suggestion: 'Current space allocation is efficient. No changes needed.',
  },
  {
    id: 'gas-003',
    title: 'Consider Using Events for Tracking',
    description: 'Add emit!() events for deposit/withdraw operations to enable off-chain indexing without on-chain storage costs.',
    estimatedSaving: '~500 CU saved vs. storing logs on-chain',
    suggestion: `#[event]\npub struct DepositEvent {\n    pub user: Pubkey,\n    pub amount: u64,\n    pub timestamp: i64,\n}`,
  },
];

export function getThinkingSteps(): ThinkingStep[] {
  const now = new Date();
  return THINKING_STEPS.map((step, i) => ({
    ...step,
    id: i,
    timestamp: new Date(now.getTime() + i * 800).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  }));
}

export function getAuditResult(): AuditResult {
  return {
    vulnerabilities: VULNERABILITIES,
    summary: {
      critical: VULNERABILITIES.filter(v => v.severity === 'critical').length,
      high: VULNERABILITIES.filter(v => v.severity === 'high').length,
      medium: VULNERABILITIES.filter(v => v.severity === 'medium').length,
      safe: 0,
      totalIssues: VULNERABILITIES.length,
      securityScore: 25,
      computeOptimizations: GAS_OPTIMIZATIONS.length,
    },
    gasOptimizations: GAS_OPTIMIZATIONS,
  };
}
