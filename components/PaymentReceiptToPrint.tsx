
import React from 'react';
import type { Payment } from '../types';
import { DentalIcon } from './icons';

interface PaymentReceiptProps {
    payment: Payment;
    clinicName: string;
    patientName: string;
}

export const PaymentReceiptToPrint = React.forwardRef<HTMLDivElement, PaymentReceiptProps>(({ payment, clinicName, patientName }, ref) => {
    return (
        <div ref={ref} className="p-8 font-sans text-gray-800">
            <div className="flex justify-between items-start pb-4 border-b">
                <div>
                    <h1 className="text-3xl font-bold">{clinicName} Dental</h1>
                    <p>Av. Sonrisas 123, Lima, Perú</p>
                </div>
                 <div className="w-16 h-16 text-blue-500"><DentalIcon /></div>
            </div>
            <div className="my-6">
                <h2 className="text-2xl font-semibold mb-2">Recibo de Pago</h2>
                <div className="grid grid-cols-2 gap-4">
                     <p><span className="font-semibold">Fecha de Pago:</span> {new Date(payment.date).toLocaleDateString()}</p>
                    <p><span className="font-semibold">Paciente:</span> {patientName}</p>
                </div>
            </div>

            <div className="mt-8 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold mb-2">Detalle del Pago</h3>
                 <table className="w-full text-left text-sm">
                    <tbody>
                        <tr className="border-b">
                            <td className="p-2 font-semibold">Método de Pago:</td>
                            <td className="p-2">{payment.method}</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-2 font-semibold">Monto Pagado:</td>
                            <td className="p-2 text-xl font-bold text-green-600">S/ {payment.amount.toFixed(2)}</td>
                        </tr>
                    </tbody>
                 </table>
            </div>

            <p className="text-center text-sm text-gray-500 mt-12">¡Gracias por su pago!</p>
        </div>
    );
});
