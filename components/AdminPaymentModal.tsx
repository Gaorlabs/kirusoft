
import React, { useState, useEffect } from 'react';
import type { AdminPaymentModalProps, Payment } from '../types';
import { CloseIcon } from './icons';

export const AdminPaymentModal: React.FC<AdminPaymentModalProps> = ({ payment, patients, onClose, onSave }) => {
    
    const [formData, setFormData] = useState({
        id: '',
        patientId: '',
        date: new Date().toISOString().slice(0, 10),
        amount: '',
        method: 'Efectivo',
    });

    useEffect(() => {
        if (payment) {
            setFormData({
                id: (payment as Payment & { patientId: string }).id || '',
                patientId: payment.patientId || '',
                date: payment.date ? new Date(payment.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
                amount: payment.amount?.toString() || '',
                method: payment.method || 'Efectivo',
            });
        }
    }, [payment]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(formData.amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            alert('Por favor, ingrese un monto válido.');
            return;
        }
        if (!formData.patientId) {
            alert('Por favor, seleccione un paciente.');
            return;
        }
        
        onSave({
            id: formData.id || undefined,
            patientId: formData.patientId,
            amount: numericAmount,
            method: formData.method,
            date: new Date(formData.date).toISOString(),
        });
        onClose();
    };

    if (!payment) return null;
    
    const isNew = !(payment as Payment).id;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">{isNew ? 'Registrar Pago' : 'Editar Pago'}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white w-8 h-8">
                        <CloseIcon />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div>
                        <label htmlFor="patientId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Paciente</label>
                        <select 
                            name="patientId" 
                            id="patientId" 
                            value={formData.patientId} 
                            onChange={handleChange} 
                            required 
                            disabled={!isNew}
                            className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white disabled:bg-slate-200 dark:disabled:bg-slate-600"
                        >
                            <option value="" disabled>Seleccionar paciente</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha del Pago</label>
                        <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                    </div>
                     <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Monto (S/)</label>
                        <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} required min="0.01" step="0.01" className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                    </div>
                     <div>
                        <label htmlFor="method" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Método de Pago</label>
                        <select name="method" id="method" value={formData.method} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white">
                            <option>Efectivo</option>
                            <option>Tarjeta de Crédito/Débito</option>
                            <option>Transferencia Bancaria</option>
                            <option>Yape/Plin</option>
                        </select>
                    </div>
                </form>

                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 py-2 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 font-semibold">Cancelar</button>
                    <button type="submit" onClick={handleSubmit} className="bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 font-semibold">Guardar</button>
                </div>
            </div>
        </div>
    );
};