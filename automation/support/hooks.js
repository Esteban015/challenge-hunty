const { Before, After, BeforeAll, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');
const { connectCandidateWA, sendAsCandidate, disconnectCandidateWA } = require('./candidateWhatsApp');
const { cleanupCandidatesByPhone } = require('./dataCleanup');
const { spawnSync } = require('child_process');
const { existsSync, unlinkSync } = require('fs');
const path = require('path');

setDefaultTimeout(60 * 1000);

const CHROME_LOCK = path.resolve(__dirname, '../candidate-session/session/SingletonLock');

// Kill any Chrome processes using candidate-session (orphans from crashed test runs).
// Runs unconditionally — Chrome can block new instances via socket even without the lock file.
function killCandidateSessionChrome() {
  if (process.platform !== 'win32') return;

  const find = spawnSync('powershell', [
    '-NonInteractive', '-Command',
    "Get-CimInstance Win32_Process -Filter \"name='chrome.exe'\" | Where-Object { $_.CommandLine -like '*candidate-session*' } | Select-Object -ExpandProperty ProcessId",
  ], { encoding: 'utf8', timeout: 10000 });

  const pids = (find.stdout || '')
    .trim().split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => /^\d+$/.test(l));

  for (const pid of pids) {
    spawnSync('taskkill', ['/F', '/PID', pid], { timeout: 3000 });
  }

  if (pids.length) {
    console.log(`[Cleanup] Killed ${pids.length} orphaned Chrome process(es)`);
    spawnSync('ping', ['-n', '3', '127.0.0.1'], { stdio: 'ignore', timeout: 5000 });
  }

  // Remove stale lock file if Chrome didn't clean it up
  try { unlinkSync(CHROME_LOCK); } catch { /* already gone — fine */ }
}

// Connect the candidate WA simulator ONCE for the whole test suite
BeforeAll({ timeout: 90 * 1000 }, async function () {
  killCandidateSessionChrome();
  try {
    await connectCandidateWA();
  } catch (err) {
    console.warn(`[WA] Candidate simulator could not connect: ${err.message}`);
    console.warn('[WA] @whatsapp scenarios will fail.');
  }
});

// Destroy the WA client cleanly so the Chrome lock is released for the next run
AfterAll(async function () {
  await disconnectCandidateWA().catch(() => {});
});

// Launch a Playwright browser for every scenario
Before(async function () {
  this.browser = await chromium.launch({ headless: false });
  const context = await this.browser.newContext({ viewport: { width: 1280, height: 800 } });
  this.page = await context.newPage();
});

// Clean up stale candidates and wire sendAsCandidate for regression scenarios
Before({ tags: '@whatsapp' }, async function () {
  cleanupCandidatesByPhone(this.candidatePhone);
  this.sendAsCandidate = (text) => sendAsCandidate(this.serverPhone, text);
});

After(async function (scenario) {
  if (scenario.result?.status === 'FAILED') {
    const screenshot = await this.page?.screenshot({ fullPage: true });
    if (screenshot) this.attach(screenshot, 'image/png');
  }
  await this.browser?.close();
});
