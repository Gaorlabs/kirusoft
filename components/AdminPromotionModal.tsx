
import React, { useState, useEffect } from 'react';
import type { AdminPromotionModalProps, Promotion } from '../types';
import { CloseIcon } from './icons';

export const AdminPromotionModal: React.FC<AdminPromotionModalProps> = ({ promotion, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<Promotion, 'id' | 'isActive'> & { id?: string }>({
        title: '', subtitle: '', imageUrl: '', ctaText: '', details: ''
    });

    useEffect(() => {
        if (promotion && Object.keys(promotion).length > 0) {
            // FIX: Merged partial promotion prop with a full default object to ensure the object passed to setFormData satisfies the required state type. This resolves a TypeScript error where optional properties on the prop conflicted with required properties in the state.
            setFormData({
                title: '', subtitle: '', imageUrl: '', ctaText: '', details: '',
                ...promotion
            });
        } else {
            setFormData({ title: '', subtitle: '', imageUrl: '', ctaText: '', details: '' });
        }
    }, [promotion]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!promotion) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                 <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">{formData.id ? 'Editar Promoción' : 'Nueva Promoción'}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white w-8 h-8">
                        <CloseIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Título</label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                    </div>
                     <div>
                        <label htmlFor="subtitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Subtítulo</label>
                        <input type="text" name="subtitle" id="subtitle" value={formData.subtitle} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300">URL de la Imagen</label>
                        <input type="text" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                    </div>
                     <div>
                        <label htmlFor="ctaText" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Texto del Botón (CTA)</label>
                        <input type="text" name="ctaText" id="ctaText" value={formData.ctaText} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                    </div>
                     <div>
                        <label htmlFor="details" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Detalles (uno por línea)</label>
                        <textarea name="details" id="details" value={formData.details} onChange={handleChange} required rows={4} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white"></textarea>
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
