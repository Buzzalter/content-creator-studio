import { Routes, Route, Link, useLocation, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { Moon, Sun, ImageIcon } from "lucide-react";
import { applyTheme, getTheme, type Theme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { SaveModal } from "@/components/SaveModal";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import GeneratePage from "@/pages/Generate";
import EditPage from "@/pages/Edit";
import GalleryPage from "@/pages/Gallery";
import NotFound from "@/pages/NotFound";

const tabs = [
  { to: "/", label: "Generate", end: true },
  { to: "/edit", label: "Edit" },
  { to: "/gallery", label: "Gallery" },
] as const;

function TopNav() {
  const [theme, setTheme] = useState<Theme>("light");
  useLocation();

  useEffect(() => {
    const t = getTheme();
    setTheme(t);
    applyTheme(t);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-dashed border-border bg-surface text-muted-foreground"
            aria-label="Logo placeholder"
          >
            <ImageIcon className="h-4 w-4" />
          </div>
          <span className="text-base font-semibold tracking-tight">Post Generator</span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-border bg-surface p-1 sm:flex">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <nav className="flex items-center gap-1 border-t border-border/60 px-4 py-2 sm:hidden">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              cn(
                "flex-1 rounded-full px-3 py-1.5 text-center text-sm font-medium transition-all",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <Routes>
          <Route path="/" element={<GeneratePage />} />
          <Route path="/edit" element={<EditPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <SaveModal />
      <Toaster />
    </div>
  );
}
