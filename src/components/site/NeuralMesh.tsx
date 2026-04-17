import { useEffect, useRef } from "react";

/** Canvas2D neural network mesh: glowing nodes connected by light threads,
 *  with traveling data packets along edges. Mouse-parallax tilt. */
export function NeuralMesh() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, dpr = 1;
    let mx = 0, my = 0;        // current mouse offset
    let tx = 0, ty = 0;        // smoothed
    let t = 0;

    type Node = { x: number; y: number; r: number; pulse: number };
    type Edge = { a: number; b: number; packets: number[] };

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const seed = () => {
      nodes.length = 0;
      edges.length = 0;
      const count = Math.max(28, Math.min(58, Math.floor((w * h) / 22000)));
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 1.2 + Math.random() * 2.2,
          pulse: Math.random() * Math.PI * 2,
        });
      }
      // Connect each node to its 2-3 nearest
      for (let i = 0; i < nodes.length; i++) {
        const dists: { j: number; d: number }[] = [];
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          dists.push({ j, d: Math.hypot(dx, dy) });
        }
        dists.sort((a, b) => a.d - b.d);
        for (let k = 0; k < 2 + (Math.random() < 0.4 ? 1 : 0); k++) {
          const j = dists[k].j;
          if (!edges.some((e) => (e.a === i && e.b === j) || (e.a === j && e.b === i))) {
            edges.push({ a: i, b: j, packets: Math.random() < 0.25 ? [Math.random()] : [] });
          }
        }
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mx = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
      my = ((e.clientY - rect.top) / rect.height - 0.5) * 30;
    };

    let rafId = 0;
    const tick = () => {
      t += 0.012;
      tx += (mx - tx) * 0.06;
      ty += (my - ty) * 0.06;

      ctx.clearRect(0, 0, w, h);

      // Edges
      for (const e of edges) {
        const a = nodes[e.a], b = nodes[e.b];
        const ax = a.x + tx, ay = a.y + ty;
        const bx = b.x + tx, by = b.y + ty;
        const grad = ctx.createLinearGradient(ax, ay, bx, by);
        grad.addColorStop(0, "rgba(0,245,255,0.35)");
        grad.addColorStop(1, "rgba(123,47,255,0.35)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();

        // Maybe spawn packet
        if (e.packets.length === 0 && Math.random() < 0.004) e.packets.push(0);

        // Update packets
        for (let i = e.packets.length - 1; i >= 0; i--) {
          const p = e.packets[i];
          const px = ax + (bx - ax) * p;
          const py = ay + (by - ay) * p;
          ctx.fillStyle = "rgba(255,255,255,0.95)";
          ctx.shadowColor = "rgba(0,245,255,0.95)";
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(px, py, 1.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          e.packets[i] = p + 0.012;
          if (e.packets[i] > 1) e.packets.splice(i, 1);
        }
      }

      // Nodes
      for (const n of nodes) {
        n.pulse += 0.03;
        const pulse = 0.6 + Math.sin(n.pulse) * 0.4;
        const x = n.x + tx, y = n.y + ty;
        ctx.fillStyle = `rgba(0,245,255,${0.5 + pulse * 0.4})`;
        ctx.shadowColor = "rgba(0,245,255,0.9)";
        ctx.shadowBlur = 14 * pulse;
        ctx.beginPath();
        ctx.arc(x, y, n.r * (0.9 + pulse * 0.3), 0, Math.PI * 2);
        ctx.fill();

        // Inner violet core
        ctx.fillStyle = "rgba(123,47,255,0.7)";
        ctx.shadowColor = "rgba(123,47,255,0.9)";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(x, y, n.r * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      rafId = requestAnimationFrame(tick);
    };

    resize();
    tick();
    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
