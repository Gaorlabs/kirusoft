

import React from 'react';
import type { Payment } from '../types';
import { DentalIcon } from './icons';

interface PaymentReceiptProps {
    payment: Payment;
    clinicName: string;
    patientName: string;
    receiptNumber: string;
}

export const PaymentReceiptToPrint = React.forwardRef<HTMLDivElement, PaymentReceiptProps>(({ payment, clinicName, patientName, receiptNumber }, ref) => {
    
    const numberToWords = (num: number): string => {
        // Basic implementation for demonstration
        return `${num.toFixed(2)} Nuevos Soles`;
    }

    return (
        <div ref={ref} className="bg-white text-slate-800 font-sans">
            <div className="w-[210mm] min-h-[297mm] p-10 mx-auto flex flex-col">
                {/* Header */}
                <header className="flex justify-between items-start pb-6 border-b border-slate-300">
                    <div className="flex items-center space-x-4">
                        <DentalIcon className="w-16 h-16 text-blue-600" />
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{clinicName} Dental</h1>
                            <p className="text-slate-500 text-xs">Av. Sonrisas 123, Lima, Perú</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-slate-400 uppercase tracking-wider">Recibo de Pago</h2>
                        <p className="text-sm font-mono text-slate-500 mt-1">N°: {receiptNumber}</p>
                    </div>
                </header>
                
                {/* Details */}
                 <section className="my-8 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <div>
                        <p className="text-slate-500 font-semibold uppercase tracking-wider text-xs">Recibido de</p>
                        <p className="font-bold text-slate-800 text-base">{patientName}</p>
                    </div>
                     <div className="text-right">
                        <p className="text-slate-500 font-semibold uppercase tracking-wider text-xs">Fecha</p>
                        <p className="font-bold text-slate-800 text-base">{new Date(payment.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                      <div>
                        <p className="text-slate-500 font-semibold uppercase tracking-wider text-xs">La suma de</p>
                        <p className="font-bold text-slate-800 text-base">{numberToWords(payment.amount)}</p>
                    </div>
                </section>
                
                {/* Table */}
                <main className="flex-1">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="bg-slate-100 text-slate-600 text-xs uppercase">
                                <th className="p-3 font-semibold border-b-2 border-slate-200 w-3/5">Concepto</th>
                                <th className="p-3 font-semibold border-b-2 border-slate-200">Método de Pago</th>
                                <th className="p-3 font-semibold border-b-2 border-slate-200 text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-100">
                                <td className="p-3">Abono a tratamiento dental</td>
                                <td className="p-3 text-slate-500">{payment.method}</td>
                                <td className="p-3 text-right font-mono font-semibold">S/ {payment.amount.toFixed(2)}</td>
                            </tr>
                        </tbody>
                         <tfoot>
                             <tr className="font-bold text-base">
                                <td colSpan={2} className="p-3 text-right">TOTAL</td>
                                <td className="p-3 text-right font-mono text-blue-600">S/ {payment.amount.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </main>
                
                {/* Footer */}
                <footer className="mt-auto pt-16 flex justify-between items-end">
                    <div className="text-xs text-slate-400">
                        <p>Este es un recibo generado por el sistema.</p>
                        <p>Gracias por su confianza.</p>
                    </div>
                    <div className="text-center w-1/3">
                        <div className="border-t-2 border-slate-400 pt-2">
                            <p className="font-semibold text-base text-slate-700">Recibido por</p>
                            <p className="text-sm text-slate-500">{clinicName} Dental</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
});