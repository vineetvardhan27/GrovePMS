'use client';

import React, { useState } from 'react';
import { BanquetInvoice } from '../../lib/banquet/types';
import { Printer, ArrowLeft, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import BanquetInvoiceDocument from './BanquetInvoiceDocument';

interface BanquetInvoiceViewProps {
  invoice: BanquetInvoice;
}

export default function BanquetInvoiceView({ invoice }: BanquetInvoiceViewProps) {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = invoice.pdf_filename.replace(/\.pdf$/i, '');
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const handleCopyInvoiceNo = () => {
    navigator.clipboard.writeText(invoice.invoice_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top action toolbar (hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link href={`/banquet/${invoice.booking_id}`} className="pms-btn-secondary gap-1.5 text-xs">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Workspace</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-muted">Invoice No:</span>
            <span className="font-mono text-xs font-bold text-brand-forest">{invoice.invoice_number}</span>
            <button
              type="button"
              onClick={handleCopyInvoiceNo}
              className="pms-btn-icon h-7 w-7 text-xs"
              title="Copy Invoice Number"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-status-green" /> : <Copy className="w-3.5 h-3.5 text-ink-muted" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={handlePrint} className="pms-btn-primary gap-2 cursor-pointer shadow-xs">
            <Printer className="w-4 h-4" />
            <span>Print Tax Invoice (A4)</span>
          </button>
        </div>
      </div>

      {/* Screen Invoice Card Wrapper */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-xs p-6 sm:p-10 max-w-4xl mx-auto">
        <BanquetInvoiceDocument invoice={invoice} />
      </div>
    </div>
  );
}
