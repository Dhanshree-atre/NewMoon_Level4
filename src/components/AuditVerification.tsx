import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { shortenAddress, bytesToHex } from '../utils/contract';
import type { ZkProofLog } from '../hooks/useMidnight';
import type { Ledger } from '../../managed/midnightpay/contract/index.js';

interface AuditVerificationProps {
  ledgerState: Ledger | null;
  proofLogs: ZkProofLog[];
  isLoading: boolean;
  circuitStep: string;
  error: string | null;
  onAudit: (complianceWitnessHex: string, targetHashHex: string) => Promise<boolean>;
}

export const AuditVerification: React.FC<AuditVerificationProps> = ({
  ledgerState,
  proofLogs,
  isLoading,
  circuitStep,
  error,
  onAudit,
}) => {
  const [witnessInput, setWitnessInput] = useState<string>('0x' + 'bb'.repeat(32));
  const [targetHashInput, setTargetHashInput] = useState<string>('0x' + 'bb'.repeat(32));
  const [auditSuccess, setAuditSuccess] = useState<boolean | null>(null);

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuditSuccess(null);
    try {
      await onAudit(witnessInput, targetHashInput);
      setAuditSuccess(true);
    } catch {
      setAuditSuccess(false);
    }
  };

  const onChainComplianceHex = ledgerState ? '0x' + bytesToHex(ledgerState.complianceHash) : '---';

  return (
    <div className="space-y-8">
      {/* Top Banner: How Aggregate Compliance Works */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-800/40 shadow-xl space-y-3">
        <div className="flex items-center gap-2.5 text-purple-300 font-bold text-lg">
          <FileCheck2 className="w-6 h-6 text-purple-400" />
          <span>Aggregate Regulatory & Tax Compliance Verifier</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
          Under standard banking rails, verifying tax withholding or regulatory compliance requires auditing every individual payroll record, leaking sensitive executive and contractor wages.
          On Midnight, MidnightPay enables employers to generate a <strong>zero-knowledge aggregate proof</strong> showing that mandatory withholdings match statutory percentages without ever disclosing individual salaries to auditors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Audit Form */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            Verify Aggregate Compliance Hash
          </h2>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs font-mono space-y-1.5">
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">On-Chain Compliance Root:</span>
            <div className="text-slate-200 break-all text-[11px]">{onChainComplianceHex}</div>
          </div>

          <form onSubmit={handleRunAudit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Auditor Target Commitment Hash
              </label>
              <input
                type="text"
                value={targetHashInput}
                onChange={(e) => setTargetHashInput(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Private Aggregate Witness Preimage (CSV / Hash)
              </label>
              <input
                type="text"
                value={witnessInput}
                onChange={(e) => setWitnessInput(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {circuitStep && (
              <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-cyan-200 text-xs flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <span>{circuitStep}</span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {auditSuccess === true && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>ZK Circuit Confirmed: Regulatory compliance matches on-chain commitment with zero salary leakage!</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{isLoading ? 'Executing Circuit...' : 'Verify ZK Compliance Proof'}</span>
            </button>
          </form>
        </div>

        {/* Right 2 Columns: Live Zero-Knowledge Proof Trace */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyan-400" />
                Zero-Knowledge Proof Ledger Stream
              </h2>
              <p className="text-xs text-slate-400">
                Real-time cryptographic circuit transitions on Midnight Preprod.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800/60">
              {proofLogs.length} Circuits Proved
            </span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {proofLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No circuit executions recorded yet in current session.
              </div>
            ) : (
              proofLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-colors space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-400">{log.circuit}()</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {log.proofStatus}
                      </span>
                    </div>
                    <span className="text-slate-500 font-mono text-[11px]">{log.timestamp}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 font-semibold block mb-0.5">Disclosed On-Chain:</span>
                      <span className="text-slate-200 font-mono break-all">{log.disclosedData}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-purple-400 font-semibold block mb-0.5">Shielded Private Inputs:</span>
                      <span className="text-slate-300 font-mono">{log.privateShieldedInputs}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 font-mono">
                    <span>Preprod Tx: {shortenAddress(log.txHash, 8)}</span>
                    <span className="flex items-center gap-1 text-cyan-400 hover:underline cursor-pointer">
                      <span>View on Midnight Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
