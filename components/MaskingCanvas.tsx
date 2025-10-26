import React, { useRef, useEffect, useState } from 'react';
import { AiProvider } from '../types';

interface MaskingCanvasProps {
  imageSrc: string;
  brushSize: number;
  onMaskChange: (mask: string | null) => void;
  provider: AiProvider;
  model: string;
}

const MaskingCanvas: React.FC<MaskingCanvasProps> = ({ imageSrc, brushSize, onMaskChange, provider, model }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null); // Offscreen canvas for the mask
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());

  const isDalle2 = provider === AiProvider.OPENAI && model === 'dall-e-2';

  // Function to resize and setup canvas
  const setupCanvas = () => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    const image = imageRef.current;
    if (!canvas || !container || !image.src || image.naturalWidth === 0) return;

    const { naturalWidth, naturalHeight } = image;
    const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();
    
    const imageAspectRatio = naturalWidth / naturalHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    let renderWidth, renderHeight;

    if (imageAspectRatio > containerAspectRatio) {
      renderWidth = containerWidth;
      renderHeight = containerWidth / imageAspectRatio;
    } else {
      renderHeight = containerHeight;
      renderWidth = containerHeight * imageAspectRatio;
    }
    
    // Setup visible canvas
    canvas.width = renderWidth;
    canvas.height = renderHeight;
    canvas.style.width = `${renderWidth}px`;
    canvas.style.height = `${renderHeight}px`;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, renderWidth, renderHeight);

    // Setup offscreen mask canvas
    if (maskCanvasRef.current) {
        maskCanvasRef.current.width = renderWidth;
        maskCanvasRef.current.height = renderHeight;
        const maskCtx = maskCanvasRef.current.getContext('2d');
        if (maskCtx) {
            // For DALL-E 2, we start with an opaque canvas and "erase" to transparency.
            // For Gemini, we start with a black canvas and draw white "protected" areas.
            maskCtx.fillStyle = 'black';
            maskCtx.fillRect(0, 0, renderWidth, renderHeight);
        }
    }
  };
  
  // Load image and setup canvas
  useEffect(() => {
    const image = imageRef.current;
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;

    const handleLoad = () => {
        setupCanvas();
    };

    image.addEventListener('load', handleLoad);
    
    // Initialize the offscreen mask canvas
    maskCanvasRef.current = document.createElement('canvas');

    const container = canvasRef.current?.parentElement;
    const resizeObserver = new ResizeObserver(() => setupCanvas());
    if (container) {
      resizeObserver.observe(container);
    }

    // Clear mask state when provider changes
    onMaskChange(null);


    return () => {
      image.removeEventListener('load', handleLoad);
      if (container) {
        resizeObserver.unobserve(container);
      }
    };
  }, [imageSrc, isDalle2]);

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const draw = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;

    const ctx = canvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');
    if (!ctx || !maskCtx) return;
    
    const strokeStyle = isDalle2 ? 'rgba(0, 0, 0, 0.7)' : 'rgba(239, 68, 68, 0.6)';

    // Draw on visible canvas (for user feedback)
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // Draw on offscreen mask canvas (for API)
    if (isDalle2) {
      // "Erase" to transparency
      maskCtx.globalCompositeOperation = 'destination-out';
    } else {
      maskCtx.globalCompositeOperation = 'source-over';
    }
    
    maskCtx.beginPath();
    maskCtx.moveTo(from.x, from.y);
    maskCtx.lineTo(to.x, to.y);
    maskCtx.strokeStyle = 'white'; // Color doesn't matter for destination-out, but does for source-over
    maskCtx.lineWidth = brushSize;
    maskCtx.lineCap = 'round';
    maskCtx.lineJoin = 'round';
    maskCtx.stroke();

    // Reset composite operation if we changed it
    if (isDalle2) {
      maskCtx.globalCompositeOperation = 'source-over';
    }
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const coords = getCoordinates(event);
    if (coords) {
      setIsDrawing(true);
      setLastPosition(coords);
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setLastPosition(null);
      // Generate and propagate the mask data URL
      const maskDataUrl = maskCanvasRef.current?.toDataURL('image/png');
      if (maskDataUrl) {
        onMaskChange(maskDataUrl);
      }
    }
  };

  const handleDrawMove = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    if (!isDrawing || !lastPosition) return;
    const coords = getCoordinates(event);
    if (coords) {
      draw(lastPosition, coords);
      setLastPosition(coords);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-crosshair touch-none"
      onMouseDown={startDrawing}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onMouseMove={handleDrawMove}
      onTouchStart={startDrawing}
      onTouchEnd={stopDrawing}
      onTouchMove={handleDrawMove}
    />
  );
};

export default MaskingCanvas;