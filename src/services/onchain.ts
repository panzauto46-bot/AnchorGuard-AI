import { Connection, PublicKey, SystemProgram, clusterApiUrl } from '@solana/web3.js';
import type { AuditResult } from '../types';

// Program ID (placeholder — replace after deploying to devnet)
const PROGRAM_ID = new PublicKey('AGrdVerify111111111111111111111111111111111');

// Default to DEVNET (FREE — no real SOL needed!)
const NETWORK = clusterApiUrl('devnet');

/**
 * Generate a SHA-256 hash of the audit result for on-chain storage.
 */
export async function hashAuditResult(result: AuditResult): Promise<Uint8Array> {
    const json = JSON.stringify(result);
    const encoded = new TextEncoder().encode(json);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    return new Uint8Array(hashBuffer);
}

/**
 * Derive the PDA address for an audit record.
 */
export function deriveAuditPDA(
    auditorPubkey: PublicKey,
    programName: string
): [PublicKey, number] {
    const nameHash = hashStringSync(programName);
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from('audit'),
            auditorPubkey.toBuffer(),
            nameHash,
        ],
        PROGRAM_ID
    );
}

/**
 * Simple sync string hash (for PDA derivation).
 */
function hashStringSync(str: string): Buffer {
    // Use a simple hash for PDA seeds
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data[i];
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    // Pad to 32 bytes
    const buf = Buffer.alloc(32);
    buf.writeInt32BE(hash, 0);
    for (let i = 4; i < 32; i++) {
        buf[i] = data[i % data.length] || 0;
    }
    return buf;
}

/**
 * Check if an audit record exists on-chain.
 */
export async function checkAuditOnChain(
    auditorPubkey: PublicKey,
    programName: string
): Promise<OnChainAuditRecord | null> {
    try {
        const connection = new Connection(NETWORK, 'confirmed');
        const [pda] = deriveAuditPDA(auditorPubkey, programName);
        const accountInfo = await connection.getAccountInfo(pda);

        if (!accountInfo || !accountInfo.data) {
            return null;
        }

        return parseAuditRecord(accountInfo.data);
    } catch {
        return null;
    }
}

/**
 * Request free Devnet SOL (airdrop).
 * This is completely free — for testing/demo purposes.
 */
export async function requestDevnetAirdrop(walletPubkey: PublicKey): Promise<string> {
    const connection = new Connection(NETWORK, 'confirmed');
    const signature = await connection.requestAirdrop(walletPubkey, 1_000_000_000); // 1 SOL
    await connection.confirmTransaction(signature, 'confirmed');
    return signature;
}

/**
 * Get SOL balance for a wallet.
 */
export async function getBalance(walletPubkey: PublicKey): Promise<number> {
    const connection = new Connection(NETWORK, 'confirmed');
    const balance = await connection.getBalance(walletPubkey);
    return balance / 1_000_000_000; // Convert lamports to SOL
}

// ==========================================
// TYPES
// ==========================================

export interface OnChainAuditRecord {
    auditor: string;
    auditedAt: Date;
    programName: string;
    auditHash: string;
    securityScore: number;
    totalIssues: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    verified: boolean;
}

export interface VerificationStatus {
    isVerified: boolean;
    record: OnChainAuditRecord | null;
    pdaAddress: string;
    explorerUrl: string;
}

/**
 * Build the Solscan/Explorer URL for a transaction or account.
 */
export function getExplorerUrl(addressOrSig: string, type: 'tx' | 'account' = 'account'): string {
    // Devnet explorer
    return `https://explorer.solana.com/${type}/${addressOrSig}?cluster=devnet`;
}

/**
 * Parse raw account data into AuditRecord.
 * (Simplified — in production, use Anchor's IDL-based deserialization)
 */
function parseAuditRecord(data: Buffer): OnChainAuditRecord | null {
    try {
        // Skip 8-byte discriminator
        let offset = 8;

        // Auditor (32 bytes)
        const auditor = new PublicKey(data.slice(offset, offset + 32)).toBase58();
        offset += 32;

        // Audited at (i64, 8 bytes)
        const auditedAtSec = Number(data.readBigInt64LE(offset));
        const auditedAt = new Date(auditedAtSec * 1000);
        offset += 8;

        // Program name (4 bytes length + string)
        const nameLen = data.readUInt32LE(offset);
        offset += 4;
        const programName = data.slice(offset, offset + nameLen).toString('utf8');
        offset += nameLen;

        // Audit hash (32 bytes)
        const auditHash = Buffer.from(data.slice(offset, offset + 32)).toString('hex');
        offset += 32;

        // Score, counts
        const securityScore = data.readUInt8(offset++);
        const totalIssues = data.readUInt16LE(offset);
        offset += 2;
        const criticalCount = data.readUInt8(offset++);
        const highCount = data.readUInt8(offset++);
        const mediumCount = data.readUInt8(offset++);
        const verified = data.readUInt8(offset++) === 1;

        return {
            auditor, auditedAt, programName, auditHash,
            securityScore, totalIssues, criticalCount,
            highCount, mediumCount, verified,
        };
    } catch {
        return null;
    }
}

/**
 * Format the instruction data for the publish_audit instruction.
 * This creates the serialized data that would be sent in a transaction.
 */
export function buildPublishInstruction(
    programName: string,
    auditHash: Uint8Array,
    securityScore: number,
    totalIssues: number,
    criticalCount: number,
    highCount: number,
    mediumCount: number,
): Buffer {
    // Anchor instruction discriminator for "publish_audit"
    // In production, generate from IDL: sha256("global:publish_audit")[0:8]
    const discriminator = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);

    const nameBytes = Buffer.from(programName, 'utf8');
    const nameLen = Buffer.alloc(4);
    nameLen.writeUInt32LE(nameBytes.length);

    const hashBuf = Buffer.from(auditHash);

    const scoreBuf = Buffer.alloc(1);
    scoreBuf.writeUInt8(securityScore);

    const issuesBuf = Buffer.alloc(2);
    issuesBuf.writeUInt16LE(totalIssues);

    const critBuf = Buffer.alloc(1);
    critBuf.writeUInt8(criticalCount);

    const highBuf = Buffer.alloc(1);
    highBuf.writeUInt8(highCount);

    const medBuf = Buffer.alloc(1);
    medBuf.writeUInt8(mediumCount);

    return Buffer.concat([
        discriminator,
        nameLen, nameBytes,
        hashBuf,
        scoreBuf,
        issuesBuf,
        critBuf, highBuf, medBuf,
    ]);
}
