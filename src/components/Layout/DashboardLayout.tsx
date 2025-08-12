import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className={cn("flex-1 overflow-auto", className)}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}