import React, { useRef, useEffect, useState } from 'react';

interface MaskingCanvasProps {
  imageSrc: string;
  brushSize: number;
  onMaskChange: (mask: string | null) => void;
}

const MaskingCanvas: React.FC<MaskingCanvasProps> = ({ imageSrc, brushSize, onMaskChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null); // Offscreen canvas for the mask
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());

  // Function to resize canvas to fit the displayed image
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    const image = imageRef.current;
    if (!canvas || !container || !image.src) return;

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
    
    canvas.width = renderWidth;
    canvas.height = renderHeight;
    canvas.style.width = `${renderWidth}px`;
    canvas.style.height = `${renderHeight}px`;

    // Also resize the offscreen mask canvas
    if (maskCanvasRef.current) {
        maskCanvasRef.current.width = renderWidth;
        maskCanvasRef.current.height = renderHeight;
        const maskCtx = maskCanvasRef.current.getContext('2d');
        if (maskCtx) {
            maskCtx.fillStyle = 'black';
            maskCtx.fillRect(0, 0, renderWidth, renderHeight);
        }
    }
  };
  
  // Load image and setup resize observer
  useEffect(() => {
    const image = imageRef.current;
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;

    const handleLoad = () => {
        resizeCanvas();
    };

    image.addEventListener('load', handleLoad);

    const container = canvasRef.current?.parentElement;
    const resizeObserver = new ResizeObserver(() => resizeCanvas());
    if (container) {
      resizeObserver.observe(container);
    }
    
    // Initialize the offscreen mask canvas
    maskCanvasRef.current = document.createElement('canvas');


    return () => {
      image.removeEventListener('load', handleLoad);
      if (container) {
        resizeObserver.unobserve(container);
      }
    };
  }, [imageSrc]);

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

    // Draw on visible canvas (for user feedback)
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)'; // Semi-transparent red
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // Draw on offscreen mask canvas (for API)
    maskCtx.beginPath();
    maskCtx.moveTo(from.x, from.y);
    maskCtx.lineTo(to.x, to.y);
    maskCtx.strokeStyle = 'white';
    maskCtx.lineWidth = brushSize;
    maskCtx.lineCap = 'round';
    maskCtx.lineJoin = 'round';
    maskCtx.stroke();
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
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
