import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './routes/Dashboard';
import Runs from './routes/Runs';
import RunDetail from './routes/RunDetail';
import Registries from './routes/Registries';
import Templates from './routes/Templates';
import Proofs from './routes/Proofs';
import Kits from './routes/Kits';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/runs" element={<Runs />} />
        <Route path="/runs/:runId" element={<RunDetail />} />
        <Route path="/registries" element={<Registries />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/proofs" element={<Proofs />} />
        <Route path="/kits" element={<Kits />} />
      </Route>
    </Routes>
  );
}
