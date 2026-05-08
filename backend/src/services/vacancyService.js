import { promises as fs } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = resolve(__dirname, '../data/vacancies.json');

async function readVacancies() {
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

async function writeVacancies(vacancies) {
  await fs.writeFile(DATA_FILE, JSON.stringify(vacancies, null, 2), 'utf-8');
}

export async function getAllVacancies() {
  return readVacancies();
}

export async function getVacancyById(id) {
  const vacancies = await readVacancies();
  return vacancies.find((v) => v.id === id) || null;
}

export async function createVacancy({ name, area, location, description }) {
  const vacancies = await readVacancies();
  const vacancy = {
    id: `v-${uuidv4().slice(0, 8)}`,
    name,
    area,
    location,
    description,
    createdAt: new Date().toISOString(),
  };
  vacancies.push(vacancy);
  await writeVacancies(vacancies);
  return vacancy;
}
