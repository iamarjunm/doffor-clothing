'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Smartphone,
  CreditCard,
  Building2,
  Wallet,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { formatINR } from '../lib/format';

export default function RazorpayModal({ open, orderData, customer, onClose, onPaymentSuccess }) {
  const [tab, setTab] = useState('upi');
  const [upiId, setUpiId] = useState('customer@okaxis');
  const [cardNum, setCardNum] = useState('4111 1111 1111 1111');
  const [bank, setBank] = useState('HDFC Bank');
  const [processing, setProcessing] = useState(false);

  if (!open || !orderData) return null;

  const totalINR = Math.round((orderData.amount || 0) / 100);

  const handlePayNow = (e) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      const fakePaymentId = `pay_DFR${Date.now().toString(36).toUpperCase()}`;
      setProcessing(false);
      onPaymentSuccess({
        razorpay_order_id: orderData.razorpayOrderId,
        razorpay_payment_id: fakePaymentId,
        razorpay_signature: 'sandbox_verified_hmac_sha256',
        isSimulated: true,
        paymentChannel: tab.toUpperCase(),
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={!processing ? onClose : undefined} />

      <div className="relative z-10 w-full max-w-md bg-[#0E1320] text-white rounded-md border border-blue-500/30 shadow-2xl overflow-hidden animate-fade-up">
        <div className="bg-gradient-to-r from-[#0B2A6B] to-[#1A56DB] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-obsidian border border-acid flex items-center justify-center font-display font-extrabold text-acid text-lg">
              D
            </div>
            <div>
              <p className="font-display font-bold text-sm tracking-wider">DOFFOR CLOTHING</p>
              <p className="font-mono text-[11px] text-blue-100/90">
                Razorpay Checkout • {orderData.razorpayOrderId}
              </p>
            </div>
          </div>
          <button onClick={onClose} disabled={processing} className="text-blue-100 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-3 bg-[#131B2E] border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-blue-200/70">Paying as</p>
            <p className="text-xs font-medium text-white">
              {customer?.phone || customer?.email || 'Doffor Customer'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-blue-200/70">Payable Amount</p>
            <p className="font-mono font-bold text-lg text-acid">{formatINR(totalINR)}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 border-b border-white/10 bg-[#0B0F1A]">
          {[
            { id: 'upi', label: 'UPI / QR', icon: Smartphone },
            { id: 'card', label: 'Card', icon: CreditCard },
            { id: 'netbanking', label: 'Bank', icon: Building2 },
            { id: 'wallet', label: 'Wallet', icon: Wallet },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setTab(m.id)}
                className={`py-3 flex flex-col items-center gap-1 text-[11px] font-mono transition-colors border-b-2 ${
                  tab === m.id
                    ? 'border-blue-400 text-blue-300 bg-blue-500/10'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {m.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handlePayNow} className="p-5 space-y-4">
          {tab === 'upi' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {['GPay', 'PhonePe', 'Paytm'].map((app) => (
                  <button
                    key={app}
                    type="button"
                    onClick={() => setUpiId(`doffor@${app.toLowerCase()}`)}
                    className="py-2 px-2 rounded border border-white/15 bg-white/[0.04] hover:border-blue-400 text-xs font-semibold transition-colors"
                  >
                    {app}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Enter UPI ID</label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-[#070B14] border border-white/15 rounded px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
          )}

          {tab === 'card' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Card Number</label>
                <input
                  type="text"
                  required
                  value={cardNum}
                  onChange={(e) => setCardNum(e.target.value)}
                  className="w-full bg-[#070B14] border border-white/15 rounded px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-blue-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  defaultValue="12 / 29"
                  placeholder="MM / YY"
                  className="w-full bg-[#070B14] border border-white/15 rounded px-3 py-2 text-sm font-mono text-white"
                />
                <input
                  type="password"
                  defaultValue="424"
                  placeholder="CVV"
                  className="w-full bg-[#070B14] border border-white/15 rounded px-3 py-2 text-sm font-mono text-white"
                />
              </div>
            </div>
          )}

          {tab === 'netbanking' && (
            <div className="grid grid-cols-2 gap-2">
              {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak', 'Yes Bank'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBank(b)}
                  className={`py-2.5 px-3 rounded border text-xs font-medium text-left ${
                    bank === b
                      ? 'border-blue-400 bg-blue-500/20 text-white'
                      : 'border-white/10 bg-white/[0.03] text-slate-300'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          )}

          {tab === 'wallet' && (
            <div className="space-y-2">
              {['Amazon Pay', 'Paytm Wallet', 'PhonePe Wallet', 'Freecharge'].map((w) => (
                <label
                  key={w}
                  className="flex items-center gap-3 p-2.5 rounded border border-white/10 bg-white/[0.03] cursor-pointer hover:border-blue-400"
                >
                  <input type="radio" name="wallet" defaultChecked={w === 'Amazon Pay'} />
                  <span className="text-xs font-medium">{w}</span>
                </label>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={processing}
            className="w-full py-3.5 rounded bg-blue-600 hover:bg-blue-500 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying with Razorpay...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Pay {formatINR(totalINR)} Securely
              </>
            )}
          </button>

          <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 256-bit SSL Secured
            </span>
            <span>Razorpay Test Mode</span>
          </div>
        </form>
      </div>
    </div>
  );
}
