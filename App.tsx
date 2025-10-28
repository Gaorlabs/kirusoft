
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { AdminPage } from './components/AdminPage';
import { ConsultationRoom } from './components/ConsultationRoom';
// FIX: Corrected typo 'OdogramState' to 'OdontogramState'.
import type { Appointment, Doctor, Promotion, AppSettings, PatientRecord, OdontogramState, Payment } from './types';
import { DENTAL_SERVICES_MAP, ALL_TEETH_PERMANENT, ALL_TEETH_DECIDUOUS } from './constants';
import { PaymentModal } from './components/PaymentModal';
import { AppointmentForm } from './components/AppointmentForm';

const initialToothState = { surfaces: { buccal: [], lingual: [], occlusal: [], distal: [], mesial: [], root: [] }, whole: [], findings: [] };
// FIX: Corrected typo 'OdogramState' to 'OdontogramState'.
const createInitialOdontogram = (teeth: number[]): OdontogramState => teeth.reduce((acc, toothId) => ({ ...acc, [toothId]: structuredClone(initialToothState) }), {});

// Mock data for initial state
const MOCK_DOCTORS: Doctor[] = [
    { id: 'doc1', name: 'Dr. Ana García', specialty: 'Ortodoncia', availability: {
        'Monday': ['09:00', '10:00', '11:00', '14:00', '15:00'],
        'Wednesday': ['09:00', '10:00', '11:00', '12:00'],
        'Friday': ['09:00', '10:00', '14:00', '15:00', '16:00'],
    } },
    { id: 'doc2', name: 'Dr. Carlos Martinez', specialty: 'Endodoncia', availability: {
        'Tuesday': ['10:00', '11:00', '12:00', '15:00', '16:00', '17:00'],
        'Thursday': ['09:00', '10:00', '11:00', '14:00'],
    } },
    { id: 'doc3', name: 'Dr. Sofia Rodriguez', specialty: 'Cirugía Bucal', availability: {
        'Monday': ['15:00', '16:00', '17:00'],
        'Tuesday': ['09:00', '10:00'],
        'Wednesday': ['15:00', '16:00', '17:00'],
        'Thursday': ['15:00', '16:00'],
        'Friday': ['11:00', '12:00'],
    } },
];

const MOCK_APPOINTMENTS: Appointment[] = [
    { id: 'apt1', name: 'Juan Perez', phone: '987654321', email: 'juan.perez@email.com', dateTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), service: 'orthodontics', status: 'confirmed', doctorId: 'doc1' },
    { id: 'apt2', name: 'Maria Lopez', phone: '912345678', email: 'maria.lopez@email.com', dateTime: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), service: 'endodontics', status: 'confirmed', doctorId: 'doc2' },
    { id: 'apt3', name: 'Pedro Ramirez', phone: '955555555', email: 'pedro.ramirez@email.com', dateTime: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), service: 'cosmetic_dentistry', status: 'completed', doctorId: 'doc1' },
    // FIX: Corrected an appointment object that was missing the required `status` property and had an invalid `service` value. The `service` was changed to 'emergency' and `status` was set to 'waiting'.
    { id: 'apt4', name: 'Laura Sanchez', phone: '933333333', email: 'laura.s@email.com', dateTime: new Date(new Date().setDate(new Date().getDate())).toISOString(), service: 'emergency', status: 'waiting', doctorId: 'doc3' },
    { id: 'apt5', name: 'Carlos Gomez', phone: '922222222', email: 'carlos.g@email.com', dateTime: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(), service: 'restorations', status: 'requested', doctorId: undefined },
];

const MOCK_PROMOTIONS: Promotion[] = [
    { id: 'promo1', title: 'Limpieza Dental 2x1', subtitle: 'Paga una y la segunda es GRATIS', imageUrl: 'https://images.unsplash.com/photo-1629905675717-f6d3b3c0ca60?q=80&w=2070&auto=format&fit=crop', ctaText: 'Agendar Ahora', isActive: true, details: 'Válido para limpiezas profundas.\nAplica para dos personas en la misma visita.\nNo acumulable con otras promociones.' },
    { id: 'promo2', title: 'Blanqueamiento Dental', subtitle: 'Luce una sonrisa más blanca y brillante.', imageUrl: 'https://images.unsplash.com/photo-1606923235213-a4e9b9a61a04?q=80&w=2070&auto=format&fit=crop', ctaText: 'Más Información', isActive: false, details: 'Tratamiento de blanqueamiento profesional en consultorio.' },
];

const MOCK_SETTINGS: AppSettings = {
    clinicName: 'Kiru',
    clinicAddress: 'Av. Sonrisas 123, Lima, Perú',
    clinicPhone: '(+51) 123 456 78',
    clinicEmail: 'info@kiru.com',
    heroImageUrl: 'https://images.unsplash.com/photo-1606811413289-29109a63da4a?q=80&w=2070&auto=format&fit=crop',
    loginImageUrl: 'https://images.unsplash.com/photo-1629904850781-2a6d71c1c739?q=80&w=1974&auto=format&fit=crop',
    yapeInfo: {
        qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=yape-payment-info-kiru-ana',
        recipientName: 'Ana García (Yape)',
        phoneNumber: '987654321',
    },
    plinInfo: {
        qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=plin-payment-info-kiru-carlos',
        recipientName: 'Carlos Martinez (Plin)',
        phoneNumber: '912345678',
    },
    whatsappNumber: '51987654321',
};

const MOCK_PATIENT_RECORDS: Record<string, PatientRecord> = {
    'apt1': { // Juan Perez
        patientId: 'apt1',
        permanentOdontogram: createInitialOdontogram(ALL_TEETH_PERMANENT),
        deciduousOdontogram: createInitialOdontogram(ALL_TEETH_DECIDUOUS),
        sessions: [
            { id: 'sess1', name: 'Sesión 1', status: 'completed', treatments: [
                { id: 'treat1', treatmentId: 'filling', toothId: 16, surface: 'occlusal', status: 'completed', sessionId: 'sess1' }
            ], date: new Date('2023-10-15').toISOString(), notes: 'Revisión inicial completa. Paciente presenta buena higiene bucal.', documents: [] }
        ],
        medicalAlerts: ['Hipertensión controlada.'],
        prescriptions: [],
        consents: [],
        payments: [{ id: 'pay1', date: new Date('2023-10-15').toISOString(), amount: 120, method: 'Efectivo' }],
    },
    'apt4': { // Laura Sanchez
        patientId: 'apt4',
        permanentOdontogram: createInitialOdontogram(ALL_TEETH_PERMANENT),
        deciduousOdontogram: createInitialOdontogram(ALL_TEETH_DECIDUOUS),
        sessions: [],
        medicalAlerts: ['Alergia a la penicilina.'],
        prescriptions: [],
        consents: [],
        payments: [],
    }
};

// Custom hook for persisting state to localStorage
function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      if (stickyValue !== null) {
        const parsedValue = JSON.parse(stickyValue);
        // FIX: Merge the stored value with the default value.
        // This ensures that if the data structure in localStorage is outdated (e.g., missing new keys like `yapeInfo`),
        // the application doesn't crash when trying to access properties of undefined. It creates a more robust state initialization.
        return { ...defaultValue, ...parsedValue };
      }
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
}

type Page = 'landing' | 'login' | 'admin' | 'consultation';
type MainView = 'odontogram' | 'plan' | 'history' | 'prescriptions' | 'consents' | 'accounts';
type BookingStage = 'idle' | 'form' | 'payment';


function App() {
    const [page, setPage] = useState<Page>('landing');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // Use sticky state to persist data across reloads
    const [appointments, setAppointments] = useStickyState<Appointment[]>(MOCK_APPOINTMENTS, 'kiru-appointments');
    const [doctors, setDoctors] = useStickyState<Doctor[]>(MOCK_DOCTORS, 'kiru-doctors');
    const [promotions, setPromotions] = useStickyState<Promotion[]>(MOCK_PROMOTIONS, 'kiru-promotions');
    const [settings, setSettings] = useStickyState<AppSettings>(MOCK_SETTINGS, 'kiru-settings');
    const [patientRecords, setPatientRecords] = useStickyState<Record<string, PatientRecord>>(MOCK_PATIENT_RECORDS, 'kiru-patientRecords');
    
    const [currentPatientIndex, setCurrentPatientIndex] = useState<number | null>(null);
    const [initialTabForConsultation, setInitialTabForConsultation] = useState<MainView | undefined>();
    
    // State for booking flow modals using a state machine
    const [bookingStage, setBookingStage] = useState<BookingStage>('idle');
    const [pendingAppointmentData, setPendingAppointmentData] = useState<Omit<Appointment, 'id' | 'status'> | null>(null);


    const sortedAppointments = useMemo(() => 
        [...appointments].sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()),
        [appointments]
    );

    const handleLogin = (success: boolean) => {
        if (success) {
            setIsAuthenticated(true);
            setPage('admin');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setPage('landing');
    };
    
    const handleCloseBookingModals = () => {
        setBookingStage('idle');
        setPendingAppointmentData(null);
    };

    // This is called from LandingPage to open the appointment form
    const handleOpenAppointmentForm = () => {
        setBookingStage('form');
    };

    // This is called from AppointmentForm to proceed to payment
    const handleInitiateBooking = (appointmentData: Omit<Appointment, 'id' | 'status'>) => {
        setPendingAppointmentData(appointmentData);
        setBookingStage('payment');
    };

    const handlePaymentConfirmation = () => {
        if (!pendingAppointmentData) return;

        const newAppointment: Appointment = {
            ...pendingAppointmentData,
            id: crypto.randomUUID(),
            status: 'requested',
        };
        setAppointments(prev => [...prev, newAppointment]);

        // Construct and open WhatsApp link
        const message = `¡Hola! Acabo de agendar mi cita en ${settings.clinicName}. Aquí están los detalles:\n\n*Paciente:* ${newAppointment.name}\n*Servicio:* ${DENTAL_SERVICES_MAP[newAppointment.service]}\n*Fecha y Hora:* ${new Date(newAppointment.dateTime).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}\n\nPor favor, adjunto mi voucher de pago para confirmar la cita. ¡Gracias!`;
        const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        alert(`¡Solicitud de cita enviada para ${newAppointment.name}!\nAhora serás redirigido a WhatsApp para enviar tu voucher y confirmar la cita.`);
        handleCloseBookingModals();
    };
    
    const handlePayLaterConfirmation = () => {
        if (!pendingAppointmentData) return;
        const newAppointment: Appointment = {
            ...pendingAppointmentData,
            id: crypto.randomUUID(),
            status: 'requested',
        };
        setAppointments(prev => [...prev, newAppointment]);
        handleCloseBookingModals();
        alert(`¡Cita solicitada para ${newAppointment.name}!\nPor favor, completa el pago en la clínica para confirmar tu cita.`);
    };

    const handleOpenClinicalRecord = (patient: Appointment, targetTab?: MainView) => {
        const patientIndex = sortedAppointments.findIndex(p => p.id === patient.id);
        setCurrentPatientIndex(patientIndex);
        setInitialTabForConsultation(targetTab);
        setPage('consultation');
    };
    
    const currentPatient = useMemo(() => {
        if (currentPatientIndex === null || !sortedAppointments[currentPatientIndex]) return null;
        return sortedAppointments[currentPatientIndex];
    }, [currentPatientIndex, sortedAppointments]);

    // State for the loaded patient record to avoid side-effects in render
    const [currentPatientRecord, setCurrentPatientRecord] = useState<PatientRecord | null>(null);

    useEffect(() => {
        if (!currentPatient) {
            setCurrentPatientRecord(null);
            return;
        }

        const record = patientRecords[currentPatient.id];
        if (record) {
            setCurrentPatientRecord({
                ...record,
                prescriptions: record.prescriptions || [],
                consents: record.consents || [],
                payments: record.payments || [],
            });
        } else {
            // This is a new patient record, create it and update the global state
            const newRecord: PatientRecord = {
                patientId: currentPatient.id,
                permanentOdontogram: createInitialOdontogram(ALL_TEETH_PERMANENT),
                deciduousOdontogram: createInitialOdontogram(ALL_TEETH_DECIDUOUS),
                sessions: [],
                medicalAlerts: [],
                prescriptions: [],
                consents: [],
                payments: [],
            };
            // Update the main records state. This will trigger a re-render.
            setPatientRecords(prev => ({ ...prev, [currentPatient.id]: newRecord }));
            // Set the local record state so the UI can update immediately without waiting for the next effect run.
            setCurrentPatientRecord(newRecord);
        }
    }, [currentPatient, patientRecords, setPatientRecords]);


    const handleNavigateToAdmin = () => {
        setPage('admin');
        setCurrentPatientIndex(null);
    };

     const handleNavigateToPatient = (direction: 'next' | 'previous') => {
        if (currentPatientIndex === null) return;
        const newIndex = direction === 'next' ? currentPatientIndex + 1 : currentPatientIndex - 1;
        if (newIndex >= 0 && newIndex < sortedAppointments.length) {
            setCurrentPatientIndex(newIndex);
        }
    };
    
    const handleSavePatientRecord = (record: PatientRecord) => {
        setPatientRecords(prev => ({
            ...prev,
            [record.patientId]: record
        }));
        alert('Ficha clínica guardada con éxito.');
    };

    // --- CRUD Handlers ---

    const handleSaveAppointment = (data: Omit<Appointment, 'id'> & { id?: string }) => {
        setAppointments(prev => {
            if (data.id) {
                return prev.map(a => a.id === data.id ? { ...a, ...data } as Appointment : a);
            }
            return [...prev, { ...data, id: crypto.randomUUID(), status: data.status || 'requested' } as Appointment];
        });
    };
    
    const handleDeleteAppointment = (id: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar esta cita?')) {
            setAppointments(prev => prev.filter(a => a.id !== id));
        }
    };
    
    const handleSaveDoctor = (data: Omit<Doctor, 'id'> & { id?: string }) => {
        setDoctors(prev => {
            if (data.id) {
                return prev.map(d => d.id === data.id ? { ...d, ...data } as Doctor : d);
            }
            return [...prev, { ...data, id: crypto.randomUUID(), availability: data.availability || {} } as Doctor];
        });
    };

    const handleDeleteDoctor = (id: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar este doctor?')) {
            setDoctors(prev => prev.filter(d => d.id !== id));
        }
    };

    const handleSavePromotion = (data: Omit<Promotion, 'id' | 'isActive'> & { id?: string }) => {
        setPromotions(prev => {
            if (data.id) {
                // Find existing promotion to preserve its isActive status if not changed
                const existingPromo = prev.find(p => p.id === data.id);
                const isActive = existingPromo ? existingPromo.isActive : false;
                return prev.map(p => p.id === data.id ? { ...p, ...data, isActive } as Promotion : p);
            }
            return [...prev, { ...data, id: crypto.randomUUID(), isActive: false } as Promotion];
        });
    };

     const togglePromotionStatus = (id: string) => {
        setPromotions(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : { ...p, isActive: false }));
    };

    const handleDeletePromotion = (id: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar esta promoción?')) {
            setPromotions(prev => prev.filter(p => p.id !== id));
        }
    };

    const handleSavePayment = (paymentData: { patientId: string; amount: number; method: string; date: string; id?: string }) => {
        setPatientRecords(prev => {
            const newRecords = structuredClone(prev);
            const patientRecord = newRecords[paymentData.patientId];
            if (!patientRecord) {
                alert("Error: No se encontró la ficha del paciente.");
                return prev;
            }

            if (paymentData.id) { // Editing existing payment
                const paymentIndex = patientRecord.payments.findIndex(p => p.id === paymentData.id);
                if (paymentIndex > -1) {
                    patientRecord.payments[paymentIndex] = {
                        ...patientRecord.payments[paymentIndex],
                        amount: paymentData.amount,
                        method: paymentData.method,
                        date: paymentData.date,
                    };
                }
            } else { // Adding new payment
                const newPayment: Payment = {
                    id: crypto.randomUUID(),
                    date: paymentData.date,
                    amount: paymentData.amount,
                    method: paymentData.method,
                };
                if (!patientRecord.payments) patientRecord.payments = [];
                patientRecord.payments.push(newPayment);
            }
            return newRecords;
        });
    };

    const handleDeletePayment = (paymentId: string, patientId: string) => {
        if (!window.confirm('¿Está seguro de que desea eliminar este pago?')) return;
        setPatientRecords(prev => {
            const newRecords = structuredClone(prev);
            const patientRecord = newRecords[patientId];
            if (!patientRecord) return prev;

            patientRecord.payments = patientRecord.payments.filter(p => p.id !== paymentId);
            return newRecords;
        });
    };
    
    const activePromotion = promotions.find(p => p.isActive) || null;

    let pageContent;

    if (page === 'admin' && isAuthenticated) {
        pageContent = (
            <AdminPage 
                appointments={appointments}
                doctors={doctors}
                promotions={promotions}
                settings={settings}
                patientRecords={patientRecords}
                onSaveAppointment={handleSaveAppointment}
                onDeleteAppointment={handleDeleteAppointment}
                onSaveDoctor={handleSaveDoctor}
                onDeleteDoctor={handleDeleteDoctor}
                onSavePromotion={handleSavePromotion}
                onDeletePromotion={handleDeletePromotion}
                onTogglePromotionStatus={togglePromotionStatus}
                setSettings={setSettings}
                onLogout={handleLogout}
                onOpenClinicalRecord={handleOpenClinicalRecord}
            />
        );
    } else if (page === 'consultation' && isAuthenticated && currentPatient && currentPatientRecord) {
        pageContent = (
            <ConsultationRoom
                patient={currentPatient}
                patientRecord={currentPatientRecord}
                onSave={handleSavePatientRecord}
                onNavigateToAdmin={handleNavigateToAdmin}
                onNavigateToPatient={handleNavigateToPatient}
                isFirstPatient={currentPatientIndex === 0}
                isLastPatient={currentPatientIndex === sortedAppointments.length - 1}
                onSavePayment={handleSavePayment}
                onDeletePayment={handleDeletePayment}
                initialTab={initialTabForConsultation}
            />
        );
    } else if (page === 'consultation' && isAuthenticated && currentPatientIndex !== null && !currentPatientRecord) {
        pageContent = <div className="flex h-screen items-center justify-center bg-gray-100">Cargando ficha del paciente...</div>;
    } else if (page === 'login') {
        pageContent = <LoginPage onLogin={handleLogin} onNavigateToLanding={() => setPage('landing')} settings={settings} />;
    } else { // default to landing
        pageContent = <LandingPage onOpenAppointmentForm={handleOpenAppointmentForm} settings={settings} onNavigateToLogin={() => setPage('login')} activePromotion={activePromotion} doctors={doctors} />;
    }
    
    return (
        <>
            {pageContent}
            
            {/* Appointment Form Modal for landing page flow */}
            {bookingStage === 'form' && !isAuthenticated && (
                 <AppointmentForm
                    onClose={handleCloseBookingModals}
                    onBookAppointment={handleInitiateBooking}
                    doctors={doctors}
                 />
            )}

            {/* Payment Modal for landing page flow */}
            {bookingStage === 'payment' && pendingAppointmentData && !isAuthenticated && (
                <PaymentModal
                    appointment={pendingAppointmentData}
                    settings={settings}
                    onConfirm={handlePaymentConfirmation}
                    onPayLater={handlePayLaterConfirmation}
                    onClose={handleCloseBookingModals}
                />
            )}
        </>
    );
}

export default App;
