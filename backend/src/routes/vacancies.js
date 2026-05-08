import { Router } from 'express';
import { getAllVacancies, createVacancy } from '../services/vacancyService.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const vacancies = await getAllVacancies();
    res.json(vacancies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve vacancies' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, area, location, description } = req.body;
    if (!name || !area || !location || !description) {
      return res.status(400).json({ error: 'name, area, location and description are required' });
    }
    const vacancy = await createVacancy({ name, area, location, description });
    res.status(201).json(vacancy);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create vacancy' });
  }
});

export default router;
