import { describe, it, expect, beforeEach } from 'vitest';
import * as rt from '@midnight-ntwrk/compact-runtime';
import { Contract, ledger, type Ledger } from '../managed/midnightpay/contract/index.js';

describe('MidnightPay Confidential Payroll Protocol', () => {
  // Test Keys & Identities
  const employerSk = new Uint8Array(32).fill(10);
  const employee1Sk = new Uint8Array(32).fill(21);
  const employee2Sk = new Uint8Array(32).fill(22);
  const employee1Recipient = new Uint8Array(32).fill(31);
  const employee2Recipient = new Uint8Array(32).fill(32);
  const salt1 = new Uint8Array(32).fill(41);
  const salt2 = new Uint8Array(32).fill(42);

  const cycleId = 1n;
  const committedBudget = 75000n;
  const scheduleCommitment = new Uint8Array(32).fill(88);
  const complianceCommitment = new Uint8Array(32).fill(99);

  let currentCallerSk = employerSk;
  let currentClaimWitness: [Uint8Array, bigint, Uint8Array, bigint] = [
    employee1Recipient,
    25000n,
    salt1,
    cycleId,
  ];
  let currentComplianceWitness = complianceCommitment;

  const witnesses = {
    local_secret_key: (ctx: any): [any, Uint8Array] => [ctx.privateState, currentCallerSk],
    get_recipient_claim_witness: (ctx: any): [any, [Uint8Array, bigint, Uint8Array, bigint]] => [
      ctx.privateState,
      currentClaimWitness,
    ],
    get_compliance_witness: (ctx: any): [any, Uint8Array] => [
      ctx.privateState,
      currentComplianceWitness,
    ],
  };

  let contract: any;
  let contractAddress: any;
  let currentContractState: any;
  let currentZswapLocalState: any;
  let currentPrivateState: any;

  function makeContext(circuitId: string) {
    return (rt as any).createCircuitContext(
      circuitId,
      contractAddress,
      currentZswapLocalState,
      currentContractState,
      currentPrivateState
    );
  }

  function getLedgerState(): Ledger {
    return ledger(currentContractState);
  }

  beforeEach(async () => {
    contract = new Contract(witnesses);
    contractAddress = (rt as any).dummyContractAddress();
    const coinPk = new Uint8Array(32).fill(5);
    const constructorContext = (rt as any).createConstructorContext({}, coinPk);
    const init = await contract.initialState(constructorContext);

    currentContractState = init.currentContractState.data;
    currentZswapLocalState = init.currentZswapLocalState;
    currentPrivateState = init.currentPrivateState;
  });

  it('1. should deploy contract and initialize confidential payroll cycle', async () => {
    currentCallerSk = employerSk;

    const res = await contract.impureCircuits.init_payroll_cycle(
      makeContext('init_payroll_cycle'),
      cycleId,
      committedBudget,
      scheduleCommitment,
      complianceCommitment
    );

    currentContractState = res.context.callContext.currentQueryContext.state;
    const l = getLedgerState();

    expect(l.currentCycle).toBe(1n);
    expect(l.totalCommittedBudget).toBe(75000n);
    expect(l.totalDisbursed).toBe(0n);
    expect(l.isClosed).toBe(false);
    expect(l.claimedNullifiers.size()).toBe(0n);
    expect(l.employer).toBeDefined();
    expect(l.employer.length).toBe(32);
  });

  it('2. should verify private witness claim and update disbursed total with unique nullifier', async () => {
    // 1. Initialize cycle
    currentCallerSk = employerSk;
    let res = await contract.impureCircuits.init_payroll_cycle(
      makeContext('init_payroll_cycle'),
      cycleId,
      committedBudget,
      scheduleCommitment,
      complianceCommitment
    );
    currentContractState = res.context.callContext.currentQueryContext.state;

    // 2. Employee 1 executes confidential salary claim of 25,000
    currentCallerSk = employee1Sk;
    const salary1 = 25000n;
    currentClaimWitness = [employee1Recipient, salary1, salt1, cycleId];

    const leaf1 = contract._compute_claim_leaf_0(employee1Recipient, salary1, salt1, cycleId);
    const nullifier1 = contract._compute_nullifier_0(employee1Sk, salt1);

    res = await contract.impureCircuits.claim_salary(
      makeContext('claim_salary'),
      nullifier1,
      leaf1,
      salary1
    );
    currentContractState = res.context.callContext.currentQueryContext.state;

    const l = getLedgerState();
    expect(l.totalDisbursed).toBe(25000n);
    expect(l.claimedNullifiers.member(nullifier1)).toBe(true);
    expect(l.claimedNullifiers.size()).toBe(1n);
  });

  it('3. should enforce anti-double-spend and reject re-claiming with the same nullifier', async () => {
    // 1. Init
    currentCallerSk = employerSk;
    let res = await contract.impureCircuits.init_payroll_cycle(
      makeContext('init_payroll_cycle'),
      cycleId,
      committedBudget,
      scheduleCommitment,
      complianceCommitment
    );
    currentContractState = res.context.callContext.currentQueryContext.state;

    // 2. Claim first time
    currentCallerSk = employee1Sk;
    const salary1 = 20000n;
    currentClaimWitness = [employee1Recipient, salary1, salt1, cycleId];
    const leaf1 = contract._compute_claim_leaf_0(employee1Recipient, salary1, salt1, cycleId);
    const nullifier1 = contract._compute_nullifier_0(employee1Sk, salt1);

    res = await contract.impureCircuits.claim_salary(
      makeContext('claim_salary'),
      nullifier1,
      leaf1,
      salary1
    );
    currentContractState = res.context.callContext.currentQueryContext.state;

    // 3. Attempt duplicate claim with identical nullifier -> must throw
    await expect(
      contract.impureCircuits.claim_salary(
        makeContext('claim_salary'),
        nullifier1,
        leaf1,
        salary1
      )
    ).rejects.toThrow(/Salary already claimed for this nullifier/);
  });

  it('4. should enforce budget solvency and reject claims exceeding total committed budget', async () => {
    // 1. Init with small budget: 30,000
    currentCallerSk = employerSk;
    const tightBudget = 30000n;
    let res = await contract.impureCircuits.init_payroll_cycle(
      makeContext('init_payroll_cycle'),
      cycleId,
      tightBudget,
      scheduleCommitment,
      complianceCommitment
    );
    currentContractState = res.context.callContext.currentQueryContext.state;

    // 2. Attempt to claim 35,000 (exceeds 30,000 budget)
    currentCallerSk = employee1Sk;
    const excessiveSalary = 35000n;
    currentClaimWitness = [employee1Recipient, excessiveSalary, salt1, cycleId];
    const excessiveLeaf = contract._compute_claim_leaf_0(
      employee1Recipient,
      excessiveSalary,
      salt1,
      cycleId
    );
    const excessiveNullifier = contract._compute_nullifier_0(employee1Sk, salt1);

    await expect(
      contract.impureCircuits.claim_salary(
        makeContext('claim_salary'),
        excessiveNullifier,
        excessiveLeaf,
        excessiveSalary
      )
    ).rejects.toThrow(/Total disbursed exceeds committed budget/);
  });

  it('5. should audit aggregate compliance without revealing individual worker compensation', async () => {
    // 1. Init
    currentCallerSk = employerSk;
    let res = await contract.impureCircuits.init_payroll_cycle(
      makeContext('init_payroll_cycle'),
      cycleId,
      committedBudget,
      scheduleCommitment,
      complianceCommitment
    );
    currentContractState = res.context.callContext.currentQueryContext.state;

    // 2. Verify legitimate compliance hash passes audit circuit
    currentComplianceWitness = complianceCommitment;
    res = await contract.impureCircuits.audit_compliance(
      makeContext('audit_compliance'),
      complianceCommitment
    );
    expect(res).toBeDefined();

    // 3. Fake compliance hash fails audit circuit
    const fakeCompliance = new Uint8Array(32).fill(0xee);
    await expect(
      contract.impureCircuits.audit_compliance(makeContext('audit_compliance'), fakeCompliance)
    ).rejects.toThrow();
  });

  it('6. should allow employer to close cycle and reject claims on closed cycle', async () => {
    // 1. Init
    currentCallerSk = employerSk;
    let res = await contract.impureCircuits.init_payroll_cycle(
      makeContext('init_payroll_cycle'),
      cycleId,
      committedBudget,
      scheduleCommitment,
      complianceCommitment
    );
    currentContractState = res.context.callContext.currentQueryContext.state;

    // 2. Employer closes cycle
    currentCallerSk = employerSk;
    res = await contract.impureCircuits.close_payroll_cycle(makeContext('close_payroll_cycle'));
    currentContractState = res.context.callContext.currentQueryContext.state;

    const l = getLedgerState();
    expect(l.isClosed).toBe(true);

    // 3. Worker attempts claim on closed cycle -> rejected
    currentCallerSk = employee2Sk;
    const salary2 = 10000n;
    currentClaimWitness = [employee2Recipient, salary2, salt2, cycleId];
    const leaf2 = contract._compute_claim_leaf_0(employee2Recipient, salary2, salt2, cycleId);
    const nullifier2 = contract._compute_nullifier_0(employee2Sk, salt2);

    await expect(
      contract.impureCircuits.claim_salary(makeContext('claim_salary'), nullifier2, leaf2, salary2)
    ).rejects.toThrow(/Payroll cycle is closed/);
  });
});
