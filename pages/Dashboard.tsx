import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Calendar, Box } from 'lucide-react';
import { Project } from '../types';

const mockProjects: Project[] = [
  {
    id: 'p1',
    title: 'Bungalow Assignment',
    description: 'Year 2 Semester 1 - Structural Analysis',
    date: 'Oct 24, 2024',
    componentCount: 12
  },
  {
    id: 'p2',
    title: 'Office Complex Tower',
    description: 'Final Year Project - Concrete Works',
    date: 'Sep 15, 2024',
    componentCount: 45
  },
  {
    id: 'p3',
    title: 'Community Center',
    description: 'Group Assignment A',
    date: 'Aug 02, 2024',
    componentCount: 8
  }
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-500 mt-1">Manage and visualize your QS assignments</p>
        </div>
        <button 
          onClick={() => navigate('/new_project_setup')}
          className="flex items-center justify-center space-x-2 bg-[#0056b3] hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-sm font-medium transition-colors"
        >
          <Plus size={20} />
          <span>Create New Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProjects.map((project) => (
          <div 
            key={project.id} 
            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-col"
          >
            <div className="p-6 flex-grow">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-50 p-3 rounded-lg text-[#0056b3]">
                  <FolderOpen size={24} />
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  Active
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{project.description}</p>
              
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>{project.date}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Box size={14} />
                  <span>{project.componentCount} components</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-50 bg-gray-50/50 rounded-b-xl">
              <button 
                onClick={() => navigate(`/project/${project.id}`)}
                className="w-full py-2 bg-white border border-gray-200 text-[#007bff] hover:bg-blue-50 hover:border-blue-200 rounded-lg font-medium transition-colors text-sm"
              >
                Open Project
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;