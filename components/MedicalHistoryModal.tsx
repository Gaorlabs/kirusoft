
import React, { useState, KeyboardEvent } from 'react';
import type { MedicalHistory } from '../types';
import { CloseIcon, PlusIcon, TrashIcon } from './icons';

interface MedicalHistoryModalProps {
    history: MedicalHistory;
    onClose: () => void;
    onSave: (history: MedicalHistory) => void;
}

interface TagInputProps {
    label: string;
    items: string[];
    setItems: (items: string[]) => void;
    placeholder: string;
}

const TagInput: React.FC<TagInputProps> = ({ label, items, setItems, placeholder }) => {
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
        const trimmed = inputValue.trim();
        if (trimmed && !items.find(i => i.toLowerCase() === trimmed.toLowerCase())) {
            setItems([...items, trimmed]);
            setInputValue('');
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    const handleRemove = (itemToRemove: string) => {
        setItems(items.filter(item => item !== itemToRemove));
    };

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-grow block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
                <button type="button" onClick={handleAdd} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center flex-shrink-0">
                    <PlusIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
                {items.map((item, index) => (
                    <span key={index} className="flex items-center gap-x-1.5 px-2 py-1 text-xs font-medium rounded-full bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200">
                        {item}
                        <button type="button" onClick={() => handleRemove(item)} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                           <CloseIcon className="w-3 h-3"/>
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
};


export const MedicalHistoryModal: React.FC<MedicalHistoryModalProps> = ({ history, onClose, onSave }) => {
    const [currentHistory, setCurrentHistory] = useState<MedicalHistory>(history);

    const updateList = (key: keyof MedicalHistory, items: string[]) => {
        setCurrentHistory(prev => ({...prev, [key]: items }));
    };

    const handleSave = () => {
        onSave(currentHistory);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Editar Historial Médico (Anamnesis)</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"><CloseIcon /></button>
                </div>
                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                    <TagInput 
                        label="Alergias"
                        items={currentHistory.allergies}
                        setItems={(items) => updateList('allergies', items)}
                        placeholder="Ej: Penicilina, AINES..."
                    />
                    <TagInput 
                        label="Enfermedades Sistémicas"
                        items={currentHistory.systemicDiseases}
                        setItems={(items) => updateList('systemicDiseases', items)}
                        placeholder="Ej: Diabetes, Hipertensión..."
                    />
                    <TagInput 
                        label="Medicación Actual"
                        items={currentHistory.currentMedications}
                        setItems={(items) => updateList('currentMedications', items)}
                        placeholder="Ej: Losartán 50mg, Aspirina..."
                    />
                    <TagInput 
                        label="Cirugías Previas"
                        items={currentHistory.pastSurgeries}
                        setItems={(items) => updateList('pastSurgeries', items)}
                        placeholder="Ej: Apendicectomía..."
                    />
                    <TagInput 
                        label="Hábitos"
                        items={currentHistory.habits}
                        setItems={(items) => updateList('habits', items)}
                        placeholder="Ej: Tabaquismo, Bruxismo..."
                    />
                     <div>
                        <label htmlFor="familyHistory" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Antecedentes Familiares</label>
                        <textarea 
                            id="familyHistory"
                            value={currentHistory.familyHistory}
                            onChange={e => setCurrentHistory(prev => ({...prev, familyHistory: e.target.value}))}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white"
                            placeholder="Anotaciones sobre antecedentes médicos familiares relevantes..."
                        />
                    </div>
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 py-2 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 font-semibold">Cancelar</button>
                    <button type="button" onClick={handleSave} className="bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 font-semibold">Guardar Cambios</button>
                </div>
            </div>
        </div>
    );
};
