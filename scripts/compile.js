import { execSync } from 'node:child_process';
import os from 'node:os';

const contractPath = 'contracts/midnightpay.compact';
const outPath = 'managed/midnightpay';

console.log(`[MidnightPay] Compiling Compact contract: ${contractPath} -> ${outPath}`);

try {
  if (os.platform() === 'win32') {
    // Check if compact is directly in PATH or use WSL
    try {
      execSync('compact compile --version', { stdio: 'pipe' });
      execSync(`compact compile ${contractPath} ${outPath}`, { stdio: 'inherit' });
    } catch {
      // Fallback to WSL
      console.log('[MidnightPay] Invoking Compact compiler through WSL environment...');
      execSync(`wsl -d Ubuntu-26.04 -e bash -c "~/.local/bin/compact compile ${contractPath} ${outPath}"`, { stdio: 'inherit' });
    }
  } else {
    // Linux / macOS / GitHub Actions CI
    execSync(`compact compile ${contractPath} ${outPath}`, { stdio: 'inherit' });
  }
  console.log('[MidnightPay] Compilation completed successfully.');
} catch (err) {
  console.error('[MidnightPay] Compilation failed:', err.message);
  process.exit(1);
}
