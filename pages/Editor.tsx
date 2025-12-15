import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, RefreshCw, Move, Save, Smartphone, Layers, X, FileText, Loader2, Maximize, GitCommit } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

const Editor: React.FC = () => {
  const { projectId, componentType } = useParams();
  const navigate = useNavigate();
  const typeName = decodeURIComponent(componentType || 'Component');

  // --- Component Type Logic ---
  const isPadFooting = typeName === 'Pad Footing';
  const isColumnStump = typeName === 'Column Stump';
  const isColumn = typeName === 'Column';
  const isGroundBeam = typeName === 'Ground Beam';
  const isFloorBeam = typeName === 'Floor Beam';
  const isFloorSlab = typeName === 'Floor Slab' || typeName === 'Floor Slab - BRC';
  const isStripFoundation = typeName === 'Strip Foundation';

  const isBeam = isGroundBeam || isFloorBeam;

  // --- Label Definitions ---
  let dim1Label = 'Length (L)';
  let dim2Label = 'Width (W)';
  let dim3Label = 'Depth (D)';

  if (isPadFooting) {
    dim1Label = 'Footing Breadth (B)';
    dim2Label = 'Footing Width (W)';
    dim3Label = 'Footing Depth (D)';
  } else if (isColumnStump) {
    dim1Label = 'Breadth (B)';
    dim2Label = 'Width (W)';
    dim3Label = 'Height (H)';
  } else if (isColumn) {
    dim1Label = 'Face A (B)';
    dim2Label = 'Face B (W)';
    dim3Label = 'Clear Height (H)';
  } else if (isFloorSlab) {
    dim1Label = 'Length (L)';
    dim2Label = 'Width (W)';
    dim3Label = 'Thickness (T)';
  } else if (isStripFoundation) {
    dim1Label = 'Total Length (L)';
    dim2Label = 'Width (W)';
    dim3Label = 'Depth (D)';
  }

  // --- State Management ---
  const [label, setLabel] = useState(`New ${typeName}`);
  
  // Main Dimensions
  const [dim1, setDim1] = useState(isColumn || isColumnStump ? 300 : 3000); 
  const [dim2, setDim2] = useState(isColumn || isColumnStump ? 300 : 300);  
  const [dim3, setDim3] = useState(isColumn ? 3000 : 400);                  

  // Pad Footing: Column Stump Details
  const [includeStub, setIncludeStub] = useState(false);
  const [stubBreadth, setStubBreadth] = useState(300);
  const [stubWidth, setStubWidth] = useState(300);
  const [stubHeight, setStubHeight] = useState(600);

  // Beam: Slab Edge Details
  const [includeSlabEdge, setIncludeSlabEdge] = useState(false);
  const [slabThickness, setSlabThickness] = useState(150);
  const [slabProjection, setSlabProjection] = useState(300);

  // Floor Slab: BRC Mesh
  const [brcMeshType, setBrcMeshType] = useState('A142');

  // Visualization State (Camera/View)
  const [opacity, setOpacity] = useState(90);
  const [rotation, setRotation] = useState(45);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });

  // Model & Plan Alignment State
  const [modelPos, setModelPos] = useState({ x: 0, y: 0, z: 0 });
  const [modelRot, setModelRot] = useState({ x: 0, y: 0, z: 0 });
  const [modelScale, setModelScale] = useState(1);
  const [planScale, setPlanScale] = useState(1);

  // Image Upload State
  const [markerImage, setMarkerImage] = useState<string | null>(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset defaults on type change
  useEffect(() => {
    if (isColumn) {
      setDim1(300); setDim2(300); setDim3(3000);
    } else if (isColumnStump) {
      setDim1(300); setDim2(300); setDim3(900);
    } else if (isFloorSlab) {
      setDim1(4000); setDim2(4000); setDim3(150);
    } else if (isPadFooting) {
      setDim1(1500); setDim2(1500); setDim3(400);
    } else if (isBeam) {
      setDim1(4000); setDim2(300); setDim3(600);
    } else if (isStripFoundation) {
      setDim1(5000); setDim2(600); setDim3(300);
    }
    
    // Reset transforms
    setModelPos({ x: 0, y: 0, z: 0 });
    setModelRot({ x: 0, y: 0, z: 0 });
    setModelScale(1);
    setPlanScale(1);
  }, [typeName]);

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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      try {
        setIsProcessingPdf(true);
        const fileUrl = URL.createObjectURL(file);
        
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            
            setMarkerImage(canvas.toDataURL('image/png'));
        }
        URL.revokeObjectURL(fileUrl);
      } catch (error) {
        console.error('Error processing PDF:', error);
        alert('Failed to load PDF. Please try a different file.');
      } finally {
        setIsProcessingPdf(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMarkerImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMarkerImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetTransforms = () => {
    setModelPos({ x: 0, y: 0, z: 0 });
    setModelRot({ x: 0, y: 0, z: 0 });
    setModelScale(1);
    setPlanScale(1);
  };

  // --- 3D Model Logic ---
  const ratio = 0.15 * scale; // Only affects view scale calculation for box setup? 
  // Wait, `scale` here is the View Scale state. 
  // We should apply the View Scale in the container transform, not bake it into dimensions, 
  // otherwise relative movements become confusing.
  // However, the original code baked `scale` into `ratio`.
  // To support independent model scaling, I should separate `ratio` (pixels per unit) from `scale` (zoom).
  // I will keep `ratio` constant for pixel conversion and use CSS scale for zoom.
  
  const BASE_RATIO = 0.15;
  // Previously ratio was 0.15 * scale. Now let's just use 0.15 and let the CSS scale handle the zoom.
  // BUT the previous implementation relied on `scale` state for the CSS `scale3d` AND the `ratio`. 
  // If I change ratio, I change the box size relative to the scene.
  // If I change CSS scale, I change the scene size.
  // The previous code: `boxL = dim1 * ratio`. And transform: `scale3d(${scale}...)`.
  // This effectively squared the scale effect? 
  // Let's check: 
  // `transform: ... scale3d(${scale}, ${scale}, ${scale})`
  // `const ratio = 0.15 * scale`
  // Yes, it was applying scale twice. Once in geometry size, once in view.
  // This might have been intentional for "Fine Tune Scale" to really shrink it?
  // Let's stick to the previous behavior for `ratio` to avoid breaking the "feel", 
  // but for the new `modelScale` I will apply it purely as a transform on the model.

  // To fix the double scaling issue if it existed, or just respect current behavior:
  // I will leave `ratio` as is for now, assuming "Fine Tune Scale" is a global zoom.
  
  // Determine Box Dimensions
  let boxL = 0, boxW = 0, boxH = 0;

  if (isColumn) {
    boxL = dim1 * ratio;
    boxW = dim2 * ratio; 
    boxH = dim3 * ratio; 
  } else if (isColumnStump) {
    boxL = dim1 * ratio;
    boxW = dim2 * ratio;
    boxH = dim3 * ratio;
  } else if (isPadFooting || isFloorSlab || isStripFoundation) {
    boxL = dim1 * ratio;
    boxW = dim2 * ratio;
    boxH = dim3 * ratio;
  } else if (isBeam) {
    boxL = dim1 * ratio; 
    boxW = dim2 * ratio; 
    boxH = dim3 * ratio; 
  }

  const stB = stubBreadth * ratio;
  const stW = stubWidth * ratio;
  const stH = stubHeight * ratio;
  const slThick = slabThickness * ratio;
  const slProj = slabProjection * ratio;

  // --- Render Functions ---

  const renderCube = (
    w: number, 
    d: number, 
    h: number, 
    colorPrefix: string, 
    labelText?: string,
    displayDims?: { x: number, y: number, z: number }
  ) => {
    const bgMain = `bg-${colorPrefix}-500`;
    const borderMain = `border-${colorPrefix}-500`;
    const bgSide = `bg-${colorPrefix}-600`;
    const borderSide = `border-${colorPrefix}-700`;
    const bgBottom = `bg-${colorPrefix}-700`;

    return (
      <div className="preserve-3d relative" style={{ width: w, height: d }}>
        {/* Top Face (Y+) */}
        <div 
          className={`absolute inset-0 border ${borderMain} ${bgMain} backface-hidden flex items-center justify-center shadow-sm`}
          style={{ 
            opacity: opacity / 100,
            transform: `translateZ(${h / 2}px)`
          }}
        >
          {labelText && <div className="text-white font-mono text-[10px] font-bold tracking-widest opacity-90 transform -rotate-90 md:rotate-0 whitespace-nowrap px-1">{labelText}</div>}
        </div>

        {/* Bottom Face (Y-) */}
        <div 
          className={`absolute inset-0 ${bgBottom} backface-hidden`}
          style={{ 
            opacity: (opacity / 100) * 0.8,
            transform: `rotateY(180deg) translateZ(${h / 2}px)`
          }}
        ></div>

        {/* Front Side (Z+) */}
        <div 
          className={`absolute ${bgSide} border ${borderSide} backface-hidden`}
          style={{
            width: w,
            height: h,
            top: (d - h) / 2, 
            left: 0,
            opacity: (opacity / 100) * 0.9,
            transform: `rotateX(-90deg) translateZ(${d / 2}px)`
          }}
        ></div>

        {/* Back Side (Z-) */}
        <div 
          className={`absolute ${bgSide} border ${borderSide} backface-hidden`}
          style={{
            width: w,
            height: h,
            top: (d - h) / 2,
            left: 0,
            opacity: (opacity / 100) * 0.9,
            transform: `rotateX(90deg) translateZ(${d / 2}px)`
          }}
        ></div>

        {/* Right Side (X+) */}
        <div 
          className={`absolute ${bgSide} border ${borderSide} backface-hidden`}
          style={{
            width: h, 
            height: d,
            left: (w - h) / 2,
            top: 0,
            opacity: (opacity / 100) * 0.9,
            transform: `rotateY(90deg) translateZ(${w / 2}px)`
          }}
        ></div>

        {/* Left Side (X-) */}
        <div 
          className={`absolute ${bgSide} border ${borderSide} backface-hidden`}
          style={{
            width: h,
            height: d,
            left: (w - h) / 2,
            top: 0,
            opacity: (opacity / 100) * 0.9,
            transform: `rotateY(-90deg) translateZ(${w / 2}px)`
          }}
        ></div>

        {/* --- Dimensions Overlay --- */}
        {displayDims && (
          <>
             {/* X Dimension */}
             <div 
               className="absolute backface-hidden"
               style={{
                 width: w,
                 height: 20,
                 top: d + 5,
                 left: 0,
                 transform: `translateZ(${h/2}px)`, 
               }}
             >
                <div className="w-full h-full flex flex-col items-center pt-1 relative">
                   <div className="absolute top-1 left-0 w-full h-px bg-gray-400"></div>
                   <div className="absolute top-0 left-0 w-px h-2 bg-gray-400"></div>
                   <div className="absolute top-0 right-0 w-px h-2 bg-gray-400"></div>
                   <span className="bg-white/90 px-1 text-[9px] text-gray-800 font-mono font-bold rounded shadow-sm relative z-10 -mt-1.5">
                     {displayDims.x}
                   </span>
                </div>
             </div>

             {/* Y Dimension */}
             <div 
               className="absolute backface-hidden"
               style={{
                 width: 20,
                 height: d,
                 top: 0,
                 left: w + 5, 
                 transform: `translateZ(${h/2}px)`,
               }}
             >
                <div className="w-full h-full flex flex-row items-center pl-1 relative">
                   <div className="absolute left-1 top-0 h-full w-px bg-gray-400"></div>
                   <div className="absolute left-0 top-0 h-px w-2 bg-gray-400"></div>
                   <div className="absolute left-0 bottom-0 h-px w-2 bg-gray-400"></div>
                   <span className="bg-white/90 px-1 text-[9px] text-gray-800 font-mono font-bold rounded shadow-sm relative z-10 rotate-90 whitespace-nowrap -ml-1.5">
                     {displayDims.y}
                   </span>
                </div>
             </div>

             {/* Z Dimension */}
             <div
               className="absolute backface-hidden"
               style={{
                 width: 30,
                 height: h,
                 left: -35,
                 top: (d - h) / 2,
                 transform: `rotateX(-90deg) translateZ(${d/2}px)`
               }}
             >
                <div className="w-full h-full flex flex-row items-center justify-end pr-1 relative">
                   <div className="absolute right-1 top-0 h-full w-px bg-gray-400"></div>
                   <div className="absolute right-0 top-0 h-px w-2 bg-gray-400"></div>
                   <div className="absolute right-0 bottom-0 h-px w-2 bg-gray-400"></div>
                   <span className="bg-white/90 px-1 text-[9px] text-gray-800 font-mono font-bold rounded shadow-sm relative z-10 -rotate-90 -mr-1.5">
                     {displayDims.z}
                   </span>
                </div>
             </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header Breadcrumb */}
      <div className="mb-4 flex-shrink-0">
        <Link to={`/project/${projectId}`} className="inline-flex items-center text-sm text-gray-500 hover:text-[#0056b3] transition-colors">
          <ArrowLeft size={16} className="mr-1" />
          Back to Project
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
        
        {/* LEFT PANEL - Controls */}
        <div className="w-full lg:w-96 flex-shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden z-10">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center space-x-2">
            <Layers className="text-blue-600" size={18} />
            <h2 className="font-bold text-gray-800">{typeName} Inputs</h2>
          </div>
          
          <div className="flex-grow overflow-y-auto p-6 space-y-8">
            
            {/* 1. Component Details */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">1. Identity</label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label / ID</label>
                <input 
                  type="text" 
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder={`e.g. ${typeName === 'Column' ? 'C1' : 'F1'}`}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              {isFloorSlab && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">BRC Mesh Type</label>
                  <input 
                    type="text" 
                    value={brcMeshType}
                    onChange={(e) => setBrcMeshType(e.target.value)}
                    placeholder="e.g. A9, A142"
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>

            {/* 2. Dimensions */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">2. Dimensions (mm)</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1 truncate" title={dim1Label}>{dim1Label}</label>
                  <input 
                    type="number" 
                    value={dim1}
                    onChange={(e) => setDim1(Number(e.target.value))}
                    className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1 truncate" title={dim2Label}>{dim2Label}</label>
                  <input 
                    type="number" 
                    value={dim2}
                    onChange={(e) => setDim2(Number(e.target.value))}
                    className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1 truncate" title={dim3Label}>{dim3Label}</label>
                  <input 
                    type="number" 
                    value={dim3}
                    onChange={(e) => setDim3(Number(e.target.value))}
                    className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Pad Footing: Integrated Stump */}
              {isPadFooting && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <label className="flex items-center space-x-2 cursor-pointer select-none mb-3">
                    <input 
                      type="checkbox" 
                      checked={includeStub}
                      onChange={(e) => setIncludeStub(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="text-sm font-bold text-gray-700">Include Column Stump?</span>
                  </label>

                  {includeStub && (
                    <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div>
                        <label className="block text-[10px] text-blue-800 mb-1 uppercase font-bold">Stump Breadth</label>
                        <input type="number" value={stubBreadth} onChange={(e) => setStubBreadth(Number(e.target.value))} className="w-full bg-white border border-blue-200 rounded px-2 py-1 text-xs" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-blue-800 mb-1 uppercase font-bold">Stump Width</label>
                        <input type="number" value={stubWidth} onChange={(e) => setStubWidth(Number(e.target.value))} className="w-full bg-white border border-blue-200 rounded px-2 py-1 text-xs" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] text-blue-800 mb-1 uppercase font-bold">Stump Height</label>
                        <input type="number" value={stubHeight} onChange={(e) => setStubHeight(Number(e.target.value))} className="w-full bg-white border border-blue-200 rounded px-2 py-1 text-xs" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Beams: Integrated Slab Edge */}
              {isBeam && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <label className="flex items-center space-x-2 cursor-pointer select-none mb-3">
                    <input 
                      type="checkbox" 
                      checked={includeSlabEdge}
                      onChange={(e) => setIncludeSlabEdge(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="text-sm font-bold text-gray-700">Include Slab Edge?</span>
                  </label>

                  {includeSlabEdge && (
                    <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div>
                        <label className="block text-[10px] text-blue-800 mb-1 uppercase font-bold">Thickness (T_slab)</label>
                        <input type="number" value={slabThickness} onChange={(e) => setSlabThickness(Number(e.target.value))} className="w-full bg-white border border-blue-200 rounded px-2 py-1 text-xs" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-blue-800 mb-1 uppercase font-bold">Projection (P_slab)</label>
                        <input type="number" value={slabProjection} onChange={(e) => setSlabProjection(Number(e.target.value))} className="w-full bg-white border border-blue-200 rounded px-2 py-1 text-xs" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Marker Image */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">3. Marker Image (Plan)</label>
              <div 
                onClick={() => !isProcessingPdf && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer group relative ${markerImage ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
              >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*,application/pdf"
                />
                
                {isProcessingPdf ? (
                  <div className="flex flex-col items-center justify-center py-2 text-blue-600">
                    <Loader2 size={24} className="animate-spin mb-2" />
                    <p className="text-xs font-medium">Processing PDF...</p>
                  </div>
                ) : markerImage ? (
                    <div className="relative z-10">
                        <img src={markerImage} alt="Uploaded Plan" className="w-full h-32 object-contain rounded-md mb-2 opacity-80" />
                        <p className="text-xs text-blue-700 font-medium truncate">Image/PDF Loaded</p>
                        <button 
                            onClick={removeImage}
                            className="absolute -top-4 -right-4 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                            title="Remove Image"
                        >
                            <X size={14} /> 
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                          <Upload className="text-gray-400 group-hover:text-blue-500" size={20} />
                        </div>
                        <p className="text-xs text-gray-500">Drop Image or PDF</p>
                    </>
                )}
              </div>
            </div>

            {/* 4. Alignment Controls */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">4. Alignment</label>
                  <button onClick={resetTransforms} className="text-[10px] text-blue-600 hover:underline">Reset</button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 space-y-4 border border-gray-100">
                {/* Plan Scale */}
                {markerImage && (
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Plan Scale</label>
                        <input 
                            type="range" min="0.1" max="5" step="0.1" 
                            value={planScale} 
                            onChange={(e) => setPlanScale(Number(e.target.value))}
                            className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                )}
                
                {/* Model Position */}
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Model Position (X, Y, Z)</label>
                    <div className="grid grid-cols-3 gap-2">
                        <input type="number" value={modelPos.x} onChange={(e) => setModelPos({...modelPos, x: Number(e.target.value)})} className="bg-white border border-gray-200 rounded px-2 py-1 text-xs" placeholder="X" />
                        <input type="number" value={modelPos.y} onChange={(e) => setModelPos({...modelPos, y: Number(e.target.value)})} className="bg-white border border-gray-200 rounded px-2 py-1 text-xs" placeholder="Y" />
                        <input type="number" value={modelPos.z} onChange={(e) => setModelPos({...modelPos, z: Number(e.target.value)})} className="bg-white border border-gray-200 rounded px-2 py-1 text-xs" placeholder="Z" />
                    </div>
                </div>

                {/* Model Rotation */}
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Model Rotation</label>
                    <div className="grid grid-cols-3 gap-2 text-center text-[9px] text-gray-400">
                         <div>
                            <span className="block mb-1">X: {modelRot.x}°</span>
                            <input type="range" min="0" max="360" value={modelRot.x} onChange={(e) => setModelRot({...modelRot, x: Number(e.target.value)})} className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                         </div>
                         <div>
                            <span className="block mb-1">Y: {modelRot.y}°</span>
                            <input type="range" min="0" max="360" value={modelRot.y} onChange={(e) => setModelRot({...modelRot, y: Number(e.target.value)})} className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                         </div>
                         <div>
                            <span className="block mb-1">Z: {modelRot.z}°</span>
                            <input type="range" min="0" max="360" value={modelRot.z} onChange={(e) => setModelRot({...modelRot, z: Number(e.target.value)})} className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                         </div>
                    </div>
                </div>

                {/* Model Scale */}
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Model Scale ({modelScale.toFixed(2)}x)</label>
                    <input 
                        type="range" min="0.1" max="3" step="0.1" 
                        value={modelScale} 
                        onChange={(e) => setModelScale(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL - Canvas */}
        <div className="flex-grow flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden relative">
          
          {/* Toolbar */}
          <div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-start pointer-events-none">
            <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 pointer-events-auto">
              <p className="text-xs font-medium text-gray-600">3D Preview • {typeName}</p>
            </div>
            <div className="flex space-x-2 pointer-events-auto">
              <button onClick={() => { setRotation(0); setScale(1); setPosition({x:0, y:0}); resetTransforms(); }} className="p-2 bg-white hover:bg-gray-50 rounded-lg shadow-sm border border-gray-200 text-gray-600 transition-colors" title="Reset View">
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
            {/* Background Grid */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
               <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            </div>

            {/* 3D Mock Model Container */}
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                perspective: '1200px', // Creates 3D space
              }}
            >
              {/* Transform Wrapper (Camera View: Rotation & Scale & Position) */}
              <div 
                className="preserve-3d transition-transform duration-75 ease-out"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) rotateX(60deg) rotateZ(${rotation}deg) scale3d(${scale}, ${scale}, ${scale})`,
                  width: 0,
                  height: 0,
                  position: 'relative'
                }}
              >
                {/* 2D PLAN IMAGE PLANE (Rendered beneath the object) */}
                {markerImage && (
                    <div 
                      className="absolute backface-hidden"
                      style={{
                          // Fixed large canvas for the plan
                          width: 800,
                          height: 800,
                          // Center the plan
                          left: -400,
                          top: -400,
                          // Position at the bottom of the component (relative to center)
                          transform: `translateZ(${-boxH/2}px) scale(${planScale})`,
                          backgroundImage: `url(${markerImage})`,
                          backgroundSize: 'contain',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center',
                          opacity: 0.7,
                      }}
                    />
                )}

                {/* Main Component Wrapper (Object Transform: Pos, Rot, Scale) */}
                <div 
                  className="absolute preserve-3d" 
                  style={{ 
                    width: boxL, 
                    height: boxW, 
                    left: -boxL/2, 
                    top: -boxW/2,
                    transform: `
                      translate3d(${modelPos.x}px, ${modelPos.y}px, ${modelPos.z}px)
                      rotateX(${modelRot.x}deg)
                      rotateY(${modelRot.y}deg)
                      rotateZ(${modelRot.z}deg)
                      scale3d(${modelScale}, ${modelScale}, ${modelScale})
                    `
                  }}
                >
                    
                    {/* Main Component Body */}
                    {renderCube(boxL, boxW, boxH, 'blue', label, { x: dim1, y: dim2, z: dim3 })}

                    {/* Pad Footing: Stump */}
                    {isPadFooting && includeStub && (
                       <div 
                        className="preserve-3d absolute"
                        style={{
                          width: stB,
                          height: stW,
                          left: (boxL - stB) / 2,
                          top: (boxW - stW) / 2,
                          transform: `translateZ(${boxH / 2 + stH / 2}px)` // Sit on top of footing
                        }}
                       >
                         <div className="absolute inset-0 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2" style={{ width: 0, height: 0 }}>
                            {renderCube(stB, stW, stH, 'green', undefined, { x: stubBreadth, y: stubWidth, z: stubHeight })}
                         </div>
                       </div>
                    )}

                    {/* Beam: Slab Edge */}
                    {isBeam && includeSlabEdge && (
                      <div
                        className="preserve-3d absolute"
                        style={{
                          width: boxL,
                          height: slProj,
                          left: 0,
                          top: boxW, 
                          transform: `translateZ(${boxH/2 - slThick/2}px)`
                        }}
                      >
                         <div className="absolute top-0 left-0 w-full h-full">
                           {renderCube(boxL, slProj, slThick, 'gray', undefined, { x: dim1, y: slabProjection, z: slabThickness })}
                         </div>
                      </div>
                    )}
                </div>

              </div>
            </div>
          </div>

          {/* Alignment Controls Footer (View Controls) */}
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
                <span>View Rotation</span>
                <span>{rotation}°</span>
              </label>
              <input type="range" min="0" max="360" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0056b3]" />
            </div>
            <div>
              <label className="flex justify-between text-xs font-semibold text-gray-500 mb-2">
                <span>View Zoom</span>
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