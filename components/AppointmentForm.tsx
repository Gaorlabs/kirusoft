

import React, { useState, useMemo } from 'react';
// FIX: Changed import to be a relative path.
import type { Appointment, Doctor } from '../types';
// FIX: Changed import to be a relative path.
import { CloseIcon, UserIcon, PhoneIcon, EmailIcon, ServiceIcon, ChevronDownIcon } from './icons';
import { DENTAL_SERVICES } from '../constants';

interface AppointmentFormProps {
    onClose: () => void;
    onBookAppointment: (appointmentData: Omit<Appointment, 'id' | 'status'>) => void;
    doctors: Doctor[];
}

const generateTimeSlots = (doctors: Doctor[]) => {
    const days: { date: Date, slots: Date[], hasSlots: boolean }[] = [];
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let currentDate = new Date();
    
    for (let i = 0; i < 10; i++) { // Generate for the next 10 days
        const dayDate = new Date(currentDate);
        dayDate.setDate(currentDate.getDate() + i);
        dayDate.setHours(0, 0, 0, 0);
        const dayName = daysOfWeek[dayDate.getDay()];
        
        const daySlots: Date[] = [];
        
        // From 8:00 to 18:00 (6 PM), assuming 1 hour slots
        for (let hour = 8; hour <= 18; hour++) {
            const slotTime = new Date(dayDate);
            slotTime.setHours(hour, 0, 0, 0);
            
            const timeString = `${String(hour).padStart(2, '0')}:00`;
            
            // Check if any doctor is available at this time
            const isAvailable = doctors.some(doc => 
                doc.availability && doc.availability[dayName] && doc.availability[dayName].includes(timeString)
            );
            
            // Only add future slots where a doctor is available
            if (isAvailable && new Date() < slotTime) {
                daySlots.push(slotTime);
            }
        }
        
        days.push({
            date: dayDate,
            slots: daySlots,
            hasSlots: daySlots.length > 0,
        });
    }
    return days;
};


export const AppointmentForm: React.FC<AppointmentFormProps> = ({ onClose, onBookAppointment, doctors }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [service, setService] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    const timeSlotsByDay = useMemo(() => generateTimeSlots(doctors), [doctors]);
    
    const selectedDaySlots = useMemo(() => {
        if (!selectedDate) return [];
        return timeSlotsByDay.find(day => day.date.toDateString() === selectedDate.toDateString())?.slots || [];
    }, [selectedDate, timeSlotsByDay]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot || !name || !email || !phone || !service) {
            alert('Por favor, complete todos los campos, seleccione un servicio y un horario.');
            return;
        }
        onBookAppointment({ name, phone, email, dateTime: selectedSlot, service });
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">Agendar Cita</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 w-8 h-8">
                        <CloseIcon />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                     <div>
                        <h3 className="text-lg font-semibold text-blue-600 mb-4">1. Tus Datos Personales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {/* Name Field */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-500 mb-1">Nombre Completo</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 w-10">
                                        <UserIcon />
                                    </div>
                                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="block w-full rounded-lg border border-slate-300 bg-slate-50 py-3 pl-11 pr-4 text-base text-slate-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors placeholder:text-slate-400" placeholder="Ej. Ana Torres" />
                                </div>
                            </div>
                            {/* Phone Field */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-slate-500 mb-1">Teléfono</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 w-10">
                                        <PhoneIcon />
                                    </div>
                                    <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} required className="block w-full rounded-lg border border-slate-300 bg-slate-50 py-3 pl-11 pr-4 text-base text-slate-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors placeholder:text-slate-400" placeholder="Ej. 987 654 321"/>
                                </div>
                            </div>
                            {/* Email Field */}
                            <div className="md:col-span-2">
                                <label htmlFor="email" className="block text-sm font-medium text-slate-500 mb-1">Correo Electrónico</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 w-10">
                                        <EmailIcon />
                                    </div>
                                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="block w-full rounded-lg border border-slate-300 bg-slate-50 py-3 pl-11 pr-4 text-base text-slate-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors placeholder:text-slate-400" placeholder="ejemplo@correo.com"/>
                                </div>
                            </div>
                            {/* Service Field */}
                            <div className="md:col-span-2">
                                <label htmlFor="service" className="block text-sm font-medium text-slate-500 mb-1">Tipo de Servicio</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 w-10">
                                        <ServiceIcon />
                                    </div>
                                    <select 
                                        id="service" 
                                        value={service} 
                                        onChange={e => setService(e.target.value)} 
                                        required 
                                        className="appearance-none block w-full rounded-lg border border-slate-300 bg-slate-50 py-3 pl-11 pr-10 text-base text-slate-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
                                    >
                                        <option value="" disabled>Seleccione el motivo de su visita</option>
                                        {DENTAL_SERVICES.map(s => (
                                            <option key={s.id} value={s.id}>{s.label}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                        <ChevronDownIcon />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold text-blue-600 mb-4">2. Elige un Día</h3>
                         <div className="flex space-x-2 overflow-x-auto pb-4">
                            {timeSlotsByDay.map(({ date, hasSlots }) => {
                                const isSelected = selectedDate?.toDateString() === date.toDateString();
                                return (
                                    <button
                                        type="button"
                                        key={date.toISOString()}
                                        onClick={() => {
                                            if (hasSlots) {
                                                setSelectedDate(date);
                                                setSelectedSlot(null);
                                            }
                                        }}
                                        disabled={!hasSlots}
                                        className={`p-3 rounded-lg text-center transition-all duration-300 transform flex-shrink-0 w-28 ${
                                            isSelected
                                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg ring-2 ring-blue-300 -translate-y-1'
                                            : hasSlots
                                            ? 'bg-slate-100 hover:bg-blue-100 hover:-translate-y-1'
                                            : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                                        }`}
                                    >
                                        <p className={`text-sm font-bold uppercase ${isSelected ? 'text-blue-200' : hasSlots ? 'text-slate-500' : 'text-slate-400'}`}>{date.toLocaleDateString('es-ES', { weekday: 'short' })}</p>
                                        <p className={`text-4xl font-extrabold my-1 ${!hasSlots && !isSelected ? 'text-slate-400' : ''}`}>{date.getDate()}</p>
                                        <p className={`text-sm font-semibold uppercase ${isSelected ? 'text-blue-200' : hasSlots ? 'text-slate-500' : 'text-slate-400'}`}>{date.toLocaleDateString('es-ES', { month: 'short' })}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className={`transition-all duration-500 ease-in-out ${selectedDate ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                        {selectedDate && (
                            <div>
                                <h3 className="text-lg font-semibold text-blue-600 my-4">3. Elige un Horario</h3>
                                {selectedDaySlots.length > 0 ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {selectedDaySlots.map(slot => (
                                            <button 
                                                type="button"
                                                key={slot.toISOString()}
                                                onClick={() => setSelectedSlot(slot.toISOString())}
                                                className={`p-2 rounded-md border text-sm font-semibold transition-colors duration-200 ${
                                                    selectedSlot === slot.toISOString() 
                                                    ? 'bg-gradient-to-br from-pink-500 to-pink-600 text-white border-pink-700 shadow-md transform scale-105' 
                                                    : 'bg-slate-50 hover:bg-pink-100 hover:border-pink-300 border-slate-300'
                                                }`}
                                            >
                                                {slot.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-slate-500 bg-slate-100 p-4 rounded-lg">No quedan horarios disponibles para este día.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl mt-auto">
                    <button 
                        type="submit"
                        onClick={handleSubmit}
                        disabled={!selectedSlot || !name || !email || !phone || !service}
                        className="w-full bg-pink-600 text-white px-8 py-3 rounded-lg hover:bg-pink-700 font-semibold shadow-lg shadow-pink-500/20 disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed transition-all transform hover:-translate-y-1 disabled:translate-y-0 text-base"
                    >
                        Agendar y Pagar
                    </button>
                </div>
            </div>
        </div>
    );
};