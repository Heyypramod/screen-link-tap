import { Link, useRouterState } from "@tanstack/react-router";
import { Tv, Cast, Settings } from "lucide-react";
import { tapHaptic } from "@/lib/haptics";

const items = [
  { to: "/", label: "Devices", icon: Tv },
  { to: "/cast", label: "Cast", icon: Cast },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Dock() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="material-chrome"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "8px 0 calc(24px + env(safe-area-inset-bottom, 0px))",
        borderTop: "0.5px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        justifyContent: "space-around",
        zIndex: 100,
      }}
    >
      {items.map(({ to, label, icon: Icon }) => {
        const active = to === "/" ? path === "/" : path.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={() => tapHaptic("Light")}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "4px 16px",
              textDecoration: "none",
              color: active ? "var(--color-blue)" : "var(--label-secondary)",
              transition: "color 200ms cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={24} strokeWidth={active ? 2 : 1.8} />
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: 0.1 }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
