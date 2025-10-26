import { TextOverlay } from '../types';

export const flattenTextOverlays = (baseImageSrc: string, overlays: TextOverlay[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      // Draw the base image
      ctx.drawImage(image, 0, 0);

      // Draw each text overlay
      overlays.forEach(overlay => {
        const pixelX = (overlay.x / 100) * canvas.width;
        const pixelY = (overlay.y / 100) * canvas.height;
        const pixelFontSize = (overlay.fontSize / 100) * canvas.height;

        ctx.font = `${pixelFontSize}px ${overlay.fontFamily}`;
        ctx.fillStyle = overlay.color;
        ctx.textAlign = overlay.textAlign;
        ctx.textBaseline = 'middle';
        
        // Simple text wrapping
        const lines = overlay.text.split('\n');
        lines.forEach((line, index) => {
            ctx.fillText(line, pixelX, pixelY + (index * pixelFontSize * 1.2));
        });

      });
      
      const mimeType = baseImageSrc.substring(baseImageSrc.indexOf(':') + 1, baseImageSrc.indexOf(';'));
      resolve(canvas.toDataURL(mimeType));
    };

    image.onerror = (err) => {
      reject(new Error(`Could not load image: ${err}`));
    };
    
    image.src = baseImageSrc;
  });
};
