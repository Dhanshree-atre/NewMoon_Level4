import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Download,
  AlertTriangle,
  CheckCircle,
  FileText,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { formatNight, shortenAddress, type SelectiveDisclosureProof } from '../utils/contract';
import type { Ledger } from '../../managed/midnightpay/contract/index.js';

interface ClaimSalaryProps {
  ledgerState: Ledger | null;
  isLoading: boolean;
  circuitStep: string;
  error: string | null;
  onClaim: (
    recipientHex: string,
    amount: bigint,
    saltHex: string,
    cycle: bigint,
    sk?: Uint8Array
  ) => Promise<{ ledger: Ledger; nullifierHex: string; leafHex: string }>;
}

export const ClaimSalary: React.FC<ClaimSalaryProps> = ({
  ledgerState,
  isLoading,
  circuitStep,
  error,
  onClaim,
}) => {
  const [recipientInput, setRecipientInput] = useState<string>(
    '0x3131313131313131313131313131313131313131313131313131313131313131'
  );
  const [amountInput, setAmountInput] = useState<string>('35000');
  const [saltInput, setSaltInput] = useState<string>(
    '0x4141414141414141414141414141414141414141414141414141414141414141'
  );
  const [cycleInput, setCycleInput] = useState<string>('1');
  const [secretKeyInput, setSecretKeyInput] = useState<string>('0x' + '21'.repeat(32));

  const [claimReceipt, setClaimReceipt] = useState<SelectiveDisclosureProof | null>(null);
  const [discloseAmountToAuditor, setDiscloseAmountToAuditor] = useState<boolean>(true);
  const [discloseTimestamp, setDiscloseTimestamp] = useState<boolean>(true);

  const handlePreFillDemo = () => {
    setRecipientInput('0x3131313131313131313131313131313131313131313131313131313131313131');
    setAmountInput('35000');
    setSaltInput('0x4141414141414141414141414141414141414141414141414141414141414141');
    setCycleInput(ledgerState ? ledgerState.currentCycle.toString() : '1');
    setSecretKeyInput('0x' + '21'.repeat(32));
  };

  const handlePasteCredential = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      if (parsed.recipientAddress) setRecipientInput(parsed.recipientAddress);
      if (parsed.amount) setAmountInput(parsed.amount);
      if (parsed.salt) setSaltInput(parsed.salt);
      if (parsed.cycleId) setCycleInput(parsed.cycleId);
    } catch {
      // ignore
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const amt = BigInt(amountInput);
      const cycle = BigInt(cycleInput);

      const rawSk = new Uint8Array(32);
      const cleanSk = secretKeyInput.replace(/^0x/, '');
      for (let i = 0; i < 32; i++) {
        rawSk[i] = parseInt(cleanSk.slice(i * 2, i * 2 + 2), 16) || 0x21;
      }

      const res = await onClaim(recipientInput, amt, saltInput, cycle, rawSk);

      setClaimReceipt({
        recipientAddress: recipientInput,
        cycleId: cycle,
        claimedAmount: amt,
        nullifier: res.nullifierHex,
        leafHash: res.leafHex,
        timestamp: new Date().toISOString(),
        verifiedOnChain: true,
      });
    } catch (err: any) {
      // error handled by parent
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column: Claim Submission */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-cyan-400" />
              Claim Confidential Salary
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Zero-knowledge proof guarantees your salary is disbursed without revealing amounts to peers.
            </p>
          </div>
          <button
            type="button"
            onClick={handlePreFillDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Demo Witness</span>
          </button>
        </div>

        {/* JSON Quick-Paste helper */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <label className="text-[11px] font-mono text-slate-400 block mb-1">
            Quick-Paste Employee Credential JSON (optional):
          </label>
          <input
            type="text"
            placeholder='{"recipientAddress":"0x...","amount":"35000",...}'
            onChange={(e) => handlePasteCredential(e.target.value)}
            className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <form onSubmit={handleSubmitClaim} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Recipient Address (Private Witness)
            </label>
            <input
              type="text"
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Entitled Salary (NIGHT)
              </label>
              <input
                type="number"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                min="1"
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Active Cycle ID
              </label>
              <input
                type="number"
                value={cycleInput}
                onChange={(e) => setCycleInput(e.target.value)}
                min="1"
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Blinding Salt (Secret Blinding Factor)
            </label>
            <input
              type="text"
              value={saltInput}
              onChange={(e) => setSaltInput(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Your Private Secret Key
            </label>
            <input
              type="password"
              value={secretKeyInput}
              onChange={(e) => setSecretKeyInput(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Used strictly in client-side ZK circuit to derive nullifier. Never broadcast to network.
            </span>
          </div>

          {/* Privacy badge */}
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-cyan-300 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Cryptographic Protection:</strong> The Compact circuit validates that your claim matches the employer's schedule commitment root. Your nullifier prevents double-claiming while hiding which entry was claimed.
            </p>
          </div>

          {circuitStep && (
            <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-cyan-200 text-xs flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <span>{circuitStep}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || ledgerState?.isClosed}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isLoading ? 'Synthesizing ZK Proof...' : 'Execute Confidential Claim'}</span>
          </button>
        </form>
      </div>

      {/* Right Column: Selective Disclosure Proof & Receipt */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Selective Disclosure Certificate
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Prove your income to third parties (lenders, landlords, tax authorities) without leaking coworker salaries.
          </p>
        </div>

        {claimReceipt ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/50 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>Zero-Knowledge Payment Confirmed on Preprod</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-emerald-900/50">
                  <span className="text-slate-400">Payroll Cycle:</span>
                  <span className="text-slate-200">#{claimReceipt.cycleId.toString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-900/50">
                  <span className="text-slate-400">Claim Amount:</span>
                  <span className="text-cyan-400 font-bold">{formatNight(claimReceipt.claimedAmount)} NIGHT</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-900/50">
                  <span className="text-slate-400">Nullifier:</span>
                  <span className="text-slate-300">{shortenAddress('0x' + claimReceipt.nullifier, 6)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-900/50">
                  <span className="text-slate-400">Schedule Leaf:</span>
                  <span className="text-slate-300">{shortenAddress('0x' + claimReceipt.leafHash, 6)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Verification Time:</span>
                  <span className="text-slate-300">{new Date(claimReceipt.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            {/* Selective Disclosure Toggles */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Selective Disclosure Controls:
              </span>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Disclose exact salary amount to cert verifier:</span>
                <button
                  type="button"
                  onClick={() => setDiscloseAmountToAuditor((v) => !v)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-cyan-400"
                >
                  {discloseAmountToAuditor ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{discloseAmountToAuditor ? 'Revealed' : 'Shielded'}</span>
                </button>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Disclose timestamp:</span>
                <button
                  type="button"
                  onClick={() => setDiscloseTimestamp((v) => !v)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-cyan-400"
                >
                  {discloseTimestamp ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{discloseTimestamp ? 'Revealed' : 'Shielded'}</span>
                </button>
              </div>
            </div>

            {/* Export Certificate Button */}
            <button
              type="button"
              onClick={() => {
                const cert = {
                  network: 'Midnight Preprod',
                  protocol: 'MidnightPay Confidential Payroll',
                  recipient: claimReceipt.recipientAddress,
                  cycleId: claimReceipt.cycleId.toString(),
                  amount: discloseAmountToAuditor ? claimReceipt.claimedAmount.toString() : '[REDACTED_BY_OWNER]',
                  nullifier: claimReceipt.nullifier,
                  timestamp: discloseTimestamp ? claimReceipt.timestamp : '[REDACTED_BY_OWNER]',
                  cryptographicStatus: 'VERIFIED_ON_CHAIN_ZERO_KNOWLEDGE',
                };
                const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `MidnightPay_Selective_Disclosure_Cert_${claimReceipt.cycleId}.json`;
                a.click();
              }}
              className="w-full py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Verified Income Certificate (.json)</span>
            </button>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl p-6 text-center text-slate-500 space-y-2">
            <ShieldCheck className="w-10 h-10 text-slate-600" />
            <span className="text-xs">No active claim receipt in current session.</span>
            <p className="text-[11px] text-slate-600 max-w-xs">
              Execute a confidential claim using the form on the left to generate your cryptographic proof of compensation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
