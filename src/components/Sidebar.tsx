import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { CodeEditor } from './CodeEditor';
import { Plus, X, FileCode } from 'lucide-react';

export interface ProgramFile {
    id: string;
    name: string;
    code: string;
}

interface SidebarProps {
    files: ProgramFile[];
    activeFileId: string;
    onSetActiveFile: (id: string) => void;
    onUpdateFile: (id: string, code: string) => void;
    onAddFile: () => void;
    onRemoveFile: (id: string) => void;
    onRenameFile: (id: string, name: string) => void;
    handleAudit: () => void;
    isAuditing: boolean;
}

export function Sidebar({
    files,
    activeFileId,
    onSetActiveFile,
    onUpdateFile,
    onAddFile,
    onRemoveFile,
    onRenameFile,
    handleAudit,
    isAuditing
}: SidebarProps) {
    const { isDark } = useTheme();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const activeFile = files.find(f => f.id === activeFileId) || files[0];
    const totalLines = files.reduce((sum, f) => sum + f.code.split('\n').length, 0);

    const handleStartRename = (id: string, currentName: string) => {
        setEditingId(id);
        setEditName(currentName);
    };

    const handleFinishRename = () => {
        if (editingId && editName.trim()) {
            onRenameFile(editingId, editName.trim());
        }
        setEditingId(null);
    };

    return (
        <div className={`w-full lg:w-1/2 flex flex-col border-r ${isDark ? 'border-dark-border' : 'border-light-border'}`} style={{ minHeight: '400px' }}>
            {/* Panel Header */}
            <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${isDark ? 'border-dark-border bg-dark-surface/50' : 'border-light-border bg-zinc-50/50'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-solana-green' : 'bg-solana-purple'}`} />
                <span className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    INPUT ZONE
                </span>
                <span className={`ml-auto text-[10px] font-mono ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    {files.length} program{files.length > 1 ? 's' : ''} • {totalLines} lines
                </span>
            </div>

            {/* File Tabs */}
            <div className={`flex items-center gap-0.5 px-2 py-1.5 border-b overflow-x-auto ${isDark ? 'border-dark-border bg-dark-surface/30' : 'border-light-border bg-zinc-50/30'}`}>
                {files.map(file => (
                    <div
                        key={file.id}
                        className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer shrink-0 ${file.id === activeFileId
                                ? isDark
                                    ? 'bg-white/10 text-white border border-white/10'
                                    : 'bg-white text-zinc-900 border border-zinc-200 shadow-sm'
                                : isDark
                                    ? 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                    : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'
                            }`}
                        onClick={() => onSetActiveFile(file.id)}
                    >
                        <FileCode className="w-3 h-3 shrink-0" />
                        {editingId === file.id ? (
                            <input
                                type="text"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                onBlur={handleFinishRename}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') handleFinishRename();
                                    if (e.key === 'Escape') setEditingId(null);
                                }}
                                className={`w-20 text-[11px] font-medium bg-transparent border-b outline-none ${isDark ? 'border-solana-green text-white' : 'border-solana-purple text-zinc-900'
                                    }`}
                                autoFocus
                                onClick={e => e.stopPropagation()}
                            />
                        ) : (
                            <span
                                onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    handleStartRename(file.id, file.name);
                                }}
                                title="Double-click to rename"
                            >
                                {file.name}
                            </span>
                        )}
                        {files.length > 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveFile(file.id);
                                }}
                                className={`w-3.5 h-3.5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'hover:bg-red-500/20 text-zinc-500 hover:text-red-400' : 'hover:bg-red-50 text-zinc-400 hover:text-red-500'
                                    }`}
                            >
                                <X className="w-2.5 h-2.5" />
                            </button>
                        )}
                    </div>
                ))}

                {/* Add File Button */}
                <button
                    onClick={onAddFile}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all shrink-0 ${isDark
                            ? 'text-zinc-600 hover:text-solana-green hover:bg-solana-green/10'
                            : 'text-zinc-400 hover:text-solana-purple hover:bg-solana-purple/10'
                        }`}
                    title="Add program file"
                >
                    <Plus className="w-3 h-3" />
                    <span className="hidden sm:inline">Add</span>
                </button>
            </div>

            {/* Code Editor for Active File */}
            <div className="flex-1 overflow-hidden">
                {activeFile && (
                    <CodeEditor
                        code={activeFile.code}
                        onCodeChange={(code) => onUpdateFile(activeFile.id, code)}
                        onAudit={handleAudit}
                        isAuditing={isAuditing}
                        fileName={activeFile.name}
                    />
                )}
            </div>
        </div>
    );
}
