import React, { useState, useMemo } from 'react';
import type { Appointment, Doctor } from '../types';
// FIX: Corrected a typo in the import of 'APPOINTMENT_STATUS_CONFIG'.
import { DENTAL_SERVICES_MAP, APPOINTMENT_STATUS_CONFIG } from '../constants';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface AgendaViewProps {
    appointments: Appointment[];
    doctors: Doctor[];
    onSelectAppointment: (appointment: Appointment) => void;
}

// --- Date Helper Functions ---
const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
};

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const getMonthName = (date: Date, locale = 'es-ES') => {
    return date.toLocaleString(locale, { month: 'long' });
};

// --- Component ---
export const AgendaView: React.FC<AgendaViewProps> = ({ appointments, doctors, onSelectAppointment }) => {
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');
    const [currentDate, setCurrentDate] = useState(new Date());

    const doctorsMap = useMemo(() =>
        doctors.reduce((acc, doc) => {
            acc[doc.id] = doc;
            return acc;
        }, {} as Record<string, Doctor>),
        [doctors]
    );

    const appointmentsByDate = useMemo(() => {
        return appointments.reduce((acc, app) => {
            const dateStr = new Date(app.dateTime).toDateString();
            if (!acc[dateStr]) {
                acc[dateStr] = [];
            }
            acc[dateStr].push(app);
            // Sort appointments within the day
            acc[dateStr].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
            return acc;
        }, {} as Record<string, Appointment[]>);
    }, [appointments]);

    const handlePrev = () => {
        if (viewMode === 'week') {
            setCurrentDate(addDays(currentDate, -7));
        } else if (viewMode === 'month') {
            setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
        } else {
            setCurrentDate(addDays(currentDate, -1));
        }
    };

    const handleNext = () => {
        if (viewMode === 'week') {
            setCurrentDate(addDays(currentDate, 7));
        } else if (viewMode === 'month') {
            setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
        } else {
            setCurrentDate(addDays(currentDate, 1));
        }
    };

    const handleToday = () => {
        setCurrentDate(new Date());
        setViewMode('day');
    };

    const renderHeader = () => {
        let title = '';
        if (viewMode === 'week') {
            const startOfWeek = getStartOfWeek(currentDate);
            const endOfWeek = addDays(startOfWeek, 6);
            const startMonth = getMonthName(startOfWeek);
            const endMonth = getMonthName(endOfWeek);
            if (startMonth === endMonth) {
                title = `${startMonth} ${startOfWeek.getFullYear()}`;
            } else {
                title = `${startMonth} - ${endMonth} ${endOfWeek.getFullYear()}`;
            }
        } else if (viewMode === 'day') {
            title = currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        } else {
            title = `${getMonthName(currentDate)} ${currentDate.getFullYear()}`;
        }

        return (
            <div className="flex justify-between items-center mb-4 px-2">
                <div className="flex items-center space-x-2">
                    <button onClick={handlePrev} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><ChevronLeftIcon className="w-5 h-5" /></button>
                    <button onClick={handleNext} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><ChevronRightIcon className="w-5 h-5" /></button>
                    <button onClick={handleToday} className="px-4 py-2 text-sm font-semibold border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50">Hoy</button>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white capitalize">{title}</h3>
                <div className="bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
                    <button onClick={() => setViewMode('month')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'month' ? 'bg-white dark:bg-slate-800 shadow' : 'text-slate-600 dark:text-slate-300'}`}>Mes</button>
                    <button onClick={() => setViewMode('week')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'week' ? 'bg-white dark:bg-slate-800 shadow' : 'text-slate-600 dark:text-slate-300'}`}>Semana</button>
                </div>
            </div>
        );
    };

    const renderDayView = () => {
        const day = currentDate;
        const dayAppointments = appointmentsByDate[day.toDateString()] || [];
        const timeSlots = Array.from({ length: 11 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`); // 8am to 6pm

        return (
            <div className="overflow-auto h-full bg-white dark:bg-slate-900">
                <div className="border-t border-slate-200 dark:border-slate-700">
                    {timeSlots.map(time => {
                        const hour = parseInt(time.split(':')[0]);
                        const hourAppointments = dayAppointments.filter(app => new Date(app.dateTime).getHours() === hour);
                        
                        return (
                            <div key={time} className="flex border-b border-slate-200 dark:border-slate-700 min-h-[60px]">
                                <div className="w-24 text-center text-sm font-semibold text-slate-500 dark:text-slate-400 p-2 border-r border-slate-200 dark:border-slate-700 flex-shrink-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50">
                                    {time}
                                </div>
                                <div className="flex-1 p-2 space-y-2">
                                    {hourAppointments.map(app => {
                                        const doctor = app.doctorId ? doctorsMap[app.doctorId] : null;
                                        const statusInfo = APPOINTMENT_STATUS_CONFIG[app.status];
                                        return (
                                            <button 
                                                key={app.id} 
                                                onClick={() => onSelectAppointment(app)}
                                                className={`w-full text-left ${statusInfo.color} border-l-4 ${statusInfo.borderColor} p-2 rounded-md text-sm hover:shadow-lg transition-all duration-200`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <p className={`font-bold ${statusInfo.textColor}`}>{app.name}</p>
                                                    <p className={`font-semibold ${statusInfo.textColor}`}>{new Date(app.dateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                                <p className={statusInfo.textColor}>{DENTAL_SERVICES_MAP[app.service]}</p>
                                                {doctor && <p className={`text-xs italic ${statusInfo.textColor} opacity-80`}>{doctor.name}</p>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderWeekView = () => {
        const startOfWeek = getStartOfWeek(currentDate);
        const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));
        const timeSlots = Array.from({ length: 11 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`); // 8am to 6pm

        return (
            <div className="overflow-auto h-full">
                <div className="grid grid-cols-[auto_repeat(7,1fr)] min-w-[1200px]">
                    {/* Time column */}
                    <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400"></div>
                    {/* Day headers */}
                    {weekDays.map(day => (
                        <div key={day.toISOString()} className="text-center p-2 border-b border-l border-slate-200 dark:border-slate-700">
                            <p className="font-semibold text-slate-700 dark:text-slate-300">{day.toLocaleDateString('es-ES', { weekday: 'short' })}</p>
                            <p className={`text-2xl font-bold ${new Date().toDateString() === day.toDateString() ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>{day.getDate()}</p>
                        </div>
                    ))}
                    {/* Grid body */}
                    {timeSlots.map(time => (
                        <React.Fragment key={time}>
                            <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 p-2 border-t border-slate-200 dark:border-slate-700 sticky left-0 bg-white dark:bg-slate-800">{time}</div>
                            {weekDays.map(day => {
                                const dayAppointments = appointmentsByDate[day.toDateString()] || [];
                                const hourAppointments = dayAppointments.filter(app => new Date(app.dateTime).getHours() === parseInt(time.split(':')[0]));
                                
                                return (
                                    <div key={day.toISOString()} className="border-t border-l border-slate-200 dark:border-slate-700 p-1 min-h-[80px]">
                                        {hourAppointments.map(app => {
                                            const doctor = app.doctorId ? doctorsMap[app.doctorId] : null;
                                            const statusInfo = APPOINTMENT_STATUS_CONFIG[app.status];
                                            return (
                                                <button 
                                                    key={app.id} 
                                                    onClick={() => onSelectAppointment(app)}
                                                    className={`w-full text-left ${statusInfo.color} border-l-4 ${statusInfo.borderColor} p-1.5 rounded-md text-xs mb-1 hover:shadow-lg hover:scale-105 transition-transform duration-200`}
                                                >
                                                    <p className={`font-bold ${statusInfo.textColor}`}>{app.name}</p>
                                                    <p className={statusInfo.textColor}>{DENTAL_SERVICES_MAP[app.service]}</p>
                                                    {doctor && <p className={`text-xs italic ${statusInfo.textColor} opacity-80`}>{doctor.name}</p>}
                                                    <p className={`font-semibold mt-1 ${statusInfo.textColor}`}>{new Date(app.dateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        );
    };

    const renderMonthView = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        // Adjust to start the week on Monday
        const firstDayGrid = new Date(firstDayOfMonth);
        const dayOfWeek = firstDayGrid.getDay();
        const diff = firstDayGrid.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const startDate = new Date(firstDayGrid.setDate(diff));

        const days = [];
        let day = new Date(startDate);
        
        for (let i = 0; i < 42; i++) {
             days.push(new Date(day));
             day = addDays(day, 1);
        }

        const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

        return (
            <div className="flex flex-col h-full">
                <div className="grid grid-cols-7">
                    {weekDays.map(dayName => (
                        <div key={dayName} className="text-center py-2 text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-l border-slate-200 dark:border-slate-700">{dayName}</div>
                    ))}
                </div>
                <div className="flex-1 grid grid-cols-7 grid-rows-6 border-t border-r border-slate-200 dark:border-slate-700">
                    {days.map((d, index) => {
                        const isCurrentMonth = d.getMonth() === month;
                        const isToday = d.toDateString() === new Date().toDateString();
                        const dayAppointments = appointmentsByDate[d.toDateString()] || [];

                        return (
                            <div key={index} className={`p-1.5 flex flex-col border-b border-l border-slate-200 dark:border-slate-700 ${isCurrentMonth ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                                <div className={`text-sm self-end ${isToday ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold' : isCurrentMonth ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
                                    {d.getDate()}
                                </div>
                                <div className="flex-1 mt-1 overflow-y-auto text-xs space-y-1">
                                    {dayAppointments.slice(0, 2).map(app => {
                                        const statusInfo = APPOINTMENT_STATUS_CONFIG[app.status];
                                        return (
                                            <button 
                                                key={app.id} 
                                                onClick={() => onSelectAppointment(app)}
                                                className={`w-full text-left ${statusInfo.color} p-1 rounded`} 
                                                title={`${app.name} - ${new Date(app.dateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`}
                                            >
                                                <p className={`font-semibold ${statusInfo.textColor} truncate`}>
                                                    <span className="font-mono">{new Date(app.dateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span> {app.name}
                                                </p>
                                            </button>
                                        );
                                    })}
                                    {dayAppointments.length > 2 && (
                                        <div className="text-blue-600 dark:text-blue-400 font-semibold p-1">
                                            +{dayAppointments.length - 2} más
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col">
            {renderHeader()}
            <div className="flex-1 overflow-hidden">
                {{
                    'week': renderWeekView(),
                    'month': renderMonthView(),
                    'day': renderDayView(),
                }[viewMode]}
            </div>
        </div>
    );
};