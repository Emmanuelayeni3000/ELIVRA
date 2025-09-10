'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  Users, 
  UserCheck, 
  Clock, 
  TrendingUp, 
  Activity,
  BarChart3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AnalyticsData {
  overview: {
    totalEvents: number;
    totalInvites: number;
    totalAttending: number;
    totalNotAttending: number;
    totalPending: number;
    totalGuests: number;
    rsvpRate: number;
    responseRate: number;
  };
  trends: {
    rsvpTrend: Array<{
      date: string;
      attending: number;
      notAttending: number;
      total: number;
    }>;
    eventBreakdown: Array<{
      eventId: string;
      eventTitle: string;
      eventDate: string;
      totalInvites: number;
      attending: number;
      notAttending: number;
      pending: number;
      guestCount: number;
      rsvpRate: number;
    }>;
  };
  recentActivity: Array<{
    id: string;
    guestName: string;
    eventTitle: string;
    rsvpStatus: string;
    rsvpAt: string;
    guestCount: number;
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: string;
    location: string;
    inviteCount: number;
  }>;
  eventTypes: Array<{
    type: string;
    count: number;
  }>;
  timeframe: number;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?timeframe=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attending': return 'bg-green-500';
      case 'not-attending': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'attending': return 'Attending';
      case 'not-attending': return 'Not Attending';
      default: return 'Pending';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-royal-navy mb-2">Analytics Dashboard</h1>
          <p className="text-slate-gray">Track your event performance and guest engagement</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-gray/50" />
          <p className="text-slate-gray">Unable to load analytics data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-royal-navy mb-2">Analytics Dashboard</h1>
          <p className="text-slate-gray">Track your event performance and guest engagement</p>
        </div>
        <div className="mt-4 md:mt-0">
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-royal-navy focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-2 hover:border-gold-foil/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-gray">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-gold-foil" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-royal-navy">{analytics.overview.totalEvents}</div>
            <p className="text-xs text-slate-gray">
              Active events in your account
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-gold-foil/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-gray">Total Invites</CardTitle>
            <Users className="h-4 w-4 text-gold-foil" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-royal-navy">{analytics.overview.totalInvites}</div>
            <p className="text-xs text-slate-gray">
              Invitations sent across all events
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-gold-foil/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-gray">Attending</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.overview.totalAttending}</div>
            <p className="text-xs text-slate-gray">
              Total guests attending ({analytics.overview.totalGuests} people)
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-gold-foil/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-gray">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-gold-foil" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-royal-navy">{analytics.overview.responseRate}%</div>
            <p className="text-xs text-slate-gray">
              {analytics.overview.totalPending} pending responses
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-royal-navy">Event Performance</CardTitle>
            <CardDescription>RSVP breakdown by event</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.trends.eventBreakdown.map((event) => (
                <div
                  key={event.eventId}
                  className="p-4 border rounded-lg bg-pearl-beige/30 hover:bg-pearl-beige/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-royal-navy">{event.eventTitle}</h4>
                    <Badge variant="outline" className="text-gold-foil border-gold-foil">
                      {event.rsvpRate.toFixed(1)}% Response Rate
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-gray mb-3">
                    {new Date(event.eventDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-royal-navy">{event.totalInvites}</div>
                      <div className="text-xs text-slate-gray">Invited</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{event.attending}</div>
                      <div className="text-xs text-slate-gray">Attending</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-600">{event.notAttending}</div>
                      <div className="text-xs text-slate-gray">Not Attending</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-600">{event.pending}</div>
                      <div className="text-xs text-slate-gray">Pending</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-l-full" 
                      style={{ width: `${(event.attending / event.totalInvites) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity & Upcoming Events */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-royal-navy flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest RSVP responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(activity.rsvpStatus)}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-royal-navy truncate">
                        {activity.guestName}
                      </p>
                      <p className="text-xs text-slate-gray truncate">
                        {activity.eventTitle}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-royal-navy">
                        {getStatusText(activity.rsvpStatus)}
                      </p>
                      <p className="text-xs text-slate-gray">
                        {new Date(activity.rsvpAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {analytics.recentActivity.length === 0 && (
                  <p className="text-sm text-slate-gray text-center py-4">
                    No recent activity
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-royal-navy flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Your next events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.upcomingEvents.map((event) => (
                  <div key={event.id} className="p-3 border rounded-lg bg-pearl-beige/30">
                    <h4 className="font-medium text-royal-navy text-sm">{event.title}</h4>
                    <p className="text-xs text-slate-gray">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-slate-gray">{event.inviteCount} invites sent</p>
                  </div>
                ))}
                {analytics.upcomingEvents.length === 0 && (
                  <p className="text-sm text-slate-gray text-center py-4">
                    No upcoming events
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
