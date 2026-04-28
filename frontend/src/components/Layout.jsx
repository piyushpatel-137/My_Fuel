import { Bike, Fuel, Gauge, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/bikes", label: "Bikes", icon: Bike },
  { to: "/fuel", label: "Fuel", icon: Fuel }
];

const Layout = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-sky-100 bg-white/90 px-5 py-6 shadow-soft backdrop-blur transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-sky-600 text-white">
              <Fuel size={22} />
            </div>
            <div>
              <p className="text-lg font-bold">MyFuel</p>
              <p className="text-xs text-slate-500">Vehicle fuel tracker</p>
            </div>
          </div>
          <button className="icon-btn lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                    isActive ? "bg-sky-600 text-white shadow-sm" : "text-slate-600 hover:bg-sky-50 hover:text-sky-700"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-5 right-5">
          <div className="rounded-lg border border-sky-100 bg-sky-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{user?.firstName} {user?.lastName}</p>
            <p className="break-all text-xs text-slate-500">{user?.email}</p>
          </div>
          <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100" onClick={logout}>
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {open && <button className="fixed inset-0 z-30 bg-slate-950/20 lg:hidden" onClick={() => setOpen(false)} aria-label="Close overlay" />}

      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-sky-100 bg-white/85 px-4 py-4 backdrop-blur lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <button className="icon-btn lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div>
              <p className="text-sm text-slate-500">Welcome back</p>
              <h1 className="text-xl font-bold text-slate-950">{user?.username}</h1>
            </div>
            <div className="hidden rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 sm:block">
              Account verified
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;

