import React, { useRef, useState, useEffect } from 'react';
import { X, Trash2, Check, PenTool, Type, Upload, RotateCcw } from 'lucide-react';

export default function SignatureCanvas({ onSave, onClose }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureMode, setSignatureMode] = useState('draw'); // 'draw', 'type', 'upload'
  const [typedName, setTypedName] = useState('');
  const [typedFont, setTypedFont] = useState('cursive-signature-1');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [uploadImage, setUploadImage] = useState(null);
  const [history, setHistory] = useState([]); // State history stack of ImageData
  const [typedFontSize, setTypedFontSize] = useState(48); // Custom font size for typed signatures

  // Cursive fonts loaded in index.html
  const cursiveFonts = [
    { id: 'cursive-signature-1', name: 'Mrs Saint Delafield (Classic Flow)', family: "'Mrs Saint Delafield', cursive" },
    { id: 'cursive-signature-2', name: 'Great Vibes (Elegant Quill)', family: "'Great Vibes', cursive" },
    { id: 'cursive-signature-3', name: 'Alex Brush (Modern Script)', family: "'Alex Brush', cursive" },
    { id: 'cursive-signature-4', name: 'Herr Von Muellerhoff (Calligraphy)', family: "'Herr Von Muellerhoff', cursive" },
    { id: 'cursive-signature-5', name: 'Monsieur La Doulaise (Flourished)', family: "'Monsieur La Doulaise', cursive" },
    { id: 'cursive-signature-6', name: 'Pinyon Script (Slanted Ink)', family: "'Pinyon Script', cursive" },
    { id: 'cursive-signature-7', name: 'Reenie Beanie (Casual Pen)', family: "'Reenie Beanie', cursive" },
    { id: 'cursive-signature-8', name: 'Sacramento (Monoline Cursive)', family: "'Sacramento', cursive" }
  ];

  useEffect(() => {
    if (signatureMode === 'draw') {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Clear canvas on load
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Capture initial blank state
        const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([initialState]);
      }
    }
  }, [signatureMode]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Scale client coordinate to match canvas resolution correctly
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      setIsDrawing(true);
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory(prev => [...prev, currentState]);
      }
    }
  };

  const handleUndo = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      const previousState = newHistory[newHistory.length - 1];
      
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.putImageData(previousState, 0, 0);
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const blankState = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([blankState]);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (signatureMode === 'draw') {
      const canvas = canvasRef.current;
      if (canvas) {
        // Convert white canvas background to transparent for the A4 document layout.
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0);
        
        const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          // If pixel is pure white or very close, make it transparent
          if (data[i] > 240 && data[i+1] > 240 && data[i+2] > 240) {
            data[i+3] = 0; // alpha
          }
        }
        tempCtx.putImageData(imgData, 0, 0);
        onSave(tempCanvas.toDataURL('image/png'));
      }
    } else if (signatureMode === 'type') {
      if (!typedName.trim()) return;
      // Render typed name as transparent PNG using a canvas
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const selectedFont = cursiveFonts.find(f => f.id === typedFont);
      ctx.font = `italic ${typedFontSize}px ${selectedFont ? selectedFont.family : 'cursive'}`;
      ctx.fillStyle = strokeColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);
      
      onSave(canvas.toDataURL('image/png'));
    } else if (signatureMode === 'upload') {
      if (uploadImage) {
        onSave(uploadImage);
      }
    }
    onClose();
  };

  return (
    <div className="signature-overlay">
      <div className="signature-modal glassmorphic">
        <div className="signature-header">
          <h3>Add Digital Signature</h3>
          <button className="close-btn animate-hover" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        
        <div className="signature-tabs">
          <button 
            className={`sig-tab-btn ${signatureMode === 'draw' ? 'active' : ''}`}
            onClick={() => setSignatureMode('draw')}
          >
            <PenTool size={16} /> Draw
          </button>
          <button 
            className={`sig-tab-btn ${signatureMode === 'type' ? 'active' : ''}`}
            onClick={() => setSignatureMode('type')}
          >
            <Type size={16} /> Type
          </button>
          <button 
            className={`sig-tab-btn ${signatureMode === 'upload' ? 'active' : ''}`}
            onClick={() => setSignatureMode('upload')}
          >
            <Upload size={16} /> Upload
          </button>
        </div>

        <div className="signature-body">
          {signatureMode === 'draw' && (
            <div className="draw-container">
              <div className="draw-settings">
                <div className="color-selector">
                  <span className="setting-label">Color:</span>
                  <button 
                    className={`color-dot ${strokeColor === '#000000' ? 'selected' : ''}`}
                    style={{ backgroundColor: '#000000' }}
                    onClick={() => setStrokeColor('#000000')}
                    aria-label="Black Color"
                  />
                  <button 
                    className={`color-dot ${strokeColor === '#0f2c59' ? 'selected' : ''}`}
                    style={{ backgroundColor: '#0f2c59' }}
                    onClick={() => setStrokeColor('#0f2c59')}
                    aria-label="Blue Color"
                  />
                  <button 
                    className={`color-dot ${strokeColor === '#d32f2f' ? 'selected' : ''}`}
                    style={{ backgroundColor: '#d32f2f' }}
                    onClick={() => setStrokeColor('#d32f2f')}
                    aria-label="Red Color"
                  />
                </div>
                
                <div className="brush-selector">
                  <span className="setting-label">Thickness:</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                  />
                  <span className="brush-value">{strokeWidth}px</span>
                </div>
              </div>
              
              <canvas
                ref={canvasRef}
                width={400}
                height={150}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="signature-canvas-element"
              />
              
              <div className="canvas-footer">
                <span className="hint-text">Use mouse/stylus/touch to sign inside the box</span>
                <div className="flex gap-3 items-center">
                  <button 
                    className="text-btn animate-hover flex items-center gap-1" 
                    onClick={handleUndo} 
                    disabled={history.length <= 1}
                    style={{ 
                      opacity: history.length <= 1 ? 0.4 : 1, 
                      cursor: history.length <= 1 ? 'not-allowed' : 'pointer',
                      border: 'none',
                      background: 'none'
                    }}
                    title="Undo last stroke"
                  >
                    <RotateCcw size={13} /> Undo
                  </button>
                  <button className="clear-btn text-btn flex items-center gap-1" onClick={clearCanvas}>
                    <Trash2 size={13} /> Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {signatureMode === 'type' && (
            <div className="type-container">
              <div className="form-group">
                <label htmlFor="sig-type-name">Type your name:</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    id="sig-type-name"
                    type="text" 
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="theme-input"
                    maxLength={30}
                    style={{ flex: 1 }}
                  />
                  {typedName && (
                    <button
                      className="text-btn animate-hover flex items-center gap-1"
                      onClick={() => setTypedName('')}
                      title="Clear name"
                      style={{ border: 'none', background: 'none', whiteSpace: 'nowrap' }}
                    >
                      <Trash2 size={13} /> Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="draw-settings mb-3">
                <div className="brush-selector w-full flex items-center justify-between gap-3">
                  <span className="setting-label">Font Size:</span>
                  <input 
                    type="range" 
                    min="24" 
                    max="72" 
                    value={typedFontSize}
                    onChange={(e) => setTypedFontSize(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="brush-value">{typedFontSize}px</span>
                </div>
              </div>

              <div className="font-grid font-signature-grid">
                {cursiveFonts.map((font) => (
                  <button 
                    key={font.id}
                    className={`font-card ${typedFont === font.id ? 'active' : ''}`}
                    onClick={() => setTypedFont(font.id)}
                    style={{ 
                      fontFamily: font.family,
                      fontSize: `${Math.max(14, Math.min(32, typedFontSize * 0.45))}px`,
                      lineHeight: '60px',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      padding: '0 8px'
                    }}
                  >
                    {typedName || 'Signature'}
                  </button>
                ))}
              </div>

              <div className="color-selector">
                <span className="setting-label">Ink Color:</span>
                <button 
                  className={`color-dot ${strokeColor === '#000000' ? 'selected' : ''}`}
                  style={{ backgroundColor: '#000000' }}
                  onClick={() => setStrokeColor('#000000')}
                  aria-label="Black Ink"
                />
                <button 
                  className={`color-dot ${strokeColor === '#0f2c59' ? 'selected' : ''}`}
                  style={{ backgroundColor: '#0f2c59' }}
                  onClick={() => setStrokeColor('#0f2c59')}
                  aria-label="Blue Ink"
                />
                <button 
                  className={`color-dot ${strokeColor === '#d32f2f' ? 'selected' : ''}`}
                  style={{ backgroundColor: '#d32f2f' }}
                  onClick={() => setStrokeColor('#d32f2f')}
                  aria-label="Red Ink"
                />
              </div>
            </div>
          )}

          {signatureMode === 'upload' && (
            <div className="upload-container">
              <div className="upload-box">
                <input 
                  type="file" 
                  id="sig-upload" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="sig-upload" className="upload-label">
                  <Upload size={32} />
                  <span>Choose signature image file</span>
                  <span className="subtext">PNG, JPG formats supported (transparent PNG recommended)</span>
                </label>
              </div>

              {uploadImage && (
                <div className="uploaded-preview">
                  <span className="preview-label">Preview:</span>
                  <div className="img-container">
                    <img src={uploadImage} alt="Uploaded signature" />
                    <button className="remove-img-btn" onClick={() => setUploadImage(null)}>
                      <X size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="signature-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSave}
            disabled={
              (signatureMode === 'draw' && history.length <= 1) ||
              (signatureMode === 'type' && !typedName.trim()) ||
              (signatureMode === 'upload' && !uploadImage)
            }
          >
            <Check size={16} /> Insert Signature
          </button>
        </div>
      </div>
    </div>
  );
}
