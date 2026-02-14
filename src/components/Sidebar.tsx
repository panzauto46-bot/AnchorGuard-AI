import { useTheme } from '../context/ThemeContext';
import { CodeEditor } from './CodeEditor';

interface SidebarProps {
    code: string;
    setCode: (code: string) => void;
    handleAudit: () => void;
    isAuditing: boolean;
}

export function Sidebar({ code, setCode, handleAudit, isAuditing }: SidebarProps) {
    const { isDark } = useTheme();

    return (
        <div className={`w-full lg:w-1/2 flex flex-col border-r ${isDark ? 'border-dark-border' : 'border-light-border'}`} style={{ minHeight: '400px' }}>
            {/* Panel Header */}
            <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${isDark ? 'border-dark-border bg-dark-surface/50' : 'border-light-border bg-zinc-50/50'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-solana-green' : 'bg-solana-purple'}`} />
                <span className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    INPUT ZONE
                </span>
                <span className={`ml-auto text-[10px] font-mono ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    {code.split('\n').length} lines
                </span>
            </div>
            <div className="flex-1 overflow-hidden">
                <CodeEditor
                    code={code}
                    onCodeChange={setCode}
                    onAudit={handleAudit}
                    isAuditing={isAuditing}
                />
            </div>
        </div>
    );
}
