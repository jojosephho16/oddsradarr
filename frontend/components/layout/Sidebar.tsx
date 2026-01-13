"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe,
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Users,
  Star,
  Filter,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/useStore";
import { useState } from "react";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Markets",
    href: "/markets",
    icon: TrendingUp,
  },
  {
    title: "Smart Traders",
    href: "/traders",
    icon: Users,
  },
  {
    title: "Watchlist",
    href: "/watchlist",
    icon: Star,
  },
];

const platforms = [
  { id: "polymarket", label: "Polymarket", color: "polymarket" as const },
  { id: "kalshi", label: "Kalshi", color: "kalshi" as const },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, selectedPlatform, setSelectedPlatform } = useStore();
  const [filtersOpen, setFiltersOpen] = useState(true);

  if (!sidebarOpen) return null;

  return (
    <aside className="fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 border-r border-border bg-background overflow-y-auto hidden lg:block">
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isActive && "bg-primary/10 text-primary border border-primary/20"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Filters section */}
        <div className="border-t border-border p-4">
          <Button
            variant="ghost"
            className="w-full justify-between mb-2"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                filtersOpen && "rotate-180"
              )}
            />
          </Button>

          {filtersOpen && (
            <div className="space-y-3">
              {/* Platform filter */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Platform</p>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedPlatform === null ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedPlatform(null)}
                  >
                    All
                  </Badge>
                  {platforms.map((platform) => (
                    <Badge
                      key={platform.id}
                      variant={
                        selectedPlatform === platform.id
                          ? platform.color
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => setSelectedPlatform(platform.id)}
                    >
                      {platform.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick stats footer */}
        <div className="border-t border-border p-4 bg-muted/30">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Last updated</span>
            <span className="text-foreground">Just now</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
