'use client';

import React from 'react';
import { Shield, CheckCircle, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useVerification } from '@/contexts/VerificationContext';

export default function VerificationStatus() {
  const t = useTranslations('verification');
  const { isVerified, verificationDate, userNationality, clearVerification } = useVerification();

  if (!isVerified) {
    return null;
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-brand-light/20 dark:bg-brand-primary/20 border border-brand-primary/30 dark:border-brand-primary/30 rounded-lg">
      <CheckCircle className="w-4 h-4 text-brand-primary dark:text-brand-light" />
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-brand-dark dark:text-brand-background">
          {t('status.verified')}
          {userNationality && userNationality !== 'Self Verified' && (
            <span className="ml-1 text-brand-primary dark:text-brand-light">
              • 🌍 {userNationality}
            </span>
          )}
        </span>
        <span className="text-xs text-brand-primary dark:text-brand-light">
          {t('status.discountActive')}
        </span>
      </div>
      <button
        onClick={clearVerification}
        className="ml-2 p-1 hover:bg-brand-light/30 dark:hover:bg-brand-primary/30 rounded transition-colors"
        aria-label="Cerrar sesión de verificación"
      >
        <X className="w-3 h-3 text-brand-primary dark:text-brand-light" />
      </button>
    </div>
  );
}
