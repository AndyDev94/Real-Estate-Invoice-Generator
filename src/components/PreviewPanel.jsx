import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Download, Printer, AlertCircle, Link2, FileDown, Eye, ChevronDown } from 'lucide-react';
import InvoiceTemplates from './InvoiceTemplates';

const PreviewPanel = forwardRef(function PreviewPanel({ 
  className,
  style,
  data, 
  onFieldChange, 
  onDownloadPDF, 
  onDownloadA4PDF,
  onDownloadBlankPDF,
  onPrintInvoice,
  onShareLink,
  viewOnly = false
}, ref) {
  const [zoom, setZoom] = useState(100);
  const scaleContainerRef = useRef(null);
  const viewportRef = useRef(null);
  const toolbarRef = useRef(null);
  const [blankDropdownOpen, setBlankDropdownOpen] = useState(false);
  const [previewBlankMode, setPreviewBlankMode] = useState(false);
  const blankDropdownRef = useRef(null);
  const blankMenuRef = useRef(null);
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    function handleClickOutside(event) {
      const isDropdownClick = blankDropdownRef.current && blankDropdownRef.current.contains(event.target);
      const isMenuClick = blankMenuRef.current && blankMenuRef.current.contains(event.target);
      if (!isDropdownClick && !isMenuClick) {
        setBlankDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    
    const handleClose = () => setBlankDropdownOpen(false);
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
    };
  }, []);

  const handleToggleDropdown = () => {
    if (!blankDropdownOpen && blankDropdownRef.current && toolbarRef.current) {
      const rect = blankDropdownRef.current.getBoundingClientRect();
      const toolbarRect = toolbarRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom - toolbarRect.top + 8,
        left: rect.left - toolbarRect.left
      });
    }
    setBlankDropdownOpen(!blankDropdownOpen);
  };

  // Expose scale container for PDF capture (lets App.jsx neutralize transform)
  useImperativeHandle(ref, () => ({
    getScaleContainer: () => scaleContainerRef.current,
  }));

  // Auto-fit zoom on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        const screenWidth = window.innerWidth - 36;
        const scalePct = Math.min(Math.floor((screenWidth / 794) * 100), 100);
        setZoom(scalePct);
      } else {
        setZoom(100);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const defaultZoom = window.innerWidth < 1024
    ? Math.min(Math.floor(((window.innerWidth - 36) / 794) * 100), 100)
    : 100;

  const zoomRef = useRef(zoom);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  // ── 2-finger pinch-to-zoom and smooth drag (pan) on the paper viewport ────
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let initialDist = null;
    let initialZoom = 100;
    let initialMidpoint = null;
    let initialScroll = { left: 0, top: 0 };

    const getDistance = (t) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    const getMidpoint = (t) => ({
      x: (t[0].clientX + t[1].clientX) / 2,
      y: (t[0].clientY + t[1].clientY) / 2,
    });

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        initialDist = getDistance(e.touches);
        initialZoom = zoomRef.current;
        initialMidpoint = getMidpoint(e.touches);
        initialScroll = {
          left: viewport.scrollLeft,
          top: viewport.scrollTop
        };
        e.preventDefault(); // stop browser from intercepting pinch
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 2 && initialDist !== null && initialMidpoint !== null) {
        // 1. Zoom calculation
        const dist = getDistance(e.touches);
        const ratio = dist / initialDist;
        const newZoom = Math.min(Math.max(Math.round(initialZoom * ratio / 5) * 5, 40), 150);
        setZoom(newZoom);

        // 2. Combined Focal Zoom & Panning calculation
        const midpoint = getMidpoint(e.touches);
        const deltaX = midpoint.x - initialMidpoint.x;
        const deltaY = midpoint.y - initialMidpoint.y;

        const rect = viewport.getBoundingClientRect();
        const clientStartMidX = initialMidpoint.x - rect.left;
        const clientStartMidY = initialMidpoint.y - rect.top;
        const scaleFactor = newZoom / initialZoom;

        viewport.scrollLeft = (initialScroll.left + clientStartMidX) * scaleFactor - clientStartMidX - deltaX;
        viewport.scrollTop = (initialScroll.top + clientStartMidY) * scaleFactor - clientStartMidY - deltaY;

        e.preventDefault();
      }
    };

    const onTouchEnd = (e) => {
      if (e.touches.length < 2) {
        initialDist = null;
        initialMidpoint = null;
      }
    };

    viewport.addEventListener('touchstart', onTouchStart, { passive: false });
    viewport.addEventListener('touchmove', onTouchMove, { passive: false });
    viewport.addEventListener('touchend', onTouchEnd);

    return () => {
      viewport.removeEventListener('touchstart', onTouchStart);
      viewport.removeEventListener('touchmove', onTouchMove);
      viewport.removeEventListener('touchend', onTouchEnd);
    };
  }, []); // run only once on mount

  return (
    <div className={`${className || "preview-panel-wrapper"} ${viewOnly ? 'view-only-centered' : ''}`}>
      <div className="preview-toolbar glassmorphic mb-4" ref={toolbarRef}>
        {/* Horizontally scrollable action buttons */}
        <div className="toolbar-scroll-wrapper">
          <div className="toolbar-btns">
            <button className="btn-primary animate-hover" onClick={onDownloadPDF} title="Download PDF sized to invoice content">
              <Download size={15} /> Download PDF
            </button>

            {onDownloadA4PDF && (
              <button className="btn-a4 animate-hover" onClick={onDownloadA4PDF} title="Download strict A4 PDF — perfect for printing">
                <FileDown size={15} /> A4 Print PDF
              </button>
            )}

            {onDownloadBlankPDF && (
              <div className="blank-pdf-dropdown" ref={blankDropdownRef}>
                <button 
                  className={`btn-accent animate-hover flex items-center gap-1.5 ${previewBlankMode ? 'blank-active' : ''}`}
                  onClick={handleToggleDropdown}
                  title="Blank A4 options"
                >
                  <FileDown size={15} /> 
                  <span>{previewBlankMode ? 'Blank View' : 'Blank A4 PDF'}</span>
                  <ChevronDown size={13} className={`dropdown-caret-icon ${blankDropdownOpen ? 'rotated' : ''}`} />
                </button>
              </div>
            )}

            <button className="btn-accent animate-hover" onClick={onPrintInvoice} title="Print/Save as PDF via browser print window">
              <Printer size={15} /> Print / Save PDF
            </button>

            {onShareLink && (
              <button className="btn-accent animate-hover" onClick={onShareLink} title="Generate a sharing link for client view">
                <Link2 size={15} /> Share Link
              </button>
            )}
          </div>
        </div>

        {/* Floating dropdown menu placed outside the scroll wrapper to prevent clipping */}
        {blankDropdownOpen && (
          <div 
            ref={blankMenuRef}
            className="blank-dropdown-menu glassmorphic animate-fade-in"
            style={{ top: `${dropdownCoords.top}px`, left: `${dropdownCoords.left}px` }}
          >
            <button
              className="blank-dropdown-item"
              onClick={() => {
                setPreviewBlankMode(!previewBlankMode);
                setBlankDropdownOpen(false);
              }}
            >
              <Eye size={14} />
              <span>{previewBlankMode ? 'Show Normal Invoice' : 'Show Blank Invoice'}</span>
            </button>
            <button
              className="blank-dropdown-item"
              onClick={() => {
                onDownloadBlankPDF();
                setBlankDropdownOpen(false);
              }}
            >
              <Download size={14} />
              <span>Download Blank PDF</span>
            </button>
          </div>
        )}

        {/* Zoom slider */}
        <div className="zoom-slider-group">
          <span className="zoom-slider-label">Zoom</span>
          <input
            id="zoom-slider"
            type="range"
            min={40}
            max={150}
            step={5}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="zoom-slider"
            title={`Zoom: ${zoom}%`}
          />
          <span className="zoom-slider-pct">{zoom}%</span>
          <button
            className="zoom-reset-btn"
            onClick={() => setZoom(defaultZoom)}
            title="Reset zoom"
          >↺</button>
        </div>
      </div>

      {!viewOnly && (
        <div className="wysiwyg-hint-banner">
          <AlertCircle size={14} />
          <span>Tip: You can click and type directly on the names, titles, and text blocks inside the invoice preview!</span>
        </div>
      )}

      <div ref={viewportRef} className="paper-viewport scrollbar-thin">
        <div 
          className="paper-scale-wrapper"
          style={{ 
            width: `${794 * (zoom / 100)}px`,
            margin: '0 auto',
            overflow: 'hidden'
          }}
        >
          <div 
            ref={scaleContainerRef}
            className="paper-scale-container"
            style={{ 
              transform: `scale(${zoom / 100})`, 
              transformOrigin: 'top left',
              width: '794px',
              marginBottom: `${((zoom / 100) - 1) * 1123 + 20}px` 
            }}
          >
            {/* Apply selected font directly on the A4 element so it shows live */}
            <div
              id="invoice-capture-area"
              className="a4-sheet-container shadow-2xl"
              style={style}
            >
              <InvoiceTemplates 
                data={previewBlankMode ? { ...data, _isBlankPDF: true } : data}
                onFieldChange={onFieldChange}
                activeTemplate={data.activeTemplate}
                accentColor={data.accentColor}
                viewOnly={viewOnly}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PreviewPanel;
