import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

// Renders an inline copy-to-clipboard button for order or shipment codes.
export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label = 'Sao chép',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!text) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      void 0;
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border border-mint-secondary/25 bg-card text-mint-secondary hover:text-mint-primary hover:bg-mint-neutral transition-colors ${className}`}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-mint-tertiary" /> : <Copy className="w-3.5 h-3.5" />}
      <span>{copied ? 'Đã chép' : label}</span>
    </button>
  );
};
