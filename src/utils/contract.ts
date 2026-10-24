/**
 * MidnightPay Contract & Cryptographic Utilities
 */

import { Contract, ledger, type Ledger } from '../../managed/midnightpay/contract/index.js';
import * as rt from '@midnight-ntwrk/compact-runtime';

export interface EmployeeAllocation {
  id: string;
  name: string;
  recipientAddress: string;
  amount: bigint;
  salt: string;
}

export interface PayrollCycleData {
  cycleId: bigint;
  totalBudget: bigint;
  totalDisbursed: bigint;
  scheduleCommitment: string;
  complianceHash: string;
  isClosed: boolean;
  employerAddress: string;
}

export interface SelectiveDisclosureProof {
  recipientAddress: string;
  cycleId: bigint;
  claimedAmount: bigint;
  nullifier: string;
  leafHash: string;
  timestamp: string;
  verifiedOnChain: boolean;
}

// Helper to convert hex string to Uint8Array(32)
export function hexToBytes32(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(32);
  for (let i = 0; i < Math.min(clean.length / 2, 32); i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16) || 0;
  }
  return bytes;
}

// Helper to convert Uint8Array to hex string
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Format currency
export function formatNight(amount: bigint | number): string {
  const val = typeof amount === 'bigint' ? Number(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(val);
}

// Shorten address for UI
export function shortenAddress(addr: string, chars = 6): string {
  if (!addr) return '';
  if (addr.length <= chars * 2 + 2) return addr;
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`;
}

/**
 * Client-Side Protocol Helper wrapping the compiled contract
 */
export class MidnightPayClient {
  public contract: any;
  public contractAddress: any;
  public currentContractState: any;
  public currentZswapLocalState: any;
  public currentPrivateState: any;
  public activeCallerSk: Uint8Array;
  public activeClaimWitness: [Uint8Array, bigint, Uint8Array, bigint];
  public activeComplianceWitness: Uint8Array;

  constructor(defaultSk?: Uint8Array) {
    this.activeCallerSk = defaultSk ?? new Uint8Array(32).fill(1);
    this.activeClaimWitness = [new Uint8Array(32), 0n, new Uint8Array(32), 0n];
    this.activeComplianceWitness = new Uint8Array(32).fill(0);

    const witnesses = {
      local_secret_key: (ctx: any): [any, Uint8Array] => [ctx.privateState, this.activeCallerSk],
      get_recipient_claim_witness: (ctx: any): [any, [Uint8Array, bigint, Uint8Array, bigint]] => [
        ctx.privateState,
        this.activeClaimWitness,
      ],
      get_compliance_witness: (ctx: any): [any, Uint8Array] => [
        ctx.privateState,
        this.activeComplianceWitness,
      ],
    };

    this.contract = new Contract(witnesses);
    this.contractAddress = (rt as any).dummyContractAddress();
  }

  async init(initialBudget = 100000n): Promise<Ledger> {
    const coinPk = new Uint8Array(32).fill(7);
    const constructorContext = (rt as any).createConstructorContext({}, coinPk);
    const initRes = await this.contract.initialState(constructorContext);

    this.currentContractState = initRes.currentContractState.data;
    this.currentZswapLocalState = initRes.currentZswapLocalState;
    this.currentPrivateState = initRes.currentPrivateState;

    // Initialize Cycle 1 by default
    const scheduleCommitment = new Uint8Array(32).fill(0xaa);
    const complianceCommitment = new Uint8Array(32).fill(0xbb);

    const context = this.makeContext('init_payroll_cycle');
    const res = await this.contract.impureCircuits.init_payroll_cycle(
      context,
      1n,
      initialBudget,
      scheduleCommitment,
      complianceCommitment
    );

    this.currentContractState = res.context.callContext.currentQueryContext.state;
    return this.getLedger();
  }

  makeContext(circuitId: string) {
    return (rt as any).createCircuitContext(
      circuitId,
      this.contractAddress,
      this.currentZswapLocalState,
      this.currentContractState,
      this.currentPrivateState
    );
  }

  getLedger(): Ledger {
    return ledger(this.currentContractState);
  }

  computeLeaf(recipient: Uint8Array, amount: bigint, salt: Uint8Array, cycle: bigint): Uint8Array {
    return this.contract._compute_claim_leaf_0(recipient, amount, salt, cycle);
  }

  computeNullifier(sk: Uint8Array, salt: Uint8Array): Uint8Array {
    return this.contract._compute_nullifier_0(sk, salt);
  }

  async initPayrollCycle(
    cycleId: bigint,
    budget: bigint,
    scheduleCommitment: Uint8Array,
    complianceCommitment: Uint8Array,
    callerSk: Uint8Array
  ): Promise<Ledger> {
    this.activeCallerSk = callerSk;
    const context = this.makeContext('init_payroll_cycle');
    const res = await this.contract.impureCircuits.init_payroll_cycle(
      context,
      cycleId,
      budget,
      scheduleCommitment,
      complianceCommitment
    );
    this.currentContractState = res.context.callContext.currentQueryContext.state;
    return this.getLedger();
  }

  async claimSalary(
    recipient: Uint8Array,
    amount: bigint,
    salt: Uint8Array,
    cycle: bigint,
    sk: Uint8Array
  ): Promise<{ ledger: Ledger; nullifierHex: string; leafHex: string }> {
    this.activeCallerSk = sk;
    this.activeClaimWitness = [recipient, amount, salt, cycle];

    const leaf = this.computeLeaf(recipient, amount, salt, cycle);
    const nullifier = this.computeNullifier(sk, salt);

    const context = this.makeContext('claim_salary');
    const res = await this.contract.impureCircuits.claim_salary(
      context,
      nullifier,
      leaf,
      amount
    );

    this.currentContractState = res.context.callContext.currentQueryContext.state;
    return {
      ledger: this.getLedger(),
      nullifierHex: bytesToHex(nullifier),
      leafHex: bytesToHex(leaf),
    };
  }

  async auditCompliance(complianceWitness: Uint8Array, targetHash: Uint8Array): Promise<boolean> {
    this.activeComplianceWitness = complianceWitness;
    const context = this.makeContext('audit_compliance');
    await this.contract.impureCircuits.audit_compliance(context, targetHash);
    return true;
  }

  async closeCycle(callerSk: Uint8Array): Promise<Ledger> {
    this.activeCallerSk = callerSk;
    const context = this.makeContext('close_payroll_cycle');
    const res = await this.contract.impureCircuits.close_payroll_cycle(context);
    this.currentContractState = res.context.callContext.currentQueryContext.state;
    return this.getLedger();
  }
}
