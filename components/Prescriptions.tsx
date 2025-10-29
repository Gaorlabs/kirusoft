

import React, { useState, useRef, useMemo } from 'react';
import type { Prescription, Doctor, Medication } from '../types';
import { PlusIcon, FileTextIcon, CloseIcon, PrintIcon, DentalIcon, TrashIcon, WhatsappIcon } from './icons';
import { COMMON_MEDICATIONS, COMMON_RECOMMENDATIONS } from '../constants';

interface PrescriptionModalProps {
    onClose: () => void;
    onSave: (prescription: Omit<Prescription, 'id' | 'date'>) => void;
    doctors: Doctor[];
    treatments: string[];
}

const PrescriptionModal: React.FC<PrescriptionModalProps> = ({ onClose, onSave, doctors, treatments }) => {
    const [medications, setMedications] = useState<Medication[]>([{ name: '', presentation: '', dosage: '' }]);
    const [recommendations, setRecommendations] = useState('');
    const [relatedTreatment, setRelatedTreatment] = useState('');
    const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
    const [medicationSuggestions, setMedicationSuggestions] = useState<Array<typeof COMMON_MEDICATIONS>[]>(() => [[]]);

    const handleAddMedication = () => {
        setMedications(prev => [...prev, { name: '', presentation: '', dosage: '' }]);
        setMedicationSuggestions(prev => [...prev, []]);
    };

    const handleRemoveMedication = (index: number) => {
        if (medications.length > 1) {
            setMedications(prev => prev.filter((_, i) => i !== index));
            setMedicationSuggestions(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleMedicationFieldChange = (index: number, field: keyof Medication, value: string) => {
        const newMedications = [...medications];
        newMedications[index] = { ...newMedications[index], [field]: value };
        
        setMedications(newMedications);

        if (field === 'name' && value) {
            const newSuggestions = [...medicationSuggestions];
            newSuggestions[index] = COMMON_MEDICATIONS.filter(med =>
                med.name.toLowerCase().includes(value.toLowerCase())
            );
            setMedicationSuggestions(newSuggestions);
        } else if (field === 'name') {
            const newSuggestions = [...medicationSuggestions];
            newSuggestions[index] = [];
            setMedicationSuggestions(newSuggestions);
        }
    };

    const handleSuggestionClick = (medIndex: number, med: typeof COMMON_MEDICATIONS[0]) => {
        const newMedications = [...medications];
        newMedications[medIndex] = {
            name: med.name,
            presentation: med.presentation,
            dosage: med.dosage
        };
        setMedications(newMedications);

        const newSuggestions = [...medicationSuggestions];
        newSuggestions[medIndex] = [];
        setMedicationSuggestions(newSuggestions);
    };

    const addRecommendation = (rec: string) => {
        setRecommendations(prev => prev ? `${prev}\n- ${rec}` : `- ${rec}`);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validMedications = medications.filter(m => m.name.trim() && m.dosage.trim());
        if (validMedications.length === 0 || !doctorId) {
            alert('Por favor, añada al menos un medicamento completo y seleccione un doctor.');
            return;
        }
        onSave({ medications: validMedications, recommendations, relatedTreatment, doctorId });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Nueva Receta Profesional</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="doctorId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Doctor que prescribe</label>
                            <select name="doctorId" id="doctorId" value={doctorId} onChange={e => setDoctorId(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="relatedTreatment" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tratamiento Asociado (Opcional)</label>
                            <select name="relatedTreatment" id="relatedTreatment" value={relatedTreatment} onChange={e => setRelatedTreatment(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                <option value="">Ninguno</option>
                                {treatments.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {medications.map((med, index) => (
                            <div key={index} className="relative p-4 border border-slate-300 dark:border-slate-600 rounded-lg space-y-4 bg-slate-50 dark:bg-slate-700/30">
                                {medications.length > 1 && (
                                    <button type="button" onClick={() => handleRemoveMedication(index)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 dark:hover:bg-slate-600 rounded-full">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                )}
                                <div className="relative">
                                    <label htmlFor={`medication-${index}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">Medicamento (Rp/)</label>
                                    <input type="text" id={`medication-${index}`} name="name" value={med.name} onChange={e => handleMedicationFieldChange(index, 'name', e.target.value)} required autoComplete="off" className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                                    {medicationSuggestions[index]?.length > 0 && (
                                        <ul className="absolute z-10 w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md mt-1 shadow-lg max-h-40 overflow-y-auto">
                                            {medicationSuggestions[index].map(medSuggestion => (
                                                <li key={medSuggestion.name} onClick={() => handleSuggestionClick(index, medSuggestion)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer">{medSuggestion.name}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor={`presentation-${index}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">Presentación</label>
                                        <input type="text" id={`presentation-${index}`} name="presentation" value={med.presentation} onChange={e => handleMedicationFieldChange(index, 'presentation', e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label htmlFor={`dosage-${index}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">Indicaciones / Dosis</label>
                                        <input type="text" id={`dosage-${index}`} name="dosage" value={med.dosage} onChange={e => handleMedicationFieldChange(index, 'dosage', e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button type="button" onClick={handleAddMedication} className="w-full flex items-center justify-center space-x-2 border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 font-semibold py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50">
                        <PlusIcon className="w-5 h-5"/>
                        <span>Añadir Medicamento</span>
                    </button>

                    <div>
                        <label htmlFor="recommendations" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Recomendaciones Adicionales</label>
                        <textarea id="recommendations" name="recommendations" value={recommendations} onChange={e => setRecommendations(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {COMMON_RECOMMENDATIONS.map(rec => (
                                <button key={rec} type="button" onClick={() => addRecommendation(rec)} className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-full hover:bg-slate-300 dark:hover:bg-slate-500">+ {rec}</button>
                            ))}
                        </div>
                    </div>
                </form>
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 py-2 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 font-semibold">Cancelar</button>
                    <button type="submit" onClick={handleSubmit} className="bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 font-semibold">Guardar Receta</button>
                </div>
            </div>
        </div>
    );
};

interface PrescriptionsProps {
    prescriptions: Prescription[];
    onUpdate: (prescriptions: Prescription[]) => void;
    patientName: string;
    doctors: Doctor[];
    treatments: string[];
    onAction: (action: 'print' | 'send', type: 'prescription', item: Prescription) => void;
    isSending: boolean;
}

export const Prescriptions: React.FC<PrescriptionsProps> = ({ prescriptions, onUpdate, patientName, doctors, treatments, onAction, isSending }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const doctorsMap = useMemo(() => doctors.reduce((acc, doc) => ({ ...acc, [doc.id]: doc }), {} as Record<string, Doctor>), [doctors]);

    const handleSavePrescription = (data: Omit<Prescription, 'id' | 'date'>) => {
        const newPrescription: Prescription = {
            ...data,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
        };
        onUpdate([...prescriptions, newPrescription]);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200">Recetas Médicas</h3>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg"><PlusIcon /><span>Nueva Receta</span></button>
            </div>

            {prescriptions.length === 0 ? (
                <div className="text-center p-6 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">No hay recetas registradas para este paciente.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {prescriptions.map(p => {
                        const doctor = doctorsMap[p.doctorId];
                        const firstMedication = p.medications[0];
                        return (
                        <div key={p.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-shadow hover:shadow-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-lg text-slate-800 dark:text-slate-200">
                                        {firstMedication?.name}
                                        {p.medications.length > 1 && <span className="text-sm font-normal text-gray-500"> (+{p.medications.length - 1})</span>}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(p.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    {doctor && <p className="text-xs text-gray-500 dark:text-gray-400">Prescrito por: <span className="font-semibold">{doctor.name}</span></p>}
                                </div>
                                <div className="flex items-center space-x-2">
                                     <button onClick={() => onAction('print', 'prescription', p)} className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-1.5 px-3 rounded-md text-sm" title="Imprimir / Descargar Receta">
                                        <PrintIcon className="w-4 h-4"/> 
                                        <span>Imprimir</span>
                                     </button>
                                     <button onClick={() => onAction('send', 'prescription', p)} disabled={isSending} className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-1.5 px-3 rounded-md text-sm disabled:bg-slate-400 disabled:cursor-not-allowed" title="Enviar por WhatsApp">
                                        <WhatsappIcon className="w-4 h-4"/> 
                                        <span>{isSending ? 'Enviando...' : 'Enviar'}</span>
                                     </button>
                                </div>
                            </div>
                        </div>
                    )})}
                </div>
            )}

            {isModalOpen && <PrescriptionModal onClose={() => setIsModalOpen(false)} onSave={handleSavePrescription} doctors={doctors} treatments={treatments}/>}
        </div>
    );
};