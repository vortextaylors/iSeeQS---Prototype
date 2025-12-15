import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, User } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Direct navigation, bypassing any form submission logic
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Hero */}
      <div className="hidden lg:flex w-1/2 bg-[#0056b3] relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-blue-900/30 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2831&auto=format&fit=crop" 
          alt="Architectural Blueprint" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
        />
        <div className="relative z-20 text-white p-12 max-w-xl">
          <h1 className="text-5xl font-bold mb-6">Visualize QS in a new dimension.</h1>
          <p className="text-xl text-blue-100 leading-relaxed">
            Bridge the gap between 2D drawings and reality. 
            Align, model, and visualize building components directly from your coursework.
          </p>
        </div>
      </div>

      {/* Right Side - Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500">Sign in to access your projects (Draft Mode Enabled)</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Student ID</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="e.g. QS-2024-001" 
                  defaultValue="QS-STUDENT-DEMO"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  defaultValue="password123"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                <span className="text-gray-600">Remember me</span>
              </label>
              <button type="button" className="text-[#007bff] hover:underline font-medium bg-transparent border-0 p-0 cursor-pointer">Forgot password?</button>
            </div>

            <button 
              type="button" 
              onClick={handleLogin}
              className="w-full py-3 bg-[#0056b3] hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <span>Sign In</span>
              <ArrowRight size={20} />
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            Don't have an account? <button type="button" className="text-[#007bff] font-semibold hover:underline bg-transparent border-0 p-0 cursor-pointer">Create account</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;