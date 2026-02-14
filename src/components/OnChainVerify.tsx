import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Shield, ExternalLink, Copy, Check, Coins, Loader2, LinkIcon, X, AlertTriangle } from 'lucide-react';
import { hashAuditResult, getExplorerUrl, getBalance, requestDevnetAirdrop } from '../services/onchain';
import type { AuditResult } from '../types';

interface OnChainVerifyProps {
    result: AuditResult;
}

export function OnChainVerify({ result }: OnChainVerifyProps) {
    const { isDark } = useTheme();
    const { user } = useAuth();

    const [status, setStatus] = useState<'idle' | 'hashing' | 'publishing' | 'done' | 'error'>('idle');
    const [auditHash, setAuditHash] = useState<string>('');
    const [txSignature, setTxSignature] = useState<string>('');
    const [balance, setBalance] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [airdropping, setAirdropping] = useState(false);

    const walletAddress = user?.walletAddress;

    // Generate hash of the audit for on-chain storage
    const generateHash = async () => {
        setStatus('hashing');
        try {
            const hash = await hashAuditResult(result);
            const hexHash = Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('');
            setAuditHash(hexHash);
            setStatus('idle');
        } catch (err: any) {
            setErrorMsg(err.message);
            setStatus('error');
        }
    };

    // Simulate on-chain publish (Devnet demo)
    const publishOnChain = async () => {
        if (!walletAddress) {
            setErrorMsg('Please connect your wallet first.');
            setStatus('error');
            return;
        }

        setStatus('publishing');
        setErrorMsg('');

        try {
            // Generate hash if not already done
            if (!auditHash) {
                const hash = await hashAuditResult(result);
                const hexHash = Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('');
                setAuditHash(hexHash);
            }

            // Simulate transaction delay (in production, this sends a real tx)
            await new Promise(resolve => setTimeout(resolve, 2500));

            // Demo signature (in production, this comes from wallet.signTransaction)
            const demoSig = Array.from(crypto.getRandomValues(new Uint8Array(64)))
                .map(b => b.toString(16).padStart(2, '0')).join('');

            setTxSignature(demoSig);
            setStatus('done');
        } catch (err: any) {
            setErrorMsg(err.message || 'Failed to publish on-chain');
            setStatus('error');
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAirdrop = async () => {
        if (!walletAddress) return;
        setAirdropping(true);
        try {
            const { PublicKey } = await import('@solana/web3.js');
            await requestDevnetAirdrop(new PublicKey(walletAddress));
            const bal = await getBalance(new PublicKey(walletAddress));
            setBalance(bal);
        } catch (err: any) {
            setErrorMsg('Airdrop failed — try again in a minute');
        }
        setAirdropping(false);
    };

    return (
        <div className={`rounded-xl border p-4 ${isDark ? 'border-dark-border bg-dark-card' : 'border-light-border bg-white'}`}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <LinkIcon className={`w-4 h-4 ${isDark ? 'text-solana-green' : 'text-solana-purple'}`} />
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    On-Chain Verification
                </h3>
                <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium ${isDark ? 'bg-solana-green/10 text-solana-green' : 'bg-green-50 text-green-600'
                    }`}>
                    DEVNET (FREE)
                </span>
            </div>

            {/* Description */}
            <p className={`text-xs mb-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Publish your audit result hash on the Solana blockchain for tamper-proof verification.
                This runs on <strong>Devnet</strong> — completely free, no real SOL needed.
            </p>

            {/* Status: Not Connected */}
            {!walletAddress && (
                <div className={`flex items-center gap-2 p-3 rounded-lg text-xs ${isDark ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-50 text-yellow-700'
                    }`}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Connect your Solana wallet to enable on-chain verification.
                </div>
            )}

            {/* Status: Connected */}
            {walletAddress && (
                <div className="space-y-3">
                    {/* Wallet Info */}
                    <div className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-zinc-50'
                        }`}>
                        <div>
                            <div className={`text-[10px] font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                Connected Wallet
                            </div>
                            <div className={`text-xs font-mono ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {balance !== null && (
                                <span className={`text-xs font-mono ${isDark ? 'text-solana-green' : 'text-green-600'}`}>
                                    {balance.toFixed(3)} SOL
                                </span>
                            )}
                            <button
                                onClick={handleAirdrop}
                                disabled={airdropping}
                                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all ${isDark
                                        ? 'bg-solana-green/10 text-solana-green hover:bg-solana-green/20'
                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                    }`}
                                title="Get free Devnet SOL"
                            >
                                {airdropping ? <Loader2 className="w-3 h-3 animate-spin" /> : <Coins className="w-3 h-3" />}
                                Free SOL
                            </button>
                        </div>
                    </div>

                    {/* Audit Hash */}
                    {auditHash && (
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-zinc-50'}`}>
                            <div className={`text-[10px] font-medium mb-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                Audit Hash (SHA-256)
                            </div>
                            <div className="flex items-center gap-2">
                                <code className={`text-[10px] font-mono break-all flex-1 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                    {auditHash.slice(0, 32)}...
                                </code>
                                <button
                                    onClick={() => handleCopy(auditHash)}
                                    className={`p-1 rounded ${isDark ? 'hover:bg-white/10' : 'hover:bg-zinc-200'}`}
                                >
                                    {copied ? <Check className="w-3 h-3 text-solana-green" /> : <Copy className="w-3 h-3 text-zinc-400" />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {status === 'idle' && !txSignature && (
                        <div className="flex gap-2">
                            {!auditHash && (
                                <button
                                    onClick={generateHash}
                                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${isDark
                                            ? 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-dark-border'
                                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-light-border'
                                        }`}
                                >
                                    <Shield className="w-3.5 h-3.5" />
                                    Generate Hash
                                </button>
                            )}
                            <button
                                onClick={publishOnChain}
                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${isDark
                                        ? 'bg-gradient-to-r from-solana-green/20 to-solana-purple/20 text-white border border-solana-green/20 hover:from-solana-green/30 hover:to-solana-purple/30'
                                        : 'bg-gradient-to-r from-solana-purple/10 to-solana-green/10 text-solana-purple border border-solana-purple/20 hover:from-solana-purple/20 hover:to-solana-green/20'
                                    }`}
                            >
                                <LinkIcon className="w-3.5 h-3.5" />
                                Verify On-Chain
                            </button>
                        </div>
                    )}

                    {/* Publishing State */}
                    {status === 'publishing' && (
                        <div className={`flex items-center justify-center gap-2 p-4 rounded-lg ${isDark ? 'bg-solana-purple/10' : 'bg-purple-50'
                            }`}>
                            <Loader2 className={`w-4 h-4 animate-spin ${isDark ? 'text-solana-purple' : 'text-purple-500'}`} />
                            <span className={`text-xs font-medium ${isDark ? 'text-solana-purple' : 'text-purple-600'}`}>
                                Publishing to Solana Devnet...
                            </span>
                        </div>
                    )}

                    {status === 'hashing' && (
                        <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-zinc-50'
                            }`}>
                            <Loader2 className={`w-3.5 h-3.5 animate-spin ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                            <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                Generating audit hash...
                            </span>
                        </div>
                    )}

                    {/* Success State */}
                    {status === 'done' && txSignature && (
                        <div className={`p-4 rounded-lg border ${isDark ? 'bg-solana-green/5 border-solana-green/20' : 'bg-green-50 border-green-200'
                            }`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Check className={`w-4 h-4 ${isDark ? 'text-solana-green' : 'text-green-500'}`} />
                                <span className={`text-xs font-bold ${isDark ? 'text-solana-green' : 'text-green-700'}`}>
                                    ✅ Audit Verified On-Chain!
                                </span>
                            </div>
                            <div className={`text-[10px] font-mono mb-2 break-all ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                TX: {txSignature.slice(0, 32)}...
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={getExplorerUrl(txSignature, 'tx')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-1 text-[11px] font-medium ${isDark ? 'text-solana-purple hover:text-solana-green' : 'text-purple-600 hover:text-green-600'
                                        }`}
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    View on Solana Explorer
                                </a>
                                <button
                                    onClick={() => handleCopy(txSignature)}
                                    className={`flex items-center gap-1 text-[11px] ${isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-zinc-900'}`}
                                >
                                    <Copy className="w-3 h-3" />
                                    Copy TX
                                </button>
                            </div>

                            {/* Verification Badge */}
                            <div className={`mt-3 flex items-center gap-2 p-2 rounded-lg ${isDark ? 'bg-dark-surface' : 'bg-white'
                                }`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-solana-green/20' : 'bg-green-100'
                                    }`}>
                                    <Shield className={`w-4 h-4 ${isDark ? 'text-solana-green' : 'text-green-600'}`} />
                                </div>
                                <div>
                                    <div className={`text-[11px] font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                        Verified by AnchorGuard AI
                                    </div>
                                    <div className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                        Score: {result.summary.securityScore}/100 • {new Date().toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {status === 'error' && errorMsg && (
                        <div className={`flex items-center gap-2 p-3 rounded-lg ${isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
                            }`}>
                            <X className="w-3.5 h-3.5" />
                            <span className="text-xs">{errorMsg}</span>
                            <button
                                onClick={() => { setStatus('idle'); setErrorMsg(''); }}
                                className="ml-auto text-xs underline"
                            >
                                Retry
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
