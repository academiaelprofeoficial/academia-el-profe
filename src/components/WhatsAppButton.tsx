'use client';

// ============================================================
// WhatsApp Floating Button — CMS-configurable
// Shows a floating WhatsApp button based on siteSettings.
// Phone number, default message, and visibility from CMS.
// ============================================================

import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { motion, AnimatePresence } from 'framer-motion';

const WHATSAPP_NUMBER = '51922737951';
const WHATSAPP_DEFAULT_MSG = 'Hola, quiero información sobre los cursos de Academia El Profe.';

export function WhatsAppButton() {
  const settings = useSiteSettings();

  const visible = settings?.whatsappVisible !== false;
  const phone = settings?.whatsapp || WHATSAPP_NUMBER;
  const message = settings?.whatsappMessage || WHATSAPP_DEFAULT_MSG;

  if (!visible) return null;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <AnimatePresence>
      <motion.a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="fixed z-50 flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 max-sm:hidden"
        style={{
          width: 60,
          height: 60,
          boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4), 0 0 40px rgba(37, 211, 102, 0.15)',
          bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
          right: '1.5rem',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 1.5 }}
        whileHover={{
          boxShadow: '0 6px 30px rgba(37, 211, 102, 0.5), 0 0 60px rgba(37, 211, 102, 0.2)',
        }}
      >
        <WhatsAppIcon size={60} />

        {/* Pulse ring animation */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: '#25D366' }} />
      </motion.a>
    </AnimatePresence>
  );
}