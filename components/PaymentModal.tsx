

import React, { useState } from 'react';
import type { Appointment, AppSettings } from '../types';
import { CloseIcon } from './icons';
import { DENTAL_SERVICES_MAP } from '../constants';

interface PaymentModalProps {
    appointment: Omit<Appointment, 'id' | 'status'>;
    settings: AppSettings;
    onConfirm: () => void;
    onPayLater: () => void;
    onClose: () => void;
}

type PaymentOption = 'payNow' | 'payLater';
type PaymentMethod = 'yape' | 'plin';

export const PaymentModal: React.FC<PaymentModalProps> = ({ appointment, settings, onConfirm, onPayLater, onClose }) => {
    const [paymentOption, setPaymentOption] = useState<PaymentOption>('payNow');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('yape');

    const paymentDetails = paymentMethod === 'yape' ? settings.yapeInfo : settings.plinInfo;

    const renderPayNowContent = () => (
        <>
            <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">Selecciona tu método de pago</h3>
                <div className="flex border border-slate-300 rounded-lg p-1 bg-slate-100">
                     <button 
                        onClick={() => setPaymentMethod('yape')}
                        className={`flex-1 py-2 rounded-md font-semibold transition-all duration-300 transform ${paymentMethod === 'yape' ? 'bg-purple-600 text-white shadow-md scale-105' : 'hover:bg-slate-200'}`}
                    >
                        Yape
                    </button>
                    <button 
                        onClick={() => setPaymentMethod('plin')}
                        className={`flex-1 py-2 rounded-md font-semibold transition-all duration-300 transform ${paymentMethod === 'plin' ? 'bg-blue-700 text-white shadow-md scale-105' : 'hover:bg-slate-200'}`}
                    >
                        Plin
                    </button>
                </div>
            </div>
            
            <div className="text-center p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="font-semibold mb-2">Escanea el código QR para pagar:</p>
                <img 
                    src={paymentDetails.qrUrl} 
                    alt={`QR para ${paymentMethod}`} 
                    className="w-48 h-48 mx-auto rounded-lg shadow-sm" 
                />
                <div className="mt-4 text-center space-y-1">
                    <p className="text-sm text-slate-500">A nombre de:</p>
                    <p className="font-bold text-lg text-slate-800">{paymentDetails.recipientName}</p>
                    <p className="text-sm text-slate-500 mt-2">Al número:</p>
                    <p className="font-semibold text-lg text-slate-800 font-mono tracking-wider">{paymentDetails.phoneNumber}</p>
                </div>
            </div>

             <div className="text-center text-sm text-slate-500">
                <p>Después de realizar el pago, haz clic en el botón de abajo para enviarnos tu voucher por WhatsApp y confirmar tu cita.</p>
            </div>
        </>
    );

    const renderPayLaterContent = () => (
        <div className="text-center p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-bold text-lg text-blue-800">Pago en Clínica</h3>
            <p className="text-slate-600 mt-2">
                Tu cita quedará solicitada. Para confirmarla, por favor realiza el pago en la recepción de la clínica antes de tu cita.
            </p>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">Confirmar Cita</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 w-8 h-8">
                        <CloseIcon />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-blue-600 mb-2">1. Resumen de tu Cita</h3>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-sm">
                            <p><span className="font-semibold">Paciente:</span> {appointment.name}</p>
                            <p><span className="font-semibold">Servicio:</span> {DENTAL_SERVICES_MAP[appointment.service]}</p>
                            <p><span className="font-semibold">Fecha y Hora:</span> {new Date(appointment.dateTime).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-blue-600 mb-3">2. Elige una opción de pago</h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button 
                                onClick={() => setPaymentOption('payNow')}
                                className={`p-4 rounded-lg border-2 text-center font-semibold transition-all relative ${paymentOption === 'payNow' ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-200' : 'border-slate-300 bg-white hover:bg-slate-50'}`}
                            >
                                Pagar Ahora
                                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Recomendado</span>
                            </button>
                            <button 
                                onClick={() => setPaymentOption('payLater')}
                                className={`p-4 rounded-lg border-2 text-center font-semibold transition-all ${paymentOption === 'payLater' ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-200' : 'border-slate-300 bg-white hover:bg-slate-50'}`}
                            >
                                Pagar en Clínica
                            </button>
                        </div>
                    </div>
                    
                    {paymentOption === 'payNow' ? renderPayNowContent() : renderPayLaterContent()}
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl mt-auto">
                    <button 
                        onClick={paymentOption === 'payNow' ? onConfirm : onPayLater}
                        className={`w-full text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all transform hover:-translate-y-1 text-base ${
                            paymentOption === 'payNow' 
                            ? 'bg-green-600 hover:bg-green-700 shadow-green-500/30'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                        }`}
                    >
                        {paymentOption === 'payNow' 
                            ? '¡Listo! Enviar voucher por WhatsApp'
                            : 'Solicitar Cita (Pago Pendiente)'
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};