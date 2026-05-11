const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

const SESSION_DIR = path.resolve(__dirname, '../candidate-session');
let client = null;
let isReady = false;
let connectingPromise = null;

async function connectCandidateWA() {
  if (client && isReady) return client;
  // If a connection attempt is already in progress, wait for it instead of
  // launching a second Chromium instance against the same userDataDir
  if (connectingPromise) return connectingPromise;

  connectingPromise = new Promise((resolve, reject) => {
    client = new Client({
      authStrategy: new LocalAuth({ dataPath: SESSION_DIR }),
      puppeteer: {
        headless: true,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      },
    });

    client.on('qr', (qr) => {
      console.log('\n[Candidate WA] Scan this QR with WhatsApp account #2:\n');
      qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
      console.log('[Candidate WA] Connected ✓');
      isReady = true;
      connectingPromise = null;
      resolve(client);
    });

    client.on('auth_failure', (msg) => {
      connectingPromise = null;
      client = null;
      reject(new Error(`Auth failure: ${msg}`));
    });

    client.on('disconnected', () => {
      isReady = false;
      client = null;
      connectingPromise = null;
    });

    // initialize() is async — catch its rejection so it reaches our promise
    client.initialize().catch((err) => {
      connectingPromise = null;
      client = null;
      reject(err);
    });
  });

  return connectingPromise;
}

async function sendAsCandidate(serverPhone, text) {
  if (!client || !isReady) throw new Error('Candidate WA client is not connected');
  const chatId = `${serverPhone.replace(/\D/g, '')}@c.us`;
  await client.sendMessage(chatId, text);
}

async function disconnectCandidateWA() {
  if (client) {
    await client.destroy();
    client = null;
    isReady = false;
  }
}

function isClientReady() {
  return isReady;
}

module.exports = { connectCandidateWA, sendAsCandidate, disconnectCandidateWA, isClientReady };
