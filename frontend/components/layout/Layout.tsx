"use client";

import { ReactNode } from "react";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { sidebarOpen } = useStore();

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <TopBar />
        <Sidebar />
        <main
          className={cn(
            "pt-0 min-h-[calc(100vh-3.5rem)] transition-all duration-300",
            sidebarOpen ? "lg:pl-64" : ""
          )}
        >
          {children}
        </main>
      </div>
    </TooltipProvider>
  );
}
