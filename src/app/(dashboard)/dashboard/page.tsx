'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

import { Activity, Bell, Calendar as CalendarIcon, ChevronRight, Clock, Users, CheckCircle, XCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, isValid } from 'date-fns';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  type: string;
  guests?: { id: string }[];
}

interface DashboardStats {
  totalEvents: number;
  totalInvites: number;
  totalGuests: number;
  rsvpStats: {
    pending: number;
    accepted: number;
    declined: number;
  };
  responseRate: number;
}

interface RecentRSVP {
  guestName: string;
  rsvpStatus: string;
  rsvpAt: string;
  event: {
    title: string;
  };
}

interface RecentReminder {
  type: string;
  sentAt: string;
  invite: {
    guestName: string;
  };
  event: {
    title: string;
  };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRSVPs, setRecentRSVPs] = useState<RecentRSVP[]>([]);
  const [recentReminders, setRecentReminders] = useState<RecentReminder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('🚀 Dashboard: Starting data fetch...');
        
        // Fetch recent events for display
        const eventsResponse = await fetch('/api/events?limit=3');
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          console.log('📅 Dashboard: Recent events fetched:', eventsData.events);
          eventsData.events?.forEach((event: Event, index: number) => {
            console.log(`📅 Event ${index + 1}:`, {
              id: event.id,
              title: event.title,
              date: event.date,
              dateType: typeof event.date,
              isValidDate: event.date ? !isNaN(new Date(event.date).getTime()) : false,
              parsedDate: event.date ? new Date(event.date) : null
            });
          });
          setEvents(eventsData.events || []);
        }



        // Fetch dashboard statistics
        const statsResponse = await fetch('/api/dashboard/stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log('📊 Dashboard: Stats fetched:', statsData.stats);
          setStats(statsData.stats);
          setRecentRSVPs(statsData.notifications.recentRSVPs || []);
          setRecentReminders(statsData.notifications.recentReminders || []);
        }
        
        console.log('✅ Dashboard: Data fetch completed successfully');
      } catch (err) {
        console.error('❌ Dashboard: Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8 lg:space-y-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
          <div className="space-y-2 min-w-0">
            <div className="accent-bar-gold">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-royal-navy font-playfair-display leading-tight tracking-tight">
                Celebration Dashboard
              </h1>
            </div>
            <p className="text-slate-gray font-inter text-sm sm:text-base md:text-lg">Loading your dashboard...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="wedding-elevated-card min-w-0">
              <CardContent className="p-4 sm:p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
  <div className="space-y-6 sm:space-y-8 lg:space-y-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
        <div className="space-y-2 min-w-0">
          <div className="accent-bar-gold">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-royal-navy font-playfair-display leading-tight tracking-tight">
              Celebration Dashboard
            </h1>
          </div>
          <p className="text-slate-gray font-inter text-sm sm:text-base md:text-lg">
            {session?.user?.name ? `Welcome back, ${session.user.name}!` : session?.user?.email ? `Welcome back, ${session.user.email}!` : 'Welcome to your dashboard!'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2 shrink-0">
          <Link href="/dashboard/rsvp" className="w-full sm:w-auto">
            <Button className="btn-outline-gold font-inter font-medium rounded-lg px-4 sm:px-5 py-2.5 w-full sm:w-auto text-sm">
              <Users className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Manage RSVPs</span>
              <span className="sm:hidden">RSVPs</span>
            </Button>
          </Link>
          <Link href="/dashboard/events/new" className="w-full sm:w-auto">
            <Button className="btn-gradient-primary font-inter font-semibold tracking-wide rounded-lg px-4 sm:px-6 py-2.5 w-full sm:w-auto text-sm">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Create Event</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="wedding-elevated-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-pearl-beige/30 min-w-0">
          <CardHeader className="pb-3 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-semibold text-slate-gray uppercase tracking-wide truncate">Total RSVPs</CardTitle>
              <div className="p-1.5 sm:p-2 bg-royal-navy/10 rounded-lg shrink-0">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-royal-navy" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-4 sm:px-6">
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <p className="text-2xl sm:text-3xl font-bold text-royal-navy">{stats?.totalGuests || 0}</p>
                <p className="text-xs sm:text-sm text-slate-gray">guests</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-gray">Response Rate</span>
                  <span className="font-medium text-royal-navy">{stats?.responseRate || 0}%</span>
                </div>
                <Progress 
                  value={stats?.responseRate || 0} 
                  className="h-2 bg-pearl-beige"
                />
              </div>
            </div>
          </CardContent>
        </Card>

  <Card className="wedding-elevated-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gold-foil/5 min-w-0">
          <CardHeader className="pb-3 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-semibold text-slate-gray uppercase tracking-wide truncate">RSVP Status</CardTitle>
              <div className="p-1.5 sm:p-2 bg-gold-foil/10 rounded-lg shrink-0">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gold-foil" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-4 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-royal-navy">{stats?.rsvpStats.pending || 0}</p>
                <p className="text-xs sm:text-sm text-slate-gray">Awaiting response</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-semibold text-green-700 uppercase truncate">Accepted</span>
                  </div>
                  <p className="text-sm sm:text-lg font-bold text-green-800">{stats?.rsvpStats.accepted || 0}</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <XCircle className="h-3 w-3 text-red-600" />
                    <span className="text-xs font-semibold text-red-700 uppercase truncate">Declined</span>
                  </div>
                  <p className="text-sm sm:text-lg font-bold text-red-800">{stats?.rsvpStats.declined || 0}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>



  <Card className="wedding-elevated-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50 min-w-0">
          <CardHeader className="pb-3 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-semibold text-slate-gray uppercase tracking-wide">Recent Activity</CardTitle>
              <div className="p-1.5 sm:p-2 bg-slate-100 rounded-lg shrink-0">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-4 sm:px-6">
            <ScrollArea className="h-[180px] sm:h-[200px]">
              <div className="space-y-2 sm:space-y-3">
                {recentRSVPs.length === 0 && recentReminders.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-gray">No recent activity</p>
                  </div>
                ) : (
                  <>
                    {recentRSVPs.slice(0, 3).map((rsvp, index) => (
                      <div key={`rsvp-${index}`} className="p-3 rounded-lg bg-white border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 rounded-full shrink-0" style={{
                            backgroundColor: rsvp.rsvpStatus === 'accepted' ? '#ecfdf5' : rsvp.rsvpStatus === 'declined' ? '#fef2f2' : '#fffbeb'
                          }}>
                            {rsvp.rsvpStatus === 'accepted' ? (
                              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                            ) : rsvp.rsvpStatus === 'declined' ? (
                              <XCircle className="h-3.5 w-3.5 text-red-600" />
                            ) : (
                              <Clock className="h-3.5 w-3.5 text-amber-600" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-royal-navy">{rsvp.guestName}</p>
                            <p className="text-xs text-slate-gray">
                              {rsvp.rsvpStatus === 'accepted' ? 'Accepted invitation for' : rsvp.rsvpStatus === 'declined' ? 'Declined invitation for' : 'Responded to'} {rsvp.event.title}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {rsvp.rsvpAt ? format(new Date(rsvp.rsvpAt), 'MMM d, h:mm a') : 'Recently'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {recentReminders.slice(0, 2).map((reminder, index) => (
                      <div key={`reminder-${index}`} className="p-3 rounded-lg bg-white border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 rounded-full bg-blue-50 shrink-0">
                            <Bell className="h-3.5 w-3.5 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-royal-navy">Reminder sent</p>
                            <p className="text-xs text-slate-gray">
                              To {reminder.invite.guestName} for {reminder.event.title}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {format(new Date(reminder.sentAt), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Events Overview */}
      <Card className="wedding-elevated-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-royal-navy/3">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-royal-navy/5 to-gold-foil/5 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-royal-navy/10 rounded-lg shrink-0">
                <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-royal-navy" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-xl sm:text-2xl font-bold text-royal-navy font-playfair-display truncate">
                  My Events
                </CardTitle>
                <CardDescription className="text-slate-gray font-inter text-sm hidden sm:block">
                  Manage and track all your wedding events
                </CardDescription>
              </div>
            </div>
            <Link href="/dashboard/events" className="shrink-0">
              <Button variant="outline" size="sm" className="btn-outline-gold font-inter text-xs px-3 sm:px-4 py-2 h-auto hover:bg-gold-foil/10 transition-colors w-full sm:w-auto">
                View All
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {error && (
              <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className="group p-3 sm:p-4 rounded-xl bg-white border border-gray-100 hover:border-gold-foil/30 hover:shadow-md transition-all duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <h3 className="font-semibold text-royal-navy text-base sm:text-lg group-hover:text-royal-navy/80 transition-colors truncate">{event.title}</h3>
                        <Badge variant="outline" className="text-xs px-2 py-1 bg-royal-navy/5 text-royal-navy border-royal-navy/20 w-fit">
                          {event.type || 'Event'}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-gray">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                          <span className="truncate">{isValid(new Date(event.date)) ? format(new Date(event.date), 'PPP') : 'Date TBD'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                          <span>{event.guests?.length || 0} guests</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-3">
                      <Badge 
                        variant="secondary"
                        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-colors text-xs"
                      >
                        Upcoming
                      </Badge>
                      <Button variant="ghost" size="icon" asChild className="hover:bg-gold-foil/10 transition-colors h-8 w-8 shrink-0">
                        <Link href={`/dashboard/events/${event.id}/edit`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 sm:py-12">
                <CalendarIcon className="h-10 w-10 sm:h-12 sm:w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-gray text-base sm:text-lg font-medium mb-2">No events yet</p>
                <p className="text-slate-400 text-sm mb-4">Create your first event to get started</p>
                <Link href="/dashboard/events/new">
                  <Button className="btn-gradient-primary text-sm">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
