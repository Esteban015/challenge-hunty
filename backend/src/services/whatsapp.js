import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getCandidateByPhone, updateCandidate } from './candidateService.js';
import { getVacancyById } from './vacancyService.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SESSION_DIR = resolve(__dirname, '../../.wwebjs_auth');

let client = null;

export function getClient() {
  return client;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatChatId(phone) {
  return `${phone.replace(/\D/g, '')}@c.us`;
}

function normalizePhone(chatId) {
  // chatId format: "521551234567@c.us" or "521551234567:device@c.us"
  return chatId.split('@')[0].split(':')[0];
}

// ── Outgoing messages ─────────────────────────────────────────────────────────

export async function sendTextMessage(phone, text) {
  if (!client) throw new Error('WhatsApp client is not initialized');
  await client.sendMessage(formatChatId(phone), text);
}

/**
 * Sends a plain-text message listing the options inline.
 * NOTE: whatsapp-web.js marks interactive buttons as DEPRECATED.
 * We always send plain text with numbered options so the candidate
 * can reply by typing the option text.
 */
export async function sendButtonMessage(phone, bodyText, buttons) {
  const optionsList = buttons.map((b, i) => `${i + 1}. ${b}`).join('\n');
  const fullText = `${bodyText}\n\n${optionsList}\n\n_Responde con una de las opciones anteriores._`;
  await sendTextMessage(phone, fullText);
}

// ── Incoming message handler / state machine ──────────────────────────────────

async function handleIncomingMessage(msg) {
  if (msg.fromMe) return;
  if (msg.isStatus) return;

  const rawFrom = msg.from;

  // WhatsApp multi-device can use LID format (e.g. 12345@lid) instead of
  // the real phone number. Resolve the actual number via the Contact object.
  let phone;
  if (rawFrom.endsWith('@lid')) {
    try {
      const contact = await msg.getContact();
      console.log(`[WhatsApp] LID contact dump: ${JSON.stringify({ number: contact.number, id: contact.id, pushname: contact.pushname })}`);
      // contact.number may return the LID itself; id.user holds the real E.164 number
      phone = contact.id?.user || contact.number || '';
      if (!phone) {
        console.warn(`[WhatsApp] Could not extract phone from LID ${rawFrom}, skipping.`);
        return;
      }
    } catch (err) {
      console.warn(`[WhatsApp] Could not resolve LID ${rawFrom} to a phone number:`, err.message);
      return;
    }
  } else {
    phone = normalizePhone(rawFrom);
  }

  console.log(`[WhatsApp] Incoming — from: ${rawFrom} → normalized: ${phone} | body: "${msg.body}"`);

  const candidate = await getCandidateByPhone(phone);
  if (!candidate) {
    console.log(`[WhatsApp] No candidate found for phone: ${phone} (no action taken)`);
    return;
  }

  const text = msg.body.trim().toLowerCase();
  if (!text) return;

  console.log(`[WhatsApp] Handling message for candidate ${candidate.id} (stage: ${candidate.conversationStage}): "${text}"`);

  // ── Stage: awaiting_acceptance ─────────────────────────────────────────────
  if (candidate.conversationStage === 'awaiting_acceptance') {
    const accepted = text.includes('acepto') && !text.includes('no acepto') && !text.startsWith('no');
    const rejected = text.includes('no acepto') || text === 'no';

    if (accepted) {
      await updateCandidate(candidate.id, {
        status: 'conversando',
        conversationStage: 'awaiting_experience',
      });

      const vacancy = await getVacancyById(candidate.vacancyId);
      const description = vacancy?.description ?? 'Información no disponible.';

      await sendTextMessage(
        phone,
        `¡Excelente! Nos alegra que quieras continuar. 🎉\n\n*Descripción de la vacante:*\n${description}\n\n¿Cuántos años de experiencia tienes en este rol? (responde con un número)`
      );
      return;
    }

    if (rejected) {
      await updateCandidate(candidate.id, {
        status: 'descalificado',
        conversationStage: 'done',
      });
      await sendTextMessage(
        phone,
        'Entendido, gracias por tu tiempo. ¡Mucho éxito en tus próximos proyectos! 👋'
      );
      return;
    }

    await sendTextMessage(
      phone,
      'No entendí tu respuesta. Por favor responde *Acepto* o *No acepto*.'
    );
    return;
  }

  // ── Stage: awaiting_experience ─────────────────────────────────────────────
  if (candidate.conversationStage === 'awaiting_experience') {
    const match = text.match(/\d+/);

    if (!match) {
      await sendTextMessage(phone, 'Por favor indícanos un número. ¿Cuántos años de experiencia tienes?');
      return;
    }

    const years = parseInt(match[0], 10);

    if (years >= 5) {
      await updateCandidate(candidate.id, { status: 'aprobado', conversationStage: 'done' });
      await sendTextMessage(
        phone,
        `¡Felicidades! Con ${years} años de experiencia, has pasado a la siguiente etapa del proceso. Pronto te contactaremos. 🚀`
      );
    } else {
      await updateCandidate(candidate.id, { status: 'descalificado', conversationStage: 'done' });
      await sendTextMessage(
        phone,
        `Gracias por compartir tu experiencia. Lamentablemente buscamos candidatos con al menos 5 años de experiencia en este rol. ¡Te deseamos mucho éxito!`
      );
    }
  }
}

// ── Connection ────────────────────────────────────────────────────────────────

export function connectToWhatsApp() {
  client = new Client({
    authStrategy: new LocalAuth({ dataPath: SESSION_DIR }),
    puppeteer: {
      headless: true,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    },
  });

  client.on('qr', (qr) => {
    console.log('\n[WhatsApp] Scan this QR code with your WhatsApp app:\n');
    qrcode.generate(qr, { small: true });
    console.log('\n(The QR refreshes every 30s until scanned)\n');
  });

  client.on('loading_screen', (percent, message) => {
    console.log(`[WhatsApp] Loading… ${percent}% — ${message}`);
  });

  client.on('authenticated', () => {
    console.log('[WhatsApp] Authenticated ✓');
  });

  client.on('auth_failure', (msg) => {
    console.error('[WhatsApp] Authentication failed:', msg);
    console.error('[WhatsApp] Delete .wwebjs_auth/ and restart to re-scan QR.');
  });

  client.on('ready', () => {
    console.log('[WhatsApp] Connected and ready ✓');
  });

  client.on('disconnected', (reason) => {
    console.warn(`[WhatsApp] Disconnected: ${reason}. Reconnecting in 5s…`);
    client.destroy().catch(() => {});
    setTimeout(connectToWhatsApp, 5000);
  });

  // 'message' only fires for messages received AFTER the client connected.
  // 'message_create' fires for both sent and received — we filter fromMe inside the handler.
  client.on('message_create', async (msg) => {
    try {
      await handleIncomingMessage(msg);
    } catch (err) {
      console.error('[WhatsApp] Error handling message:', err);
    }
  });

  client.initialize();
  console.log('[WhatsApp] Initializing (launching Chromium)…');
}
