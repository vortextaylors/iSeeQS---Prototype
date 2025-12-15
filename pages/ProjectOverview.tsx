import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Box, QrCode, Edit2, ChevronRight, Layers } from 'lucide-react';
import { ComponentType, QSComponent } from '../types';

const componentTypes = Object.values(ComponentType);

const mockComponents: QSComponent[] = [
  { id: 'c1', type: ComponentType.PAD_FOOTING, label: 'F-1', status: 'AR Ready', lastEdited: '2 mins ago' },
  { id: 'c2', type: ComponentType.COLUMN, label: 'C-2', status: 'Draft', lastEdited: '1 day ago' },
  { id: 'c3', type: ComponentType.GROUND_BEAM, label: 'GB-1', status: 'AR Ready', lastEdited: '3 days ago' },
];

const ProjectOverview: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Breadcrumb & Header */}
      <div>
        <Link to="/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-[#0056b3] mb-4 transition-colors">
          <ArrowLeft size={16} className="mr-1" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bungalow Assignment</h1>
            <p className="text-gray-500 mt-1">Project ID: {projectId}</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border shadow-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>All changes saved</span>
          </div>
        </div>
      </div>

      {/* Section 1: Create New Component */}
      <section>
        <div className="flex items-center space-x-2 mb-6">
          <Layers className="text-[#0056b3]" />
          <h2 className="text-xl font-bold text-gray-800">Create New Component</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {componentTypes.map((type) => (
            <button
              key={type}
              onClick={() => navigate(`/editor/${projectId}/${encodeURIComponent(type)}`)}
              className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md hover:-translate-y-1 transition-all group h-32"
            >
              <div className="w-10 h-10 bg-blue-50 text-[#0056b3] rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#0056b3] group-hover:text-white transition-colors">
                <Box size={20} />
              </div>
              <span className="text-xs font-semibold text-center text-gray-700 group-hover:text-[#0056b3] leading-tight">
                {type}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Section 2: Existing Components */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Existing Components</h2>
          <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded-full text-gray-600">{mockComponents.length} items</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Component Type</th>
                <th className="px-6 py-4">Label / ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Edited</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockComponents.map((comp) => (
                <tr key={comp.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{comp.type}</td>
                  <td className="px-6 py-4 text-gray-600">{comp.label}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      comp.status === 'AR Ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {comp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{comp.lastEdited}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => navigate(`/editor/${projectId}/${encodeURIComponent(comp.type)}`)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Edit2 size={12} className="mr-1.5" />
                      Edit
                    </button>
                    {comp.status === 'AR Ready' && (
                      <button 
                        onClick={() => navigate(`/qr-result/${projectId}/${comp.id}`)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-[#0056b3] hover:bg-blue-700"
                      >
                        <QrCode size={12} className="mr-1.5" />
                        View QR
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ProjectOverview;