
import type React from 'react';

export enum WorkMode {
  PORTRAIT,
  RESTORE,
  CREATIVE,
  COMPOSITE,
}

export interface ModeInfo {
  id: WorkMode;
  name: string;
  icon: React.ReactElement;
  description: string;
}

export interface TextOverlay {
  id: string;
  text: string;
  fontFamily: string;
  fontSize: number; // As a percentage of the image's height
  color: string;
  textAlign: CanvasRenderingContext2D['textAlign'];
  x: number; // position as percentage of width
  y: number; // position as percentage of height
}
