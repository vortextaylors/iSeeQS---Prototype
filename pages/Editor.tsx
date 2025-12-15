import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, RefreshCw, Move, Save, Smartphone } from 'lucide-react';

const Editor: React.FC = () => {
  const { projectId, componentType } = useParams();
  const navigate = useNavigate();
  const typeName = decodeURIComponent(componentType || 'Component');

  // State for Form Inputs
  const [label, setLabel] = useState(`New ${typeName}`);
  const [length, setLength] = useState(1500);
  const [width, setWidth] = useState(1500);
  const [depth, setDepth] = useState(400);
  
  // Stump/Detail State
  const [includeStub, setIncludeStub] = useState(false);
  const [stubLength, setStubLength] = useState(300);
  const [stubWidth, setStubWidth] = useState(300);
  const [stubHeight, setStubHeight] = useState(600);

  // Visualization State
  const [opacity, setOpacity] = useState(70);
  const [rotation, setRotation] = useState(45);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });

  // Handle Global Dragging Logic
  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.current.x,
          y: e.clientY - dragStart.current.y
        });
      }
    };
    const handleGlobalUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMove);
      window.addEventListener('mouseup', handleGlobalUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  // Convert mm to pixels for the CSS model (Ratio: 1mm = 0.15px approx for display)
  const ratio = 0.15 * scale;
  
  const mainStyle = {
    width: `${length * ratio}px`,
    height: `${width * ratio}px`, // In 3D top-down view, CSS height acts as QS Width (Y)
    depth: `${depth * ratio}px`,  // CSS Depth (Z) acts as QS Depth/Height
  };

  const stubStyle = {
    width: `${stubLength * ratio}px`,
    height: `${stubWidth * ratio}px`,
    depth: `${stubHeight * ratio}px`,
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header Breadcrumb */}
      <div className="mb-4 flex-shrink-0">
        <Link to={`/project/${projectId}`} className="inline-flex items-center text-sm text-gray-500 hover:text-[#0056b3] transition-colors">
          <ArrowLeft size={16} className="mr-1" />
          Back to Bungalow Project
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
        
        {/* LEFT PANEL - Controls */}
        <div className="w-full lg:w-96 flex-shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden z-10">
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">{typeName} Configuration</h2>
          </div>
          
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            
            {/* 1. Details */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">1. Component Details</label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label / ID</label>
                <input 
                  type="text" 
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* 2. Dimensions */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">2. Dimensions (mm)</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Length</label>
                  <input 
                    type="number" 
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Width</label>
                  <input 
                    type="number" 
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">Depth / Height</label>
                  <input 
                    type="number" 
                    value={depth}
                    onChange={(e) => setDepth(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <p className="text-[11px] text-[#007bff] font-medium flex items-center">
                <RefreshCw size={10} className="mr-1" />
                Updates 3D model in real-time.
              </p>
              
              <div className="pt-2">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input 
                    id="includeStub"
                    type="checkbox" 
                    checked={includeStub}
                    onChange={(e) => setIncludeStub(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                  />
                  <span className="text-sm font-medium text-gray-700">Include Column Stump?</span>
                </label>
              </div>

              {includeStub && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="col-span-2 text-xs font-semibold text-gray-500">Stump Dimensions</div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">Length</label>
                    <input type="number" value={stubLength} onChange={(e) => setStubLength(Number(e.target.value))} className="w-full border border-gray-300 rounded px-2 py-1 text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">Width</label>
                    <input type="number" value={stubWidth} onChange={(e) => setStubWidth(Number(e.target.value))} className="w-full border border-gray-300 rounded px-2 py-1 text-xs" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-gray-500 mb-1">Height</label>
                    <input type="number" value={stubHeight} onChange={(e) => setStubHeight(Number(e.target.value))} className="w-full border border-gray-300 rounded px-2 py-1 text-xs" />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Marker Image */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">3. Marker Image (Plan)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                  <Upload className="text-gray-400 group-hover:text-blue-500" size={20} />
                </div>
                <p className="text-xs text-gray-500">Drop 2D drawing or click to browse</p>
              </div>
              <div className="flex items-center space-x-2 text-xs text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="font-medium">foundation_plan_v2.jpg loaded</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Canvas */}
        <div className="flex-grow flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden relative">
          
          {/* Toolbar */}
          <div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-start pointer-events-none">
            <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 pointer-events-auto">
              <p className="text-xs font-medium text-gray-600">Drag to move model • Use sliders to align</p>
            </div>
            <div className="flex space-x-2 pointer-events-auto">
              <button onClick={() => { setRotation(0); setScale(1); setPosition({x:0, y:0}); }} className="p-2 bg-white hover:bg-gray-50 rounded-lg shadow-sm border border-gray-200 text-gray-600 transition-colors" title="Reset View">
                <RefreshCw size={18} />
              </button>
              <button onClick={() => setPosition({x:0, y:0})} className="p-2 bg-white hover:bg-gray-50 rounded-lg shadow-sm border border-gray-200 text-gray-600 transition-colors" title="Center Model">
                <Move size={18} />
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div 
            className="flex-grow bg-gray-100 overflow-hidden relative cursor-move select-none"
            onMouseDown={handleMouseDown}
          >
            {/* Background 2D Drawing */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2831&auto=format&fit=crop" 
                className="w-full h-full object-cover opacity-90 pointer-events-none"
                alt="Plan Background"
              />
            </div>

            {/* 3D Mock Model Container */}
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                perspective: '1200px', // Creates 3D space
              }}
            >
              {/* Transform Wrapper (Rotation & Scale & Position) */}
              <div 
                className="preserve-3d transition-transform duration-75 ease-out"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) rotateX(60deg) rotateZ(${rotation}deg) scale3d(${scale}, ${scale}, ${scale})`,
                }}
              >
                {/* 
                   THE CUBE IMPLEMENTATION
                   Using standard CSS to construct a box from 6 faces.
                   In this top-down perspective:
                   - Width (X) = length
                   - Height (Y) = width
                   - Thickness (Z) = depth
                */}
                
                {/* Main Component Box */}
                <div className="preserve-3d relative" style={{ width: mainStyle.width, height: mainStyle.height }}>
                   {/* Top Face (The one we mostly see) */}
                   <div 
                     className="absolute inset-0 border border-blue-500 bg-blue-500 backface-hidden flex items-center justify-center shadow-sm"
                     style={{ 
                       opacity: opacity / 100,
                       transform: `translateZ(${parseInt(mainStyle.depth)/2}px)`
                     }}
                   >
                     <div className="text-white font-mono text-xs font-bold tracking-widest opacity-80">{label}</div>
                   </div>

                   {/* Bottom Face */}
                   <div 
                     className="absolute inset-0 bg-blue-700 backface-hidden"
                     style={{ 
                       opacity: (opacity / 100) * 0.8,
                       transform: `rotateY(180deg) translateZ(${parseInt(mainStyle.depth)/2}px)`
                     }}
                   ></div>

                   {/* Sides (Simple representation for thickness) */}
                   {/* Front Side */}
                   <div 
                    className="absolute bg-blue-600 border border-blue-700"
                    style={{
                      width: mainStyle.width,
                      height: mainStyle.depth,
                      opacity: (opacity / 100) * 0.9,
                      transform: `rotateX(-90deg) translateZ(${parseInt(mainStyle.height)/2}px)`,
                      bottom: `-${parseInt(mainStyle.depth)/2}px`,
                      left: 0
                    }}
                   ></div>
                   {/* Right Side */}
                   <div 
                    className="absolute bg-blue-600 border border-blue-700"
                    style={{
                      width: mainStyle.depth,
                      height: mainStyle.height,
                      opacity: (opacity / 100) * 0.9,
                      transform: `rotateY(90deg) translateZ(${parseInt(mainStyle.width)/2}px)`,
                      right: `-${parseInt(mainStyle.depth)/2}px`,
                      top: 0
                    }}
                   ></div>
                   {/* Left Side */}
                   <div 
                    className="absolute bg-blue-600 border border-blue-700"
                    style={{
                      width: mainStyle.depth,
                      height: mainStyle.height,
                      opacity: (opacity / 100) * 0.9,
                      transform: `rotateY(-90deg) translateZ(${parseInt(mainStyle.width)/2}px)`,
                      left: `-${parseInt(mainStyle.depth)/2}px`,
                      top: 0
                    }}
                   ></div>
                   {/* Back Side */}
                   <div 
                    className="absolute bg-blue-600 border border-blue-700"
                    style={{
                      width: mainStyle.width,
                      height: mainStyle.depth,
                      opacity: (opacity / 100) * 0.9,
                      transform: `rotateX(90deg) translateZ(${parseInt(mainStyle.height)/2}px)`,
                      top: `-${parseInt(mainStyle.depth)/2}px`,
                      left: 0
                    }}
                   ></div>
                </div>

                {/* Stump (Child Object) */}
                {includeStub && (
                   <div 
                    className="preserve-3d absolute"
                    style={{
                      width: stubStyle.width,
                      height: stubStyle.height,
                      left: `calc(50% - ${parseInt(stubStyle.width)/2}px)`,
                      top: `calc(50% - ${parseInt(stubStyle.height)/2}px)`,
                      transform: `translateZ(${parseInt(mainStyle.depth)}px)` // Sit on top of footing
                    }}
                   >
                     {/* Stump Top */}
                     <div 
                       className="absolute inset-0 border border-green-500 bg-green-500 backface-hidden"
                       style={{ 
                         opacity: opacity / 100,
                         transform: `translateZ(${parseInt(stubStyle.depth)}px)`
                       }}
                     ></div>
                     
                     {/* Stump Sides */}
                     <div 
                       className="absolute bg-green-600 border border-green-700"
                       style={{
                         width: stubStyle.width,
                         height: stubStyle.depth,
                         opacity: (opacity / 100) * 0.9,
                         transform: `rotateX(-90deg) translateZ(${parseInt(stubStyle.height)/2}px)`,
                         bottom: `-${parseInt(stubStyle.depth)/2}px`,
                         left: 0
                       }}
                     ></div>
                     <div 
                       className="absolute bg-green-600 border border-green-700"
                       style={{
                         width: stubStyle.depth,
                         height: stubStyle.height,
                         opacity: (opacity / 100) * 0.9,
                         transform: `rotateY(90deg) translateZ(${parseInt(stubStyle.width)/2}px)`,
                         right: `-${parseInt(stubStyle.depth)/2}px`,
                         top: 0
                       }}
                     ></div>
                   </div>
                )}

              </div>
            </div>
          </div>

          {/* Alignment Controls Footer */}
          <div className="bg-white border-t border-gray-200 p-4 grid grid-cols-3 gap-6 z-20">
            <div>
              <label className="flex justify-between text-xs font-semibold text-gray-500 mb-2">
                <span>Opacity</span>
                <span>{opacity}%</span>
              </label>
              <input type="range" min="20" max="90" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0056b3]" />
            </div>
            <div>
              <label className="flex justify-between text-xs font-semibold text-gray-500 mb-2">
                <span>Rotation (Y)</span>
                <span>{rotation}°</span>
              </label>
              <input type="range" min="0" max="360" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0056b3]" />
            </div>
            <div>
              <label className="flex justify-between text-xs font-semibold text-gray-500 mb-2">
                <span>Fine Tune Scale</span>
                <span>{scale.toFixed(1)}x</span>
              </label>
              <input type="range" min="0.5" max="2" step="0.1" value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0056b3]" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Actions */}
      <div className="mt-4 flex justify-end space-x-3 flex-shrink-0">
        <button 
          onClick={() => navigate(`/project/${projectId}`)}
          className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 shadow-sm transition-colors"
        >
          <Save size={18} />
          <span>Save Draft</span>
        </button>
        <button 
          onClick={() => navigate(`/qr-result/${projectId}/new`)}
          className="flex items-center space-x-2 px-8 py-3 bg-[#0056b3] hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-all hover:shadow-lg"
        >
          <Smartphone size={18} />
          <span>GENERATE AR</span>
        </button>
      </div>
    </div>
  );
};

export default Editor;