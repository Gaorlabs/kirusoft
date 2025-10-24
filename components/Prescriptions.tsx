import React, { useState, useRef } from 'react';
import type { Prescription } from '../types';
import { PlusIcon, FileTextIcon, CloseIcon, PrintIcon } from './icons';

interface PrescriptionModalProps {
    onClose: () => void;
    onSave: (prescription: Omit<Prescription, 'id' | 'date'>) => void;
}

const PrescriptionModal: React.FC<PrescriptionModalProps> = ({ onClose, onSave }) => {
    const [medication, setMedication] = useState('');
    const [dosage, setDosage] = useState('');
    const [instructions, setInstructions] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!medication || !dosage || !instructions) {
            alert('Por favor, complete todos los campos.');
            return;
        }
        onSave({ medication, dosage, instructions });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg">
                <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Nueva Receta</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="medication" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Medicamento</label>
                            <input type="text" id="medication" value={medication} onChange={e => setMedication(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="dosage" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dosis</label>
                            <input type="text" id="dosage" value={dosage} onChange={e => setDosage(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="instructions" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Instrucciones</label>
                            <textarea id="instructions" value={instructions} onChange={e => setInstructions(e.target.value)} required rows={4} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 py-2 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 font-semibold">Cancelar</button>
                        <button type="submit" className="bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 font-semibold">Guardar Receta</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const PrescriptionToPrint = React.forwardRef<HTMLDivElement, { prescription: Prescription, clinicName: string, patientName: string }>(({ prescription, clinicName, patientName }, ref) => {
    return (
        <div ref={ref} className="p-8 font-sans text-gray-800">
            <div className="flex justify-between items-start pb-4 border-b">
                <div>
                    <h1 className="text-3xl font-bold">{clinicName} Dental</h1>
                    <p>Av. Sonrisas 123, Lima, Perú</p>
                </div>
                <div className="text-blue-500">
                   <FileTextIcon className="w-16 h-16"/>
                </div>
            </div>
            <div className="my-6">
                <h2 className="text-2xl font-semibold mb-2">Receta Médica</h2>
                <div className="grid grid-cols-2 gap-4">
                    <p><span className="font-semibold">Fecha:</span> {new Date(prescription.date).toLocaleDateString()}</p>
                    <p><span className="font-semibold">Paciente:</span> {patientName}</p>
                </div>
            </div>

            <div className="mt-8 p-4 border rounded-lg">
                <p className="font-bold text-xl text-blue-600">{prescription.medication}</p>
                <p className="text-md font-semibold text-gray-600">{prescription.dosage}</p>
                <div className="mt-4 pt-4 border-t">
                    <p className="font-semibold mb-1">Instrucciones:</p>
                    <p className="text-md text-gray-700 whitespace-pre-wrap">{prescription.instructions}</p>
                </div>
            </div>
            <div className="mt-24 text-center">
                <p className="border-t-2 w-1/2 mx-auto pt-2">Firma del Doctor</p>
            </div>
        </div>
    );
});


interface PrescriptionsProps {
    prescriptions: Prescription[];
    onUpdate: (prescriptions: Prescription[]) => void;
    patientName: string;
}

export const Prescriptions: React.FC<PrescriptionsProps> = ({ prescriptions, onUpdate, patientName }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [prescriptionToPrint, setPrescriptionToPrint] = useState<Prescription | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const handleSavePrescription = (data: Omit<Prescription, 'id' | 'date'>) => {
        const newPrescription: Prescription = {
            ...data,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
        };
        onUpdate([...prescriptions, newPrescription]);
    };

    const handlePrint = (prescription: Prescription) => {
        setPrescriptionToPrint(prescription);
        setTimeout(() => {
            const printContent = printRef.current;
            if (printContent) {
                const winPrint = window.open('', '', 'width=900,height=650');
                if (winPrint) {
                    winPrint.document.write('<html><head><title>Receta</title>');
                    winPrint.document.write('<script src="https://cdn.tailwindcss.com"></script>');
                    winPrint.document.write('</head><body>');
                    winPrint.document.write(printContent.innerHTML);
                    winPrint.document.write('</body></html>');
                    winPrint.document.close();
                    winPrint.focus();
                    setTimeout(() => {
                        winPrint.print();
                        winPrint.close();
                        setPrescriptionToPrint(null);
                    }, 500);
                }
            }
        }, 100);
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
                    {prescriptions.map(p => (
                        <div key={p.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 transition-shadow hover:shadow-lg">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 flex-shrink-0 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <FileTextIcon className="w-6 h-6"/>
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-blue-600 dark:text-blue-400">{p.medication}</p>
                                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{p.dosage}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                     <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{new Date(p.date).toLocaleDateString()}</p>
                                     <button onClick={() => handlePrint(p)} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors" title="Imprimir Receta">
                                        <PrintIcon className="w-5 h-5"/>
                                     </button>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                 <p className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 mb-1">Instrucciones</p>
                                 <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{p.instructions}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && <PrescriptionModal onClose={() => setIsModalOpen(false)} onSave={handleSavePrescription} />}
             <div className="hidden">
                 {prescriptionToPrint && <PrescriptionToPrint ref={printRef} prescription={prescriptionToPrint} clinicName="Kiru" patientName={patientName}/>}
            </div>
        </div>
    );
};