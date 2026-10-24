# MidnightPay: User Guide & Operator Manual

This guide walks you through using MidnightPay for confidential, verifiable payroll and revenue splitting on the Midnight network.

---

## 1. What You Need

Before starting, ensure you have the following prerequisites ready:
1. **Lace Wallet (Midnight Edition):** A browser extension wallet configured for the **Midnight Preprod** test network.
2. **Funded Preprod Address:** Testnet **tNIGHT** and **tDUST** to cover payroll budget deposits and transaction fees (available via the official Midnight Preprod Faucet).
3. **Web Browser:** Google Chrome, Brave, or any Chromium-based browser supporting the Lace extension.
4. **Node.js Environment (for local operators):** Node.js v22+ and npm to run the application locally or run contract test suites.

---

## 2. Step-by-Step Guide (Non-Technical)

### Scenario A: Running Payroll as an Employer or DAO Treasury Admin

1. **Connect Your Wallet**
   * Open the MidnightPay application.
   * Click **Connect Lace Wallet** in the top-right corner.
   * Approve the connection prompt in your Lace wallet and confirm you are connected to **Midnight Preprod**.

2. **Configure Your Pay Cycle & Allocations**
   * Navigate to the **Admin Payroll** tab.
   * Under **New Cycle ID**, enter the sequential pay period index (e.g., `1`, `2`, `3`).
   * In the **Private Payroll Allocation Schedule** table, list your team members or contractor roles. For each recipient:
     * Assign a descriptive role or identifier (e.g., *Lead ZK Engineer*).
     * Enter their shielded Midnight receiving address.
     * Enter their agreed compensation amount in **NIGHT**.
   * Note that this breakdown is encrypted and stored strictly in your browser memory—it never gets posted in raw form to the blockchain.

3. **Share Credentials with Recipients**
   * Next to each worker's row, click the **Copy Credential** button.
   * Securely send each employee their private claim credential (via end-to-end encrypted messaging, corporate email, or HR portal). Each worker receives only their own secret receipt, ensuring total coworker confidentiality.

4. **Commit the Payroll on Midnight**
   * Enter the **Total Committed Budget** (must be greater than or equal to the sum of all scheduled allocations).
   * Click **Commit Cycle On-Chain**.
   * Your browser calculates the cryptographic schedule root and signs the transaction.
   * Approve the transaction in your Lace wallet. Once confirmed on Preprod, the total budget and schedule commitment are posted on-chain.

5. **Closing the Pay Period**
   * Once the claiming window concludes, click **Close Active Cycle**.
   * This locks the contract state, preventing unauthorized or delayed withdrawals.

---

### Scenario B: Claiming Your Salary as an Employee or Contractor

1. **Connect Your Wallet**
   * Navigate to the **Claim Payout** tab.
   * Connect your personal Lace wallet.

2. **Enter Your Private Claim Details**
   * If your employer provided a credential string, paste it directly into the **Quick-Paste Employee Credential** field.
   * Alternatively, manually input your **Recipient Address**, **Entitled Salary Amount**, **Active Cycle ID**, **Blinding Salt**, and **Private Secret Key**.

3. **Execute the Confidential Claim**
   * Click **Execute Confidential Claim**.
   * The local zero-knowledge circuit derives your unique **nullifier** and proves to the Midnight ledger that your claim matches an authorized entry in the employer's schedule commitment.
   * The transaction disburses your funds without disclosing your salary amount to anyone observing the blockchain.

4. **Generate a Selective Disclosure Certificate**
   * After the claim succeeds, your verified cryptographic payment receipt appears in the right-hand panel.
   * Use the **Selective Disclosure Controls** to choose what information is visible:
     * Toggle the salary amount (reveal to prove income, or mask for anonymity).
     * Toggle timestamps and metadata.
   * Click **Download Verified Income Certificate (.json)** to obtain a portable, cryptographically sound proof of income for banks, mortgage providers, landlords, or tax auditors.

---

### Scenario C: Auditing & Regulatory Compliance

1. **Navigate to Audit & Compliance**
   * Regulators, tax authorities, or internal auditors can access the **Audit & Compliance** tab.
2. **Verify Aggregate Tax Withholding**
   * Input the statutory withholding witness and target hash.
   * Click **Verify ZK Compliance Proof**.
   * The circuit confirms aggregate tax withholding compliance without revealing individual worker salaries.

---

## 3. What Gets Proved (and What Stays Private)

| Data Property | Visibility | How It Is Handled |
| :--- | :--- | :--- |
| **Employer Identity** | Public On-Chain | Stored as a 32-byte public key commitment on the ledger. |
| **Total Committed Budget** | Public On-Chain | Publicly visible so employees and auditors verify solvency. |
| **Total Disbursed Amount** | Public On-Chain | Public running counter confirming aggregate budget solvency. |
| **Active Cycle ID** | Public On-Chain | Tracks the current active payroll epoch. |
| **Nullifier Set** | Public On-Chain | Unique cryptographic hashes preventing double-claims. |
| **Individual Salaries** | **Strictly Private** | Never broadcast or saved to the ledger. Evaluated strictly inside client-side ZK circuits. |
| **Coworker Pay Bands** | **Strictly Private** | Hidden from colleagues and external block explorer observers. |
| **Worker Addresses** | **Strictly Private** | Shielded within the employer's private allocation root. |
| **Blinding Salts** | **Strictly Private** | Random cryptographic seeds held locally by employers and workers. |
| **Budget Solvency Proof** | **Proved via ZK** | Math proves `totalDisbursed <= totalCommittedBudget` without leaking individual values. |
| **Entitlement Proof** | **Proved via ZK** | Math proves worker is owed payment without revealing their pay tier. |
| **Anti-Double-Spend** | **Proved via ZK** | Proves nullifier was derived from claimant's private key and hasn't been claimed yet. |

---

## 4. Troubleshooting & FAQ

### Issue: "Salary already claimed for this nullifier"
* **Cause:** The unique nullifier derived from your secret key and blinding salt has already been registered on-chain for this payroll cycle.
* **Solution:** Confirm whether you or your automated wallet already submitted this claim. Check your wallet balance or review the **Claimed Claims** counter on the Admin dashboard.

### Issue: "Total disbursed exceeds committed budget"
* **Cause:** The sum of all claimed payouts exceeds the total budget committed by the employer for this cycle.
* **Solution:** The employer must commit an updated cycle with a higher budget allocation or adjust allocation amounts.

### Issue: "Payroll cycle is closed"
* **Cause:** The employer finalized and closed the active pay cycle.
* **Solution:** Contact your payroll administrator to reopen the cycle or queue your payout in the next payroll cycle.

### Issue: "Unauthorized: Only employer can start new cycle"
* **Cause:** The transaction sender attempted to initialize or close a cycle without possessing the employer's private authentication key.
* **Solution:** Ensure you are connected with the employer's designated admin wallet.

### Issue: Compact compilation or WASM errors in development
* **Cause:** Vite bundler missing WebAssembly integration for cryptographic runtimes.
* **Solution:** Ensure `vite-plugin-wasm` is enabled in `vite.config.ts` and Node.js v22+ is used.
