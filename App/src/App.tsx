import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './routes/Dashboard';
import Runs from './routes/Runs';
import RunDetail from './routes/RunDetail';
import GateFailures from './routes/GateFailures';
import Verify from './routes/Verify';
import Kits from './routes/Kits';
import ProofLedger from './routes/ProofLedger';
import Registries from './routes/Registries';
import Commands from './routes/Commands';
import Knowledge from './routes/Knowledge';
import Settings from './routes/Settings';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/runs" element={<Runs />} />
        <Route path="/runs/:runId" element={<RunDetail />} />
        <Route path="/runs/:runId/gates" element={<GateFailures />} />
        <Route path="/runs/:runId/verify" element={<Verify />} />
        <Route path="/runs/:runId/kits" element={<Kits />} />
        <Route path="/runs/:runId/proofs" element={<ProofLedger />} />
        <Route path="/registries" element={<Registries />} />
        <Route path="/commands" element={<Commands />} />
        <Route path="/knowledge" element={<Knowledge />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
