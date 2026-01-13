"use client";

import { TrendingUp, BarChart3, Users, Percent, RotateCw, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { DataLayer } from "@/types";
import { cn } from "@/lib/utils";

const layers: { id: DataLayer; label: string; icon: typeof TrendingUp; color: string }[] = [
  { id: "oi", label: "Open Interest", icon: TrendingUp, color: "text-accent-bullish" },
  { id: "volume", label: "Volume", icon: BarChart3, color: "text-accent-volume" },
  { id: "smart_traders", label: "Smart Traders", icon: Users, color: "text-accent-smart" },
  { id: "probability", label: "Probability", icon: Percent, color: "text-accent-highlight" },
];

export default function GlobeControls() {
  const { activeLayer, setActiveLayer, globeAutoRotate, setGlobeAutoRotate } = useStore();

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-card/50 backdrop-blur-sm rounded-lg border border-border">
      {/* Layer toggles */}
      <div className="flex flex-wrap gap-1">
        {layers.map((layer) => {
          const isActive = activeLayer === layer.id;
          return (
            <Button
              key={layer.id}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveLayer(layer.id)}
              className={cn(
                "gap-1.5 text-xs",
                isActive && "bg-primary/20 border border-primary/30"
              )}
            >
              <layer.icon className={cn("h-3.5 w-3.5", isActive && layer.color)} />
              <span className="hidden sm:inline">{layer.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-border hidden sm:block" />

      {/* Auto-rotate toggle */}
      <Button
        variant={globeAutoRotate ? "secondary" : "ghost"}
        size="sm"
        onClick={() => setGlobeAutoRotate(!globeAutoRotate)}
        className="gap-1.5 text-xs"
      >
        {globeAutoRotate ? (
          <>
            <Pause className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Pause</span>
          </>
        ) : (
          <>
            <RotateCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Rotate</span>
          </>
        )}
      </Button>
    </div>
  );
}
