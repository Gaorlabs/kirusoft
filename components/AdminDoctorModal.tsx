import React, { useState, useEffect } from 'react';
import type { AdminDoctorModalProps, Doctor } from '../types';
import { CloseIcon } from './icons';

export const AdminDoctorModal: React.FC<AdminDoctorModalProps> = ({ doctor, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<Doctor, 'id'> & { id?: string }>({ name: '', specialty: '' });

    useEffect(() => {
        if (doctor && Object.keys(doctor).length > 0) {
            // FIX: Merged partial doctor prop with a full default object to ensure the object passed to setFormData satisfies the required state type. This resolves a TypeScript error where optional properties on the prop conflicted with required properties in the state.
            setFormData({
                name: '', specialty: '',
                ...doctor
            });
        } else {
             setFormData({ name: '', specialty: '' });
        }
    }, [doctor]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!doctor) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
                 <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">{formData.id ? 'Editar Doctor' : 'Nuevo Doctor'}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white w-8 h-8">
                        <CloseIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre Completo</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                    </div>
                     <div>
                        <label htmlFor="specialty" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Especialidad</label>
                        <input type="text" name="specialty" id="specialty" value={formData.specialty} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
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