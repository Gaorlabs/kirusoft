
import React, { useState, useEffect } from 'react';
import type { AdminTreatmentModalProps, DentalTreatment, TreatmentApplication } from '../types';
import { CloseIcon } from './icons';
import { TREATMENT_CATEGORIES } from '../constants';

export const AdminTreatmentModal: React.FC<AdminTreatmentModalProps> = ({ treatment, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        id: '',
        label: '',
        category: TREATMENT_CATEGORIES[0],
        price: 0,
        appliesTo: 'surface' as TreatmentApplication,
    });

    const isNew = !treatment || !('id' in treatment) || !treatment.id;

    useEffect(() => {
        if (treatment && !isNew) {
            setFormData({
                id: (treatment as DentalTreatment).id,
                label: (treatment as DentalTreatment).label,
                category: (treatment as DentalTreatment).category,
                price: (treatment as DentalTreatment).price,
                appliesTo: (treatment as DentalTreatment).appliesTo,
            });
        } else {
            setFormData({
                id: '',
                label: '',
                category: TREATMENT_CATEGORIES[0],
                price: 0,
                appliesTo: 'surface' as TreatmentApplication,
            });
        }
    }, [treatment, isNew]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!treatment) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">{isNew ? 'Nuevo Servicio' : 'Editar Servicio'}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white w-8 h-8">
                        <CloseIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div>
                        <label htmlFor="label" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre del Servicio</label>
                        <input type="text" name="label" id="label" value={formData.label} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Precio (S/)</label>
                        <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Categoría</label>
                        <select name="category" id="category" value={formData.category} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white">
                            {TREATMENT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="appliesTo" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Aplica a</label>
                        <select name="appliesTo" id="appliesTo" value={formData.appliesTo} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white">
                            <option value="surface">Superficie</option>
                            <option value="whole_tooth">Diente Completo</option>
                            <option value="root">Raíz</option>
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