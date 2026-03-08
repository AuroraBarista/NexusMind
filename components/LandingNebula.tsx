"use client";

import { useEffect, useRef, useState } from "react";
import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d";
import { forceManyBody, forceCollide, forceX, forceY } from "d3-force";

// Static "Beauty" Data
const LANDING_DATA = {
    nodes: Array.from({ length: 40 }, (_, i) => ({
        id: i,
        group: i % 3 === 0 ? 'academic' : i % 3 === 1 ? 'social' : 'internship',
        val: Math.random() * 5 + 3 // Varied sizes
    })),
    links: Array.from({ length: 60 }, () => ({
        source: Math.floor(Math.random() * 40),
        target: Math.floor(Math.random() * 40),
        type: Math.random() > 0.7 ? "hard" : "soft"
    }))
};

const COLORS: Record<string, string> = {
    academic: "#3b82f6", // Blue
    social: "#a855f7",   // Purple
    internship: "#22c55e", // Green
};

export default function LandingNebula() {
    const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
    const [rotation, setRotation] = useState(0);

    // Auto-Rotate Effect
    useEffect(() => {
        const interval = setInterval(() => {
            setRotation(r => r + 0.002);
        }, 16);
        return () => clearInterval(interval);
    }, []);

    // Physics
    useEffect(() => {
        if (graphRef.current) {
            const fg = graphRef.current;
            fg.d3Force('charge', forceManyBody().strength(-50));
            fg.d3Force('collide', forceCollide().radius(5));
            // Gentle Pull to Center
            fg.d3Force('x', forceX(0).strength(0.05));
            fg.d3Force('y', forceY(0).strength(0.05));
        }
    }, []);

    return (
        <div className="w-full h-full opacity-60 mix-blend-screen pointer-events-none">
            <ForceGraph2D
                ref={graphRef}
                graphData={LANDING_DATA}
                width={800} // Fixed size for hero visual
                height={600}
                backgroundColor="rgba(0,0,0,0)"
                nodeLabel={() => ""}

                // Visuals
                nodeRelSize={6}
                nodeColor={(node: any) => COLORS[node.group]}

                // Custom Paint for Glow
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                    const { x, y } = node;
                    // Rotation Logic (Manual Camera Orbit simulation)
                    const cos = Math.cos(rotation);
                    const sin = Math.sin(rotation);
                    const rx = x * cos - y * sin;
                    const ry = x * sin + y * cos;

                    // Draw Glow
                    ctx.beginPath();
                    ctx.arc(rx, ry, node.val * 1.5, 0, 2 * Math.PI, false);
                    ctx.fillStyle = COLORS[node.group];
                    ctx.globalAlpha = 0.3; // Glow
                    ctx.fill();

                    // Draw Core
                    ctx.beginPath();
                    ctx.arc(rx, ry, node.val * 0.6, 0, 2 * Math.PI, false);
                    ctx.fillStyle = "#fff";
                    ctx.globalAlpha = 1;
                    ctx.fill();
                }}

                // Links
                linkColor={() => "#ffffff"}
                linkWidth={1}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.005}
                linkDirectionalParticleWidth={2}
            />
        </div>
    );
}
