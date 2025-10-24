
import React from 'react';

export type ToothSurfaceName = 'buccal' | 'lingual' | 'occlusal' | 'distal' | 'mesial' | 'root';
export type TreatmentStatus = 'proposed' | 'completed';
export type TreatmentApplication = 'surface' | 'whole_tooth' | 'root';

// FIX: Added new treatment IDs to the type definitions to resolve type errors in `constants.tsx`.
export type ToothCondition = 'caries' | 'filling' | 'endodontics' | 'crown' | 'implant' | 'sealant' | 'pulpotomy' | 'post-and-core';
export type WholeToothCondition = 'extraction' | 'missing' | 'unerupted' | 'removable-prosthesis';

export interface DentalTreatment {
    id: ToothCondition | WholeToothCondition;
    label: string;
    category: string;
    price: number;
    appliesTo: TreatmentApplication;
    icon: React.ReactNode;
}

export interface AppliedTreatment {
    id: string;
    treatmentId: ToothCondition | WholeToothCondition;
    toothId: number;
    surface: ToothSurfaceName | 'whole';
    status: TreatmentStatus;
    sessionId: string;
}

export interface ClinicalFinding {
    id: string;
    toothId: number;
    surface: ToothSurfaceName | 'whole';
    condition: ToothCondition | WholeToothCondition;
}

export interface ToothState {
    surfaces: Record<ToothSurfaceName, AppliedTreatment[]>;
    whole: AppliedTreatment[];
    findings: ClinicalFinding[];
}

export type OdontogramState = Record<number, ToothState>;

export interface Session {
    id: string;
    name: string;
    status: 'pending' | 'completed';
    treatments: AppliedTreatment[];
    date: string;
    notes: string;
    documents: { id: string; name: string; type: 'pdf' | 'image' | 'doc' }[];
    scheduledDate?: string;
}

export type AppointmentStatus = 'requested' | 'confirmed' | 'waiting' | 'in_consultation' | 'completed' | 'canceled';


export interface Appointment {
    id: string;
    name: string;
    phone: string;
    email: string;
    dateTime: string;
    service: string;
    status: AppointmentStatus;
    doctorId?: string;
}

export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    availability?: Record<string, string[]>;
}

export interface AppSettings {
    clinicName: string;
    clinicAddress: string;
    clinicPhone: string;
    clinicEmail: string;
    heroImageUrl: string;
    loginImageUrl: string;
}

export interface Prescription {
    id: string;
    date: string;
    medication: string;
    dosage: string;
    instructions: string;
}

export interface ConsentForm {
    id: string;
    templateId: string;
    title: string;
    dateSigned: string | null;
    status: 'pending' | 'signed';
}

export interface Payment {
    id: string;
    date: string;
    amount: number;
    method: string;
}

export interface PatientRecord {
    patientId: string;
    permanentOdontogram: OdontogramState;
    deciduousOdontogram: OdontogramState;
    sessions: Session[];
    medicalAlerts: string[];
    prescriptions: Prescription[];
    consents: ConsentForm[];
    payments: Payment[];
}

export interface AdminAppointmentModalProps {
    appointment: Appointment | Partial<Appointment> | null;
    doctors: Doctor[];
    onClose: () => void;
    onSave: (appointment: Omit<Appointment, 'id'> & { id?: string }) => void;
}

export interface Promotion {
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    ctaText: string;
    isActive: boolean;
    details: string; // Newlines will be used for list items
}

export interface AdminPromotionModalProps {
    promotion: Promotion | Partial<Promotion> | null;
    onClose: () => void;
    onSave: (promotion: Omit<Promotion, 'id' | 'isActive'> & { id?: string }) => void;
}

export interface AdminDoctorModalProps {
    doctor: Doctor | Partial<Doctor> | null;
    onClose: () => void;
    onSave: (doctor: Omit<Doctor, 'id'> & { id?: string }) => void;
}

export interface AdminPaymentModalProps {
    payment: (Payment & { patientId: string }) | { patientId?: string } | null;
    patients: { id: string; name: string }[];
    onClose: () => void;
    onSave: (paymentData: { patientId: string; amount: number; method: string; date: string; id?: string }) => void;
}