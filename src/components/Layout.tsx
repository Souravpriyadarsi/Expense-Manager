import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  PieChart,
  Settings as SettingsIcon,
  Moon,
  Sun,
} from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";
import ToastContainer from "./ToastContainer";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/add", label: "Add Entry", icon: PlusCircle, end: false },
  { to: "/reports", label: "Reports", icon: PieChart, end: false },
  { to: "/settings", label: "Settings", icon: SettingsIcon, end: false },
];

export default function Layout() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <div className="min-h-full md:flex">
      <aside
        className="md:h-screen md:sticky md:top-0 md:w-56 md:flex-none flex md:flex-col
                   items-center md:items-stretch justify-between gap-2 px-3 py-3 md:py-5
                   border-b md:border-b-0 md:border-r bg-surface"
      >
        <div className="flex items-center gap-2.5 px-1 md:px-2 md:mb-4">
          <span className="grid h-7.5 w-7.5 place-items-center rounded-lg font-bold bg-accent text-accent-contrast">
            ₹
          </span>
          <span className="font-semibold tracking-tight hidden sm:block">
            Expense Manager
          </span>
        </div>

        <nav className="flex md:flex-col gap-1 md:flex-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors " +
                (isActive ? "nav-active" : "nav-idle")
              }
            >
              <Icon size={17} strokeWidth={2} />
              <span className="hidden sm:block">{label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={toggleTheme}
          className="btn btn-ghost md:justify-start"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          <span className="hidden sm:block">
            {theme === "dark" ? "Light" : "Dark"} mode
          </span>
        </button>
      </aside>

      <main className="flex-1 min-w-0 px-4 py-5 sm:px-8 sm:py-8 max-w-[1180px] w-full mx-auto">
        <Outlet />
      </main>

      <ToastContainer />
    </div>
  );
}
