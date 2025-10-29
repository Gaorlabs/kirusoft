

import React, { useMemo, useState, useEffect, useRef } from 'react';
import type { Session, Payment, DentalTreatment } from '../types';
import { PrintIcon, DentalIcon, PlusIcon, CloseIcon, TrashIcon, DollarSignIcon, CheckIcon, PencilIcon, WhatsappIcon } from './icons';

interface PaymentModalProps {
    onClose: () => void;
    onSave: (payment: { amount: number; method: string; date: string; id?: string }) => void;
    paymentToEdit?: Payment | null;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ onClose, onSave, paymentToEdit }) => {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('Efectivo');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

    useEffect(() => {
        if (paymentToEdit) {
            setAmount(paymentToEdit.amount.toString());
            setMethod(paymentToEdit.method);
            setDate(new Date(paymentToEdit.date).toISOString().slice(0, 10));
        }
    }, [paymentToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            alert('Por favor, ingrese un monto válido.');
            return;
        }
        onSave({ 
            amount: numericAmount, 
            method, 
            date: new Date(date).toISOString(), 
            id: paymentToEdit?.id 
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md">
                <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">{paymentToEdit ? 'Editar Pago' : 'Registrar Pago'}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha del Pago</label>
                            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Monto (S/)</label>
                            <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} required min="0.01" step="0.01" className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="method" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Método de Pago</label>
                            <select id="method" value={method} onChange={e => setMethod(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white">
                                <option>Efectivo</option>
                                <option>Tarjeta de Crédito/Débito</option>
                                <option>Transferencia Bancaria</option>
                                <option>Yape/Plin</option>
                            </select>
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 py-2 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 font-semibold">Cancelar</button>
                        <button type="submit" onClick={handleSubmit} className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-semibold">Guardar Pago</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface AccountSummaryModalProps {
    onClose: () => void;
    sessions: Session[];
    patientName: string;
    totalCost: number;
    totalPaid: number;
    balance: number;
    treatmentsMap: Record<string, DentalTreatment>;
    onAction: (action: 'print' | 'send', type: 'accountStatement', item: any) => void;
    isSending: boolean;
}

const AccountSummaryModal: React.FC<AccountSummaryModalProps> = ({ onClose, sessions, patientName, totalCost, totalPaid, balance, treatmentsMap, onAction, isSending }) => {
    const allTreatments = useMemo(() => sessions.flatMap(s => s.treatments.map(t => ({ ...t, sessionName: s.name }))), [sessions]);
    const summaryData = { sessions, totalCost, totalPaid, balance, patientName, treatmentsMap };
    
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm max-h-[90vh] flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Resumen de Cuenta</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"><CloseIcon /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 font-mono text-xs text-slate-800 dark:text-slate-200 w-[300px] mx-auto">
                        <div className="text-center mb-4">
                            <h3 className="font-bold text-lg">Kiru Dental</h3>
                            <p>Av. Sonrisas 123, Lima</p>
                            <p>{new Date().toLocaleString('es-ES')}</p>
                        </div>
                        <div className="border-t border-dashed border-slate-400 my-2"></div>
                        <p><span className="font-semibold">Paciente:</span> {patientName}</p>
                        <div className="border-t border-dashed border-slate-400 my-2"></div>

                        {allTreatments.length > 0 && 
                            allTreatments.map(t => {
                                const info = treatmentsMap[t.treatmentId];
                                return (
                                    <div key={t.id} className="grid grid-cols-3 gap-1">
                                        <span className="col-span-2 truncate">{info?.label} (D{t.toothId})</span>
                                        <span className="text-right">S/{info?.price.toFixed(2)}</span>
                                    </div>
                                );
                            })
                        }
                        
                        <div className="border-t border-dashed border-slate-400 my-2"></div>

                        <div className="space-y-1">
                            <div className="flex justify-between font-semibold">
                                <span>SUBTOTAL:</span>
                                <span>S/{totalCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <span>PAGADO:</span>
                                <span>S/{totalPaid.toFixed(2)}</span>
                            </div>
                            <div className="border-t-2 border-solid border-slate-400 my-2"></div>
                            <div className="flex justify-between font-bold text-base">
                                <span>SALDO:</span>
                                <span>S/{balance.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="text-center mt-4 pt-2 border-t border-dashed border-slate-400">
                            <p>Gracias por su preferencia</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 py-2 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 font-semibold">Cerrar</button>
                    <button type="button" onClick={() => onAction('print', 'accountStatement', summaryData)} className="bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 font-semibold flex items-center space-x-2"><PrintIcon className="w-4 h-4" /><span>Imprimir</span></button>
                </div>
            </div>
        </div>
    );
};


interface AccountsProps {
    sessions: Session[];
    patientId: string;
    payments: Payment[];
    patientName: string;
    treatments: DentalTreatment[];
    onSavePayment: (paymentData: { patientId: string; amount: number; method: string; date: string; id?: string }) => void;
    onDeletePayment: (paymentId: string, patientId: string) => void;
    onAction: (action: 'print' | 'send', type: 'paymentReceipt' | 'accountStatement', item: any) => void;
    isSending: boolean;
}

const StatCard: React.FC<{ title: string; value: string; colorClass: string; icon: React.ReactNode }> = ({ title, value, colorClass, icon }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center space-x-4">
        <div className={`p-3 rounded-full ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    </div>
);

export const Accounts: React.FC<AccountsProps> = ({ sessions, patientId, payments, patientName, treatments, onSavePayment, onDeletePayment, onAction, isSending }) => {
    const [editingPayment, setEditingPayment] = useState<Payment | null | {}>(null);
    const [showSummaryModal, setShowSummaryModal] = useState(false);

    const treatmentsMap = useMemo(() => 
        treatments.reduce((acc, treatment) => {
            acc[treatment.id] = treatment;
            return acc;
        }, {} as Record<string, DentalTreatment>), 
    [treatments]);

    const totalCost = useMemo(() => sessions.flatMap(s => s.treatments).reduce((sum, t) => sum + (treatmentsMap[t.treatmentId]?.price || 0), 0), [sessions, treatmentsMap]);
    const totalPaid = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);
    const balance = totalCost - totalPaid;

    const handleSavePayment = (paymentData: { amount: number; method: string; date: string; id?: string }) => {
        onSavePayment({
            ...paymentData,
            patientId: patientId,
        });
        setEditingPayment(null);
    };
    
    const handleDeletePayment = (paymentId: string) => {
        onDeletePayment(paymentId, patientId);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200">Cuentas del Paciente</h3>
                <div className="flex space-x-2">
                    <button onClick={() => setEditingPayment({})} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"><PlusIcon /><span>Registrar Pago</span></button>
                    <button onClick={() => setShowSummaryModal(true)} className="flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg"><PrintIcon /><span>Estado de Cuenta</span></button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard title="Costo Total" value={`S/ ${totalCost.toFixed(2)}`} colorClass="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400" icon={<DollarSignIcon />} />
                <StatCard title="Total Pagado" value={`S/ ${totalPaid.toFixed(2)}`} colorClass="bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400" icon={<CheckIcon />} />
                <StatCard title="Saldo Pendiente" value={`S/ ${balance.toFixed(2)}`} colorClass="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400" icon={<DollarSignIcon />} />
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                 <div className="p-4">
                     <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Historial de Pagos</h4>
                     <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th scope="col" className="px-4 py-2">Fecha</th>
                                <th scope="col" className="px-4 py-2">Método</th>
                                <th scope="col" className="px-4 py-2 text-right">Monto</th>
                                <th scope="col" className="px-4 py-2 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center p-6 text-gray-500 dark:text-gray-400">No hay pagos registrados.</td>
                                </tr>
                            ) : (
                                payments.map(p => (
                                    <tr key={p.id} className="border-b dark:border-gray-700">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{new Date(p.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">{p.method}</td>
                                        <td className="px-4 py-3 text-right font-semibold">S/ {p.amount.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center space-x-1">
                                                <button onClick={() => onAction('print', 'paymentReceipt', p)} className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" title="Imprimir Recibo">
                                                    <PrintIcon className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => onAction('send', 'paymentReceipt', p)} disabled={isSending} className="p-1 text-green-500 hover:bg-green-100 dark:hover:bg-gray-700 rounded-full disabled:opacity-50" title="Enviar Recibo por WhatsApp">
                                                    <WhatsappIcon className="w-4 h-4"/>
                                                </button>
                                                <button onClick={() => setEditingPayment(p)} className="p-1 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-gray-700 rounded-full" title="Editar Pago">
                                                    <PencilIcon className="w-4 h-4"/>
                                                </button>
                                                <button onClick={() => handleDeletePayment(p.id)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full" title="Eliminar Pago">
                                                    <TrashIcon className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {editingPayment && <PaymentModal onClose={() => setEditingPayment(null)} onSave={handleSavePayment} paymentToEdit={'id' in editingPayment ? editingPayment : undefined} />}
            
            {showSummaryModal && (
                <AccountSummaryModal
                    onClose={() => setShowSummaryModal(false)}
                    onAction={onAction}
                    isSending={isSending}
                    sessions={sessions}
                    patientName={patientName}
                    totalCost={totalCost}
                    totalPaid={totalPaid}
                    balance={balance}
                    treatmentsMap={treatmentsMap}
                />
            )}
        </div>
    );
};