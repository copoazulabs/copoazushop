'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCart } from '@/contexts/CartContext';
import { useVerification } from '@/contexts/VerificationContext';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Wallet } from 'lucide-react';
import CeloPayment from '@/components/CeloPayment';
import VerificationButton from '@/components/VerificationButton';
import VerificationPopup from '@/components/VerificationPopup';
import VerificationStatus from '@/components/VerificationStatus';

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const tVerification = useTranslations('verification');
  const { state, finalPrice, discountAmount, discountPercentage } = useCart();
  const { isVerified, setVerified } = useVerification();
  const [selectedPaymentMethod] = useState<'celo'>('celo');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string>('');
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('es-CO')} cCOP`;
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    setPaymentError('');
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setPaymentSuccess(false);
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-background dark:bg-brand-dark flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-dark dark:text-brand-background mb-4 transition-colors duration-200">
            {t('emptyCart')}
          </h1>
          <p className="text-brand-neutral dark:text-brand-neutral mb-8 transition-colors duration-200">
            {t('emptyCartDescription')}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('continueShopping')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background dark:bg-brand-dark py-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center text-brand-primary hover:text-brand-accent mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToProducts')}
          </Link>
          <h1 className="text-3xl font-bold text-brand-dark dark:text-brand-background transition-colors duration-200">
            {t('title')}
          </h1>
        </div>

        {/* Verification Status */}
        <div className="mb-6">
          <VerificationStatus />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-brand-white dark:bg-dark-surface rounded-2xl shadow-lg p-6 transition-colors duration-200">
            <h2 className="text-xl font-semibold text-brand-dark dark:text-brand-background mb-6 transition-colors duration-200">
              {t('orderSummary')}
            </h2>
            
            <div className="space-y-4">
              {state.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-brand-background dark:bg-dark-surface rounded-lg overflow-hidden flex-shrink-0 transition-colors duration-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-brand-dark dark:text-brand-background transition-colors duration-200">
                      {item.name}
                    </h3>
                    <p className="text-sm text-brand-neutral dark:text-brand-neutral transition-colors duration-200">
                      {t('quantity')}: {item.quantity}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-brand-dark dark:text-brand-background transition-colors duration-200">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Verification Section */}
            {!isVerified ? (
              <div className="border-t border-brand-neutral dark:border-brand-neutral mt-6 pt-6 transition-colors duration-200">
                <div className="bg-gradient-to-r from-brand-primary/10 to-brand-accent/10 dark:from-brand-primary/20 dark:to-brand-accent/20 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-semibold text-brand-dark dark:text-brand-background mb-2">
                    {tVerification('checkout.title')}
                  </h3>
                  <p className="text-sm text-brand-neutral dark:text-brand-neutral mb-4">
                    {tVerification('checkout.subtitle')}
                  </p>
                  <VerificationButton 
                    onClick={() => setShowVerificationPopup(true)} 
                    variant="checkout"
                  />
                </div>
              </div>
            ) : (
              <div className="border-t border-brand-neutral dark:border-brand-neutral mt-6 pt-6 transition-colors duration-200">
                <VerificationStatus />
              </div>
            )}

            {/* Order Summary */}
            <div className="border-t border-brand-neutral dark:border-brand-neutral mt-6 pt-6 transition-colors duration-200">
              <div className="space-y-2">
                {discountAmount > 0 && (
                  <>
                    <div className="flex justify-between items-center text-sm text-brand-neutral dark:text-brand-neutral">
                      <span>Subtotal:</span>
                      <span>{formatPrice(state.totalPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-brand-primary dark:text-brand-light">
                      <span>Descuento ({discountPercentage}%):</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                  <span className="text-brand-dark dark:text-brand-background transition-colors duration-200">{t('total')}</span>
                  <span className="text-brand-dark dark:text-brand-background transition-colors duration-200">{formatPrice(finalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-brand-white dark:bg-dark-surface rounded-2xl shadow-lg p-6 transition-colors duration-200">
            <h2 className="text-xl font-semibold text-brand-dark dark:text-brand-background mb-6 transition-colors duration-200">
              {t('paymentMethods')}
            </h2>

            {paymentError && (
              <div className="bg-brand-purple/10 dark:bg-brand-purple/20 border border-brand-purple/30 dark:border-brand-purple/50 rounded-lg p-3 mb-4">
                <p className="text-brand-purple dark:text-brand-purple text-sm m-0">
                  {paymentError}
                </p>
              </div>
            )}


            {/* Payment Method */}
            <div className="mb-6">
              <div className="border-2 border-brand-primary rounded-lg p-4 bg-brand-light/20 dark:bg-brand-primary/20 flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-light/30 dark:bg-brand-primary/30 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-dark dark:text-brand-background m-0 mb-1 transition-colors duration-200">
                    cCOP on Celo Network
                  </h3>
                  <p className="text-sm text-brand-neutral dark:text-brand-neutral m-0 transition-colors duration-200">
                    Pay with cCOP tokens on Celo network
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Component */}
            <CeloPayment
              totalPrice={finalPrice}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </div>
        </div>
      </div>

      {/* Verification Popup */}
      <VerificationPopup
        isOpen={showVerificationPopup}
        onClose={() => setShowVerificationPopup(false)}
        onVerificationComplete={(verified) => {
          setVerified(verified);
          setShowVerificationPopup(false);
        }}
      />
    </div>
  );
}
