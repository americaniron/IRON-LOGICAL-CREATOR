import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { downloadAsset } from '../services/geminiService';
import { Asset, AssetProvider, AssetType } from '../types';
import { Crane, Download, X, Image, Video, BrainCircuit, XIcon } from './common/Icons';

const AssetCard: React.FC<{ asset: Asset; onRemove: (id: string) => void }> = ({ asset, onRemove }) => {
    
    const ProviderIcon: React.FC<{provider: AssetProvider}> = ({provider}) => {
        switch(provider) {
            case 'OpenAI': return <BrainCircuit className="h-4 w-4 text-[var(--accent-primary)]" />;
            case 'Grok': return <XIcon className="h-4 w-4 text-[var(--accent-primary)]" />;
            case 'Gemini':
            default: return <div className="h-3 w-3 bg-[var(--accent-primary)]" />;
        }
    }
    
    return (
        <div className={`bg-[var(--bg-secondary)] border-b-4 border-[var(--border-secondary)] group relative overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500 border-2 border-transparent hover:border-[var(--accent-primary)]`}>
            <div className="relative">
                {asset.type === 'image' ? (
                    <img src={asset.url} alt={asset.prompt} className="w-full h-48 object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                ) : (
                    <video src={asset.url} loop muted className="w-full h-48 object-cover grayscale group-hover:grayscale-0 transition-all duration-500" onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()}></video>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-secondary)] via-black/40 to-transparent"></div>
            </div>
            <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                    <div>
                        <p className={`text-xs font-black uppercase tracking-widest text-[var(--accent-primary)] flex items-center gap-2`}>
                            <ProviderIcon provider={asset.provider} />
                            {asset.provider} // {asset.type}
                        </p>
                        <p className="text-[10px] font-mono text-[var(--text-muted)]">{new Date(asset.timestamp).toLocaleString()}</p>
                    </div>
                    <button onClick={() => onRemove(asset.id)} className="p-1.5 bg-[var(--danger-secondary)]/50 text-[var(--danger-primary)] hover:bg-[var(--danger-primary)] hover:text-white transition-colors" aria-label={`Delete asset: ${asset.prompt}`}>
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <p className="text-xs font-mono text-[var(--text-secondary)] h-16 overflow-y-auto pr-2 scrollbar-thin">
                    &gt; {asset.prompt}
                </p>
            </div>
            <button
                onClick={() => downloadAsset(asset.url, `${asset.provider}-${asset.type}-${asset.id}.${asset.type === 'image' ? 'png' : 'mp4'}`)}
                className="absolute top-2 right-2 p-2 bg-[var(--bg-input)] text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all"
                aria-label={`Download asset: ${asset.prompt}`}
            >
                <Download className="h-5 w-5" />
            </button>
        </div>
    );
};

const AssetBayPanel: React.FC = () => {
    const { assets, removeAsset } = useAppContext();
    const [filter, setFilter] = useState<'all' | AssetProvider | AssetType>('all');

    const filteredAssets = useMemo(() => {
        if (filter === 'all') return assets;
        if (filter === 'image' || filter === 'video') {
            return assets.filter(a => a.type === filter);
        }
        return assets.filter(a => a.provider === filter);
    }, [assets, filter]);
    
    const FilterButton: React.FC<{ value: typeof filter, label: string, icon?: React.ReactNode }> = ({ value, label, icon }) => (
        <button
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-widest border transition-colors flex items-center gap-2 ${
                filter === value ? 'bg-[var(--accent-primary)] text-[var(--text-accent-on)] border-[var(--accent-primary)]' : 'bg-[var(--bg-secondary)] border-[var(--border-primary)] hover:border-[var(--accent-primary)]'
            }`}
        >
            {icon} {label}
        </button>
    );

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 control-panel p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-3xl font-['Black_Ops_One'] text-[var(--text-primary)] tracking-widest uppercase flex items-center gap-4">
                        <Crane className="h-8 w-8 text-[var(--accent-primary)]"/>
                        Asset_Bay
                    </h3>
                    <p className="font-mono text-sm text-[var(--text-muted)]">
                       <span className="font-bold text-[var(--text-primary)]">{filteredAssets.length}</span> // FABRICATED_UNITS
                    </p>
                </div>
                <div role="group" aria-label="Filter assets" className="flex flex-wrap gap-2">
                    <FilterButton value="all" label="All" />
                    <FilterButton value="image" label="Images" icon={<Image className="h-4 w-4" />} />
                    <FilterButton value="video" label="Videos" icon={<Video className="h-4 w-4" />} />
                    <FilterButton value="Gemini" label="Gemini" icon={<div className="h-3 w-3 bg-current" />} />
                    <FilterButton value="OpenAI" label="OpenAI" icon={<BrainCircuit className="h-4 w-4" />} />
                    <FilterButton value="Grok" label="Grok" icon={<XIcon className="h-4 w-4" />} />
                </div>
            </div>

            {filteredAssets.length > 0 ? (
                <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {filteredAssets.map(asset => (
                        <AssetCard key={asset.id} asset={asset} onRemove={removeAsset} />
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-[var(--text-muted)] monitor-screen">
                    <Crane className="h-24 w-24 opacity-10 mb-4" />
                    <p className="font-mono uppercase tracking-widest text-lg">Asset Bay Is Empty</p>
                    <p className="text-xs text-[var(--text-muted)] opacity-50 mt-2 font-mono uppercase">Fabricate new media to populate the bay.</p>
                </div>
            )}
        </div>
    );
};

export default AssetBayPanel;