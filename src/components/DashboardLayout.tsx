import { ReactNode, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChartColumn,
  ChevronDown,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Tv,
  UserCircle2,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";

interface DashboardLayoutProps {
  title: string;
  description: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  children: ReactNode;
}

const primaryNav = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Live TV", href: "/", icon: Tv },
  { label: "Profile", href: "/profile", icon: UserCircle2 },
];

const secondaryNav = [{ label: "Analytics", href: "/dashboard", icon: ChartColumn }];

const SidebarContent = () => {
  const location = useLocation();

  const sectionLinkClassName = ({ isActive }: { isActive: boolean }) =>
    cn(
      "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
      isActive
        ? "bg-slate-950 text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)] dark:bg-primary dark:text-primary-foreground"
        : "text-slate-600 hover:bg-white/80 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white",
    );

  return (
    <div className="flex h-full flex-col bg-white/70 px-4 py-5 backdrop-blur-xl dark:bg-card/80">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-primary dark:text-primary-foreground">
          <Tv className="h-5 w-5" />
        </div>
        <div>
          <p className="font-heading text-lg font-bold tracking-tight text-slate-950 dark:text-white">Reet TV</p>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Control Center</p>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <p className="px-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Workspace</p>
          <nav className="mt-3 space-y-1.5">
            {primaryNav.map(({ label, href, icon: Icon }) => (
              <NavLink key={label} to={href} end={href === "/dashboard"} className={sectionLinkClassName}>
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div>
          <p className="px-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Insights</p>
          <nav className="mt-3 space-y-1.5">
            {secondaryNav.map(({ label, href, icon: Icon }) => (
              <NavLink key={label} to={href} className={sectionLinkClassName}>
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <div className="mt-auto rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-950 to-slate-800 p-4 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] dark:border-white/10">
        <p className="text-sm font-semibold">Operations healthy</p>
        <p className="mt-1 text-sm text-slate-300">Streams, alerts, and playback metrics are in one place.</p>
        <p className="mt-4 text-xs uppercase tracking-[0.22em] text-emerald-300">
          {location.pathname === "/dashboard" ? "Dashboard active" : "Section available"}
        </p>
      </div>
    </div>
  );
};

export const DashboardLayout = ({
  title,
  description,
  searchValue,
  onSearchChange,
  children,
}: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  const initials = useMemo(() => {
    const seed = user?.username || user?.email || "User";
    return seed
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [user?.email, user?.username]);

  return (
    <div className="dashboard-shell min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.14),_transparent_18%),linear-gradient(180deg,_rgba(248,250,252,0.96),_rgba(241,245,249,0.88))] text-foreground dark:bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_18%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.08),_transparent_14%),linear-gradient(180deg,_hsl(222_47%_11%),_hsl(222_44%_9%))]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 md:px-6 xl:px-8">
        <aside className="dashboard-panel sticky top-4 hidden h-[calc(100vh-2rem)] w-[280px] overflow-hidden rounded-[32px] border border-white/60 shadow-[0_30px_100px_rgba(15,23,42,0.12)] lg:block dark:border-white/10">
          <SidebarContent />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="dashboard-panel sticky top-4 z-20 mb-6 rounded-[28px] border border-white/60 bg-white/75 px-4 py-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl md:px-6 dark:border-white/10 dark:bg-card/85">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-2xl lg:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="border-white/10 bg-white/95 p-0 dark:bg-card">
                    <SheetHeader className="px-6 pt-6">
                      <SheetTitle>Navigation</SheetTitle>
                      <SheetDescription>Move between dashboard sections and tools.</SheetDescription>
                    </SheetHeader>
                    <div className="mt-4 h-[calc(100%-5rem)]">
                      <SidebarContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-400">Operations Dashboard</p>
                  <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{title}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative w-full md:w-[320px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={searchValue}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Search widgets, activity, alerts"
                    className="h-11 rounded-2xl border-slate-200/80 bg-white pl-10 dark:border-white/10 dark:bg-background/60"
                  />
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="relative rounded-2xl border-slate-200/80 bg-white dark:border-white/10 dark:bg-background/60"
                  onClick={() => navigate("/dashboard")}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 ? <span className="absolute right-2 top-2 inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" /> : null}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-11 justify-between rounded-2xl border-slate-200/80 bg-white px-3 dark:border-white/10 dark:bg-background/60">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.avatar} alt={user?.username || "User"} />
                          <AvatarFallback className="bg-slate-900 text-xs font-semibold text-white dark:bg-primary">
                            {initials || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <p className="max-w-[110px] truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {user?.username || "Operator"}
                          </p>
                          <p className="max-w-[110px] truncate text-xs text-slate-500 dark:text-slate-400">
                            {user?.email || "dashboard@reet.tv"}
                          </p>
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl border-white/60 bg-white/95 p-2 shadow-xl dark:border-white/10 dark:bg-card/95">
                    <DropdownMenuLabel className="px-3 py-2">
                      <p className="text-sm font-semibold">{user?.username || "Operator"}</p>
                      <p className="text-xs font-normal text-muted-foreground">{user?.email || "dashboard@reet.tv"}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="rounded-xl px-3 py-2" onClick={() => navigate("/profile")}>
                      <UserCircle2 className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl px-3 py-2" onClick={() => navigate("/")}>
                      <Tv className="mr-2 h-4 w-4" />
                      Open Live TV
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl px-3 py-2" onClick={() => navigate("/profile")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 pb-6">{children}</main>
        </div>
      </div>
    </div>
  );
};
