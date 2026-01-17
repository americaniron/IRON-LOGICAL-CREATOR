import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { downloadAsset } from '../services/geminiService';
import { Asset, AssetProvider, AssetType } from '../types';
import { Crane, Download, X, Image, Video, BrainCircuit, XIcon } from './common/Icons';

const AssetCard: React.FC<{ asset: Asset; onRemove: (id: string) => void }> = ({ asset, onRemove }) => {
    
    const providerClasses: Record<AssetProvider, string> = {
        'Gemini': 'from-heavy-yellow/30 to-cyber-cyan/30 border-cyan-400',
        'OpenAI': 'from-guest-green/30 to-green-800/30 border-guest-green',
        'Grok': 'from-grok-magenta/30 to-fuchsia-800/30 border-grok-magenta',
    };

    const providerText: Record<AssetProvider, string> = {
        'Gemini': 'text-cyan-400',
        'OpenAI': 'text-guest-green',
        'Grok': 'text-grok-magenta',
    };
    
    return (
        <div className={`bg-gradient-to-br ${providerClasses[asset.provider]} border-b-4 border-black group relative overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500`}>
            <div className="relative">
                {asset.type === 'image' ? (
                    <img src={asset.url} alt={asset.prompt} className="w-full h-48 object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                ) : (
                    <video src={asset.url} loop muted className="w-full h-48 object-cover grayscale group-hover:grayscale-0 transition-all duration-500" onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()}></video>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            </div>
            <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                    <div>
                        <p className={`text-xs font-black uppercase tracking-widest ${providerText[asset.provider]}`}>{asset.provider} // {asset.type}</p>
                        <p className="text-[10px] font-mono text-gray-500">{new Date(asset.timestamp).toLocaleString()}</p>
                    </div>
                    <button onClick={() => onRemove(asset.id)} className="p-1.5 bg-red-800/50 text-red-400 hover:bg-red-600 hover:text-white transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <p className="text-xs font-mono text-gray-400 h-16 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700">
                    &gt; {asset.prompt}
                </p>
            </div>
            <button
                onClick={() => downloadAsset(asset.url, `${asset.provider}-${asset.type}-${asset.id}.${asset.type === 'image' ? 'png' : 'mp4'}`)}
                className="absolute top-2 right-2 p-2 bg-industrial-gray text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all"
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
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-widest border transition-colors flex items-center gap-2 ${
                filter === value ? 'bg-heavy-yellow text-black border-heavy-yellow' : 'bg-industrial-gray border-gray-700 hover:border-heavy-yellow'
            }`}
        >
            {icon} {label}
        </button>
    );

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 control-panel p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-3xl font-['Black_Ops_One'] text-white tracking-widest uppercase flex items-center gap-4">
                        <Crane className="h-8 w-8 text-heavy-yellow"/>
                        Asset_Bay
                    </h3>
                    <p className="font-mono text-sm text-gray-500">
                       <span className="font-bold text-white">{filteredAssets.length}</span> // FABRICATED_UNITS
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <FilterButton value="all" label="All" />
                    <FilterButton value="image" label="Images" icon={<Image className="h-4 w-4" />} />
                    <FilterButton value="video" label="Videos" icon={<Video className="h-4 w-4" />} />
                    <FilterButton value="Gemini" label="Gemini" icon={<div className="h-3 w-3 bg-cyan-400" />} />
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
                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-700 monitor-screen">
                    <Crane className="h-24 w-24 opacity-10 mb-4" />
                    <p className="font-mono uppercase tracking-widest text-lg">Asset Bay Is Empty</p>
                    <p className="text-xs text-gray-800 mt-2 font-mono uppercase">Fabricate new media to populate the bay.</p>
                </div>
            )}
        </div>
    );
};

export default AssetBayPanel;
