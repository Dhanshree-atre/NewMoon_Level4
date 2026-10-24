import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  local_secret_key(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  get_recipient_claim_witness(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, [Uint8Array,
                                                                                           bigint,
                                                                                           Uint8Array,
                                                                                           bigint]];
  get_compliance_witness(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  init_payroll_cycle(context: __compactRuntime.CircuitContext<PS>,
                     cycleId_0: bigint,
                     budget_0: bigint,
                     scheduleCommitment_0: Uint8Array,
                     complianceCommitment_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  claim_salary(context: __compactRuntime.CircuitContext<PS>,
               nullifier_0: Uint8Array,
               leafHash_0: Uint8Array,
               disclosedAmount_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  audit_compliance(context: __compactRuntime.CircuitContext<PS>,
                   providedHash_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  close_payroll_cycle(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
}

export type ProvableCircuits<PS> = {
  init_payroll_cycle(context: __compactRuntime.CircuitContext<PS>,
                     cycleId_0: bigint,
                     budget_0: bigint,
                     scheduleCommitment_0: Uint8Array,
                     complianceCommitment_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  claim_salary(context: __compactRuntime.CircuitContext<PS>,
               nullifier_0: Uint8Array,
               leafHash_0: Uint8Array,
               disclosedAmount_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  audit_compliance(context: __compactRuntime.CircuitContext<PS>,
                   providedHash_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  close_payroll_cycle(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  init_payroll_cycle(context: __compactRuntime.CircuitContext<PS>,
                     cycleId_0: bigint,
                     budget_0: bigint,
                     scheduleCommitment_0: Uint8Array,
                     complianceCommitment_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  claim_salary(context: __compactRuntime.CircuitContext<PS>,
               nullifier_0: Uint8Array,
               leafHash_0: Uint8Array,
               disclosedAmount_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  audit_compliance(context: __compactRuntime.CircuitContext<PS>,
                   providedHash_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  close_payroll_cycle(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
}

export type Ledger = {
  readonly employer: Uint8Array;
  readonly currentCycle: bigint;
  readonly totalCommittedBudget: bigint;
  readonly totalDisbursed: bigint;
  readonly payrollCommitment: Uint8Array;
  claimedNullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  readonly complianceHash: Uint8Array;
  readonly isClosed: boolean;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): Promise<__compactRuntime.ConstructorResult<PS>>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
export declare const expectedVk: Record<string, string>;
