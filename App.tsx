import React from 'react';
import { MemoryRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectOverview from './pages/ProjectOverview';
import Editor from './pages/Editor';
import QRResult from './pages/QRResult';
import Layout from './components/Layout';
import { LayoutGrid } from 'lucide-react';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Placeholder component for the New Project flow
const NewProjectSetup: React.FC = () => (
  <div className="max-w-xl mx-auto mt-12 text-center">
    <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100">
      <div className="w-16 h-16 bg-blue-50 text-[#0056b3] rounded-full flex items-center justify-center mx-auto mb-6">
        <LayoutGrid size={32} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">New Project Setup</h2>
      <p className="text-gray-500 mb-8">
        This is a placeholder for the project creation flow. In the final version, this page would allow students to upload drawings and set project parameters.
      </p>
      <Link 
        to="/dashboard" 
        className="inline-flex items-center justify-center px-6 py-3 bg-[#0056b3] text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
      >
        Return to Dashboard
      </Link>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <MemoryRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/new_project_setup" element={<NewProjectSetup />} />
          <Route path="/project/:projectId" element={<ProjectOverview />} />
          <Route path="/editor/:projectId/:componentType" element={<Editor />} />
          <Route path="/qr-result/:projectId/:componentId" element={<QRResult />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

export default App;