import React from 'react';
// FIX: Changed import to be a relative path.
import type { ToothState, ToothSurfaceName, AppliedTreatment } from '../types';
// FIX: Changed import to be a relative path.
import { ToothPlaceholderIcon } from './icons';

interface ToothProps {
    toothId: number;
    toothState: ToothState;
    onToothClick: (surface: ToothSurfaceName | 'whole') => void;
    isActive: boolean;
    activeSurface: ToothSurfaceName | 'whole' | null;
}

type ToothType = 'incisor' | 'canine' | 'premolar' | 'molar';

interface ToothSVGProps {
    toothId: number;
    toothState: ToothState;
    onToothClick: (surface: ToothSurfaceName | 'whole') => void;
    activeSurface: ToothSurfaceName | 'whole' | null;
}

const getFill = (toothState: ToothState, surface: ToothSurfaceName): string => {
    const hasFinding = toothState.findings.some(f => f.surface === surface);
    if (hasFinding) return 'url(#grad-red)';

    const treatments = toothState.surfaces[surface];
    const allSurfaceTreatments = Object.values(toothState.surfaces).flat();
    const crownTreatment = allSurfaceTreatments.find(t => t.treatmentId === 'crown');

    let treatmentToConsider: AppliedTreatment | undefined;

    if (crownTreatment && surface !== 'root') {
        treatmentToConsider = crownTreatment;
    } else if (treatments.length > 0) {
        treatmentToConsider = treatments[treatments.length - 1];
    }

    if (treatmentToConsider) {
        if (treatmentToConsider.status === 'completed') return 'url(#grad-blue)';
        if (treatmentToConsider.status === 'proposed') return 'url(#grad-red)';
    }

    return 'url(#grad-healthy)';
};


const getToothType = (toothId: number): ToothType => {
    const id = toothId % 10;
    if (id <= 2) return 'incisor';
    if (id === 3) return 'canine';
    if (id <= 5) return 'premolar';
    return 'molar';
};

const SvgGradients = () => (
    <defs>
        <linearGradient id="grad-healthy" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#CBD5E0" />
        </linearGradient>
        <linearGradient id="grad-red" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F87171" />
            <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
        <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
    </defs>
);

const MolarSVG: React.FC<ToothSVGProps> = ({ toothState, onToothClick, activeSurface }) => (
    <svg width="70" height="85" viewBox="0 0 80 95" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onToothClick('whole'); }}>
        <SvgGradients />
        <g className="tooth-surfaces stroke-gray-700 dark:stroke-gray-900 stroke-1 group-hover:drop-shadow-lg transition-all">
            <path d="M25,20 C40,15 60,15 75,20 L70,50 L30,50 Z" fill={getFill(toothState, 'buccal')} className={`hover:stroke-blue-500 ${activeSurface === 'buccal' ? 'stroke-blue-600 stroke-2' : ''}`} onClick={(e) => { e.stopPropagation(); onToothClick('buccal'); }} />
            <path d="M30,50 L70,50 L75,80 C60,85 40,85 25,80 Z" fill={getFill(toothState, 'lingual')} className={`hover:stroke-blue-500 ${activeSurface === 'lingual' ? 'stroke-blue-600 stroke-2' : ''}`} onClick={(e) => { e.stopPropagation(); onToothClick('lingual'); }} />
            <path d="M25,20 C15,35 15,65 25,80 L30,50 Z" fill={getFill(toothState, 'mesial')} className={`hover:stroke-blue-500 ${activeSurface === 'mesial' ? 'stroke-blue-600 stroke-2' : ''}`} onClick={(e) => { e.stopPropagation(); onToothClick('mesial'); }} />
            <path d="M75,20 C85,35 85,65 75,80 L70,50 Z" fill={getFill(toothState, 'distal')} className={`hover:stroke-blue-500 ${activeSurface === 'distal' ? 'stroke-blue-600 stroke-2' : ''}`} onClick={(e) => { e.stopPropagation(); onToothClick('distal'); }} />
            <path d="M30,50 C40,45 60,45 70,50 C60,55 40,55 30,50 Z" fill={getFill(toothState, 'occlusal')} className={`hover:stroke-blue-500 ${activeSurface === 'occlusal' ? 'stroke-blue-600 stroke-2' : ''}`} onClick={(e) => { e.stopPropagation(); onToothClick('occlusal'); }} />
            <path d="M40,80 Q45,95 50,80" fill={getFill(toothState, 'root')} className={`hover:stroke-blue-500 ${activeSurface === 'root' ? 'stroke-blue-600 stroke-2' : ''}`} onClick={(e) => { e.stopPropagation(); onToothClick('root'); }} />
        </g>
    </svg>
);

const PremolarSVG: React.FC<ToothSVGProps> = ({ toothState, onToothClick, activeSurface }) => (
    <svg width="65" height="85" viewBox="0 0 80 95" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onToothClick('whole'); }}>
        <SvgGradients />
        <g className="tooth-surfaces stroke-gray-700 dark:stroke-gray-900 stroke-1 group-hover:drop-shadow-lg transition-all">
            <path d="M28,20 C40,18 60,18 72,20 L68,50 L32,50 Z" fill={getFill(toothState, 'buccal')} className={`hover:stroke-blue-500 ${activeSurface === 'buccal' ? 'stroke-blue-600 stroke-2' : ''}`} onClick={(e) => { e.stopPropagation(); onToothClick('buccal'); }} />
            <path d="M32,50 L68,50 L72,80 C60,82 40,82 28,80 Z" fill={getFill(toothState, 'lingual')} className={`hover:stroke-blue-500 ${activeSurface === 'lingual' ? 'stroke-blue-600 stroke-2' : ''}`} onClick={(e) => { e.stopPropagation(); onToothClick('lingual'); }} />
            <path d="M28,20 C20,35 20,65 28,80 L32,50 Z" fill={getFill(toothState, 'mesial')} className={`hover:stroke-blue-500 ${activeSurface === 'mesial' ? 'stroke-blue-600 stroke-2' : ''}`} onClick={(e) => { e.stopPropagation(); onToothClick('mesial'); }} />
            <path d="M72,20 C80,35 80,65 72,80 L68,50 Z" fill={getFill(toothState, 'distal')} className={`hover:stroke-blue-500 ${activeSurface === 'distal' ? 'stroke-blue-600 stroke-2' : ''}`} onClick={(e) => { e.stopPropagation(); onToothClick('distal'); }} />
            <path d="M32,50 C40,48 60,48 68,50 C60,52 40,52 32,50 Z" fill={getFill(toothState, 'occlusal')} className={`hover:stroke-blue-500 ${activeSurface === 'occlusal' ? 'stroke-blue-600 stroke-2' : ''}`} onClick={(e) => { e.stopPropagation(); onToothClick('occlusal'); }} />
            <path d="M45,80 Q50,95 55,80" fill={getFill(toothState, 'root')} className={`hover:stroke-blue-500 ${activeSurface === 'root' ? 'stroke-blue-600 stroke-2' : ''}`} onClick={(e) => { e.stopPropagation(); onToothClick('root'); }} />
        </g>
    </svg>
);

const CanineSVG: React.FC<ToothSVGProps> = ({ toothState, onToothClick, activeSurface }) => (
    <svg width="60" height="85" viewBox="0 0 80 95" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onToothClick('whole'); }}>
        <SvgGradients />
        <g className="tooth-surfaces stroke-gray-700 dark:stroke-gray-900 stroke-1 group-hover:drop-shadow-lg transition-all">
            <path d="M30,20 C40,15 60,15 70,20 L65,50 L35,50 Z" fill={getFill(toothState, 'buccal')} className={`hover:stroke-blue-500 ${activeSurface === 'buccal' ? 'stroke-blue-600 stroke-2' : ''}`} onClick={(e) => { e.stopPropagation(); onToothClick('buccal'); }} />
            <path d="M35,50 L65,50 L70,80 C50,90 50,90 30,80 Z" fill={getFill(toothState, 'lingual')} className={`hover:stroke-blue-500 ${activeSurface === 'lingual' ? 'stroke-blue-600 stroke-2' : ''}`} onClick={(e) => { e.stopPropagation(); onToothClick('lingual'); }} />
            <path d="M30,20 C20,40 20,60 30,80 L35,50 Z" fill={getFill(toothState, 'mesial')} className={`hover:stroke-blue-500 ${activeSurface === 'mesial' ? 'stroke-blue-600 stroke-2' : ''}`} onClick={(e) => { e.stopPropagation(); onToothClick('mesial'); }} />
            <path d="M70,20 C80,40 80,60 70,80 L65,50 Z" fill={getFill(toothState, 'distal')} className={`hover:stroke-blue-500 ${activeSurface === 'distal' ? 'stroke-blue-600 stroke-2' : ''}`} onClick={(e) => { e.stopPropagation(); onToothClick('distal'); }} />
            <path d="M35,50 C45,45 55,45 65,50 L50,55 Z" fill={getFill(toothState, 'occlusal')} className={`hover:stroke-blue-500 ${activeSurface === 'occlusal' ? 'stroke-blue-600 stroke-2' : ''}`} onClick={(e) => { e.stopPropagation(); onToothClick('occlusal'); }} />
            <path d="M48,85 Q50,95 52,85" fill={getFill(toothState, 'root')} className={`hover:stroke-blue-500 ${activeSurface === 'root' ? 'stroke-blue-600 stroke-2' : ''}`} onClick={(e) => { e.stopPropagation(); onToothClick('root'); }} />
        </g>
    </svg>
);

const IncisorSVG: React.FC<ToothSVGProps> = ({ toothState, onToothClick, activeSurface }) => (
    <svg width="55" height="85" viewBox="0 0 80 95" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onToothClick('whole'); }}>
        <SvgGradients />
        <g className="tooth-surfaces stroke-gray-700 dark:stroke-gray-900 stroke-1 group-hover:drop-shadow-lg transition-all">
            <path d="M32,20 C40,18 60,18 68,20 L65,50 L35,50 Z" fill={getFill(toothState, 'buccal')} className={`hover:stroke-blue-500 ${activeSurface === 'buccal' ? 'stroke-blue-600 stroke-2' : ''}`} onClick={(e) => { e.stopPropagation(); onToothClick('buccal'); }} />
            <path d="M35,50 L65,50 L68,80 C60,82 40,82 32,80 Z" fill={getFill(toothState, 'lingual')} className={`hover:stroke-blue-500 ${activeSurface === 'lingual' ? 'stroke-blue-600 stroke-2' : ''}`} onClick={(e) => { e.stopPropagation(); onToothClick('lingual'); }} />
            <path d="M32,20 C28,35 28,65 32,80 L35,50 Z" fill={getFill(toothState, 'mesial')} className={`hover:stroke-blue-500 ${activeSurface === 'mesial' ? 'stroke-blue-600 stroke-2' : ''}`} onClick={(e) => { e.stopPropagation(); onToothClick('mesial'); }} />
            <path d="M68,20 C72,35 72,65 68,80 L65,50 Z" fill={getFill(toothState, 'distal')} className={`hover:stroke-blue-500 ${activeSurface === 'distal' ? 'stroke-blue-600 stroke-2' : ''}`} onClick={(e) => { e.stopPropagation(); onToothClick('distal'); }} />
            <path d="M35,50 L65,50 L65,52 L35,52 Z" fill={getFill(toothState, 'occlusal')} className={`hover:stroke-blue-500 ${activeSurface === 'occlusal' ? 'stroke-blue-600 stroke-2' : ''}`} onClick={(e) => { e.stopPropagation(); onToothClick('occlusal'); }} />
            <path d="M48,82 Q50,95 52,82" fill={getFill(toothState, 'root')} className={`hover:stroke-blue-500 ${activeSurface === 'root' ? 'stroke-blue-600 stroke-2' : ''}`} onClick={(e) => { e.stopPropagation(); onToothClick('root'); }} />
        </g>
    </svg>
);


export const Tooth: React.FC<ToothProps> = ({ toothId, toothState, onToothClick, isActive, activeSurface }) => {
    
    const wholeToothTreatment = toothState.whole.length > 0 ? toothState.whole[0] : null;
    const hasWholeFinding = toothState.findings.some(f => f.surface === 'whole' && f.condition === 'extraction');
    
    const isUnerupted = wholeToothTreatment?.treatmentId === 'unerupted';
    const isMissing = wholeToothTreatment?.treatmentId === 'missing';
    const isProposedForExtraction = (wholeToothTreatment?.treatmentId === 'extraction' && wholeToothTreatment.status === 'proposed') || hasWholeFinding;

    const toothType = getToothType(toothId);

    const toothWidthClass = {
        molar: 'w-[70px]',
        premolar: 'w-[65px]',
        canine: 'w-[60px]',
        incisor: 'w-[55px]',
    }[toothType];


    if (isMissing) {
         return (
            <div
                onClick={() => onToothClick('whole')}
                className={`h-[105px] flex flex-col items-center justify-center cursor-pointer rounded-lg transition-colors p-1 ${toothWidthClass} ${
                    isActive ? 'bg-blue-500/10 dark:bg-blue-900/30' : ''
                }`}
            >
                <div className={`h-[85px] border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-md flex items-center justify-center ${toothWidthClass}`}>
                </div>
                <div className="mt-1 text-sm font-semibold text-gray-500 dark:text-gray-400">{toothId}</div>
            </div>
        );
    }

    const ToothComponent = {
        molar: MolarSVG,
        premolar: PremolarSVG,
        canine: CanineSVG,
        incisor: IncisorSVG
    }[toothType];
    
    return (
        <div className={`group flex flex-col items-center p-1 rounded-lg transition-colors ${isActive ? 'bg-blue-500/10 dark:bg-blue-500/20' : ''}`}>
             <div className="relative">
                <ToothComponent 
                    toothId={toothId}
                    toothState={toothState}
                    onToothClick={onToothClick}
                    activeSurface={activeSurface}
                />
                {isUnerupted && (
                    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 bg-opacity-70 flex items-center justify-center rounded-md pointer-events-none">
                        <div className="w-10 h-10 text-gray-500 dark:text-gray-400">
                             <ToothPlaceholderIcon />
                        </div>
                    </div>
                )}
                 {isProposedForExtraction && (
                    <div className="absolute inset-0 flex items-center justify-center text-red-500 dark:text-red-400 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>
                )}
            </div>
            <div className={`mt-1 text-sm font-semibold ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>{toothId}</div>
        </div>
    );
};