export type Severity = 'critical' | 'high' | 'medium' | 'safe';

export interface Vulnerability {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  line: number;
  category: string;
  originalCode: string;
  fixedCode: string;
  explanation: string;
  computeImpact?: string;
}

export interface ThinkingStep {
  id: number;
  text: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'thinking';
  timestamp: string;
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
  gasOptimizations: GasOptimization[];
}

export interface GasOptimization {
  id: string;
  title: string;
  description: string;
  estimatedSaving: string;
  suggestion: string;
}

// Auth types
export type AuthProvider = 'google' | 'github' | 'wallet';

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  provider: AuthProvider;
  walletAddress?: string;
  auditsCount: number;
  joinedAt: string;
}
