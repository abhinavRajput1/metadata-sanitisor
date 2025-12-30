import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ToolPage from './pages/ToolPage';
import AuditPage from './pages/AuditPage';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/tool" element={<ToolPage />} />
          <Route path="/audit" element={<AuditPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
