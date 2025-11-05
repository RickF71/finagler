import React, { useEffect, useRef } from 'react';
//import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';

export default function NetworkGraph() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    // Mock nodes and edges
    const nodes = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      r: 6 + Math.random() * 4,
      color: i === 0 ? '#22c55e' : '#64748b'
    }));

    const edges = Array.from({ length: 18 }, () => {
      const a = Math.floor(Math.random() * nodes.length);
      let b = Math.floor(Math.random() * nodes.length);
      while (b === a) b = Math.floor(Math.random() * nodes.length);
      return [a, b];
    });

    function draw() {
      ctx.clearRect(0, 0, width, height);
      // Edges
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.25)';
      ctx.lineWidth = 1;
      edges.forEach(([a, b]) => {
        const na = nodes[a];
        const nb = nodes[b];
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.stroke();
      });
      // Nodes
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.fillStyle = n.color;
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    draw();

    const animate = () => {
      nodes.forEach((n) => {
        n.x += Math.sin(Date.now() / 1000 + n.id) * 0.2;
        n.y += Math.cos(Date.now() / 1000 + n.id) * 0.2;
      });
      draw();
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return (
    <Card className="w-full h-[70vh] bg-[#121820] border border-slate-800 relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.03)_0%,transparent_60%)]"
        animate={{ opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <div className="absolute top-4 left-4 text-slate-400 text-sm">Network Graph Mock (v0.3)</div>
    </Card>
  );
}