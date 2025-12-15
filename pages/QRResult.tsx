import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Share2, Download, CheckCircle, Smartphone, ExternalLink } from 'lucide-react';

const QRResult: React.FC = () => {
  const { projectId, componentId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto">
      <Link to={`/project/${projectId}`} className="inline-flex items-center text-sm text-gray-500 hover:text-[#0056b3] mb-8 transition-colors">
        <ArrowLeft size={16} className="mr-1" />
        Back to Bungalow Project
      </Link>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-[#28A745] py-4 px-6 text-white flex items-center justify-center space-x-2">
          <CheckCircle size={24} />
          <span className="font-bold text-lg tracking-wide">SUCCESS! YOUR AR MODEL IS READY.</span>
        </div>

        <div className="p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center">
          
          {/* Left: QR Card */}
          <div className="flex-shrink-0 flex flex-col items-center">
             <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-100 mb-6">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://iseeqs.demo/ar/view/123" 
                  alt="Generated QR Code" 
                  className="w-64 h-64"
                />
             </div>
             <p className="text-gray-500 font-medium mb-4">Component: Pad Footing (F-1)</p>
             <div className="flex space-x-3">
               <button className="flex items-center px-4 py-2 bg-[#0056b3] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                 <Share2 size={16} className="mr-2" /> Share
               </button>
               <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                 <Download size={16} className="mr-2" /> Download
               </button>
             </div>
          </div>

          {/* Right: Instructions */}
          <div className="flex-grow space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How to view in AR</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-50 text-[#0056b3] rounded-full flex items-center justify-center font-bold text-lg mr-4">1</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Scan with your phone</h4>
                    <p className="text-sm text-gray-500 mt-1">Open your camera app or a QR scanner and point it at the code.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-50 text-[#0056b3] rounded-full flex items-center justify-center font-bold text-lg mr-4">2</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Point at the drawing</h4>
                    <p className="text-sm text-gray-500 mt-1">Ensure the original 2D plan is flat on a table. The AR model will snap to the marker.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-50 text-[#0056b3] rounded-full flex items-center justify-center font-bold text-lg mr-4">3</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Interact</h4>
                    <p className="text-sm text-gray-500 mt-1">Walk around to view the footing depth and stump height in real physical space.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center space-x-4">
              <img 
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2831&auto=format&fit=crop" 
                className="w-16 h-16 object-cover rounded-md"
                alt="Reference Plan"
              />
              <div className="flex-grow">
                <p className="text-xs text-gray-500 font-semibold uppercase">Linked Marker</p>
                <p className="text-sm font-medium text-gray-900 truncate">foundation_plan_v2.jpg</p>
              </div>
              <ExternalLink size={18} className="text-gray-400" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default QRResult;