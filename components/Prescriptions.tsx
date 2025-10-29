

import React, { useState, useRef, useMemo } from 'react';
import type { Prescription, Doctor, Medication } from '../types';
import { PlusIcon, FileTextIcon, CloseIcon, PrintIcon, DentalIcon, TrashIcon } from './icons';
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

const PrescriptionToPrint = React.forwardRef<HTMLDivElement, { prescription: Prescription; clinicName: string; patientName: string; doctor?: Doctor }>(({ prescription, clinicName, patientName, doctor }, ref) => {
    const recommendationsList = prescription.recommendations ? prescription.recommendations.split('\n').map(r => r.replace(/^- /, '')).filter(r => r) : [];

    return (
        <div ref={ref} className="bg-white h-full flex flex-col font-sans text-slate-900">
            {/* Header */}
            <header className="bg-blue-600 text-white p-4 flex justify-between items-start">
                <div className="flex items-center space-x-3">
                    <DentalIcon className="w-12 h-12" />
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">{clinicName} Dental</h1>
                        <p className="text-sm text-blue-200">Salud y Estética Dental de Confianza</p>
                    </div>
                </div>
                <div className="text-right text-xs flex-shrink-0">
                    <p className="font-bold text-base">{doctor?.name}</p>
                    <p>{doctor?.specialty}</p>
                    <p className="font-mono">{doctor?.licenseNumber}</p>
                </div>
            </header>

            {/* Patient Info */}
            <section className="p-4 bg-slate-50 border-b-2 border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-3">Receta Médica</h2>
                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                        <p className="text-slate-500 font-semibold uppercase tracking-wider">Paciente</p>
                        <p className="font-bold text-slate-800 text-sm">{patientName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-500 font-semibold uppercase tracking-wider">Fecha de Emisión</p>
                        <p className="font-bold text-slate-800 text-sm">{new Date(prescription.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
                {prescription.relatedTreatment && (
                    <div className="mt-3">
                        <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Tratamiento Asociado</p>
                        <p className="font-medium text-slate-800 text-sm">{prescription.relatedTreatment}</p>
                    </div>
                )}
            </section>
            
            {/* Body */}
            <main className="flex-1 p-4 space-y-4 text-xs">
                <div>
                    <h2 className="text-pink-600 font-bold text-xl mb-2">Rp/</h2>
                    <table className="w-full text-left">
                        <thead className="border-b-2 border-slate-300">
                            <tr className="text-slate-600 uppercase tracking-wider text-[10px]">
                                <th className="pb-1 font-semibold w-2/5">Producto / Presentación</th>
                                <th className="pb-1 font-semibold">Indicaciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prescription.medications.map((med, index) => (
                                <tr key={index} className="border-b border-slate-200 align-top">
                                    <td className="py-1.5 pr-2">
                                        <p className="font-bold text-slate-800 text-sm">{index + 1}. {med.name}</p>
                                        <p className="text-slate-500">{med.presentation}</p>
                                    </td>
                                    <td className="py-1.5">
                                        <p className="text-slate-700 whitespace-pre-wrap">{med.dosage}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {recommendationsList.length > 0 && (
                    <div>
                        <h3 className="font-bold text-slate-800 border-b-2 border-slate-200 pb-1 mb-2 uppercase tracking-wider text-[10px]">Recomendaciones</h3>
                        <ul className="pl-4 list-disc space-y-1 text-slate-700">
                            {recommendationsList.map((rec, index) => (
                                <li key={index}>{rec}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="px-8 py-6 mt-auto text-center">
                <div className="border-t-2 border-slate-400 w-64 mx-auto pt-3">
                    <p className="font-semibold text-base">{doctor?.name}</p>
                    <p className="text-xs text-slate-500">Firma y Sello del Profesional</p>
                </div>
            </footer>
        </div>
    );
});


const PrescriptionPreviewModal: React.FC<{
    prescription: Prescription;
    patientName: string;
    onClose: () => void;
    doctor?: Doctor;
}> = ({ prescription, patientName, onClose, doctor }) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = printRef.current;
        if (printContent) {
            const winPrint = window.open('', '', 'width=900,height=650');
            if (winPrint) {
                winPrint.document.write('<html><head><title>Receta</title>');
                winPrint.document.write('<script src="https://cdn.tailwindcss.com"></script>');
                winPrint.document.write('<style>@media print { @page { size: A5; margin: 0; } body { -webkit-print-color-adjust: exact; } }</style>');
                winPrint.document.write('</head><body>');
                winPrint.document.write(printContent.innerHTML);
                winPrint.document.write('</body></html>');
                winPrint.document.close();
                winPrint.focus();
                setTimeout(() => {
                    winPrint.print();
                    winPrint.close();
                }, 500);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Vista Previa de Receta (A5)</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"><CloseIcon /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-slate-200 dark:bg-slate-900 flex justify-center">
                    {/* A5 aspect ratio is 148mm x 210mm */}
                    <div className="w-[148mm] h-[210mm] max-w-full scale-[0.4] sm:scale-50 md:scale-75 lg:scale-90 origin-top bg-white shadow-lg">
                         <PrescriptionToPrint ref={printRef} prescription={prescription} clinicName="Kiru" patientName={patientName} doctor={doctor} />
                    </div>
                </div>
                 <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 py-2 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 font-semibold">Cancelar</button>
                    <button type="button" onClick={handlePrint} className="bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 font-semibold flex items-center space-x-2"><PrintIcon className="w-4 h-4"/><span>Imprimir</span></button>
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
}

export const Prescriptions: React.FC<PrescriptionsProps> = ({ prescriptions, onUpdate, patientName, doctors, treatments }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [prescriptionToPreview, setPrescriptionToPreview] = useState<Prescription | null>(null);

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
                        <div key={p.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 transition-shadow hover:shadow-lg">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 flex-shrink-0 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <FileTextIcon className="w-6 h-6"/>
                                    </div>
                                    <div>
                                        {firstMedication && (
                                            <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                                                {firstMedication.name}
                                                {p.medications.length > 1 && <span className="text-sm font-normal text-gray-500"> (+{p.medications.length - 1})</span>}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                     <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{new Date(p.date).toLocaleDateString()}</p>
                                     <button onClick={() => setPrescriptionToPreview(p)} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors" title="Imprimir Receta">
                                        <PrintIcon className="w-5 h-5"/>
                                     </button>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
                                 {p.medications.map((med, index) => (
                                     <div key={index}>
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{index+1}. {med.name} <span className="font-normal text-gray-500 dark:text-gray-400">({med.presentation})</span></p>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 pl-4"> &rarr; {med.dosage}</p>
                                     </div>
                                 ))}
                                 {p.recommendations && (
                                     <div>
                                        <p className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 mt-2">Recomendaciones</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{p.recommendations}</p>
                                    </div>
                                 )}
                                 {doctor && (
                                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Prescrito por: <span className="font-semibold">{doctor.name}</span></p>
                                 )}
                            </div>
                        </div>
                    )})}
                </div>
            )}

            {isModalOpen && <PrescriptionModal onClose={() => setIsModalOpen(false)} onSave={handleSavePrescription} doctors={doctors} treatments={treatments}/>}
            {prescriptionToPreview && (
                <PrescriptionPreviewModal
                    prescription={prescriptionToPreview}
                    patientName={patientName}
                    onClose={() => setPrescriptionToPreview(null)}
                    doctor={doctorsMap[prescriptionToPreview.doctorId]}
                />
            )}
        </div>
    );
};