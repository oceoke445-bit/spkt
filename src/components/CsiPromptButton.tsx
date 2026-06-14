'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { SatisfactionForm } from './SatisfactionForm';
import { Star } from 'lucide-react';

interface CsiPromptButtonProps {
  serviceType: 'report' | 'letter' | 'complaint';
  serviceLabel: string;
  referenceId: string;
  eligible: boolean;
  checking?: boolean;
  onSubmitted?: () => void;
}

export const CsiPromptButton: React.FC<CsiPromptButtonProps> = ({
  serviceType,
  serviceLabel,
  referenceId,
  eligible,
  checking,
  onSubmitted,
}) => {
  const [open, setOpen] = useState(false);

  if (checking || !eligible) return null;

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md"
      >
        <Star className="w-4 h-4 mr-2" />
        Berikan Penilaian Kepuasan
      </Button>
      <SatisfactionForm
        open={open}
        onOpenChange={setOpen}
        serviceType={serviceType}
        serviceLabel={serviceLabel}
        referenceId={referenceId}
        onSubmitted={() => {
          onSubmitted?.();
          setOpen(false);
        }}
      />
    </>
  );
};
