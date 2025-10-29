

import React from 'react';

export type ToothSurfaceName = 'buccal' | 'lingual' | 'occlusal' | 'distal' | 'mesial' | 'root';
export type TreatmentStatus = 'proposed' | 'completed';
export type TreatmentApplication = 'surface' | 'whole_tooth' | 'root';

// Allow for dynamic creation of treatments from the admin panel.
export type ToothCondition = string;
export type WholeToothCondition = string;

export interface DentalTreatment {
    id: string;
    label: string;
    category: string;
    price: number;
    appliesTo: TreatmentApplication;
    icon: React.ReactNode;
}

export interface AppliedTreatment {
    id: string;
    treatmentId: string;
    toothId: number;
    surface: ToothSurfaceName | 'whole';
    status: TreatmentStatus;
    sessionId: string;
}

export interface ClinicalFinding {
    id: string;
    toothId: number;
    surface: ToothSurfaceName | 'whole';
    condition: string;
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
    doctorId?: string;
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
    licenseNumber?: string;
    availability?: Record<string, string[]>;
}

export interface AppSettings {
    clinicName: string;
    clinicAddress: string;
    clinicPhone: string;
    clinicEmail: string;
    heroImageUrl: string;
    loginImageUrl: string;
    yapeInfo: {
        qrUrl: string;
        recipientName: string;
        phoneNumber: string;
    };
    plinInfo: {
        qrUrl: string;
        recipientName: string;
        phoneNumber: string;
    };
    whatsappNumber: string;
    n8nWebhookUrl: string;
}

export interface Medication {
    name: string;
    presentation: string;
    dosage: string;
}

export interface Prescription {
    id: string;
    date: string;
    medications: Medication[];
    recommendations: string;
    relatedTreatment?: string;
    doctorId: string;
}

export interface ConsentForm {
    id: string;
    templateId: string;
    title: string;
    content: string;
    dateSigned: string | null;
    status: 'pending' | 'signed';
    signatureDataUrl?: string;
    doctorId?: string;
}

export interface Payment {
    id: string;
    date: string;
    amount: number;
    method: string;
}

export interface MedicalHistory {
    systemicDiseases: string[];
    pastSurgeries: string[];
    allergies: string[];
    currentMedications: string[];
    habits: string[];
    familyHistory: string;
}

export interface ProposedSession {
    id: string;
    name: string;
    scheduledDate: string;
    findingIds: string[];
    doctorId?: string;
}

export interface Budget {
    id: string;
    name: string;
    date: string;
    status: 'proposed' | 'accepted' | 'rejected';
    proposedSessions: ProposedSession[];
    followUpDate?: string;
    notes?: string;
    observations?: string;
}

export interface PatientRecord {
    patientId: string;
    permanentOdontogram: OdontogramState;
    deciduousOdontogram: OdontogramState;
    sessions: Session[];
    medicalHistory: MedicalHistory;
    prescriptions: Prescription[];
    consents: ConsentForm[];
    payments: Payment[];
    budgets: Budget[];
    recall?: {
        date: string;
        reason: string;
    };
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

export interface AdminTreatmentModalProps {
    treatment: DentalTreatment | { id?: string } | null;
    onClose: () => void;
    onSave: (data: Omit<DentalTreatment, 'icon'> & { id?: string; }) => void;
}