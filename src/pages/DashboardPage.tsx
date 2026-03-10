import { useMemo, useState } from "react";
import {
  Activity,
  BellRing,
  Clock3,
  Heart,
  RadioTower,
  SearchX,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardWidget } from "@/components/DashboardWidget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useChannelStore } from "@/store/channelStore";
import { useNotificationStore } from "@/store/notificationStore";

const COLORS = ["#0f172a", "#0ea5e9", "#14b8a6", "#f59e0b", "#f43f5e"];

const formatRelativeTime = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

const getNotificationTone = (type: "success" | "error" | "warning" | "info") => {
  switch (type) {
    case "success":
      return "bg-emerald-500/10 text-emerald-700 ring-emerald-600/20 dark:text-emerald-300";
    case "error":
      return "bg-rose-500/10 text-rose-700 ring-rose-600/20 dark:text-rose-300";
    case "warning":
      return "bg-amber-500/10 text-amber-700 ring-amber-600/20 dark:text-amber-300";
    default:
      return "bg-sky-500/10 text-sky-700 ring-sky-600/20 dark:text-sky-300";
  }
};

type WidgetDefinition = {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  className?: string;
  render: () => JSX.Element;
};

export const DashboardPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { channels, favorites, watchHistory } = useChannelStore();
  const { notifications, unreadCount, markAllAsRead } = useNotificationStore();

  const totalMinutesWatched = useMemo(
    () => watchHistory.reduce((total, item) => total + item.duration / 60, 0),
    [watchHistory],
  );

  const averageSessionMinutes = watchHistory.length > 0 ? totalMinutesWatched / watchHistory.length : 0;

  const channelLookup = useMemo(
    () =>
      channels.reduce<Record<string, string>>((accumulator, channel) => {
        accumulator[channel.id] = channel.name;
        return accumulator;
      }, {}),
    [channels],
  );

  const channelCounts = useMemo(
    () =>
      watchHistory.reduce<Record<string, number>>((accumulator, item) => {
        const channelName = channelLookup[item.channelId] || `Channel ${item.channelId.slice(0, 6)}`;
        accumulator[channelName] = (accumulator[channelName] || 0) + 1;
        return accumulator;
      }, {}),
    [channelLookup, watchHistory],
  );

  const topChannels = useMemo(
    () =>
      Object.entries(channelCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 5)
        .map(([name, value]) => ({
          name: name.length > 18 ? `${name.slice(0, 18)}...` : name,
          value,
        })),
    [channelCounts],
  );

  const watchTimeByDay = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);
      return {
        key,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        minutes: 0,
      };
    });

    const aggregated = days.reduce<Record<string, number>>((accumulator, day) => {
      accumulator[day.key] = 0;
      return accumulator;
    }, {});

    watchHistory.forEach((item) => {
      const key = new Date(item.timestamp).toISOString().slice(0, 10);
      if (key in aggregated) {
        aggregated[key] += item.duration / 60;
      }
    });

    return days.map((day) => ({
      day: day.day,
      minutes: Math.round(aggregated[day.key]),
    }));
  }, [watchHistory]);

  const activityLogs = useMemo(
    () =>
      watchHistory.slice(0, 8).map((item, index) => {
        const channelName = channelLookup[item.channelId] || `Channel ${item.channelId.slice(0, 6)}`;
        return {
          id: `${item.channelId}-${item.timestamp}-${index}`,
          title: `Watched ${channelName}`,
          detail: `${Math.max(1, Math.round(item.duration / 60))} minute session recorded`,
          timestamp: item.timestamp,
        };
      }),
    [channelLookup, watchHistory],
  );

  const notificationFeed = notifications.length
    ? notifications.slice(0, 6)
    : [
        {
          id: "seed-sync",
          title: "Library sync complete",
          message: "Channel metadata and watch-history snapshots are up to date.",
          type: "success" as const,
          timestamp: Date.now() - 1000 * 60 * 18,
          read: false,
        },
        {
          id: "seed-attention",
          title: "New review recommended",
          message: "A few favorite channels have changed availability in the last 24 hours.",
          type: "warning" as const,
          timestamp: Date.now() - 1000 * 60 * 90,
          read: true,
        },
        {
          id: "seed-report",
          title: "Weekly analytics ready",
          message: "Your engagement report has been generated for the operations team.",
          type: "info" as const,
          timestamp: Date.now() - 1000 * 60 * 60 * 6,
          read: true,
        },
      ];

  const kpiCards = [
    {
      label: "Total watch time",
      value: `${Math.round(totalMinutesWatched)}m`,
      delta: `${watchHistory.length} tracked sessions`,
      icon: Clock3,
    },
    {
      label: "Tracked channels",
      value: `${Object.keys(channelCounts).length}`,
      delta: `${channels.length} channels indexed`,
      icon: RadioTower,
    },
    {
      label: "Favorites",
      value: `${favorites.size}`,
      delta: favorites.size > 0 ? "Pinned for fast access" : "No favorites pinned",
      icon: Heart,
    },
    {
      label: "Average session",
      value: `${Math.round(averageSessionMinutes)}m`,
      delta: "Based on recent playback activity",
      icon: TrendingUp,
    },
  ];

  const widgets: WidgetDefinition[] = [
    {
      id: "audience-trend",
      title: "Audience trend",
      description: "Daily watch-time movement over the last 7 days.",
      keywords: ["trend", "analytics", "watch time", "audience"],
      className: "lg:col-span-2",
      render: () => (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={watchTimeByDay}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148,163,184,0.18)" />
              <XAxis axisLine={false} tickLine={false} dataKey="day" stroke="rgba(100,116,139,0.8)" />
              <YAxis axisLine={false} tickLine={false} stroke="rgba(100,116,139,0.8)" />
              <Tooltip
                cursor={{ fill: "rgba(14,165,233,0.08)" }}
                contentStyle={{
                  borderRadius: "16px",
                  border: "1px solid rgba(148,163,184,0.25)",
                  backgroundColor: "rgba(255,255,255,0.96)",
                  boxShadow: "0 20px 50px rgba(15,23,42,0.12)",
                }}
              />
              <Bar dataKey="minutes" fill="#0ea5e9" radius={[12, 12, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ),
    },
    {
      id: "top-channels",
      title: "Top channels",
      description: "Most frequently watched channels from recent history.",
      keywords: ["channels", "distribution", "top", "favorites"],
      render: () =>
        topChannels.length > 0 ? (
          <div className="space-y-5">
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topChannels}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={72}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {topChannels.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid rgba(148,163,184,0.25)",
                      backgroundColor: "rgba(255,255,255,0.96)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {topChannels.map((channel, index) => (
                <div key={channel.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 dark:bg-white/5">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-sm font-medium">{channel.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{channel.value} plays</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-[280px] items-center justify-center rounded-3xl border border-dashed border-slate-200 text-sm text-muted-foreground dark:border-white/10">
            Watch history will populate this widget.
          </div>
        ),
    },
    {
      id: "activity-log",
      title: "Activity log",
      description: "Recent watch sessions and recorded playback events.",
      keywords: ["activity", "logs", "sessions", "history"],
      render: () =>
        activityLogs.length > 0 ? (
          <div className="space-y-3">
            {activityLogs.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-3 dark:border-white/10 dark:bg-white/5">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-300">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{entry.title}</p>
                  <p className="text-sm text-muted-foreground">{entry.detail}</p>
                </div>
                <span className="whitespace-nowrap text-xs font-medium text-slate-400">{formatRelativeTime(entry.timestamp)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-[280px] items-center justify-center rounded-3xl border border-dashed border-slate-200 text-sm text-muted-foreground dark:border-white/10">
            No recent activity has been captured yet.
          </div>
        ),
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Operational updates, warnings, and unread alerts.",
      keywords: ["notifications", "alerts", "warnings", "messages"],
      render: () => (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-white/5">
            <div>
              <p className="text-sm font-semibold">Unread queue</p>
              <p className="text-sm text-muted-foreground">{unreadCount} alert{unreadCount === 1 ? "" : "s"} pending review</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={markAllAsRead}>
              Mark all read
            </Button>
          </div>
          <div className="space-y-3">
            {notificationFeed.map((notification) => (
              <div key={notification.id} className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`rounded-full px-2.5 py-1 text-[11px] ring-1 ring-inset ${getNotificationTone(notification.type)}`}>
                        {notification.type}
                      </Badge>
                      {!notification.read ? <BellRing className="h-3.5 w-3.5 text-rose-500" /> : null}
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                  <span className="whitespace-nowrap text-xs font-medium text-slate-400">
                    {formatRelativeTime(notification.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const visibleWidgets = normalizedSearch
    ? widgets.filter((widget) =>
        [widget.title, widget.description, ...widget.keywords].some((value) => value.toLowerCase().includes(normalizedSearch)),
      )
    : widgets;

  return (
    <DashboardLayout
      title="Broadcast Operations"
      description="Track viewer engagement, system activity, and live notifications from one modular control surface."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map(({ label, value, delta, icon: Icon }) => (
          <div
            key={label}
            className="dashboard-panel rounded-[28px] border border-white/60 bg-white/75 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-card/85"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-slate-950 p-3 text-white dark:bg-primary dark:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <Sparkles className="h-4 w-4 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="mt-5 text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 font-heading text-3xl font-bold text-slate-950 dark:text-white">{value}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{delta}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        {visibleWidgets.length > 0 ? (
          visibleWidgets.map((widget) => (
            <DashboardWidget
              key={widget.id}
              title={widget.title}
              description={widget.description}
              className={widget.className}
              contentClassName="space-y-4"
            >
              {widget.render()}
            </DashboardWidget>
          ))
        ) : (
          <div className="dashboard-panel col-span-full flex min-h-[320px] flex-col items-center justify-center rounded-[32px] border border-dashed border-slate-300/80 bg-white/70 px-6 text-center dark:border-white/10 dark:bg-card/80">
            <SearchX className="h-10 w-10 text-slate-400" />
            <h2 className="mt-4 font-heading text-2xl font-bold text-slate-950 dark:text-white">No widgets match that search</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Try a broader term like analytics, channels, activity, or alerts to bring the matching modules back into view.
            </p>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default DashboardPage;
