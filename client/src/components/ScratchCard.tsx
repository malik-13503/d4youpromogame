import { useRef, useEffect, useState } from "react";

interface ScratchCardProps {
  width: number;
  height: number;
  scratchPercent?: number;
  onScratchComplete?: () => void;
  onInitialTouch?: () => void;
  children: React.ReactNode;
  isScratched?: boolean;
}

export default function ScratchCard({
  width,
  height,
  scratchPercent = 50,
  onScratchComplete,
  onInitialTouch,
  children,
  isScratched = false,
}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(isScratched);
  const [hasBeenTouched, setHasBeenTouched] = useState(false);

  useEffect(() => {
    if (isScratched) {
      setIsCompleted(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Draw scratch overlay
    ctx.fillStyle = "#4a5568";
    ctx.fillRect(0, 0, width, height);

    // Set up for scratching
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [width, height, isScratched]);

  const getEventPos = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startScratch = (e: any) => {
    if (isCompleted) return;
    
    // Always trigger callback if provided - this handles blocking logic
    if (onInitialTouch) {
      onInitialTouch();
      return; // Don't start scratching when callback is provided
    }
    
    setIsDrawing(true);
    const pos = getEventPos(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const scratch = (e: any) => {
    if (!isDrawing || isCompleted) return;

    const pos = getEventPos(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const endScratch = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Check if enough has been scratched
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }

    const percent = (transparent / (pixels.length / 4)) * 100;

    if (percent > scratchPercent) {
      setIsCompleted(true);
      onScratchComplete?.();
    }
  };

  if (isCompleted) {
    return <div className="w-full h-full">{children}</div>;
  }

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0">{children}</div>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-pointer touch-none"
        onMouseDown={startScratch}
        onMouseMove={scratch}
        onMouseUp={endScratch}
        onMouseLeave={endScratch}
        onTouchStart={startScratch}
        onTouchMove={scratch}
        onTouchEnd={endScratch}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
