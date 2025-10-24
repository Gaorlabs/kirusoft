
import React, { useState, useEffect } from 'react';
import type { Doctor } from '../types';
import { CloseIcon } from './icons';

interface DoctorAvailabilityModalProps {
    doctor: Doctor | null;
    onClose: () => void;
    onSave: (doctor: Doctor) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS: string[] = [];
for (let i = 8; i < 19; i++) {
    TIME_SLOTS.push(`${String(i).padStart(2, '0')}:00`);
}

export const DoctorAvailabilityModal: React.FC<DoctorAvailabilityModalProps> = ({ doctor, onClose, onSave }) => {
    const [availability, setAvailability] = useState<Record<string, string[]>>({});

    useEffect(() => {
        if (doctor?.availability) {
            setAvailability(doctor.availability);
        } else {
            setAvailability({});
        }
    }, [doctor]);

    const handleToggleSlot = (day: string, slot: string) => {
        setAvailability(prev => {
            const daySlots = prev[day] || [];
            if (daySlots.includes(slot)) {
                return { ...prev, [day]: daySlots.filter(s => s !== slot) };
            } else {
                return { ...prev, [day]: [...daySlots, slot].sort() };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (doctor) {
            onSave({ ...doctor, availability });
        }
    };

    if (!doctor) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                 <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Disponibilidad de {doctor.name}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white w-8 h-8">
                        <CloseIcon />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-6 gap-2 text-center">
                        {DAYS_OF_WEEK.map(day => (
                            <div key={day} className="font-semibold text-slate-700 dark:text-slate-300">{day.substring(0,3)}</div>
                        ))}
                        {DAYS_OF_WEEK.map(day => (
                             <div key={day} className="space-y-1">
                                {TIME_SLOTS.map(slot => {
                                    const isAvailable = availability[day]?.includes(slot);
                                    return (
                                        <button 
                                            key={slot}
                                            onClick={() => handleToggleSlot(day, slot)}
                                            className={`w-full p-2 text-xs rounded-md border transition-colors ${
                                                isAvailable 
                                                ? 'bg-blue-500 text-white border-blue-600'
                                                : 'bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700'
                                            }`}
                                        >
                                            {slot}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 py-2 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 font-semibold">Cancelar</button>
                    <button type="button" onClick={handleSubmit} className="bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 font-semibold">Guardar Cambios</button>
                </div>
            </div>
        </div>
    );
};
