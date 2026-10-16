// สร้าง reports/test-summary.md จากผลการรันจริงใน reports/results.json
// ใช้: node scripts/make-summary.mjs   (หรือ npm run summary)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const INPUT = 'reports/results.json';
const OUTPUT = 'reports/test-summary.md';

if (!existsSync(INPUT)) {
  console.error(`ไม่พบ ${INPUT} — กรุณารัน "npx playwright test" ก่อน`);
  process.exit(1);
}

const report = JSON.parse(readFileSync(INPUT, 'utf8'));
const rows = [];

function walk(suite, file) {
  const currentFile = suite.file || file;
  for (const spec of suite.specs ?? []) {
    for (const t of spec.tests ?? []) {
      const last = t.results?.[t.results.length - 1];
      const status = last?.status ?? 'not run';
      const errors = (last?.errors ?? [])
        .map((e) => (e.message ?? '').replace(/\u001b\[[0-9;]*m/g, '').split('\n')[0])
        .filter(Boolean);
      rows.push({
        file: spec.file || currentFile,
        title: spec.title,
        project: t.projectName,
        status,
        duration: last?.duration ?? 0,
        errors,
      });
    }
  }
  for (const child of suite.suites ?? []) walk(child, currentFile);
}
for (const s of report.suites ?? []) walk(s, s.file);

const count = (st) => rows.filter((r) => r.status === st).length;
const passed = count('passed');
const failed = count('failed') + count('timedOut') + count('interrupted');
const skipped = count('skipped');
const icon = (st) => (st === 'passed' ? '✅ Passed' : st === 'skipped' ? '⏭️ Skipped' : `❌ ${st}`);

const lines = [];
lines.push('# Test Summary — Playwright Final Exam (SauceDemo)');
lines.push('');
lines.push(`- วันที่รัน: ${report.stats?.startTime ?? new Date().toISOString()}`);
lines.push(`- Playwright version: ${report.config?.version ?? '-'}`);
lines.push(`- ระยะเวลารวม: ${((report.stats?.duration ?? 0) / 1000).toFixed(1)} วินาที`);
lines.push(`- จำนวน Test ทั้งหมด: ${rows.length}`);
lines.push(`- Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped}`);
lines.push('');
lines.push('> ไฟล์นี้สร้างอัตโนมัติจาก `reports/results.json` ของการรันจริง ไม่ได้แก้ไขผลด้วยมือ');
lines.push('');
lines.push('| # | ไฟล์ | Test | Browser | ผลลัพธ์ | เวลา (ms) |');
lines.push('|---:|---|---|---|---|---:|');
rows.forEach((r, i) => {
  lines.push(`| ${i + 1} | ${r.file} | ${r.title} | ${r.project} | ${icon(r.status)} | ${r.duration} |`);
});
lines.push('');
lines.push('## ข้อผิดพลาดที่พบ');
lines.push('');
const failedRows = rows.filter((r) => r.errors.length > 0 || !['passed', 'skipped'].includes(r.status));
if (failedRows.length === 0) {
  lines.push('ไม่พบข้อผิดพลาด — ทุก Test Case ผ่าน (Passed)');
} else {
  for (const r of failedRows) {
    lines.push(`### ${r.title}`);
    lines.push('');
    for (const e of r.errors) lines.push(`- ${e}`);
    lines.push('');
  }
}
lines.push('');
lines.push('## วิธีเปิดดูรายงาน');
lines.push('');
lines.push('- HTML Report: `npx playwright show-report` (โฟลเดอร์ `playwright-report/`)');
lines.push('- JSON Report: `reports/results.json`');
lines.push('');

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, lines.join('\n'), 'utf8');
console.log(`สร้าง ${OUTPUT} แล้ว — Passed ${passed}/${rows.length}, Failed ${failed}`);
