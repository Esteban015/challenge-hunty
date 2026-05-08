import { Router } from 'express';
import { getCandidatesByVacancy, createCandidate } from '../services/candidateService.js';
import { getVacancyById } from '../services/vacancyService.js';
import { sendButtonMessage } from '../services/whatsapp.js';

const router = Router({ mergeParams: true });

router.get('/', async (req, res) => {
  try {
    const candidates = await getCandidatesByVacancy(req.params.id);
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve candidates' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, lastName, phone, email } = req.body;
    if (!name || !lastName || !phone || !email) {
      return res.status(400).json({ error: 'name, lastName, phone and email are required' });
    }

    const vacancy = await getVacancyById(req.params.id);
    if (!vacancy) {
      return res.status(404).json({ error: 'Vacancy not found' });
    }

    const candidate = await createCandidate({
      vacancyId: req.params.id,
      name,
      lastName,
      phone,
      email,
    });

    const message =
      `¡Hola ${name}! 👋 Te contactamos de parte de nuestro equipo de Talent Acquisition ` +
      `en relación a la vacante *${vacancy.name}*.\n\n` +
      `¿Te gustaría iniciar el proceso de selección?`;

    await sendButtonMessage(phone, message, ['Acepto', 'No acepto']);

    res.status(201).json(candidate);
  } catch (err) {
    console.error('[API] Error creating candidate:', err);
    res.status(500).json({ error: 'Failed to create candidate' });
  }
});

export default router;
