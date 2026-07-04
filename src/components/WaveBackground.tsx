"use client";

import { useEffect, useRef, useCallback } from "react";

interface Block {
  x: number;
  y: number;
  originX: number;
  originY: number;
  size: number;
  opacity: number;
  targetOpacity: number;
  vx: number;
  vy: number;
  color: string;
}

const BLOCK_SIZE = 36;
const GAP = 6;
const CELL = BLOCK_SIZE + GAP;
const REPEL_RADIUS = 120;
const REPEL_STRENGTH = 3.5;
const SPRING = 0.08;
const FRICTION = 0.82;

// Warm palette tints — subtle so hero text stays readable
const COLORS = [
  "#C47A5A", // terracotta
  "#D4A96A", // gold
  "#7B9E7B", // sage
  "#6B8DAE", // blue
  "#BBA99A", // sand
];

export default function BlockGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blocksRef = useRef<Block[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);

  const buildGrid = useCallback((width: number, height: number) => {
    const cols = Math.ceil(width / CELL) + 1;
    const rows = Math.ceil(height / CELL) + 1;
    const blocks: Block[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const ox = col * CELL;
        const oy = row * CELL;
        blocks.push({
          x: ox,
          y: oy,
          originX: ox,
          originY: oy,
          size: BLOCK_SIZE,
          opacity: 0.025 + Math.random() * 0.025,
          targetOpacity: 0.025 + Math.random() * 0.025,
          vx: 0,
          vy: 0,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
    }
    blocksRef.current = blocks;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      buildGrid(canvas.width, canvas.height);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { x: mx, y: my } = mouseRef.current;

      for (const b of blocksRef.current) {
        // Vector from block centre to mouse
        const bx = b.x + b.size / 2;
        const by = b.y + b.size / 2;
        const dx = bx - mx;
        const dy = by - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPEL_RADIUS && dist > 0) {
          // Push away — stronger when closer
          const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
          b.vx += (dx / dist) * force;
          b.vy += (dy / dist) * force;
          b.targetOpacity = 0.12;
        } else {
          b.targetOpacity = b.opacity;
        }

        // Spring back to origin
        b.vx += (b.originX - b.x) * SPRING;
        b.vy += (b.originY - b.y) * SPRING;

        // Friction
        b.vx *= FRICTION;
        b.vy *= FRICTION;

        // Integrate
        b.x += b.vx;
        b.y += b.vy;

        // Render
        const alpha = b.opacity + (b.targetOpacity - b.opacity) * 0.1;
        ctx.fillStyle = b.color;
        ctx.globalAlpha = Math.min(alpha, 0.14);
        const radius = 5;
        const bLeft = b.x;
        const bTop = b.y;
        const bRight = b.x + b.size;
        const bBottom = b.y + b.size;

        ctx.beginPath();
        ctx.moveTo(bLeft + radius, bTop);
        ctx.lineTo(bRight - radius, bTop);
        ctx.quadraticCurveTo(bRight, bTop, bRight, bTop + radius);
        ctx.lineTo(bRight, bBottom - radius);
        ctx.quadraticCurveTo(bRight, bBottom, bRight - radius, bBottom);
        ctx.lineTo(bLeft + radius, bBottom);
        ctx.quadraticCurveTo(bLeft, bBottom, bLeft, bBottom - radius);
        ctx.lineTo(bLeft, bTop + radius);
        ctx.quadraticCurveTo(bLeft, bTop, bLeft + radius, bTop);
        ctx.closePath();
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [buildGrid]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
