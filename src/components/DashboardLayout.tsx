import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { useStore } from "@/stores/useStore";
import { Menu } from "lucide-react";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { toggleSidebar } = useStore();

  return (
    <div className="flex h-screen w-full bg-background">
      <AppSidebar />

      <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center h-14 px-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="ml-3 font-bold gradient-text">FinSight</span>
        </div>

        <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
