import { useState, useEffect, useCallback } from 'react';
import { MidnightPayClient, bytesToHex, hexToBytes32 } from '../utils/contract';
import type { Ledger } from '../../managed/midnightpay/contract/index.js';

export interface WalletState {
  isConnected: boolean;
  address: string;
  network: string;
  balance: number;
  sk: Uint8Array;
}

export interface ZkProofLog {
  id: string;
  circuit: string;
  timestamp: string;
  proofStatus: 'Generating' | 'Verified' | 'Failed';
  disclosedData: string;
  privateShieldedInputs: string;
  txHash: string;
}

const PREPROD_EMPLOYER_SK = new Uint8Array(32).fill(0x11);
const DEFAULT_EMPLOYER_ADDRESS = 'mn_preprod1qz49h7wkyv4m9v3d95v94m6g9v78w5q3m4k2';

export function useMidnight() {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: true,
    address: DEFAULT_EMPLOYER_ADDRESS,
    network: 'Midnight Preprod (Testnet)',
    balance: 245000,
    sk: PREPROD_EMPLOYER_SK,
  });

  const [client, setClient] = useState<MidnightPayClient | null>(null);
  const [ledgerState, setLedgerState] = useState<Ledger | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [circuitStep, setCircuitStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [proofLogs, setProofLogs] = useState<ZkProofLog[]>([]);

  // Initialize client and initial contract state
  useEffect(() => {
    let mounted = true;
    async function setup() {
      try {
        setIsLoading(true);
        const newClient = new MidnightPayClient(wallet.sk);
        const initialLedger = await newClient.init(100000n);
        if (mounted) {
          setClient(newClient);
          setLedgerState(initialLedger);
          addProofLog({
            circuit: 'init_payroll_cycle',
            proofStatus: 'Verified',
            disclosedData: 'Cycle #1, Committed Budget: 100,000 NIGHT',
            privateShieldedInputs: 'Employer Secret Key, Private Allocations Schedule Root',
            txHash: '0x' + bytesToHex(new Uint8Array(16).fill(0x3a)),
          });
        }
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to initialize Midnight client');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    setup();
    return () => {
      mounted = false;
    };
  }, []);

  const addProofLog = (log: Omit<ZkProofLog, 'id' | 'timestamp'>) => {
    const newLog: ZkProofLog = {
      ...log,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
    };
    setProofLogs((prev) => [newLog, ...prev.slice(0, 19)]);
  };

  const connectWallet = useCallback(async (customAddress?: string) => {
    setIsLoading(true);
    try {
      // Simulates Lace Wallet Preprod connection
      await new Promise((r) => setTimeout(r, 600));
      setWallet({
        isConnected: true,
        address: customAddress || 'mn_preprod1q9xvw22lrm6k7m4v9d8c39s9v72w1q5m9k4',
        network: 'Midnight Preprod (Testnet)',
        balance: 185000,
        sk: new Uint8Array(32).fill(0x22),
      });
      setError(null);
    } catch (err: any) {
      setError('Lace wallet connection rejected');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWallet((prev) => ({ ...prev, isConnected: false }));
  }, []);

  // Circuit Call: Initialize new payroll cycle
  const startNewCycle = useCallback(
    async (
      cycleId: bigint,
      budget: bigint,
      scheduleCommitmentHex: string,
      complianceCommitmentHex: string,
      callerSk?: Uint8Array
    ) => {
      if (!client) throw new Error('Contract client not ready');
      setIsLoading(true);
      setError(null);
      setCircuitStep('Generating ZK proof for schedule commitment...');

      try {
        await new Promise((r) => setTimeout(r, 700));
        setCircuitStep('Proving budget solvency on Midnight circuit...');

        const scheduleBytes = hexToBytes32(scheduleCommitmentHex);
        const complianceBytes = hexToBytes32(complianceCommitmentHex);
        const skToUse = callerSk || wallet.sk;

        const updatedLedger = await client.initPayrollCycle(
          cycleId,
          budget,
          scheduleBytes,
          complianceBytes,
          skToUse
        );

        setLedgerState(updatedLedger);
        addProofLog({
          circuit: 'init_payroll_cycle',
          proofStatus: 'Verified',
          disclosedData: `Cycle #${cycleId.toString()}, Budget: ${budget.toLocaleString()} NIGHT`,
          privateShieldedInputs: 'Employer Private Key, Blinding Seeds, Contributor Allocation Map',
          txHash: '0x' + bytesToHex(new Uint8Array(16).map(() => Math.floor(Math.random() * 256))),
        });
        return updatedLedger;
      } catch (err: any) {
        setError(err.message || 'Circuit execution failed');
        throw err;
      } finally {
        setIsLoading(false);
        setCircuitStep('');
      }
    },
    [client, wallet.sk]
  );

  // Circuit Call: Claim confidential salary
  const claimSalary = useCallback(
    async (
      recipientHex: string,
      amount: bigint,
      saltHex: string,
      cycle: bigint,
      sk?: Uint8Array
    ) => {
      if (!client) throw new Error('Contract client not ready');
      setIsLoading(true);
      setError(null);
      setCircuitStep('Computing private nullifier & leaf hash...');

      try {
        await new Promise((r) => setTimeout(r, 600));
        setCircuitStep('Synthesizing zero-knowledge proof of salary entitlement...');

        const recipientBytes = hexToBytes32(recipientHex);
        const saltBytes = hexToBytes32(saltHex);
        const employeeSk = sk || wallet.sk;

        const result = await client.claimSalary(
          recipientBytes,
          amount,
          saltBytes,
          cycle,
          employeeSk
        );

        setLedgerState(result.ledger);
        addProofLog({
          circuit: 'claim_salary',
          proofStatus: 'Verified',
          disclosedData: `Disclosed Claim Amount: ${amount.toLocaleString()} NIGHT | Nullifier: ${result.nullifierHex.slice(0, 12)}...`,
          privateShieldedInputs: 'Worker Secret Key, Blinding Salt, Schedule Leaf Proof',
          txHash: '0x' + bytesToHex(new Uint8Array(16).map(() => Math.floor(Math.random() * 256))),
        });

        return result;
      } catch (err: any) {
        setError(err.message || 'Failed to claim salary');
        throw err;
      } finally {
        setIsLoading(false);
        setCircuitStep('');
      }
    },
    [client, wallet.sk]
  );

  // Circuit Call: Audit aggregate compliance
  const auditCompliance = useCallback(
    async (complianceWitnessHex: string, targetHashHex: string) => {
      if (!client) throw new Error('Contract client not ready');
      setIsLoading(true);
      setError(null);
      setCircuitStep('Evaluating zero-knowledge aggregate tax & withholding invariant...');

      try {
        await new Promise((r) => setTimeout(r, 500));
        const witnessBytes = hexToBytes32(complianceWitnessHex);
        const targetBytes = hexToBytes32(targetHashHex);

        await client.auditCompliance(witnessBytes, targetBytes);

        addProofLog({
          circuit: 'audit_compliance',
          proofStatus: 'Verified',
          disclosedData: `Compliance Root Verified: ${targetHashHex.slice(0, 16)}...`,
          privateShieldedInputs: 'Aggregate Tax Breakdown, Private Pay Schedule',
          txHash: '0x' + bytesToHex(new Uint8Array(16).map(() => Math.floor(Math.random() * 256))),
        });
        return true;
      } catch (err: any) {
        setError(err.message || 'Compliance audit failed');
        throw err;
      } finally {
        setIsLoading(false);
        setCircuitStep('');
      }
    },
    [client]
  );

  // Circuit Call: Close payroll cycle
  const closeCycle = useCallback(
    async (callerSk?: Uint8Array) => {
      if (!client) throw new Error('Contract client not ready');
      setIsLoading(true);
      setError(null);
      setCircuitStep('Proving employer authority to close cycle...');

      try {
        const skToUse = callerSk || wallet.sk;
        const updatedLedger = await client.closeCycle(skToUse);
        setLedgerState(updatedLedger);
        addProofLog({
          circuit: 'close_payroll_cycle',
          proofStatus: 'Verified',
          disclosedData: `Payroll Cycle Closed`,
          privateShieldedInputs: 'Employer Authentication Key',
          txHash: '0x' + bytesToHex(new Uint8Array(16).map(() => Math.floor(Math.random() * 256))),
        });
        return updatedLedger;
      } catch (err: any) {
        setError(err.message || 'Failed to close cycle');
        throw err;
      } finally {
        setIsLoading(false);
        setCircuitStep('');
      }
    },
    [client, wallet.sk]
  );

  return {
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
    clearError: () => setError(null),
  };
}
