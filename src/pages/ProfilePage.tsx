import { useAuthStore } from '@/store/authStore';
import { useChannelStore } from '@/store/channelStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { User, Mail, Settings, Tv } from 'lucide-react';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { favorites, watchHistory } = useChannelStore();
  const [username, setUsername] = useState(user?.username || '');

  const watchTimeMinutes = watchHistory.reduce((total, item) => total + (item.duration / 60), 0);
  const avgSessionMinutes = watchHistory.length > 0 ? watchTimeMinutes / watchHistory.length : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1 border-primary/20">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">{user?.username}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                  <Mail className="w-3 h-3" />
                  {user?.email}
                </p>
              </div>

              <Button variant="outline" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>

              <Button variant="default" className="w-full" onClick={() => navigate('/')}>
                <Tv className="w-4 h-4 mr-2" />
                Open Live TV
              </Button>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {watchHistory.length}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Watched Channels</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{favorites.size}</p>
                    <p className="text-sm text-muted-foreground mt-1">Favorites</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {Math.round(watchTimeMinutes)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Minutes Watched</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {Math.round(avgSessionMinutes)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Avg Session (min)</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Account Settings */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Username</label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input value={user?.email} disabled className="mt-2" />
                </div>
                <Button variant="outline" className="w-full">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
