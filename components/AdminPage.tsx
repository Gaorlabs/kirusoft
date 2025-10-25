



import React, { useState, useEffect, useMemo } from 'react';
import type { Appointment, Doctor, Promotion, AppSettings, AppointmentStatus, PatientRecord, Payment } from '../types';
import { APPOINTMENT_STATUS_CONFIG, KANBAN_COLUMNS, DENTAL_SERVICES_MAP, TREATMENTS_MAP } from '../constants';
import {
    DashboardIcon, AppointmentIcon, UsersIcon, MegaphoneIcon, SettingsIcon, PlusIcon, PencilIcon, TrashIcon, BriefcaseIcon, DentalIcon, MoonIcon, SunIcon, OdontogramIcon, ChevronDownIcon, CalendarIcon, WhatsappIcon, DollarSignIcon
} from './icons';
import { AdminAppointmentModal } from './AdminAppointmentModal';
import { AdminDoctorModal } from './AdminDoctorModal';
import { AdminPromotionModal } from './AdminPromotionModal';
import { AgendaView } from './AgendaView';
import { DoctorAvailabilityModal } from './DoctorAvailabilityModal';
import { AdminPaymentModal } from './AdminPaymentModal';


type AdminTab = 'dashboard' | 'agenda' | 'patients' | 'doctors' | 'promotions' | 'settings' | 'accounts';
type MainView = 'odontogram' | 'plan' | 'history' | 'prescriptions' | 'consents' | 'accounts';

type Theme = 'light' | 'dark';

interface AdminPageProps {
    appointments: Appointment[];
    doctors: Doctor[];
    promotions: Promotion[];
    settings: AppSettings;
    patientRecords: Record<string, PatientRecord>;
    onSaveAppointment: (data: Omit<Appointment, 'id'> & { id?: string }) => void;
    onDeleteAppointment: (id: string) => void;
    onSaveDoctor: (data: Omit<Doctor, 'id'> & { id?: string }) => void;
    onDeleteDoctor: (id: string) => void;
    onSavePromotion: (data: Omit<Promotion, 'id' | 'isActive'> & { id?: string }) => void;
    onDeletePromotion: (id: string) => void;
    onTogglePromotionStatus: (id: string) => void;
    setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
    onLogout: () => void;
    onOpenClinicalRecord: (patient: Appointment, targetTab?: MainView) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex items-center space-x-4">
        <div className="bg-pink-100 dark:bg-pink-900/50 p-3 rounded-full text-pink-600 dark:text-pink-400">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const TabButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
            isActive
                ? 'bg-pink-600 text-white shadow-lg'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50'
        }`}
    >
        <div className="w-5 h-5">{icon}</div>
        <span>{label}</span>
    </button>
);


const AdminAccountsView: React.FC<{
    patientRecords: Record<string, PatientRecord>,
    appointments: Appointment[],
    onOpenClinicalRecord: (patient: Appointment, targetTab: MainView) => void;
}> = ({ patientRecords, appointments, onOpenClinicalRecord }) => {

    const patientSummaries = useMemo(() => {
        const summaries: Record<string, { patientId: string; name: string; totalBilled: number; totalPaid: number; balance: number; appointment: Appointment }> = {};

        appointments.forEach(app => {
            if (!summaries[app.id]) {
                summaries[app.id] = {
                    patientId: app.id,
                    name: app.name,
                    totalBilled: 0,
                    totalPaid: 0,
                    balance: 0,
                    appointment: app,
                };
            }
        });

        // FIX: Used Object.keys to iterate over patient records, ensuring proper type inference and preventing potential arithmetic errors.
        Object.keys(patientRecords).forEach(patientId => {
            const record = patientRecords[patientId];
            const summary = summaries[record.patientId];
            if (summary) {
                const billed = (record.sessions || []).flatMap(s => s.treatments).reduce((sum, t) => sum + (TREATMENTS_MAP[t.treatmentId]?.price || 0), 0);
                // FIX: Explicitly type `p` as `Payment` to ensure `p.amount` is treated as a number, preventing arithmetic errors.
                const paid = (record.payments || []).reduce((sum, p: Payment) => sum + Number(p.amount), 0);
                
                summary.totalBilled = billed;
                summary.totalPaid = paid;
                summary.balance = billed - paid;
            }
        });
        
        return Object.values(summaries);

    }, [patientRecords, appointments]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Finanzas - Cuentas por Cobrar</h2>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700">
                        <tr>
                            <th scope="col" className="px-6 py-3">Paciente</th>
                            <th scope="col" className="px-6 py-3 text-right">Total Facturado</th>
                            <th scope="col" className="px-6 py-3 text-right">Total Pagado</th>
                            <th scope="col" className="px-6 py-3 text-right">Saldo Pendiente</th>
                             <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patientSummaries.map(summary => (
                            <tr key={summary.patientId} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{summary.name}</td>
                                <td className="px-6 py-4 text-right">S/ {summary.totalBilled.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right text-green-600 dark:text-green-400">S/ {summary.totalPaid.toFixed(2)}</td>
                                <td className={`px-6 py-4 text-right font-semibold ${summary.balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}>S/ {summary.balance.toFixed(2)}</td>
                                 <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => onOpenClinicalRecord(summary.appointment, 'accounts')}
                                        className="bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900 font-semibold py-1 px-3 rounded-full text-xs"
                                    >
                                        Administrar Pagos
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AdminDashboardView: React.FC<{
    appointments: Appointment[];
    patientRecords: Record<string, PatientRecord>;
}> = ({ appointments, patientRecords }) => {

    const {
        todaysAppointmentsCount,
        activePatientsCount,
        totalProposedValue,
        totalRevenue
    } = useMemo(() => {
        const today = new Date().toDateString();
        const todaysAppointments = appointments.filter(a => new Date(a.dateTime).toDateString() === today);
        const uniquePatients = new Set(appointments.map(a => a.email));

        let proposedValue = 0;
        let revenue = 0;
        
        // FIX: Used Object.keys to iterate over patient records for reliable type inference, preventing potential arithmetic errors during calculations.
        Object.keys(patientRecords).forEach(patientId => {
            const record = patientRecords[patientId];
            (record.sessions || []).forEach(session => {
                session.treatments.forEach(treatment => {
                    const price = TREATMENTS_MAP[treatment.treatmentId]?.price || 0;
                    if (treatment.status === 'proposed') {
                        proposedValue += price;
                    }
                });
            });
            // FIX: Explicitly type `payment` as `Payment` to ensure `payment.amount` is treated as a number, preventing arithmetic errors.
            (record.payments || []).forEach((payment: Payment) => {
                revenue += Number(payment.amount);
            });
        });

        return {
            todaysAppointmentsCount: todaysAppointments.length,
            activePatientsCount: uniquePatients.size,
            totalProposedValue: proposedValue,
            totalRevenue: revenue,
        };
    }, [appointments, patientRecords]);
    
     const weeklyRevenue = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toDateString();
        }).reverse();

        const dailyTotals: Record<string, number> = last7Days.reduce((acc, day) => ({ ...acc, [day]: 0 }), {});

        // FIX: Refactored to use Object.keys for iterating over patientRecords. This provides more stable type inference than Object.values, resolving an arithmetic error when calculating daily payment totals.
        Object.keys(patientRecords).forEach(patientId => {
            const record = patientRecords[patientId];
            // FIX: Explicitly type `payment` to ensure `payment.amount` is treated as a number. This resolves a type inference issue that could lead to arithmetic errors.
            (record.payments || []).forEach((payment: Payment) => {
                const paymentDay = new Date(payment.date).toDateString();
                if (dailyTotals[paymentDay] !== undefined) {
                    dailyTotals[paymentDay] += Number(payment.amount);
                }
            });
        });
        
        return last7Days.map(day => ({
            day: new Date(day).toLocaleDateString('es-ES', { weekday: 'short' }),
            total: dailyTotals[day]
        }));
    }, [patientRecords]);

    const maxRevenue = Math.max(...weeklyRevenue.map(d => d.total), 1);

    const popularServices = useMemo(() => {
        const serviceCounts = appointments.reduce((acc, app) => {
            acc[app.service] = (acc[app.service] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(serviceCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([serviceId, count]) => ({
                name: DENTAL_SERVICES_MAP[serviceId] || 'Desconocido',
                count
            }));
    }, [appointments]);

    // FIX: Pre-calculate max count to avoid division by zero or undefined, resolving arithmetic operation type errors.
    const maxPopularServiceCount = popularServices.length > 0 ? popularServices[0].count : 1;

    const todaysAppointmentList = useMemo(() => {
        return appointments
            .filter(a => new Date(a.dateTime).toDateString() === new Date().toDateString())
            .sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    }, [appointments]);


    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Dashboard</h2>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                 <StatCard title="Valor de Planes Propuestos" value={`S/ ${totalProposedValue.toFixed(2)}`} icon={<BriefcaseIcon />} />
                 <StatCard title="Ingresos Totales" value={`S/ ${totalRevenue.toFixed(2)}`} icon={<DollarSignIcon />} />
                 <StatCard title="Pacientes Activos" value={activePatientsCount} icon={<UsersIcon />} />
                 <StatCard title="Citas para Hoy" value={todaysAppointmentsCount} icon={<AppointmentIcon />} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekly Revenue & Popular Services */}
                <div className="lg:col-span-2 space-y-6">
                     {/* Weekly Revenue Chart */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Ingresos de la Semana</h3>
                        <div className="flex justify-between items-end h-64 space-x-2">
                             {weeklyRevenue.map(({ day, total }) => (
                                <div key={day} className="flex-1 flex flex-col items-center justify-end">
                                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400">S/{total.toFixed(0)}</div>
                                    <div 
                                        className="w-full bg-blue-500 rounded-t-md mt-1 transition-all duration-500 hover:bg-blue-600"
                                        style={{ height: `${(total / maxRevenue) * 100}%`}}
                                        title={`S/ ${total.toFixed(2)}`}
                                    ></div>
                                    <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-2">{day}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Popular Services */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Servicios Populares</h3>
                        <div className="space-y-4">
                            {popularServices.map(({name, count}) => (
                                <div key={name}>
                                    <div className="flex justify-between text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                        <span>{name}</span>
                                        <span>{count} citas</span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                        <div className="bg-pink-500 h-2.5 rounded-full" style={{width: `${(count / maxPopularServiceCount) * 100}%`}}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Today's Agenda */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Agenda del Día</h3>
                     <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {todaysAppointmentList.length > 0 ? todaysAppointmentList.map(app => (
                            <div key={app.id} className={`p-3 rounded-lg border-l-4 ${APPOINTMENT_STATUS_CONFIG[app.status].borderColor} ${APPOINTMENT_STATUS_CONFIG[app.status].color}`}>
                                <p className={`font-bold text-sm ${APPOINTMENT_STATUS_CONFIG[app.status].textColor}`}>{app.name}</p>
                                <p className={`text-xs ${APPOINTMENT_STATUS_CONFIG[app.status].textColor}`}>{new Date(app.dateTime).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})} - {DENTAL_SERVICES_MAP[app.service]}</p>
                            </div>
                        )) : (
                            <p className="text-center text-slate-500 dark:text-slate-400 py-8">No hay citas para hoy.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export const AdminPage: React.FC<AdminPageProps> = (props) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [theme, setTheme] = useState<Theme>('dark');
    const [agendaView, setAgendaView] = useState<'kanban' | 'calendar'>('kanban');
    
    const [editingAppointment, setEditingAppointment] = useState<Appointment | Partial<Appointment> | null>(null);
    const [editingDoctor, setEditingDoctor] = useState<Doctor | Partial<Doctor> | null>(null);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | Partial<Promotion> | null>(null);
    const [localSettings, setLocalSettings] = useState(props.settings);
    
    const [draggedItem, setDraggedItem] = useState<Appointment | null>(null);
    const [dragOverStatus, setDragOverStatus] = useState<AppointmentStatus | null>(null);
    const [editingAvailabilityDoctor, setEditingAvailabilityDoctor] = useState<Doctor | null>(null);


    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
    }, [theme]);
    
     useEffect(() => {
        setLocalSettings(props.settings);
    }, [props.settings]);
    
    const handleSaveAppointment = (data: Omit<Appointment, 'id'> & { id?: string }) => {
        props.onSaveAppointment(data);
        setEditingAppointment(null);
    };

    const handleAppointmentStatusChange = (appointmentId: string, status: AppointmentStatus) => {
        const appointment = props.appointments.find(a => a.id === appointmentId);
        if (appointment) {
            props.onSaveAppointment({ ...appointment, status });
        }
    };
    
    const handleSaveDoctor = (data: Omit<Doctor, 'id'> & { id?: string }) => {
        props.onSaveDoctor(data);
        setEditingDoctor(null);
        setEditingAvailabilityDoctor(null);
    };

    const handleSavePromotion = (data: Omit<Promotion, 'id' | 'isActive'> & { id?: string }) => {
        props.onSavePromotion(data);
        setEditingPromotion(null);
    };

    // FIX: Moved settings handlers out of render logic to prevent potential stale closures and improve performance.
    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSettingsSave = (e: React.FormEvent) => {
        e.preventDefault();
        props.setSettings(localSettings);
        alert('Configuración guardada!');
    };

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, appointment: Appointment) => {
        setDraggedItem(appointment);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: AppointmentStatus) => {
        e.preventDefault();
        if (draggedItem && draggedItem.status !== status) {
            setDragOverStatus(status);
        }
    };

    const handleDragLeave = () => {
        setDragOverStatus(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: AppointmentStatus) => {
        e.preventDefault();
        if (draggedItem && draggedItem.status !== status) {
            handleAppointmentStatusChange(draggedItem.id, status);
        }
        setDraggedItem(null);
        setDragOverStatus(null);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <AdminDashboardView appointments={props.appointments} patientRecords={props.patientRecords} />;
            case 'agenda':
                 return (
                    <div className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Agenda</h2>
                             <div className="flex items-center space-x-4">
                                <div className="bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
                                    <button onClick={() => setAgendaView('kanban')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${agendaView === 'kanban' ? 'bg-white dark:bg-slate-800 shadow' : 'text-slate-600 dark:text-slate-300'}`}>Kanban</button>
                                    <button onClick={() => setAgendaView('calendar')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${agendaView === 'calendar' ? 'bg-white dark:bg-slate-800 shadow' : 'text-slate-600 dark:text-slate-300'}`}>Calendario</button>
                                </div>
                                <button onClick={() => setEditingAppointment({})} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2"><PlusIcon className="w-5 h-5" /><span>Nueva Cita</span></button>
                             </div>
                        </div>
                        {agendaView === 'kanban' ? (
                            <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
                                {KANBAN_COLUMNS.map(status => (
                                    <div 
                                        key={status} 
                                        className={`w-72 flex-shrink-0 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl p-3 flex flex-col transition-colors ${dragOverStatus === status ? 'bg-blue-100 dark:bg-slate-700' : ''}`}
                                        onDragOver={(e) => handleDragOver(e, status)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, status)}
                                    >
                                        <div className="flex items-center mb-4">
                                            <span className={`w-3 h-3 rounded-full mr-2 ${APPOINTMENT_STATUS_CONFIG[status].kanbanHeaderBg}`}></span>
                                            <h3 className="font-semibold text-slate-700 dark:text-slate-200">{APPOINTMENT_STATUS_CONFIG[status].title}</h3>
                                            <span className="ml-auto text-sm font-bold bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full w-6 h-6 flex items-center justify-center">
                                                {props.appointments.filter(a => a.status === status).length}
                                            </span>
                                        </div>
                                        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                                            {props.appointments.filter(app => app.status === status).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()).map(app => (
                                                <div 
                                                    key={app.id} 
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, app)}
                                                    className={`bg-white dark:bg-slate-700 p-4 rounded-lg shadow-md border border-slate-200 dark:border-slate-600 cursor-grab active:cursor-grabbing ${draggedItem?.id === app.id ? 'opacity-50' : ''}`}
                                                >
                                                    <p className="font-bold text-slate-800 dark:text-white">{app.name}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{DENTAL_SERVICES_MAP[app.service]}</p>
                                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">{new Date(app.dateTime).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                                    <div className="border-t border-slate-200 dark:border-slate-600 my-3"></div>
                                                    <div className="flex justify-start items-center">
                                                        <div className="flex items-center space-x-1">
                                                            <button onClick={() => props.onOpenClinicalRecord(app)} className="p-1.5 text-blue-500 hover:bg-blue-100 dark:hover:bg-slate-600 rounded-full transition-colors" title="Abrir Ficha Clínica"><OdontogramIcon className="w-5 h-5" /></button>
                                                            <button onClick={() => setEditingAppointment(app)} className="p-1.5 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-slate-600 rounded-full transition-colors" title="Editar Cita"><PencilIcon className="w-5 h-5" /></button>
                                                             <button onClick={() => {
                                                                const phone = app.phone.replace(/\D/g, '');
                                                                const message = `Hola ${app.name}, te confirmamos tu cita para ${DENTAL_SERVICES_MAP[app.service]} el ${new Date(app.dateTime).toLocaleString('es-ES')}. ¡Te esperamos en Kiru!`;
                                                                window.open(`https://wa.me/51${phone}?text=${encodeURIComponent(message)}`, '_blank');
                                                            }} className="p-1.5 text-green-500 hover:bg-green-100 dark:hover:bg-slate-600 rounded-full transition-colors" title="Enviar WhatsApp">
                                                                <WhatsappIcon className="w-5 h-5" />
                                                            </button>
                                                            <button onClick={() => props.onDeleteAppointment(app.id)} className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-slate-600 rounded-full transition-colors" title="Eliminar Cita"><TrashIcon className="w-5 h-5" /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 h-full">
                                <AgendaView 
                                    appointments={props.appointments} 
                                    doctors={props.doctors}
                                    onSelectAppointment={(app) => setEditingAppointment(app)}
                                />
                            </div>
                        )}
                    </div>
                );
            case 'patients': {
                 // FIX: Used Object.keys().map() to extract patient data, ensuring proper type inference for the 'patients' array where Object.values() was failing.
                 const patientMap = props.appointments.reduce((acc, app) => {
                    acc[app.email] = app;
                    return acc;
                 }, {} as Record<string, Appointment>);
                 const patients = Object.keys(patientMap).map(key => patientMap[key]);
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Pacientes</h2>
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto border border-slate-200 dark:border-slate-700">
                            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Nombre</th>
                                        <th scope="col" className="px-6 py-3">Teléfono</th>
                                        <th scope="col" className="px-6 py-3">Email</th>
                                        <th scope="col" className="px-6 py-3">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patients.map(patient => (
                                        <tr key={patient.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{patient.name}</td>
                                            <td className="px-6 py-4">{patient.phone}</td>
                                            <td className="px-6 py-4">{patient.email}</td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => props.onOpenClinicalRecord(patient)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold flex items-center space-x-2" title="Abrir Ficha Clínica">
                                                    <BriefcaseIcon className="w-5 h-5" />
                                                    <span>Abrir Ficha Clínica</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            }
            case 'doctors':
                 return (
                     <div>
                         <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Doctores</h2>
                            <button onClick={() => setEditingDoctor({})} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2"><PlusIcon className="w-5 h-5" /><span>Nuevo Doctor</span></button>
                        </div>
                         <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto border border-slate-200 dark:border-slate-700">
                            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Nombre</th>
                                        <th scope="col" className="px-6 py-3">Especialidad</th>
                                        <th scope="col" className="px-6 py-3">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {props.doctors.map(doc => (
                                        <tr key={doc.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{doc.name}</td>
                                            <td className="px-6 py-4">{doc.specialty}</td>
                                            <td className="px-6 py-4 flex items-center space-x-2">
                                                 <button onClick={() => setEditingDoctor(doc)} className="p-2 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="Editar"><PencilIcon className="w-5 h-5" /></button>
                                                 <button onClick={() => setEditingAvailabilityDoctor(doc)} className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="Gestionar Disponibilidad"><CalendarIcon className="w-5 h-5" /></button>
                                                 <button onClick={() => props.onDeleteDoctor(doc.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="Eliminar"><TrashIcon className="w-5 h-5" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'promotions':
                 return (
                     <div>
                         <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Promociones</h2>
                            <button onClick={() => setEditingPromotion({})} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2"><PlusIcon className="w-5 h-5" /><span>Nueva Promoción</span></button>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto border border-slate-200 dark:border-slate-700">
                           <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Título</th>
                                        <th scope="col" className="px-6 py-3">Estado</th>
                                        <th scope="col" className="px-6 py-3">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {props.promotions.map(promo => (
                                        <tr key={promo.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{promo.title}</td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => props.onTogglePromotionStatus(promo.id)} className={`px-3 py-1 text-xs font-semibold rounded-full ${promo.isActive ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200'}`}>{promo.isActive ? 'Activa' : 'Inactiva'}</button>
                                            </td>
                                            <td className="px-6 py-4 flex items-center space-x-2">
                                                 <button onClick={() => setEditingPromotion(promo)} className="p-2 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="Editar"><PencilIcon className="w-5 h-5" /></button>
                                                 <button onClick={() => props.onDeletePromotion(promo.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="Eliminar"><TrashIcon className="w-5 h-5" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'accounts':
                return <AdminAccountsView
                    patientRecords={props.patientRecords}
                    appointments={props.appointments}
                    onOpenClinicalRecord={props.onOpenClinicalRecord}
                />;
            case 'settings': {
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Configuración</h2>
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 max-w-2xl">
                            <form onSubmit={handleSettingsSave} className="space-y-6">
                                <div>
                                    <label htmlFor="clinicName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre de la Clínica</label>
                                    <input type="text" name="clinicName" id="clinicName" value={localSettings.clinicName} onChange={handleSettingsChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label htmlFor="clinicAddress" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dirección</label>
                                    <input type="text" name="clinicAddress" id="clinicAddress" value={localSettings.clinicAddress} onChange={handleSettingsChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label htmlFor="clinicPhone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono</label>
                                    <input type="text" name="clinicPhone" id="clinicPhone" value={localSettings.clinicPhone} onChange={handleSettingsChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label htmlFor="clinicEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                                    <input type="email" name="clinicEmail" id="clinicEmail" value={localSettings.clinicEmail} onChange={handleSettingsChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label htmlFor="heroImageUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300">URL Imagen Principal (Landing)</label>
                                    <input type="text" name="heroImageUrl" id="heroImageUrl" value={localSettings.heroImageUrl} onChange={handleSettingsChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label htmlFor="loginImageUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300">URL Imagen (Login)</label>
                                    <input type="text" name="loginImageUrl" id="loginImageUrl" value={localSettings.loginImageUrl} onChange={handleSettingsChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                </div>

                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">Configuración de Pagos</h3>
                                
                                <div className="space-y-4 p-4 border rounded-lg border-slate-300 dark:border-slate-600">
                                    <h4 className="font-semibold text-lg text-slate-700 dark:text-slate-200">Yape</h4>
                                    <div>
                                        <label htmlFor="yapeQrUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300">URL de QR Yape</label>
                                        <input type="text" name="yapeQrUrl" id="yapeQrUrl" value={localSettings.yapeInfo.qrUrl} onChange={e => setLocalSettings(p => ({ ...p, yapeInfo: { ...p.yapeInfo, qrUrl: e.target.value } }))} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label htmlFor="yapeRecipientName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre del Titular (Yape)</label>
                                        <input type="text" name="yapeRecipientName" id="yapeRecipientName" value={localSettings.yapeInfo.recipientName} onChange={e => setLocalSettings(p => ({ ...p, yapeInfo: { ...p.yapeInfo, recipientName: e.target.value } }))} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label htmlFor="yapePhoneNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Número de Teléfono (Yape)</label>
                                        <input type="text" name="yapePhoneNumber" id="yapePhoneNumber" value={localSettings.yapeInfo.phoneNumber} onChange={e => setLocalSettings(p => ({ ...p, yapeInfo: { ...p.yapeInfo, phoneNumber: e.target.value } }))} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                    </div>
                                </div>
                                
                                <div className="space-y-4 p-4 border rounded-lg border-slate-300 dark:border-slate-600">
                                    <h4 className="font-semibold text-lg text-slate-700 dark:text-slate-200">Plin</h4>
                                    <div>
                                        <label htmlFor="plinQrUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300">URL de QR Plin</label>
                                        <input type="text" name="plinQrUrl" id="plinQrUrl" value={localSettings.plinInfo.qrUrl} onChange={e => setLocalSettings(p => ({ ...p, plinInfo: { ...p.plinInfo, qrUrl: e.target.value } }))} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label htmlFor="plinRecipientName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre del Titular (Plin)</label>
                                        <input type="text" name="plinRecipientName" id="plinRecipientName" value={localSettings.plinInfo.recipientName} onChange={e => setLocalSettings(p => ({ ...p, plinInfo: { ...p.plinInfo, recipientName: e.target.value } }))} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label htmlFor="plinPhoneNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Número de Teléfono (Plin)</label>
                                        <input type="text" name="plinPhoneNumber" id="plinPhoneNumber" value={localSettings.plinInfo.phoneNumber} onChange={e => setLocalSettings(p => ({ ...p, plinInfo: { ...p.plinInfo, phoneNumber: e.target.value } }))} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                    </div>
                                </div>
                                
                                <div>
                                    <label htmlFor="whatsappNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Número de WhatsApp (para confirmación de cita)</label>
                                    <input type="text" name="whatsappNumber" id="whatsappNumber" value={localSettings.whatsappNumber} onChange={handleSettingsChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                </div>

                                <div className="pt-2 text-right">
                                     <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-lg">Guardar Cambios</button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            }
        }
    };

    return (
        <div className={`flex h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors`}>
            <aside className="w-64 bg-white dark:bg-slate-800 p-4 flex flex-col border-r border-slate-200 dark:border-slate-700">
                 <div className="flex items-center space-x-2 mb-8 px-2">
                    <div className="w-9 h-9 text-blue-600 dark:text-blue-400"><DentalIcon /></div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{props.settings.clinicName} Admin</h1>
                </div>
                <nav className="flex-1 space-y-2">
                    <TabButton icon={<DashboardIcon />} label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <TabButton icon={<AppointmentIcon />} label="Agenda" isActive={activeTab === 'agenda'} onClick={() => setActiveTab('agenda')} />
                    <TabButton icon={<BriefcaseIcon />} label="Pacientes" isActive={activeTab === 'patients'} onClick={() => setActiveTab('patients')} />
                    <TabButton icon={<UsersIcon />} label="Doctores" isActive={activeTab === 'doctors'} onClick={() => setActiveTab('doctors')} />
                    <TabButton icon={<MegaphoneIcon />} label="Promociones" isActive={activeTab === 'promotions'} onClick={() => setActiveTab('promotions')} />
                    <TabButton icon={<DollarSignIcon />} label="Finanzas" isActive={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')} />
                    <TabButton icon={<SettingsIcon />} label="Configuración" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </nav>
                 <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Admin</span>
                        <button onClick={props.onLogout} className="text-sm text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 font-semibold transition-colors">Cerrar Sesión</button>
                    </div>
                     <button onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} className="w-full flex items-center justify-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600/50 transition-colors">
                        {theme === 'light' ? <MoonIcon className="w-5 h-5"/> : <SunIcon className="w-5 h-5"/>}
                        <span>Cambiar Tema</span>
                    </button>
                </div>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto flex flex-col">
                {renderContent()}
            </main>
            
            {editingAppointment && <AdminAppointmentModal appointment={editingAppointment} doctors={props.doctors} onClose={() => setEditingAppointment(null)} onSave={handleSaveAppointment} />}
            {editingDoctor && <AdminDoctorModal doctor={editingDoctor} onClose={() => setEditingDoctor(null)} onSave={handleSaveDoctor} />}
            {editingPromotion && <AdminPromotionModal promotion={editingPromotion} onClose={() => setEditingPromotion(null)} onSave={handleSavePromotion} />}
            {editingAvailabilityDoctor && <DoctorAvailabilityModal doctor={editingAvailabilityDoctor} onClose={() => setEditingAvailabilityDoctor(null)} onSave={handleSaveDoctor} />}
        </div>
    );
};