
import React, { useState, useEffect } from 'react';
// FIX: Changed import to be a relative path.
import { DentalIcon, PreventionIcon, FillingIcon, EndodonticsIcon, OrthodonticsIcon, OralSurgeryIcon, CosmeticDentistryIcon, TeamIcon, AppointmentIcon, EmergencyIcon, ClockIcon, GiftIcon, CloseIcon, CheckIcon } from './icons';
import { AppointmentForm } from './AppointmentForm';
// FIX: Changed import to be a relative path.
import type { Appointment, AppSettings, Promotion, Doctor } from '../types';


interface LandingPageProps {
  onOpenAppointmentForm: () => void;
  settings: AppSettings;
  onNavigateToLogin: () => void;
  activePromotion: Promotion | null;
  doctors: Doctor[];
}

const FeatureCard: React.FC<{icon: React.ReactNode, title: string, description: string}> = ({icon, title, description}) => (
    <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200/80 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
        <div className="w-16 h-16 mx-auto mb-6 text-pink-500">{icon}</div>
        <h3 className="text-xl font-bold mb-2 text-slate-900">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
);


const ServiceCard: React.FC<{icon: React.ReactNode, title: string, description: string}> = ({icon, title, description}) => (
    <div className="bg-white p-8 rounded-lg shadow-lg transform hover:-translate-y-2 transition-transform duration-300 text-center">
        <div className="w-16 h-16 mx-auto mb-6 text-blue-500">{icon}</div>
        <h3 className="text-xl font-bold mb-2 text-slate-900">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

const PromotionModal: React.FC<{
    onClose: () => void;
    onBook: () => void;
    promotion: Promotion;
}> = ({onClose, onBook, promotion}) => (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden transform animate-scale-in">
             <button 
                onClick={onClose} 
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-all z-10 bg-white rounded-full p-2.5 shadow-xl hover:bg-slate-200 hover:scale-110 border border-slate-200"
                aria-label="Cerrar promoción"
            >
                <CloseIcon />
            </button>
            <div className="md:grid md:grid-cols-2">
                <div className="hidden md:block bg-cover bg-center" style={{backgroundImage: `url('${promotion.imageUrl}')`}}>
                </div>
                <div className="p-8 flex flex-col justify-center bg-slate-50 text-slate-800">
                    <div className="w-14 h-14 mb-4 text-pink-500">
                        <GiftIcon />
                    </div>
                    <h2 className="text-3xl font-extrabold mb-2 text-blue-600">{promotion.title}</h2>
                    <p className="text-lg font-semibold mb-6" dangerouslySetInnerHTML={{ __html: promotion.subtitle.replace('GRATIS', '<span class="text-pink-500 font-bold">GRATIS</span>') }} />

                    <div className="text-left my-4">
                        <ul className="space-y-3 text-slate-600">
                           {promotion.details.split('\n').map((detail, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-green-500 mr-2 mt-1 w-5 h-5 flex-shrink-0"><CheckIcon /></span>
                                    <span>{detail}</span>
                                </li>
                           ))}
                        </ul>
                    </div>

                    <p className="text-sm font-semibold text-slate-500 my-6 text-center">¡Cupos limitados!</p>

                    <button 
                        onClick={() => {
                            onBook();
                            onClose();
                        }} 
                        className="bg-pink-500 text-white px-8 py-3 rounded-full hover:bg-pink-600 font-bold shadow-lg transform hover:scale-105 transition-all duration-300 w-full text-lg"
                    >
                        {promotion.ctaText}
                    </button>
                </div>
            </div>
        </div>
        <style>{`
            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            @keyframes scale-in { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
        `}</style>
    </div>
);


export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAppointmentForm, settings, onNavigateToLogin, activePromotion, doctors }) => {
  const [showPromotion, setShowPromotion] = useState(false);
  
  useEffect(() => {
    if (!activePromotion) return;

    const promoSeenKey = `promoSeen_${activePromotion.id}`;
    const hasSeenPromo = sessionStorage.getItem(promoSeenKey);
    
    if (!hasSeenPromo) {
      const timer = setTimeout(() => {
        setShowPromotion(true);
        sessionStorage.setItem(promoSeenKey, 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activePromotion]);

  return (
    <div className="bg-slate-50 text-slate-800 font-sans">
      <header className="absolute top-0 left-0 right-0 z-50 p-4">
        <div className="container mx-auto">
            <nav className="bg-white/95 backdrop-blur-sm rounded-full shadow-lg px-6 py-3 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 text-blue-600"><DentalIcon /></div>
                <h1 className="text-2xl font-bold text-slate-900">Kiru</h1>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="#home" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Inicio</a>
                <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Sobre Nosotros</a>
                <a href="#services" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Servicios</a>
                <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Contacto</a>
              </div>
              <button onClick={onOpenAppointmentForm} className="hidden md:block bg-pink-500 text-white px-5 py-2 rounded-full hover:bg-pink-600 font-semibold shadow-md transition-all transform hover:scale-105">
                Agenda tu Cita
              </button>
            </nav>
        </div>
      </header>

      <main>
        <section id="home" className="bg-blue-900 text-white overflow-hidden">
            <div className="container mx-auto px-6 pt-32 pb-20 flex flex-col md:flex-row items-center relative">
              <div className="md:w-1/2 z-10 text-center md:text-left">
                <h2 className="text-4xl lg:text-6xl font-extrabold mb-4 leading-tight">Tu Sonrisa, Nuestra Pasión.</h2>
                <p className="mb-8 text-blue-200 max-w-lg mx-auto md:mx-0 text-lg">
                 Descubre una experiencia dental diferente. En Kiru, combinamos tecnología de punta con un trato cálido y personalizado para que te sientas como en casa.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
                  <button onClick={onOpenAppointmentForm} className="bg-pink-500 text-white px-10 py-4 text-lg rounded-full hover:bg-pink-600 font-semibold shadow-lg transform hover:scale-105 transition-transform duration-300">
                    Agendar Cita Ahora
                  </button>
                  <a href="#about" className="border-2 border-white/80 text-white px-10 py-4 text-lg rounded-full hover:bg-white hover:text-blue-700 font-semibold transition-colors duration-300 text-center">
                    Saber Más
                  </a>
                </div>
              </div>
              <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center items-center z-10">
                <div className="p-2.5 rounded-3xl shadow-2xl bg-white/10 backdrop-blur-sm max-w-md w-full">
                    <img className="rounded-2xl w-full h-96 object-cover" src={settings.heroImageUrl} alt="Dentista profesional atendiendo a un paciente con una sonrisa" />
                </div>
              </div>
            </div>
        </section>
        
        <section id="features" className="py-24 bg-slate-50">
            <div className="container mx-auto px-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<AppointmentIcon />}
                        title="Cita Fácil"
                        description="Agenda tu cita en línea en menos de un minuto con nuestro sistema simplificado."
                    />
                    <FeatureCard
                        icon={<EmergencyIcon />}
                        title="Servicio de Emergencia"
                        description="Atendemos urgencias dentales para aliviar tu dolor lo más pronto posible."
                    />
                    <FeatureCard
                        icon={<ClockIcon />}
                        title="Servicio 24/7"
                        description="Nuestra plataforma está disponible a toda hora para que gestiones tus citas cuando prefieras."
                    />
                 </div>
            </div>
        </section>

        <section id="about" className="bg-white py-24">
            <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
                <div className="md:w-1/2 text-blue-600">
                    <div className="max-w-md mx-auto">
                       <TeamIcon />
                    </div>
                </div>
                <div className="md:w-1/2 text-center md:text-left">
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Bienvenido a la Familia Kiru</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        En Kiru Dental, representamos todo lo que la odontología moderna debería ser. Hemos mejorado la temida cita con el dentista y la hemos transformado en una experiencia relajante y de confianza. Nuestro equipo de profesionales está dedicado no solo a la salud de tu boca, sino también a tu comodidad y bienestar general.
                    </p>
                    <a href="#contact" className="text-pink-600 hover:text-pink-700 font-semibold transition-colors">
                        Contáctanos &rarr;
                    </a>
                </div>
            </div>
        </section>

        <section id="services" className="bg-slate-50 py-24">
          <div className="container mx-auto px-6">
             <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Nuestros Servicios Odontológicos</h2>
                <p className="text-gray-600 mt-2 max-w-2xl mx-auto">Nuestro objetivo es tratar y prevenir enfermedades que afectan a dientes, encías y mandíbula, contribuyendo a una sonrisa saludable y a tu bienestar general.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <ServiceCard 
                    icon={<PreventionIcon />}
                    title="Prevención y Diagnóstico"
                    description="Limpiezas, exámenes de rutina y detección temprana de problemas para mantener tu salud bucal."
                />
                <ServiceCard 
                    icon={<FillingIcon />}
                    title="Restauraciones"
                    description="Reparación de dientes dañados mediante empastes (obturaciones) y coronas de alta calidad."
                />
                <ServiceCard 
                    icon={<EndodonticsIcon />}
                    title="Endodoncia"
                    description="Tratamientos de conducto para salvar dientes severamente dañados, aliviando el dolor y preservando la pieza."
                />
                 <ServiceCard 
                    icon={<OrthodonticsIcon />}
                    title="Ortodoncia"
                    description="Corrección de la posición de los dientes y la mordida para una sonrisa funcional y estéticamente agradable."
                />
                <ServiceCard 
                    icon={<OralSurgeryIcon />}
                    title="Cirugía Bucal"
                    description="Procedimientos quirúrgicos, incluyendo la extracción de muelas del juicio, realizados por expertos."
                />
                 <ServiceCard 
                    icon={<CosmeticDentistryIcon />}
                    title="Estética Dental"
                    description="Mejora la apariencia de tu sonrisa con blanqueamientos, carillas y otros tratamientos cosméticos."
                />
            </div>
          </div>
        </section>
      </main>

       <footer id="contact" className="bg-blue-900 text-white py-16">
            <div className="container mx-auto px-6 text-center">
                 <h2 className="text-3xl font-bold mb-4">Contáctanos</h2>
                 <p className="text-slate-300 mb-8 max-w-xl mx-auto">¿Listo para transformar tu sonrisa? Agenda una cita o contáctanos para más información.</p>
                 <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-8 text-slate-200">
                    <span>Email: <a href="mailto:info@kiru.com" className="hover:text-pink-400">{settings.clinicEmail}</a></span>
                    <span>Teléfono: <a href={`tel:${settings.clinicPhone}`} className="hover:text-pink-400">{settings.clinicPhone}</a></span>
                    <span>Dirección: {settings.clinicAddress}</span>
                 </div>
                <p className="text-slate-400 mt-8">&copy; {new Date().getFullYear()} {settings.clinicName}. Todos los derechos reservados.</p>
                 <div className="mt-6">
                    <button 
                        onClick={onNavigateToLogin} 
                        className="border border-slate-600 hover:border-slate-500 hover:bg-slate-700 text-slate-400 font-semibold py-2 px-5 rounded-full transition-colors text-xs uppercase tracking-wider"
                    >
                        Admin Login
                    </button>
                </div>
            </div>
        </footer>

        {showPromotion && activePromotion && <PromotionModal onClose={() => setShowPromotion(false)} onBook={onOpenAppointmentForm} promotion={activePromotion} />}
    </div>
  );
};
