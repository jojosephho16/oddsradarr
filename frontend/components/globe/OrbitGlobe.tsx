"use client";

import { useRef, useMemo, useState, Suspense, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sphere, Html, Stars, Line, Float } from "@react-three/drei";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { MarketSummary, DataLayer } from "@/types";

interface GlobeMarkerProps {
  position: [number, number, number];
  color: string;
  size: number;
  market: MarketSummary;
  onClick: () => void;
}

function GlobeMarker({ position, color, size, market, onClick }: GlobeMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Pulsing animation
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(hovered ? scale * 1.3 : scale);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.4}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Outer glow ring */}
      <mesh scale={1.5}>
        <ringGeometry args={[size * 0.8, size * 1.2, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.4 : 0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Tooltip on hover */}
      {hovered && (
        <Html
          position={[0, size * 2, 0]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div className="bg-card/95 border border-border rounded-lg p-3 shadow-xl min-w-[200px] backdrop-blur-sm">
            <p className="font-semibold text-sm text-foreground truncate max-w-[180px]">
              {market.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs ${
                  market.change_24h >= 0 ? "text-accent-bullish" : "text-accent-bearish"
                }`}
              >
                {market.change_24h >= 0 ? "+" : ""}
                {market.change_24h.toFixed(2)}%
              </span>
              <span className="text-xs text-muted-foreground">
                {(market.probability * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

interface GlobeProps {
  onMarketClick: (marketId: string) => void;
}

function Globe({ onMarketClick }: GlobeProps) {
  const globeRef = useRef<THREE.Group>(null);
  const { globeAutoRotate, activeLayer, trendingMarkets, topOIMarkets, topVolumeMarkets, setSelectedMarket } = useStore();

  // Auto-rotate globe
  useFrame((state, delta) => {
    if (globeRef.current && globeAutoRotate) {
      globeRef.current.rotation.y += delta * 0.05;
    }
  });

  // Get markets based on active layer
  const markets = useMemo(() => {
    switch (activeLayer) {
      case "oi":
        return topOIMarkets;
      case "volume":
        return topVolumeMarkets;
      default:
        return trendingMarkets;
    }
  }, [activeLayer, trendingMarkets, topOIMarkets, topVolumeMarkets]);

  // Get color based on layer
  const getMarkerColor = (layer: DataLayer, change: number) => {
    if (layer === "oi") return change >= 0 ? "#50FA7B" : "#FF5555";
    if (layer === "volume") return "#8BE9FD";
    if (layer === "smart_traders") return "#BD93F9";
    return "#FFCB6B";
  };

  // Convert lat/lng to 3D position
  const latLngToVector3 = (lat: number, lng: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return [x, y, z] as [number, number, number];
  };

  // Generate positions for markets
  const markersWithPositions = useMemo(() => {
    return markets.map((market, index) => {
      // Distribute markers around the globe
      const lat = Math.sin(index * 2.4) * 60;
      const lng = (index * 137.5) % 360 - 180;
      const position = latLngToVector3(lat, lng, 2.1);
      const size = 0.05 + (market.open_interest / 1000000) * 0.03;

      return {
        market,
        position,
        size: Math.min(size, 0.12),
        color: getMarkerColor(activeLayer, market.change_24h),
      };
    });
  }, [markets, activeLayer]);

  return (
    <group ref={globeRef}>
      {/* Main globe sphere */}
      <Sphere args={[2, 64, 64]}>
        <meshPhongMaterial
          color="#0A0D18"
          emissive="#151A2C"
          emissiveIntensity={0.2}
          shininess={50}
          transparent
          opacity={0.95}
        />
      </Sphere>

      {/* Globe grid lines */}
      <Sphere args={[2.01, 32, 32]}>
        <meshBasicMaterial
          color="#2A2F45"
          wireframe
          transparent
          opacity={0.15}
        />
      </Sphere>

      {/* Atmosphere glow */}
      <Sphere args={[2.15, 32, 32]}>
        <meshBasicMaterial
          color="#BD93F9"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Market markers */}
      {markersWithPositions.map(({ market, position, size, color }) => (
        <GlobeMarker
          key={market.id}
          position={position}
          color={color}
          size={size}
          market={market}
          onClick={() => {
            // Navigate to market detail using Next.js router
            onMarketClick(market.id);
          }}
        />
      ))}
    </group>
  );
}

interface SceneProps {
  onMarketClick: (marketId: string) => void;
}

function Scene({ onMarketClick }: SceneProps) {
  const { globeAutoRotate, setGlobeAutoRotate } = useStore();

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#FFFFFF" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#BD93F9" />

      {/* Stars background */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />

      {/* Globe */}
      <Float speed={0.5} rotationIntensity={0} floatIntensity={0.5}>
        <Globe onMarketClick={onMarketClick} />
      </Float>

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={10}
        autoRotate={false}
        onStart={() => setGlobeAutoRotate(false)}
        onEnd={() => setGlobeAutoRotate(true)}
      />
    </>
  );
}

export default function OrbitGlobe() {
  const router = useRouter();

  const handleMarketClick = useCallback((marketId: string) => {
    router.push(`/market/${marketId}`);
  }, [router]);

  return (
    <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden bg-background">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Scene onMarketClick={handleMarketClick} />
        </Suspense>
      </Canvas>
    </div>
  );
}
