'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Activity, Bell, Calendar as CalendarIcon, ChevronRight, Mail, Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  date: string;
  guests?: { id: string }[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events?limit=3');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data.events || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    };

    fetchEvents();
  }, []);

  return (
  <div className="space-y-10 lg:space-y-14">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="accent-bar-gold">
            <h1 className="text-4xl md:text-5xl font-bold text-royal-navy font-playfair-display leading-tight tracking-tight">
              Celebration Dashboard
            </h1>
          </div>
          <p className="text-slate-gray font-inter text-base md:text-lg">
            {session?.user?.email ? `Welcome back, ${session.user.email}!` : 'Welcome to your dashboard!'}
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <Link href="/dashboard/rsvp">
            <Button className="btn-outline-gold font-inter font-medium rounded-lg px-5 py-2.5">
              <Users className="mr-2 h-4 w-4" />
              Manage RSVPs
            </Button>
          </Link>
          <Link href="/dashboard/events/new">
            <Button className="btn-gradient-primary font-inter font-semibold tracking-wide rounded-lg px-6 py-2.5">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="wedding-elevated-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-slate-gray">Total RSVPs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-4">
                <Progress value={89} />
              </div>
              <div>
                <p className="text-3xl font-bold text-royal-navy">24</p>
                <p className="text-sm text-slate-gray">89% response rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

  <Card className="wedding-elevated-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-slate-gray">Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-royal-navy">5</p>
                <p className="text-sm text-slate-gray">New messages</p>
              </div>
              <Badge variant="secondary" className="ml-auto">
                <Mail className="mr-1 h-4 w-4" />
                12 Total
              </Badge>
            </div>
          </CardContent>
        </Card>

  <Card className="wedding-elevated-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-slate-gray">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Calendar
                mode="single"
                selected={new Date()}
                className="rounded-md border w-full"
              />
            </div>
          </CardContent>
        </Card>

  <Card className="wedding-elevated-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-slate-gray">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[160px]">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Bell className="h-4 w-4 mr-2 text-gold-foil" />
                  <p className="text-sm text-slate-gray">New RSVP from John Doe</p>
                </div>
                <Separator />
                <div className="flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-gold-foil" />
                  <p className="text-sm text-slate-gray">Updated venue details</p>
                </div>
                <Separator />
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gold-foil" />
                  <p className="text-sm text-slate-gray">3 new messages received</p>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Events Overview */}
      <Card className="wedding-elevated-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-royal-navy font-playfair-display">
              My Events
            </CardTitle>
            <Link href="/dashboard/events">
              <Button variant="outline" size="sm" className="btn-outline-gold font-inter text-xs px-4 py-2 h-auto">
                View All
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <CardDescription className="text-slate-gray font-inter">
            Manage and track all your wedding events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && <p className="text-red-500">{error}</p>}
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 rounded-lg row-soft">
                  <div className="space-y-1">
                    <p className="font-medium text-royal-navy">{event.title}</p>
                    <p className="text-sm text-slate-gray">{format(new Date(event.date), 'PPP')}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-royal-navy border-royal-navy">
                      {event.guests?.length || 0} Guests
                    </Badge>
                    <Badge 
                      variant="secondary"
                      className="bg-royal-navy/10 text-royal-navy hover:bg-royal-navy/20"
                    >
                      Upcoming
                    </Badge>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/events/${event.id}/edit`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-gray">No events found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
