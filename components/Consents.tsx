

import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { ConsentForm, Doctor } from '../types';
import { PlusIcon, CloseIcon, CheckIcon, PencilIcon, PrintIcon, DentalIcon } from './icons';
import { CONSENT_TEMPLATES } from '../constants';

// --- PRINTABLE COMPONENT ---
const ConsentToPrint = React.forwardRef<HTMLDivElement, { consent: ConsentForm; clinicName: string; patientName: string; doctor?: Doctor }>(({ consent, clinicName, patientName, doctor }, ref) => {
    const getFormattedContent = () => {
        return consent.content
            .replace(/\[PACIENTE\]/g, patientName)
            .replace(/\[FECHA\]/g, consent.dateSigned ? new Date(consent.dateSigned).toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES'));
    };

    return (
        <div ref={ref} className="bg-white h-full flex flex-col font-sans text-slate-900 text-sm">
            {/* Header */}
            <header className="bg-blue-600 text-white p-6 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <DentalIcon className="w-12 h-12" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{clinicName} Dental</h1>
                        <p className="text-sm text-blue-200">Consentimiento Informado</p>
                    </div>
                </div>
                {doctor && (
                    <div className="text-right text-sm">
                        <p className="font-bold text-lg">{doctor.name}</p>
                        <p>{doctor.specialty}</p>
                        <p>{doctor.licenseNumber}</p>
                    </div>
                )}
            </header>

            {/* Patient Info */}
            <section className="p-6 bg-slate-50 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-4">{consent.title}</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-slate-500 font-semibold uppercase tracking-wider">Paciente</p>
                        <p className="font-bold text-slate-800 text-base">{patientName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-500 font-semibold uppercase tracking-wider">Fecha de Firma</p>
                        <p className="font-bold text-slate-800 text-base">{consent.dateSigned ? new Date(consent.dateSigned).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
                    </div>
                </div>
            </section>
            
            {/* Body */}
            <main className="flex-1 p-6 space-y-8">
                <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{getFormattedContent()}</p>
            </main>

            {/* Footer */}
            <footer className="p-6 mt-auto text-left">
                 <p className="font-semibold text-slate-600 mb-2">Firma del Paciente:</p>
                <div className="border-t-2 border-slate-300 max-w-xs pt-2 bg-slate-50 p-2 rounded-md">
                    {consent.signatureDataUrl && <img src={consent.signatureDataUrl} alt="Firma del paciente" className="h-20" />}
                </div>
            </footer>
        </div>
    );
});


// --- ADD NEW CONSENT MODAL ---
interface ConsentModalProps {
    onClose: () => void;
    onSave: (consent: Omit<ConsentForm, 'id' | 'dateSigned' | 'status' | 'content'>) => void;
    doctors: Doctor[];
}

const ConsentModal: React.FC<ConsentModalProps> = ({ onClose, onSave, doctors }) => {
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [doctorId, setDoctorId] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const template = CONSENT_TEMPLATES.find(t => t.id === selectedTemplateId);
        if (template) {
            onSave({ templateId: template.id, title: template.title, doctorId: doctorId || undefined });
            onClose();
        } else {
            alert('Por favor, seleccione una plantilla.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg">
                <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Añadir Consentimiento</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="template" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Plantilla de Consentimiento</label>
                            <select id="template" value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                <option value="" disabled>Seleccione una plantilla...</option>
                                {CONSENT_TEMPLATES.map(template => (
                                    <option key={template.id} value={template.id}>{template.title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="doctorId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Doctor (Opcional)</label>
                            <select id="doctorId" value={doctorId} onChange={e => setDoctorId(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                <option value="">Ninguno</option>
                                {doctors.map(doctor => (
                                    <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 py-2 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 font-semibold">Cancelar</button>
                        <button type="submit" className="bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 font-semibold">Añadir</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- SIGNING MODAL ---
interface ConsentSigningModalProps {
    consent: ConsentForm;
    onClose: () => void;
    onSave: (signatureDataUrl: string) => void;
    patientName: string;
}

const ConsentSigningModal: React.FC<ConsentSigningModalProps> = ({ consent, onClose, onSave, patientName }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const getFormattedContent = () => {
        return consent.content
            .replace(/\[PACIENTE\]/g, patientName)
            .replace(/\[FECHA\]/g, new Date().toLocaleDateString('es-ES'));
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#334155'; // slate-700
        
        const getPos = (e: MouseEvent | TouchEvent) => {
            const rect = canvas.getBoundingClientRect();
            let clientX, clientY;
            if (e instanceof MouseEvent) {
                clientX = e.clientX;
                clientY = e.clientY;
            } else {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            }
            return { x: clientX - rect.left, y: clientY - rect.top };
        };
        
        const startDrawing = (e: MouseEvent | TouchEvent) => { e.preventDefault(); setIsDrawing(true); const pos = getPos(e); ctx.beginPath(); ctx.moveTo(pos.x, pos.y); };
        const draw = (e: MouseEvent | TouchEvent) => { e.preventDefault(); if (!isDrawing) return; const pos = getPos(e); ctx.lineTo(pos.x, pos.y); ctx.stroke(); };
        const stopDrawing = () => { if(isDrawing) { setIsDrawing(false); ctx.closePath(); }};

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
        canvas.addEventListener('touchstart', startDrawing, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', stopDrawing);

        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseleave', stopDrawing);
            canvas.removeEventListener('touchstart', startDrawing);
            canvas.removeEventListener('touchmove', draw);
            canvas.removeEventListener('touchend', stopDrawing);
        };
    }, [isDrawing]);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
    };
    
    const handleSave = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const blank = document.createElement('canvas');
            blank.width = canvas.width;
            blank.height = canvas.height;
            if (canvas.toDataURL() === blank.toDataURL()) {
                alert("Por favor, el paciente debe firmar el documento.");
                return;
            }
            onSave(canvas.toDataURL('image/png'));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">{consent.title}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"><CloseIcon /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                        <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{getFormattedContent()}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Firma del Paciente:</label>
                        <canvas ref={canvasRef} width="700" height="200" className="bg-slate-100 dark:bg-slate-700 rounded-lg border-2 border-slate-300 dark:border-slate-600 w-full cursor-crosshair"></canvas>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                    <button type="button" onClick={clearCanvas} className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold">Limpiar</button>
                    <div className="space-x-3">
                        <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 py-2 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 font-semibold">Cancelar</button>
                        <button type="button" onClick={handleSave} className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-semibold">Guardar Firma</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- VIEW SIGNED MODAL ---
const ConsentViewModal: React.FC<{ consent: ConsentForm; onClose: () => void; patientName: string; onPrint: () => void; }> = ({ consent, onClose, patientName, onPrint }) => {
    const getFormattedContent = () => {
        return consent.content
            .replace(/\[PACIENTE\]/g, patientName)
            .replace(/\[FECHA\]/g, consent.dateSigned ? new Date(consent.dateSigned).toLocaleDateString('es-ES') : '');
    };
    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Ver Consentimiento Firmado</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"><CloseIcon /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                        <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{getFormattedContent()}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Firma registrada:</p>
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg border-2 border-slate-300 dark:border-slate-600">
                           {consent.signatureDataUrl && <img src={consent.signatureDataUrl} alt="Firma del paciente" className="mx-auto" />}
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between">
                     <button type="button" onClick={onPrint} className="bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 font-semibold flex items-center space-x-2">
                        <PrintIcon className="w-4 h-4"/>
                        <span>Imprimir / Descargar</span>
                    </button>
                    <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 py-2 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 font-semibold">Cerrar</button>
                </div>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---
interface ConsentsProps {
    consents: ConsentForm[];
    onUpdate: (consents: ConsentForm[]) => void;
    patientName: string;
    doctors: Doctor[];
}

export const Consents: React.FC<ConsentsProps> = ({ consents, onUpdate, patientName, doctors }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [signingConsent, setSigningConsent] = useState<ConsentForm | null>(null);
    const [viewingConsent, setViewingConsent] = useState<ConsentForm | null>(null);
    const [consentToPrint, setConsentToPrint] = useState<ConsentForm | null>(null);
    const printRef = useRef<HTMLDivElement>(null);
    
    const doctorsMap = useMemo(() => doctors.reduce((acc, doc) => ({ ...acc, [doc.id]: doc }), {} as Record<string, Doctor>), [doctors]);

    const handleSaveConsent = (data: Omit<ConsentForm, 'id' | 'dateSigned' | 'status' | 'content' | 'signatureDataUrl'>) => {
        const template = CONSENT_TEMPLATES.find(t => t.id === data.templateId);
        if (!template) return;

        const newConsent: ConsentForm = {
            ...data,
            id: crypto.randomUUID(),
            dateSigned: null,
            status: 'pending',
            content: template.content,
        };
        onUpdate([...consents, newConsent]);
    };
    
    const handleSaveSignature = (consentId: string, signatureDataUrl: string) => {
        const updatedConsents = consents.map(c => 
            c.id === consentId ? { ...c, status: 'signed' as const, dateSigned: new Date().toISOString(), signatureDataUrl } : c
        );
        onUpdate(updatedConsents);
        setSigningConsent(null);
    };
    
    useEffect(() => {
        if (consentToPrint && printRef.current) {
            const printContent = printRef.current;
            const winPrint = window.open('', '', 'width=900,height=650');
            if (winPrint) {
                winPrint.document.write('<html><head><title>Consentimiento</title>');
                winPrint.document.write('<script src="https://cdn.tailwindcss.com"></script>');
                winPrint.document.write('<style>@media print { @page { size: A4; margin: 0; } body { -webkit-print-color-adjust: exact; } }</style>');
                winPrint.document.write('</head><body>');
                winPrint.document.write(printContent.innerHTML);
                winPrint.document.write('</body></html>');
                winPrint.document.close();
                winPrint.focus();
                setTimeout(() => {
                    winPrint.print();
                    winPrint.close();
                    setConsentToPrint(null);
                }, 500);
            }
        }
    }, [consentToPrint]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200">Consentimientos Informados</h3>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg"><PlusIcon /><span>Añadir Consentimiento</span></button>
            </div>

            {consents.length === 0 ? (
                <div className="text-center p-6 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">No hay consentimientos registrados para este paciente.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {consents.map(c => (
                        <div key={c.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-gray-800 dark:text-white">{c.title}</p>
                                {c.status === 'signed' && c.dateSigned && (
                                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold">Firmado el {new Date(c.dateSigned).toLocaleDateString()}</p>
                                )}
                            </div>
                            <div>
                                {c.status === 'pending' ? (
                                    <button onClick={() => setSigningConsent(c)} className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold py-1 px-3 rounded-full text-sm hover:bg-blue-200 flex items-center space-x-2"><PencilIcon className="w-4 h-4" /><span>Firmar</span></button>
                                ) : (
                                    <button onClick={() => setViewingConsent(c)} className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-semibold py-1 px-3 rounded-full text-sm hover:bg-green-200 flex items-center space-x-2"><CheckIcon className="w-4 h-4" /><span>Ver Firmado</span></button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && <ConsentModal onClose={() => setIsModalOpen(false)} onSave={handleSaveConsent} doctors={doctors} />}
            {signingConsent && <ConsentSigningModal consent={signingConsent} onClose={() => setSigningConsent(null)} onSave={(sig) => handleSaveSignature(signingConsent.id, sig)} patientName={patientName} />}
            {viewingConsent && <ConsentViewModal 
                                    consent={viewingConsent} 
                                    onClose={() => setViewingConsent(null)} 
                                    patientName={patientName} 
                                    onPrint={() => {
                                        setConsentToPrint(viewingConsent);
                                        setViewingConsent(null);
                                    }}
                                />}
            <div className="hidden">
                {consentToPrint && (
                    <ConsentToPrint
                        ref={printRef}
                        consent={consentToPrint}
                        clinicName="Kiru"
                        patientName={patientName}
                        doctor={consentToPrint.doctorId ? doctorsMap[consentToPrint.doctorId] : undefined}
                    />
                )}
            </div>
        </div>
    );
};