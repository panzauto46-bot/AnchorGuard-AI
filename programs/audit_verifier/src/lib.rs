use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash;

declare_id!("AGrdVerify111111111111111111111111111111111");

#[program]
pub mod audit_verifier {
    use super::*;

    /// Publish an audit verification record on-chain.
    /// Anyone can verify a program has been audited by looking up the PDA.
    pub fn publish_audit(
        ctx: Context<PublishAudit>,
        program_name: String,
        audit_hash: [u8; 32],
        security_score: u8,
        total_issues: u16,
        critical_count: u8,
        high_count: u8,
        medium_count: u8,
    ) -> Result<()> {
        let record = &mut ctx.accounts.audit_record;

        record.auditor = ctx.accounts.auditor.key();
        record.audited_at = Clock::get()?.unix_timestamp;
        record.program_name = program_name;
        record.audit_hash = audit_hash;
        record.security_score = security_score;
        record.total_issues = total_issues;
        record.critical_count = critical_count;
        record.high_count = high_count;
        record.medium_count = medium_count;
        record.verified = true;
        record.bump = ctx.bumps.audit_record;

        emit!(AuditPublished {
            auditor: record.auditor,
            program_name: record.program_name.clone(),
            security_score,
            audit_hash,
            timestamp: record.audited_at,
        });

        msg!("🛡️ AnchorGuard: Audit verified on-chain! Score: {}/100", security_score);

        Ok(())
    }

    /// Revoke an audit (only the original auditor can do this)
    pub fn revoke_audit(ctx: Context<RevokeAudit>) -> Result<()> {
        let record = &mut ctx.accounts.audit_record;

        require!(
            record.auditor == ctx.accounts.auditor.key(),
            AuditError::Unauthorized
        );

        record.verified = false;

        emit!(AuditRevoked {
            auditor: record.auditor,
            program_name: record.program_name.clone(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

// ==========================================
// ACCOUNTS
// ==========================================

#[derive(Accounts)]
#[instruction(program_name: String)]
pub struct PublishAudit<'info> {
    #[account(
        init,
        payer = auditor,
        space = AuditRecord::SIZE,
        seeds = [
            b"audit",
            auditor.key().as_ref(),
            hash::hash(program_name.as_bytes()).to_bytes().as_ref()
        ],
        bump
    )]
    pub audit_record: Account<'info, AuditRecord>,

    #[account(mut)]
    pub auditor: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeAudit<'info> {
    #[account(mut, has_one = auditor)]
    pub audit_record: Account<'info, AuditRecord>,

    pub auditor: Signer<'info>,
}

// ==========================================
// STATE
// ==========================================

#[account]
pub struct AuditRecord {
    /// The wallet that performed the audit
    pub auditor: Pubkey,
    /// Unix timestamp of when the audit was published
    pub audited_at: i64,
    /// Name of the audited program
    pub program_name: String,
    /// SHA-256 hash of the full audit result JSON
    pub audit_hash: [u8; 32],
    /// Security score (0-100)
    pub security_score: u8,
    /// Total number of issues found
    pub total_issues: u16,
    /// Number of critical issues
    pub critical_count: u8,
    /// Number of high severity issues 
    pub high_count: u8,
    /// Number of medium severity issues
    pub medium_count: u8,
    /// Whether the audit is currently verified (can be revoked)
    pub verified: bool,
    /// PDA bump
    pub bump: u8,
}

impl AuditRecord {
    // 8 (discriminator) + 32 (pubkey) + 8 (i64) + 4+64 (string) + 32 (hash) + 1+2+1+1+1+1+1
    pub const SIZE: usize = 8 + 32 + 8 + (4 + 64) + 32 + 1 + 2 + 1 + 1 + 1 + 1 + 1;
}

// ==========================================
// EVENTS
// ==========================================

#[event]
pub struct AuditPublished {
    pub auditor: Pubkey,
    pub program_name: String,
    pub security_score: u8,
    pub audit_hash: [u8; 32],
    pub timestamp: i64,
}

#[event]
pub struct AuditRevoked {
    pub auditor: Pubkey,
    pub program_name: String,
    pub timestamp: i64,
}

// ==========================================
// ERRORS
// ==========================================

#[error_code]
pub enum AuditError {
    #[msg("Only the original auditor can revoke this record")]
    Unauthorized,
}
