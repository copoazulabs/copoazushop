'use client';

import { useState, useEffect } from 'react';
import { X, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SelfVerificationButton } from './SelfVerificationButton';

interface VerificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete: (verified: boolean) => void;
}

type VerificationStep = 'intro' | 'verifying' | 'success' | 'error';

export default function VerificationPopup({ isOpen, onClose, onVerificationComplete }: VerificationPopupProps) {
  const t = useTranslations('verification');
  const [step, setStep] = useState<VerificationStep>('intro');
  const [isVerified, setIsVerified] = useState(false);
  const [userNationality, setUserNationality] = useState<string | null>(null);

  // Close popup with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleVerificationSuccess = (nationality?: string) => {
    setStep('success');
    setIsVerified(true);
    setUserNationality(nationality || null);
    onVerificationComplete(true);
    // Note: localStorage is handled by SelfVerificationButton
  };

  const handleVerificationError = () => {
    setStep('error');
  };

  const handleClose = () => {
    setStep('intro');
    setIsVerified(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white dark:bg-brand-dark/80 rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-brand-light/20 dark:hover:bg-brand-dark/70 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-brand-neutral" />
        </button>

        <div className="p-8">
          {step === 'intro' && (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[brand-primary] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[brand-dark] dark:text-[brand-background] mb-2">
                  {t('title')}
                </h2>
                <p className="text-brand-neutral dark:text-brand-background">
                  {t('subtitle')}
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[brand-primary]" />
                  <span className="text-brand-dark dark:text-brand-background">{t('benefits.discount')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[brand-primary]" />
                  <span className="text-brand-dark dark:text-brand-background">{t('benefits.secure')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[brand-primary]" />
                  <span className="text-brand-dark dark:text-brand-background">{t('benefits.exclusive')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="flex justify-center">
                  <SelfVerificationButton
                    onVerificationSuccess={handleVerificationSuccess}
                  />
                </div>
                <button
                  onClick={handleClose}
                  className="w-full py-3 px-6 bg-brand-light/20 dark:bg-brand-dark/70 text-brand-dark dark:text-brand-background rounded-lg font-semibold hover:bg-brand-light/30 dark:hover:bg-brand-dark/80 transition-colors"
                >
                  {t('buttons.maybeLater')}
                </button>
              </div>

              {/* Privacy Note */}
              <p className="text-xs text-brand-neutral dark:text-brand-background text-center mt-4">
                {t('privacy')}
              </p>
            </>
          )}


          {step === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[brand-dark] dark:text-[brand-background] mb-2">
                {userNationality ? t('process.successWithNationality') : t('process.success')}
              </h3>
              <p className="text-brand-neutral dark:text-brand-background mb-6">
                {userNationality 
                  ? t('process.successWithNationalitySubtitle', { nationality: userNationality })
                  : t('process.successSubtitle')
                }
              </p>
              <button
                onClick={handleClose}
                className="w-full py-3 px-6 bg-[brand-primary] text-white rounded-lg font-semibold hover:bg-[brand-accent] transition-colors"
              >
                {t('buttons.startShopping')}
              </button>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[brand-dark] dark:text-[brand-background] mb-2">
                {t('process.error')}
              </h3>
              <p className="text-brand-neutral dark:text-brand-background mb-6">
                {t('process.errorSubtitle')}
              </p>
              <div className="space-y-3">
                <div className="flex justify-center">
                  <SelfVerificationButton
                    onVerificationSuccess={handleVerificationSuccess}
                  />
                </div>
                <button
                  onClick={handleClose}
                  className="w-full py-3 px-6 bg-brand-light/20 dark:bg-brand-dark/70 text-brand-dark dark:text-brand-background rounded-lg font-semibold hover:bg-brand-light/30 dark:hover:bg-brand-dark/80 transition-colors"
                >
                  {t('buttons.continueWithout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
