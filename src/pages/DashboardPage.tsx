import { useChannelStore } from '@/store/channelStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const DashboardPage = () => {
  const { watchHistory } = useChannelStore();

  // Calculate stats
  const totalMinutesWatched = watchHistory.reduce((total, item) => total + (item.duration / 60), 0);
  const avgSessionMinutes = watchHistory.length > 0 ? totalMinutesWatched / watchHistory.length : 0;

  // Most watched channels
  const channelCounts = watchHistory.reduce(
    (acc, item) => {
      acc[item.channelName] = (acc[item.channelName] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const topChannels = Object.entries(channelCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      value: count,
    }));

  // Watch time by day (last 7 days)
  const lastSevenDays = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }).reverse();

  const watchTimeByDay = lastSevenDays.map((day) => ({
    day,
    minutes: Math.floor(Math.random() * 120) + 30, // Mock data
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Your personal viewing analytics</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Minutes Watched</p>
                <p className="text-3xl font-bold text-primary mt-2">{Math.round(totalMinutesWatched)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Channels Watched</p>
                <p className="text-3xl font-bold text-primary mt-2">{Object.keys(channelCounts).length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Sessions</p>
                <p className="text-3xl font-bold text-primary mt-2">{watchHistory.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Avg Session</p>
                <p className="text-3xl font-bold text-primary mt-2">{Math.round(avgSessionMinutes)}m</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Watched Channels */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Top 5 Channels</CardTitle>
              <CardDescription>Your most watched channels</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topChannels}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(10,10,10,0.9)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Watch Time Trend */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Watch Time (Last 7 Days)</CardTitle>
              <CardDescription>Daily watch time trend</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={watchTimeByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(10,10,10,0.9)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="minutes" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Channel Distribution Pie Chart */}
          {topChannels.length > 0 && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Viewing Distribution</CardTitle>
                <CardDescription>Distribution across top channels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={topChannels}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {topChannels.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(10,10,10,0.9)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
