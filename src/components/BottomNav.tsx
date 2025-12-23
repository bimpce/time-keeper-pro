import { NavLink, useLocation } from "react-router-dom";
import { Home, Calendar, BarChart3, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function BottomNav() {
  const location = useLocation();
  const { signOut } = useAuth();

  const navItems = [
    { path: "/", icon: Calendar, label: "Koledar" },
    { path: "/today", icon: Home, label: "Danes" },
    { path: "/reports", icon: BarChart3, label: "Poročila" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className={`h-6 w-6 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          );
        })}
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="flex flex-col items-center gap-1 h-auto px-4 py-2 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-6 w-6" />
          <span className="text-xs font-medium">Odjava</span>
        </Button>
      </div>
    </nav>
  );
}