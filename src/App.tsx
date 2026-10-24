import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { PayrollManager } from './components/PayrollManager';
import { ClaimSalary } from './components/ClaimSalary';
import { AuditVerification } from './components/AuditVerification';
import { useMidnight } from './hooks/useMidnight';
import {
  Shield,
  EyeOff,
  CheckCircle2,
  Lock,
  Globe,
  Building,
  Users,
  Code2,
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'admin' | 'claim' | 'audit' | 'privacy'>('admin');

  const {
    wallet,
    ledgerState,
    isLoading,
    circuitStep,
    error,
    proofLogs,
    connectWallet,
    disconnectWallet,
    startNewCycle,
    claimSalary,
    auditCompliance,
    closeCycle,
  } = useMidnight();

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      wallet={wallet}
      onConnectWallet={connectWallet}
      onDisconnectWallet={disconnectWallet}
      isLoading={isLoading}
    >
      {/* Tab: Admin Payroll Manager */}
      {activeTab === 'admin' && (
        <PayrollManager
          ledgerState={ledgerState}
          isLoading={isLoading}
          circuitStep={circuitStep}
          error={error}
          onStartCycle={startNewCycle}
          onCloseCycle={closeCycle}
        />
      )}

      {/* Tab: Claim Salary Payout */}
      {activeTab === 'claim' && (
        <ClaimSalary
          ledgerState={ledgerState}
          isLoading={isLoading}
          circuitStep={circuitStep}
          error={error}
          onClaim={claimSalary}
        />
      )}

      {/* Tab: Audit & Compliance */}
      {activeTab === 'audit' && (
        <AuditVerification
          ledgerState={ledgerState}
          proofLogs={proofLogs}
          isLoading={isLoading}
          circuitStep={circuitStep}
          error={error}
          onAudit={auditCompliance}
        />
      )}

      {/* Tab: Privacy Model & Zero-Knowledge Architecture */}
      {activeTab === 'privacy' && (
        <div className="space-y-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-400 text-xs font-mono">
              <Shield className="w-3.5 h-3.5" />
              <span>Midnight Network Dual-State Architecture</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              The MidnightPay Privacy Model
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              How Midnight's Compact smart contracts reconcile immutable corporate solvency verification with airtight individual compensation confidentiality.
            </p>
          </div>

          {/* Problem vs Solution Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Public Blockchains (Ethereum / Solana / Polygon) */}
            <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                <Globe className="w-5 h-5" />
                <span>Transparent Blockchains (Fatal Flaw)</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Salary Leaks:</strong> Every coworker can inspect block explorers to see who gets paid what, destroying internal team cohesion.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Competitor Espionage:</strong> Rival startups monitor treasury wallets to poach talent and deduce billable contractor rates.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Regulatory Violation:</strong> Breaches mandatory wage privacy laws across the EU (GDPR) and North America.</span>
                </li>
              </ul>
            </div>

            {/* MidnightPay on Midnight */}
            <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                <Shield className="w-5 h-5" />
                <span>MidnightPay Protocol (Midnight Network)</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Zero-Knowledge Solvency:</strong> Employer publicly commits total payroll budget; math proves no overspending occurred.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Shielded Compensation:</strong> Individual payment amounts, worker wallet addresses, and blinding salts remain client-side.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Selective Disclosure:</strong> Workers receive cryptographic receipts to prove verifiable income to mortgage lenders or tax bodies.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 3 Pillars Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* 1. Public Ledger */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">1. Public Ledger State</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Immutable data verified on-chain by any observer:
              </p>
              <ul className="text-xs font-mono space-y-1 text-slate-300">
                <li>• <code className="text-cyan-400">employer</code> identity root</li>
                <li>• <code className="text-cyan-400">currentCycle</code> active epoch</li>
                <li>• <code className="text-cyan-400">totalCommittedBudget</code> limit</li>
                <li>• <code className="text-cyan-400">totalDisbursed</code> aggregate sum</li>
                <li>• <code className="text-cyan-400">claimedNullifiers</code> map</li>
                <li>• <code className="text-cyan-400">complianceHash</code> root</li>
              </ul>
            </div>

            {/* 2. Private Witnesses */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <EyeOff className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">2. Private Witnesses</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Confidential inputs kept strictly inside local browser memory:
              </p>
              <ul className="text-xs font-mono space-y-1 text-slate-300">
                <li>• <code className="text-purple-400">local_secret_key()</code> caller sk</li>
                <li>• <code className="text-purple-400">recipientAddress</code> worker id</li>
                <li>• <code className="text-purple-400">salaryAmount</code> individual wage</li>
                <li>• <code className="text-purple-400">blindingSalt</code> randomness</li>
                <li>• <code className="text-purple-400">complianceWitness</code> raw tax split</li>
              </ul>
            </div>

            {/* 3. Proved via ZK */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">3. Proved via ZK</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mathematical truths proven without revealing witness data:
              </p>
              <ul className="text-xs font-mono space-y-1 text-slate-300">
                <li>• <code className="text-emerald-400">totalDisbursed &lt;= budget</code></li>
                <li>• Leaf matches schedule root</li>
                <li>• Nullifier uniqueness (anti-cheat)</li>
                <li>• Worker owns claiming key</li>
                <li>• Withholding tax rate matches laws</li>
              </ul>
            </div>
          </div>

          {/* Compact Code Snippet Highlight */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 font-semibold flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                contracts/midnightpay.compact (disclose declaration)
              </span>
              <span className="text-[11px] font-mono text-slate-500">Compact Language 0.26</span>
            </div>
            <pre className="text-xs font-mono bg-slate-900/90 p-4 rounded-xl text-slate-300 overflow-x-auto border border-slate-800">
{`// Compact compiler enforces that only intentionally disclosed values cross the ledger boundary:
export circuit claim_salary(nullifier: Bytes<32>, leafHash: Bytes<32>, disclosedAmount: Uint<64>): [] {
  assert(disclose(!isClosed), "Payroll cycle is closed");
  assert(disclose(!claimedNullifiers.member(disclose(nullifier))), "Salary already claimed");

  // Private witness inputs stay client-side:
  const claimWitness = get_recipient_claim_witness(); // [recipient, amount, salt, cycle]
  const expectedLeaf = compute_claim_leaf(claimWitness[0], claimWitness[1], claimWitness[2], claimWitness[3]);
  assert(disclose(expectedLeaf == leafHash), "Invalid claim leaf proof");

  // Proves nullifier matches secret key without exposing either:
  const sk = local_secret_key();
  assert(disclose(compute_nullifier(sk, claimWitness[2]) == nullifier), "Nullifier mismatch");

  // Disclose only cumulative counter and unique nullifier mark:
  claimedNullifiers.insert(disclose(nullifier), true);
  totalDisbursed = (disclose(totalDisbursed) + disclose(disclosedAmount)) as Uint<64>;
  assert(disclose(totalDisbursed <= totalCommittedBudget), "Overspend rejected");
}`}
            </pre>
          </div>
        </div>
      )}
    </Layout>
  );
};
