'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface VerificationContextType {
  isVerified: boolean;
  verificationDate: string | null;
  userNationality: string | null;
  setVerified: (verified: boolean, nationality?: string) => void;
  checkVerificationStatus: () => void;
  clearVerification: () => void;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export function VerificationProvider({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);
  const [verificationDate, setVerificationDate] = useState<string | null>(null);
  const [userNationality, setUserNationality] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Ensure hydration-safe behavior
  useEffect(() => {
    setIsHydrated(true);
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = () => {
    if (typeof window !== 'undefined') {
      const verified = localStorage.getItem('selfVerified') === 'true';
      const date = localStorage.getItem('verificationDate');
      const nationality = localStorage.getItem('userNationality');
      
      setIsVerified(verified);
      setVerificationDate(date);
      setUserNationality(nationality);
    }
  };

  const setVerified = (verified: boolean, nationality?: string) => {
    setIsVerified(verified);
    setUserNationality(nationality || null);

    if (verified && isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('selfVerified', 'true');
      localStorage.setItem('verificationDate', new Date().toISOString());
      if (nationality) {
        localStorage.setItem('userNationality', nationality);
      }
      setVerificationDate(new Date().toISOString());
    }
  };

  const clearVerification = () => {
    setIsVerified(false);
    setVerificationDate(null);
    setUserNationality(null);

    if (isHydrated && typeof window !== 'undefined') {
      localStorage.removeItem('selfVerified');
      localStorage.removeItem('verificationDate');
      localStorage.removeItem('userNationality');
    }
  };

  return (
    <VerificationContext.Provider 
      value={{ 
        isVerified, 
        verificationDate, 
        userNationality,
        setVerified, 
        checkVerificationStatus,
        clearVerification 
      }}
    >
      {children}
    </VerificationContext.Provider>
  );
}

export function useVerification() {
  const context = useContext(VerificationContext);
  if (context === undefined) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
}
