/**
 * Type definitions for Cropper.js
 * Extended types for missing methods
 */

declare module 'cropperjs' {
  export interface ImageData {
    left: number;
    top: number;
    width: number;
    height: number;
    naturalWidth: number;
    naturalHeight: number;
    aspectRatio: number;
    rotate: number;
    scaleX: number;
    scaleY: number;
  }

  export interface CropBoxData {
    left: number;
    top: number;
    width: number;
    height: number;
  }

  export interface CanvasData {
    left: number;
    top: number;
    width: number;
    height: number;
    naturalWidth: number;
    naturalHeight: number;
  }

  export interface GetCroppedCanvasOptions {
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    fillColor?: string;
    imageSmoothingEnabled?: boolean;
    imageSmoothingQuality?: 'low' | 'medium' | 'high';
  }

  export default class Cropper {
    constructor(element: HTMLImageElement, options?: Cropper.Options);

    // Methods
    crop(): void;
    reset(): void;
    clear(): void;
    replace(url: string, hasSameSize?: boolean): void;
    enable(): void;
    disable(): void;
    destroy(): void;
    move(offsetX: number, offsetY?: number): void;
    moveTo(x: number, y?: number): void;
    zoom(ratio: number): void;
    zoomTo(ratio: number, pivot?: { x: number; y: number }): void;
    rotate(degree: number): void;
    rotateTo(degree: number): void;
    scale(scaleX: number, scaleY?: number): void;
    scaleX(scaleX: number): void;
    scaleY(scaleY: number): void;
    getData(rounded?: boolean): ImageData;
    setData(data: Partial<ImageData>): void;
    getContainerData(): CanvasData;
    getImageData(): ImageData;
    getCanvasData(): CanvasData;
    setCanvasData(data: Partial<CanvasData>): void;
    getCropBoxData(): CropBoxData;
    setCropBoxData(data: Partial<CropBoxData>): void;
    getCroppedCanvas(options?: GetCroppedCanvasOptions): HTMLCanvasElement;
    setAspectRatio(aspectRatio: number): void;
    setDragMode(mode: 'crop' | 'move' | 'none'): void;
  }

  namespace Cropper {
    export interface Options {
      viewMode?: 0 | 1 | 2 | 3;
      dragMode?: 'crop' | 'move' | 'none';
      initialAspectRatio?: number;
      aspectRatio?: number;
      data?: Partial<ImageData>;
      preview?: string | HTMLElement | HTMLElement[];
      responsive?: boolean;
      restore?: boolean;
      checkCrossOrigin?: boolean;
      checkOrientation?: boolean;
      modal?: boolean;
      guides?: boolean;
      center?: boolean;
      highlight?: boolean;
      background?: boolean;
      autoCrop?: boolean;
      autoCropArea?: number;
      movable?: boolean;
      rotatable?: boolean;
      scalable?: boolean;
      zoomable?: boolean;
      zoomOnTouch?: boolean;
      zoomOnWheel?: boolean;
      wheelZoomRatio?: number;
      cropBoxMovable?: boolean;
      cropBoxResizable?: boolean;
      toggleDragModeOnDblclick?: boolean;
      minContainerWidth?: number;
      minContainerHeight?: number;
      minCanvasWidth?: number;
      minCanvasHeight?: number;
      minCropBoxWidth?: number;
      minCropBoxHeight?: number;
      ready?: (event: CustomEvent) => void;
      cropstart?: (event: CustomEvent) => void;
      cropmove?: (event: CustomEvent) => void;
      cropend?: (event: CustomEvent) => void;
      crop?: (event: CustomEvent) => void;
      zoom?: (event: CustomEvent) => void;
    }
  }
}
