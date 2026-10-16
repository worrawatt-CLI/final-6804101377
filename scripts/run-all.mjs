// รัน Playwright ทั้งหมด แล้วสร้าง reports/test-summary.md เสมอ (แม้บาง Test จะ Failed)
// ใช้: npm run test:all  — ทำงานได้ทั้ง Windows (cmd/PowerShell) และ macOS/Linux
import { spawnSync } from 'node:child_process';

const isWin = process.platform === 'win32';
const npx = isWin ? 'npx.cmd' : 'npx';

const test = spawnSync(npx, ['playwright', 'test', ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: isWin, // Windows ต้องใช้ shell เพื่อเรียก .cmd
});

const summary = spawnSync(process.execPath, ['scripts/make-summary.mjs'], { stdio: 'inherit' });

process.exit(test.status ?? summary.status ?? 1);
