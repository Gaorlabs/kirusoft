import React, { useState, useEffect } from 'react';
import type { AdminAppointmentModalProps, Appointment } from '../types';
import { CloseIcon } from './icons';
import { DENTAL_SERVICES } from '../constants';

export const AdminAppointmentModal: React.FC<AdminAppointmentModalProps> = ({ appointment, doctors, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<Appointment, 'id'> & { id?: string }>({
        name: '', phone: '', email: '', service: '', dateTime: '', doctorId: '', status: 'requested'
    });

    useEffect(() => {
        if (appointment && Object.keys(appointment).length > 0) {
            const date = appointment.dateTime ? new Date(appointment.dateTime) : new Date();
            const localDateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
            // FIX: Merged partial appointment prop with a full default object to ensure the object passed to setFormData satisfies the required state type. This resolves a TypeScript error where optional properties on the prop conflicted with required properties in the state.
            // FIX: Removed the duplicate `dateTime` property from the object initialization to fix the "An object literal cannot have multiple properties with the same name" error. The final `dateTime: localDateTime` correctly overrides any value from `...appointment`.
            setFormData({
                name: '', phone: '', email: '', service: '', doctorId: '', status: 'requested',
                ...appointment,
                dateTime: localDateTime
            });
        } else {
             setFormData({ name: '', phone: '', email: '', service: '', dateTime: '', doctorId: '', status: 'requested' });
        }
    }, [appointment]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const submittedData = {
            ...formData,
            dateTime: new Date(formData.dateTime || '').toISOString()
        };
        onSave(submittedData);
    };

    if (!appointment) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">{formData.id ? 'Editar Cita' : 'Nueva Cita'}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white w-8 h-8">
                        <CloseIcon />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre del Paciente</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                    </div>
                     <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono</label>
                        <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                    </div>
                     <div>
                        <label htmlFor="dateTime" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha y Hora</label>
                        <input type="datetime-local" name="dateTime" id="dateTime" value={formData.dateTime} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                    </div>
                     <div>
                        <label htmlFor="service" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Servicio</label>
                        <select name="service" id="service" value={formData.service} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white">
                            <option value="" disabled>Seleccionar servicio</option>
                            {DENTAL_SERVICES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="doctorId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Doctor</label>
                        <select name="doctorId" id="doctorId" value={formData.doctorId} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white">
                             <option value="">Sin asignar</option>
                             {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Estado</label>
                        <select name="status" id="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white">
                            <option value="requested">Por Confirmar</option>
                            <option value="confirmed">Confirmada</option>
                            <option value="waiting">En Sala de Espera</option>
                            <option value="in_consultation">En Consulta</option>
                            <option value="completed">Completada</option>
                            <option value="canceled">Cancelada</option>
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