'use client';

// ============================================================
// WhatsApp Floating Button — CMS-configurable
// Shows a floating WhatsApp button based on siteSettings.
// Phone number, default message, and visibility from CMS.
// ============================================================

import { MessageCircle } from 'lucide-react';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { motion, AnimatePresence } from 'framer-motion';

export function WhatsAppButton() {
  const settings = useSiteSettings();

  const visible = settings?.whatsappVisible !== false;
  const phone = settings?.whatsapp;
  const message = settings?.whatsappMessage || 'Hola, quiero información sobre los cursos.';

  if (!visible || !phone) return null;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <AnimatePresence>
      <motion.a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 max-sm:hidden"
        style={{
          backgroundColor: '#25D366',
          boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4), 0 0 40px rgba(37, 211, 102, 0.15)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 1.5 }}
        whileHover={{
          boxShadow: '0 6px 30px rgba(37, 211, 102, 0.5), 0 0 60px rgba(37, 211, 102, 0.2)',
        }}
      >
        <MessageCircle className="h-7 w-7 text-white" fill="white" />

        {/* Pulse ring animation */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: '#25D366' }} />
      </motion.a>
    </AnimatePresence>
  );
}