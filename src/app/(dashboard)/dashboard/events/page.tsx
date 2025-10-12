"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, MapPin, Users, Search, Filter, Trash2, Edit2, Send } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description?: string;
  type?: string;
  guests?: { id: string; name: string; email: string; rsvpStatus: string }[];
  schedule?: { id: string; title: string; time: string }[];
}

type EventType = 'all' | 'wedding' | 'reception' | 'shower' | 'other';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventType, setEventType] = useState<EventType>('all');
  const [sendingStatus, setSendingStatus] = useState<{ [key: string]: string }>({});

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events');
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch events.');
        return;
      }

      setEvents(data.events);
      setError(null); // Clear any previous errors
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filterEvents = () => {
      let filtered = [...events];

      if (searchTerm) {
        filtered = filtered.filter(
          event =>
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (eventType !== 'all') {
        filtered = filtered.filter(event => event.type === eventType);
      }

      setFilteredEvents(filtered);
    };

    filterEvents();
  }, [events, searchTerm, eventType]);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Refetch events when page becomes visible (e.g., coming back from create/edit)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchEvents();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleDelete = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete event.');
        return;
      }

      toast.success('Event deleted successfully');
      await fetchEvents();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during deletion.';
      toast.error(errorMessage);
    }
  };

  const handleSendInvitations = async (eventId: string) => {
    setSendingStatus((prev) => ({ ...prev, [eventId]: 'sending' }));
    try {
      const response = await fetch(`/api/events/${eventId}/invites/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl: process.env.NEXT_PUBLIC_APP_URL }),
      });

      if (!response.ok) {
        setSendingStatus((prev) => ({ ...prev, [eventId]: 'failed' }));
        
        // Try to get error message from response
        let errorMessage = 'Failed to send invitations';
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }
        
        // Show specific error messages based on status code
        if (response.status === 401) {
          errorMessage = 'You are not authorized to send invitations. Please sign in again.';
        } else if (response.status === 404) {
          errorMessage = 'Event not found or you do not have permission to access it.';
        } else if (response.status === 400 && errorMessage.includes('No guests')) {
          errorMessage = 'Please add guests to this event before sending invitations.';
        }
        
        toast.error(errorMessage);
        return;
      }

      await response.json(); // Consume the response
      setSendingStatus((prev) => ({ ...prev, [eventId]: 'sent' }));
      toast.success('Invitations sent successfully!');
      await fetchEvents();
    } catch (err: unknown) {
      setSendingStatus((prev) => ({ ...prev, [eventId]: 'failed' }));
      console.error('Network error sending invitations:', err);
      const errorMessage = err instanceof Error ? err.message : 'Network error occurred. Please check your connection and try again.';
      toast.error(errorMessage);
    }
  };

  

  if (error && !loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto shadow-stats-card bg-destructive/10">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-destructive font-playfair-display">Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 font-inter">
          <p className="text-lg text-destructive">{error}</p>
          <Button variant="outline" onClick={fetchEvents} className="border-destructive text-destructive hover:bg-destructive/10">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="section-frame space-y-10 lg:space-y-14 animate-fade-up-soft">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="accent-bar-gold">
            <h1 className="text-4xl md:text-5xl font-bold text-royal-navy font-playfair-display leading-tight tracking-tight">Your Events</h1>
          </div>
          <p className="text-slate-gray font-inter text-base md:text-lg">Manage all your celebration events in one place</p>
        </div>
        <div className="flex gap-3 pt-2">
          <Link href="/dashboard/events/templates">
            <Button variant="outline" className="btn-outline-gold font-inter font-medium rounded-lg px-5 py-2.5">
              <Calendar className="mr-2 h-4 w-4" />
              Templates
            </Button>
          </Link>
          <Link href="/dashboard/events/new">
            <Button className="btn-gradient-primary font-inter font-semibold tracking-wide rounded-lg px-6 py-2.5">
              <Calendar className="mr-2 h-4 w-4" />
              Create New Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-gray h-4 w-4" />
          <Input placeholder="Search events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 input-elevated h-12 rounded-lg" />
        </div>
        <Select value={eventType} onValueChange={(value) => setEventType(value as EventType)}>
          <SelectTrigger className="w-[180px] input-elevated h-12 rounded-lg font-inter text-sm">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="wedding">Wedding</SelectItem>
            <SelectItem value="reception">Reception</SelectItem>
            <SelectItem value="shower">Bridal Shower</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="col-span-1 wedding-elevated-card">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-28" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="w-full text-center wedding-elevated-card">
          <CardContent className="p-12">
            <div className="flex flex-col items-center space-y-4">
              <Calendar className="h-12 w-12 text-slate-gray" />
              <CardDescription className="text-lg text-slate-gray">{events.length === 0 ? "No events created yet. Start by creating one!" : "No events match your search criteria."}</CardDescription>
              {events.length === 0 && (
                <Link href="/dashboard/events/new">
                  <Button className="btn-gradient-primary font-medium mt-4 px-8 py-3">Create Your First Event</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="col-span-1 wedding-elevated-card group transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="text-xl font-bold text-royal-navy font-playfair-display">{event.title}</CardTitle>
                    <Badge variant="outline" className="text-royal-navy border-royal-navy/40 bg-gold-sand/10 backdrop-blur-sm">{event.type || 'Event'}</Badge>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive" aria-label="Delete event">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="wedding-elevated-card border-gold-sand/30">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-playfair-display text-royal-navy">Delete Event</AlertDialogTitle>
                        <AlertDialogDescription className="font-inter">This will permanently remove the event and its associated data. Guests and invitations will not receive further updates.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="btn-outline-gold">Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90 text-white font-inter" onClick={() => handleDelete(event.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 font-inter">
                  <div className="flex items-center text-slate-gray">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{format(new Date(event.date), 'PPP')}</span>
                  </div>
                  <div className="flex items-center text-slate-gray">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{event.location}</span>
                  </div>
                  {event.guests && (
                    <div className="flex items-center text-slate-gray">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{event.guests.length} Guests</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <Link href={`/dashboard/events/${event.id}/edit`}>
                    <Button variant="outline" size="sm" className="btn-outline-gold font-inter text-xs px-4 py-2 h-auto">
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  {(!event.guests || event.guests.length === 0) ? (
                    <Link href={`/dashboard/guests?eventId=${event.id}`}>
                      <Button variant="outline" size="sm" className="btn-outline-gold font-inter font-medium text-xs px-5 py-2 h-auto">
                        <Users className="mr-2 h-4 w-4" />
                        Add Guests
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => handleSendInvitations(event.id)} 
                      disabled={sendingStatus[event.id] === 'sending'} 
                      className="btn-gradient-primary font-inter font-medium text-xs px-5 py-2 h-auto disabled:opacity-70"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {sendingStatus[event.id] === 'sending' ? 'Sending...' : 'Send Invites'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
