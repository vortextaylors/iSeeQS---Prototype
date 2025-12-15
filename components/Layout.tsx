import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutGrid, User } from 'lucide-react';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Simple check to see if we are deep in the app
  const isDashboard = location.pathname === '/dashboard';

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#343A40]">
      {/* Navigation Bar */}
      <header className="bg-[#0056b3] text-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <span className="font-bold text-lg">Q</span>
            </div>
            <span className="text-xl font-bold tracking-tight">ISeeQS</span>
          </div>

          <nav className="flex items-center space-x-6">
            {!isDashboard && (
              <Link to="/dashboard" className="hidden md:flex items-center space-x-2 text-blue-100 hover:text-white transition-colors">
                <LayoutGrid size={18} />
                <span className="font-medium">Dashboard</span>
              </Link>
            )}
            <div className="flex items-center space-x-4 border-l border-blue-400 pl-6">
              <div className="hidden md:flex items-center space-x-2 text-blue-100">
                <User size={18} />
                <span className="text-sm">Student Account</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-blue-700 rounded-full transition-colors text-blue-100 hover:text-white"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-[#6C757D] text-sm">
          <p>© 2024 ISeeQS. Built for Quantity Surveying Education.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;