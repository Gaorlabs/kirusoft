import React, { useState, useMemo } from 'react';
import { DENTAL_TREATMENTS, TREATMENT_CATEGORIES } from '../constants';
// FIX: Changed import to be a relative path.
import type { DentalTreatment, ToothCondition, WholeToothCondition, TreatmentApplication, ToothSurfaceName } from '../types';
// FIX: Changed import to be a relative path.
import { ChevronDownIcon, SearchIcon, CloseIcon } from './icons';

interface TreatmentSelectionModalProps {
    target: { toothId: number; surface: ToothSurfaceName | 'whole' } | null;
    onClose: () => void;
    onSelectTreatment: (id: ToothCondition | WholeToothCondition) => void;
}

const CategorySection: React.FC<{
    category: string;
    treatments: DentalTreatment[];
    onSelectTreatment: (id: ToothCondition | WholeToothCondition) => void;
}> = ({ category, treatments, onSelectTreatment }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-3 text-left font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700">
                <span>{category}</span>
                <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDownIcon />
                </span>
            </button>
            {isOpen && (
                <div className="p-3 bg-white dark:bg-slate-800 grid grid-cols-5 gap-2">
                    {treatments.map((treatment) => (
                        <button
                            key={treatment.id}
                            onClick={() => onSelectTreatment(treatment.id)}
                            className="p-1.5 border rounded-lg flex flex-col items-center justify-center text-center transition-colors bg-white dark:bg-slate-900 hover:bg-pink-50 dark:hover:bg-pink-900/40 border-slate-300 dark:border-slate-600 hover:border-pink-400 dark:hover:border-pink-700 min-h-[70px]"
                            title={treatment.label}
                        >
                            <div className="w-7 h-7 text-slate-700 dark:text-slate-300">{treatment.icon}</div>
                            <span className="text-xs mt-1 text-center font-medium text-slate-600 dark:text-slate-400 leading-tight">{treatment.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};


export const Toolbar: React.FC<TreatmentSelectionModalProps> = ({ target, onClose, onSelectTreatment }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const applicableTreatments = useMemo(() => {
        if (!target) return [];

        let applicableType: TreatmentApplication;
        if (target.surface === 'whole') {
            applicableType = 'whole_tooth';
        } else if (target.surface === 'root') {
            applicableType = 'root';
        } else {
            applicableType = 'surface';
        }

        let filtered = DENTAL_TREATMENTS.filter(t => t.appliesTo === applicableType);

        if (searchTerm) {
            filtered = filtered.filter(t =>
                t.label.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return filtered;
    }, [target, searchTerm]);

    const treatmentsByCategory = useMemo(() => {
        return TREATMENT_CATEGORIES.map(category => ({
            category,
            treatments: applicableTreatments.filter(t => t.category === category)
        })).filter(group => group.treatments.length > 0);
    }, [applicableTreatments]);

    if (!target) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                        Seleccionar Hallazgo para Diente {target.toothId}
                        <span className="text-base font-medium text-slate-500 dark:text-slate-400 capitalize"> ({target.surface})</span>
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white w-8 h-8">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar tratamiento..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg py-2 pl-10 pr-4 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                            <SearchIcon />
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 border-t border-slate-200 dark:border-slate-700">
                    {treatmentsByCategory.length > 0 ? (
                        <div className="space-y-4">
                            {treatmentsByCategory.map(({ category, treatments }) => (
                                <CategorySection
                                    key={category}
                                    category={category}
                                    treatments={treatments}
                                    onSelectTreatment={onSelectTreatment}
                                />
                            ))}
                        </div>
                    ) : (
                         <div className="text-center p-6 text-slate-500 dark:text-slate-400">
                            No se encontraron tratamientos para esta selección.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};