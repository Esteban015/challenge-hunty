import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VacanciesPage from './pages/VacanciesPage';
import CandidatesPage from './pages/CandidatesPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VacanciesPage />} />
        <Route path="/vacancies/:id/candidates" element={<CandidatesPage />} />
      </Routes>
    </BrowserRouter>
  );
}
