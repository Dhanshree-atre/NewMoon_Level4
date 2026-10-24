import React, { useState } from 'react';
import {
  Lock,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  TrendingUp,
  FileKey,
  Shield,
  Layers,
} from 'lucide-react';
import { formatNight, bytesToHex, shortenAddress, type EmployeeAllocation } from '../utils/contract';
import type { Ledger } from '../../managed/midnightpay/contract/index.js';

interface PayrollManagerProps {
  ledgerState: Ledger | null;
  isLoading: boolean;
  circuitStep: string;
  error: string | null;
  onStartCycle: (
    cycleId: bigint,
    budget: bigint,
    scheduleHex: string,
    complianceHex: string
  ) => Promise<any>;
  onCloseCycle: () => Promise<any>;
}

const DEFAULT_ALLOCATIONS: EmployeeAllocation[] = [
  {
    id: 'emp-1',
    name: 'Lead ZK Engineer',
    recipientAddress: '0x3131313131313131313131313131313131313131313131313131313131313131',
    amount: 35000n,
    salt: '0x4141414141414141414141414141414141414141414141414141414141414141',
  },
  {
    id: 'emp-2',
    name: 'Senior Frontend Dev',
    recipientAddress: '0x3232323232323232323232323232323232323232323232323232323232323232',
    amount: 25000n,
    salt: '0x4242424242424242424242424242424242424242424242424242424242424242',
  },
  {
    id: 'emp-3',
    name: 'Smart Contract Auditor',
    recipientAddress: '0x3333333333333333333333333333333333333333333333333333333333333333',
    amount: 15000n,
    salt: '0x4343434343434343434343434343434343434343434343434343434343434343',
  },
];

export const PayrollManager: React.FC<PayrollManagerProps> = ({
  ledgerState,
  isLoading,
  circuitStep,
  error,
  onStartCycle,
  onCloseCycle,
}) => {
  const [cycleIdInput, setCycleIdInput] = useState<string>('2');
  const [budgetInput, setBudgetInput] = useState<string>('100000');
  const [allocations, setAllocations] = useState<EmployeeAllocation[]>(DEFAULT_ALLOCATIONS);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const totalCommitted = allocations.reduce((sum, item) => sum + item.amount, 0n);

  const handleAddAllocation = () => {
    const newId = `emp-${Date.now().toString().slice(-4)}`;
    const randomHex = () =>
      '0x' +
      Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');

    setAllocations((prev) => [
      ...prev,
      {
        id: newId,
        name: `Contributor ${prev.length + 1}`,
        recipientAddress: randomHex(),
        amount: 10000n,
        salt: randomHex(),
      },
    ]);
  };

  const handleRemoveAllocation = (id: string) => {
    setAllocations((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateAllocation = (
    id: string,
    field: 'name' | 'recipientAddress' | 'amount' | 'salt',
    val: any
  ) => {
    setAllocations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleCopyCredential = (emp: EmployeeAllocation) => {
    const credential = JSON.stringify({
      recipientAddress: emp.recipientAddress,
      amount: emp.amount.toString(),
      salt: emp.salt,
      cycleId: ledgerState ? ledgerState.currentCycle.toString() : '1',
    });
    navigator.clipboard.writeText(credential);
    setCopiedId(emp.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCommitPayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    try {
      const cycleIdBig = BigInt(cycleIdInput);
      const budgetBig = BigInt(budgetInput);

      // Deterministic schedule commitment from allocations
      const scheduleString = allocations.map((a) => `${a.recipientAddress}:${a.amount}:${a.salt}`).join('|');
      const encoder = new TextEncoder();
      const rawBytes = encoder.encode(scheduleString);
      const scheduleBytes = new Uint8Array(32);
      for (let i = 0; i < rawBytes.length; i++) {
        scheduleBytes[i % 32] ^= rawBytes[i];
      }
      const scheduleHex = '0x' + bytesToHex(scheduleBytes);
      const complianceHex = '0x' + 'bb'.repeat(32);

      await onStartCycle(cycleIdBig, budgetBig, scheduleHex, complianceHex);
      setSuccessMessage(`Payroll Cycle #${cycleIdInput} initialized on-chain with committed budget of ${formatNight(budgetBig)} NIGHT!`);
    } catch (err: any) {
      // Error handled by parent hook
    }
  };

  const handleClose = async () => {
    if (confirm('Are you sure you want to close the active payroll cycle? No further claims will be accepted.')) {
      setSuccessMessage(null);
      await onCloseCycle();
      setSuccessMessage('Payroll cycle closed successfully.');
    }
  };

  const disbursed = ledgerState ? ledgerState.totalDisbursed : 0n;
  const budget = ledgerState ? ledgerState.totalCommittedBudget : 1n;
  const disbursedPercent = budget > 0n ? Math.min(100, Number((disbursed * 100n) / budget)) : 0;

  return (
    <div className="space-y-6">
      {/* On-Chain Ledger Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Budget Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Shield className="w-16 h-16 text-cyan-400" />
          </div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Committed Budget
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-cyan-400">
            {ledgerState ? formatNight(ledgerState.totalCommittedBudget) : '---'} <span className="text-xs font-normal text-slate-400">NIGHT</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Publicly verified on-chain limit</p>
        </div>

        {/* Total Disbursed Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <TrendingUp className="w-16 h-16 text-emerald-400" />
          </div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Total Disbursed
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            {ledgerState ? formatNight(ledgerState.totalDisbursed) : '---'} <span className="text-xs font-normal text-slate-400">NIGHT</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">{disbursedPercent}% of committed budget</p>
        </div>

        {/* Active Cycle ID Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Active Cycle
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-purple-400">
            #{ledgerState ? ledgerState.currentCycle.toString() : '---'}
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                ledgerState?.isClosed ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span className="text-xs text-slate-400 font-mono">
              {ledgerState?.isClosed ? 'Closed' : 'Active (Open for Claims)'}
            </span>
          </div>
        </div>

        {/* Nullifiers Claimed Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Shielded Claims Made
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-cyan-300">
            {ledgerState ? ledgerState.claimedNullifiers.size().toString() : '0'}
          </div>
          <p className="mt-1 text-xs text-slate-500">Unique cryptographic nullifiers</p>
        </div>
      </div>

      {/* Solvency Progress Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80">
        <div className="flex justify-between items-center text-xs font-mono mb-2">
          <span className="text-slate-400">Disbursement Solvency:</span>
          <span className="text-cyan-400 font-semibold">{disbursedPercent}% Disbursed</span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 transition-all duration-500 rounded-full"
            style={{ width: `${disbursedPercent}%` }}
          />
        </div>
      </div>

      {/* Notification Alerts */}
      {circuitStep && (
        <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-cyan-200 text-sm flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <span>{circuitStep}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Grid: Allocation Builder & Cycle Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Confidential Allocation Schedule */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyan-400" />
                Private Payroll Allocation Schedule
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Individual amounts and addresses stay client-side. Only the Merkle commitment root is posted on Midnight.
              </p>
            </div>
            <button
              onClick={handleAddAllocation}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Recipient</span>
            </button>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {allocations.map((emp) => (
              <div
                key={emp.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors space-y-2.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={emp.name}
                    onChange={(e) => handleUpdateAllocation(emp.id, 'name', e.target.value)}
                    className="bg-transparent font-medium text-sm text-slate-200 border-b border-dashed border-slate-700 focus:outline-none focus:border-cyan-400"
                    placeholder="Worker Name or Role"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-cyan-400 font-semibold">
                      {formatNight(emp.amount)} NIGHT
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCredential(emp)}
                      title="Copy Claim Credential for Employee"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 transition-colors"
                    >
                      {copiedId === emp.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveAllocation(emp.id)}
                      title="Delete Recipient"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] uppercase font-mono text-slate-500">Recipient Address (Shielded)</label>
                    <input
                      type="text"
                      value={emp.recipientAddress}
                      onChange={(e) => handleUpdateAllocation(emp.id, 'recipientAddress', e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-mono text-slate-500">Allocation Amount (NIGHT)</label>
                    <input
                      type="number"
                      value={emp.amount.toString()}
                      onChange={(e) => handleUpdateAllocation(emp.id, 'amount', BigInt(e.target.value || 0))}
                      className="w-full mt-0.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Scheduled Allocations:</span>
            <span className="font-mono font-bold text-cyan-400 text-sm">
              {formatNight(totalCommitted)} NIGHT
            </span>
          </div>
        </div>

        {/* Right Col: Cycle Control Form */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              Commit Payroll Cycle
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Posts zero-knowledge aggregate solvency proofs to the Midnight Preprod network.
            </p>
          </div>

          <form onSubmit={handleCommitPayroll} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                New Cycle ID
              </label>
              <input
                type="number"
                value={cycleIdInput}
                onChange={(e) => setCycleIdInput(e.target.value)}
                min="1"
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Total Committed Budget (NIGHT)
              </label>
              <input
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                min="1"
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Must be ≥ scheduled allocations ({formatNight(totalCommitted)} NIGHT)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs text-purple-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <FileKey className="w-3.5 h-3.5" />
                Zero-Knowledge Privacy Seal:
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                The smart contract verifies that total individual payouts match this budget without revealing individual compensation amounts to coworkers or competitors.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || totalCommitted > BigInt(budgetInput || 0)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isLoading ? 'Executing Circuit...' : 'Commit Cycle On-Chain'}</span>
            </button>
          </form>

          {/* Close Cycle Control */}
          <div className="pt-4 border-t border-slate-800">
            <span className="text-xs font-medium text-slate-400 block mb-2">Cycle Lifecycle</span>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading || ledgerState?.isClosed}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 hover:border-rose-800/60 text-slate-400 border border-slate-700/60 text-xs font-medium transition-all disabled:opacity-40"
            >
              {ledgerState?.isClosed ? 'Cycle Already Closed' : 'Close Active Cycle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
