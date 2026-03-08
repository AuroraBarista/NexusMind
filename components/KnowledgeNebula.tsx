
import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import ForceGraph2D, { ForceGraphMethods, LinkObject, NodeObject } from "react-force-graph-2d";
import { forceX, forceY, forceManyBody, forceCollide } from "d3-force";
import { Maximize2, Sparkles } from "lucide-react";

interface Snippet {
    id: string;
    content: string;
    project_anchor: string;
    summary?: string;
    ai_tags?: string[];
    file_url?: string;
}

interface NebulaProps {
    graphData: { nodes: any[], links: any[] };
    onNodeClick: (node: any) => void;
    activeNode?: any;
    width?: number;
    height?: number;
}

const COLORS: Record<string, string> = {
    academic: "#ffffff",
    social: "#d1d5db",
    internship: "#9ca3af",
    default: "#6b7280"
};

export default function KnowledgeNebula({ graphData, onNodeClick, activeNode, width, height }: NebulaProps) {
    const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
    const [hoverNode, setHoverNode] = useState<any>(null);

    useEffect(() => {
        if (graphRef.current && graphData.nodes.length > 0) {
            const fg = graphRef.current;
            fg.d3Force('charge', forceManyBody().strength(-150));
            fg.d3Force('collide', forceCollide().radius((node: any) => node.val * 2));

            // @ts-ignore
            fg.d3Force('link').strength((link: any) => {
                if (link.type === 'hard') return 0.2;
                return 0.05;
            }).distance((link: any) => {
                if (link.type === 'hard') return 40;
                return 80;
            });

            fg.d3Force('x', forceX((node: any) => {
                if (node.project_anchor === 'academic') return -100;
                if (node.project_anchor === 'social') return 0;
                if (node.project_anchor === 'internship') return 100;
                return 0;
            }).strength(0.05));

            fg.d3Force('y', forceY((node: any) => {
                if (node.project_anchor === 'academic') return -50;
                if (node.project_anchor === 'social') return 100;
                if (node.project_anchor === 'internship') return -50;
                return 0;
            }).strength(0.05));

            fg.d3ReheatSimulation();
        }
    }, [graphData]);

    const highlightNodes = useMemo(() => {
        const targetNode = activeNode || hoverNode;
        const set = new Set();
        const connectedLinks = new Set();
        if (targetNode) {
            set.add(targetNode);
            graphData.links.forEach(link => {
                const sourceId = (link.source as any).id || link.source;
                const targetId = (link.target as any).id || link.target;
                if (sourceId === targetNode.id) {
                    set.add(link.target);
                    connectedLinks.add(link);
                }
                if (targetId === targetNode.id) {
                    set.add(link.source);
                    connectedLinks.add(link);
                }
            });
        }
        return { nodes: set, links: connectedLinks };
    }, [hoverNode, activeNode, graphData.links]);

    const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return;

        const isHovered = node === hoverNode;
        const isActive = activeNode && node.id === activeNode.id;
        const isNeighbor = highlightNodes.nodes.has(node);
        const isSomethingFocused = (activeNode || hoverNode);
        const isDimmed = isSomethingFocused && !isNeighbor && !isHovered && !isActive;

        const baseColor = COLORS[node.group] || COLORS.default;

        // Star-like rendering
        const r = isActive ? node.val * 3 : (isHovered ? node.val * 2.5 : node.val * 1.5);

        ctx.globalCompositeOperation = 'screen';

        // Outer Glow (Nebula effect)
        if (!isDimmed) {
            const glowRadius = r * 8;
            const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowRadius);
            gradient.addColorStop(0, hexToRgba(baseColor, 0.4));
            gradient.addColorStop(0.5, hexToRgba(baseColor, 0.1));
            gradient.addColorStop(1, "rgba(0,0,0,0)");

            ctx.beginPath();
            ctx.fillStyle = gradient;
            ctx.arc(node.x, node.y, glowRadius, 0, 2 * Math.PI, false);
            ctx.fill();
        }

        // Inner Core (Star)
        const coreAlpha = isDimmed ? 0.3 : 1;
        ctx.beginPath();
        ctx.shadowBlur = isDimmed ? 0 : 15;
        ctx.shadowColor = baseColor;
        ctx.fillStyle = hexToRgba(baseColor, coreAlpha);
        ctx.arc(node.x, node.y, isDimmed ? r * 0.5 : r, 0, 2 * Math.PI, false);
        ctx.fill();

        // Reset Shadow/Composite
        ctx.shadowBlur = 0;
        ctx.globalCompositeOperation = 'source-over';

        // Hover Ring
        if (isHovered || isActive) {
            ctx.beginPath();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
            ctx.lineWidth = 1 / globalScale;
            ctx.arc(node.x, node.y, r * 1.5, 0, 2 * Math.PI, false);
            ctx.stroke();

            // Label
            const label = node.project_anchor || "General";
            const fontSize = 12 / globalScale; // Smaller font
            ctx.font = `${fontSize}px 'Geist Mono', monospace`; // Use mono font
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillText(label.toUpperCase(), node.x, node.y + r * 2);
        }
    }, [hoverNode, highlightNodes, activeNode]);

    return (
        <div className="relative w-full h-full bg-transparent overflow-hidden">

            {/* Info Tip - Only show if empty or specific state */}
            {graphData.nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-white/20 text-sm font-light tracking-[0.2em]">NEBULA OFFLINE</p>
                </div>
            )}

            {/* Tooltip */}
            {hoverNode && (
                <div
                    className="absolute z-50 pointer-events-none px-5 py-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl text-xs text-white shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-xs transition-all duration-300 transform scale-100 opacity-100"
                    style={{ left: 20, top: 20 }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="relative">
                            <div className={`w-2 h-2 rounded-full z-10 relative`} style={{ backgroundColor: COLORS[hoverNode.group] || COLORS.default }}></div>
                            <div className={`absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-75`} style={{ backgroundColor: COLORS[hoverNode.group] || COLORS.default }}></div>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/50">{hoverNode.project_anchor || "UNKNOWN"}</span>
                    </div>

                    <div className="font-light leading-relaxed text-gray-200 text-sm border-l border-white/10 pl-3 my-2">
                        {hoverNode.summary ? (
                            <span className="italic">"{hoverNode.summary}"</span>
                        ) : (
                            hoverNode.content?.substring(0, 100) + (hoverNode.content?.length > 100 ? "..." : "")
                        )}
                    </div>

                    {hoverNode.ai_tags && (
                        <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                            {hoverNode.ai_tags.slice(0, 3).map((tag: string) => (
                                <span key={tag} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[9px] text-white/40 uppercase tracking-wide">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <ForceGraph2D
                ref={graphRef}
                width={width}
                height={height}
                graphData={graphData}
                backgroundColor="rgba(0,0,0,0)" // Transparent
                nodeLabel={() => ""}

                linkCanvasObject={(link: any, ctx) => {
                    const isHard = link.type === 'hard';
                    // Check if either end is highlighted
                    const isHighlighted = highlightNodes.nodes.has(link.source) && highlightNodes.nodes.has(link.target);
                    // Dim if something else is focused and this isn't it
                    const isDimmed = (activeNode || hoverNode) && !isHighlighted;

                    if (isDimmed) return;

                    const start = link.source;
                    const end = link.target;

                    if (!start || !end || !Number.isFinite(start.x) || !Number.isFinite(end.x)) return;

                    ctx.beginPath();
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(end.x, end.y);

                    if (isHighlighted) {
                        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
                        ctx.lineWidth = 1;
                    } else if (isHard) {
                        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
                        ctx.lineWidth = 0.5;
                    } else {
                        ctx.strokeStyle = "rgba(255,255,255,0.03)";
                        ctx.lineWidth = 0.5;
                    }

                    ctx.globalCompositeOperation = 'screen';
                    ctx.stroke();
                    ctx.globalCompositeOperation = 'source-over';
                }}

                // Physics tweaks
                // @ts-ignore
                linkStrength={0.05}
                nodeCanvasObject={paintNode}
                enableNodeDrag={true}
                d3AlphaDecay={0.01} // Very slow decay for "floating" feel
                d3VelocityDecay={0.3} // Low friction

                onNodeClick={(node) => {
                    if (graphRef.current) {
                        graphRef.current.centerAt(node.x, node.y, 1000);
                        graphRef.current.zoom(3, 2000);
                    }
                    onNodeClick(node);
                }}
                onNodeHover={(node) => setHoverNode(node)}
            />

            <div className="absolute bottom-6 right-6 flex gap-2 z-50">
                <button
                    onClick={() => {
                        graphRef.current?.d3ReheatSimulation();
                        graphRef.current?.zoomToFit(800);
                    }}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-white/50 hover:text-white rounded-full transition-all duration-300 backdrop-blur-md active:scale-95"
                    title="Realign Nebula"
                >
                    <Maximize2 size={16} />
                </button>
            </div>
        </div>
    );
}

function hexToRgba(hex: string, alpha: number) {
    if (!hex) return `rgba(255,255,255,${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
