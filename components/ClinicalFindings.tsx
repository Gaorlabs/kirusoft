
import React from 'react';
import type { ClinicalFinding } from '../types';
import { TREATMENTS_MAP } from '../constants';
import { TrashIcon, PencilIcon } from './icons';

interface ClinicalFindingsProps {
    findings: ClinicalFinding[];
    onDeleteFinding: (findingId: string) => void;
    onEditFinding: (finding: ClinicalFinding) => void;
}

const FindingItem: React.FC<{ finding: ClinicalFinding; onDeleteFinding: (findingId: string) => void; onEditFinding: (finding: ClinicalFinding) => void; }> = ({ finding, onDeleteFinding, onEditFinding }) => {
    const treatmentInfo = TREATMENTS_MAP[finding.condition];
    
    if (!treatmentInfo) return null;

    return (
        <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{treatmentInfo.label}</td>
            <td className="px-4 py-3">{finding.toothId}</td>
            <td className="px-4 py-3 capitalize">{finding.surface}</td>
            <td className="px-4 py-3 text-center">
                 <div className="flex items-center justify-center space-x-2">
                    <button 
                        onClick={() => onEditFinding(finding)}
                        className="p-2 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-slate-600/50 rounded-full transition-colors" title="Editar Hallazgo">
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => onDeleteFinding(finding.id)}
                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-slate-600/50 rounded-full transition-colors" title="Eliminar Hallazgo">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

export const ClinicalFindings: React.FC<ClinicalFindingsProps> = ({ findings, onDeleteFinding, onEditFinding }) => {
    const sortedFindings = [...findings].sort((a,b) => a.toothId - b.toothId);
    
    return (
        <div>
            {sortedFindings.length === 0 ? (
                 <div className="text-center p-6 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400">No hay hallazgos registrados.</p>
                     <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Haga clic en un diente para registrar un nuevo hallazgo.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700">
                             <tr>
                                <th scope="col" className="px-4 py-2">Hallazgo</th>
                                <th scope="col" className="px-4 py-2">Diente</th>
                                <th scope="col" className="px-4 py-2">Superficie</th>
                                <th scope="col" className="px-4 py-2 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                             {sortedFindings.map(finding => (
                                <FindingItem 
                                    key={finding.id} 
                                    finding={finding}
                                    onDeleteFinding={onDeleteFinding}
                                    onEditFinding={onEditFinding}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};