'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Send, 
  Download,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

type InviteStatusApi = 'pending' | 'accepted' | 'declined' | 'attending' | 'not-attending' | null;

interface InviteApiResponse {
  id: string;
  guestName: string;
  email: string;
  rsvpStatus: InviteStatusApi;
  guestCount?: number | string | null;
  sentAt?: string;
  viewedAt?: string;
  rsvpAt?: string;
  message?: string;
  event: Event;
}

const normalizeRsvpStatus = (status: InviteStatusApi): 'pending' | 'accepted' | 'declined' => {
  if (status === 'attending' || status === 'accepted') {
    return 'accepted';
  }

  if (status === 'not-attending' || status === 'declined') {
    return 'declined';
  }

  return 'pending';
};

const formatStatusLabel = (status: 'pending' | 'accepted' | 'declined'): string => {
  switch (status) {
    case 'accepted':
      return 'Attending';
    case 'declined':
      return 'Not Attending';
    default:
      return 'Pending';
  }
};

interface Event {
  id: string;
  title: string;
  date: string;
  type: string;
  hashtag?: string;
}

interface Invite {
  id: string;
  guestName: string;
  email: string;
  rsvpStatus: 'pending' | 'accepted' | 'declined';
  rawStatus?: InviteStatusApi;
  guestCount?: number | null;
  sentAt?: string;
  viewedAt?: string;
  rsvpAt?: string;
  message?: string;
  event: Event;
}

interface RSVPStats {
  total: number;
  pending: number;
  accepted: number;
  declined: number;
  responseRate: number;
  totalGuests: number;
}

export default function RSVPManagePage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [filteredInvites, setFilteredInvites] = useState<Invite[]>([]);
  const [stats, setStats] = useState<RSVPStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    declined: 0,
    responseRate: 0,
    totalGuests: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [events, setEvents] = useState<Event[]>([]);

  const filterInvites = useCallback(() => {
    let filtered = invites;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(invite => 
        invite.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invite.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((invite) => {
        if (statusFilter === 'pending') {
          return invite.rsvpStatus === 'pending';
        }

        return invite.rsvpStatus === statusFilter;
      });
    }

    // Event filter
    if (eventFilter !== 'all') {
      filtered = filtered.filter(invite => invite.event.id === eventFilter);
    }

    setFilteredInvites(filtered);
  }, [invites, searchTerm, statusFilter, eventFilter]);

  useEffect(() => {
    fetchInvites();
    fetchEvents();
  }, []);

  useEffect(() => {
    filterInvites();
  }, [filterInvites]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/invites');
      if (!response.ok) throw new Error('Failed to fetch invites');
      
      const data = await response.json();
      const invitesData = Array.isArray(data.invites) ? data.invites : [];

      const normalizedInvites: Invite[] = invitesData.map((invite: InviteApiResponse) => {
        const normalizedStatus = normalizeRsvpStatus((invite?.rsvpStatus ?? null) as InviteStatusApi);
        let additionalGuests = 0;

        if (typeof invite?.guestCount === 'number') {
          additionalGuests = invite.guestCount;
        } else if (typeof invite?.guestCount === 'string') {
          const parsed = Number(invite.guestCount);
          additionalGuests = Number.isFinite(parsed) ? parsed : 0;
        }

        additionalGuests = Math.max(0, Number.isNaN(additionalGuests) ? 0 : additionalGuests);

        return {
          ...invite,
          rawStatus: (invite?.rsvpStatus ?? null) as InviteStatusApi,
          rsvpStatus: normalizedStatus,
          guestCount: additionalGuests,
        } as Invite;
      });

      setInvites(normalizedInvites);

      // Calculate stats
      const total = normalizedInvites.length;
      const pending = normalizedInvites.filter((invite) => invite.rsvpStatus === 'pending').length;
      const accepted = normalizedInvites.filter((invite) => invite.rsvpStatus === 'accepted').length;
      const declined = normalizedInvites.filter((invite) => invite.rsvpStatus === 'declined').length;
      const responseRate = total > 0 ? Math.round(((accepted + declined) / total) * 100) : 0;
      const totalGuests = normalizedInvites.reduce((sum, invite) => {
        if (invite.rsvpStatus !== 'accepted') {
          return sum;
        }

        return sum + 1 + (invite.guestCount ?? 0);
      }, 0);

      setStats({
        total,
        pending,
        accepted,
        declined,
        responseRate,
        totalGuests,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch RSVPs');
      toast.error('Failed to load RSVP data');
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/invites/${inviteId}/reminder`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to send reminder');
      
      toast.success('Reminder sent successfully');
      fetchInvites(); // Refresh data
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Failed to send reminder');
    }
  };

  const exportGuestList = () => {
    const csvContent = [
      ['Name', 'Email', 'Status', 'Guest Count', 'RSVP Date', 'Event', 'Message'],
      ...filteredInvites.map((invite) => {
        const partySize = invite.rsvpStatus === 'accepted' ? 1 + (invite.guestCount ?? 0) : 0;

        return [
          invite.guestName,
          invite.email,
          formatStatusLabel(invite.rsvpStatus),
          partySize.toString(),
          invite.rsvpAt ? format(new Date(invite.rsvpAt), 'MMM dd, yyyy') : '',
          invite.event.title,
          invite.message || '',
        ];
      }),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rsvp-list-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: 'pending' | 'accepted' | 'declined') => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Attending</Badge>;
      case 'declined':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Not Attending</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-royal-navy font-playfair-display">RSVP Management</h1>
            <p className="text-slate-gray">Loading RSVP data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="wedding-elevated-card animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-royal-navy font-playfair-display">RSVP Management</h1>
            <p className="text-slate-gray">Failed to load RSVP data</p>
          </div>
        </div>
        <Card className="wedding-elevated-card">
          <CardContent className="p-6">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchInvites} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="accent-bar-gold">
            <h1 className="text-3xl md:text-4xl font-bold text-royal-navy font-playfair-display">
              RSVP Management
            </h1>
          </div>
          <p className="text-slate-gray font-inter">
            Track and manage guest responses for your events
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={exportGuestList}
            className="btn-outline-gold font-inter font-medium rounded-lg"
          >
            <Download className="mr-2 h-4 w-4" />
            Export List
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="wedding-elevated-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-slate-gray flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Total Invites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-royal-navy">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="wedding-elevated-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-slate-gray flex items-center">
              <UserCheck className="mr-2 h-5 w-5" />
              Attending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
            <p className="text-sm text-slate-gray">{stats.totalGuests} total guests</p>
          </CardContent>
        </Card>

        <Card className="wedding-elevated-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-slate-gray flex items-center">
              <UserX className="mr-2 h-5 w-5" />
              Not Attending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{stats.declined}</p>
          </CardContent>
        </Card>

        <Card className="wedding-elevated-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-slate-gray flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Response Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-royal-navy">{stats.responseRate}%</p>
            <Progress value={stats.responseRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="wedding-elevated-card">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-royal-navy">Filter RSVPs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-gray">Search Guests</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-gray" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 wedding-input"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-gray">RSVP Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="wedding-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Attending</SelectItem>
                  <SelectItem value="declined">Not Attending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-gray">Event</label>
              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger className="wedding-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Events</SelectItem>
                  {events.map(event => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RSVP List */}
      <Card className="wedding-elevated-card">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-royal-navy">
            Guest Responses ({filteredInvites.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredInvites.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-slate-gray mx-auto mb-4" />
                  <p className="text-slate-gray">No invites match your current filters</p>
                </div>
              ) : (
                filteredInvites.map((invite) => (
                  <div key={invite.id} className="border border-warm-beige rounded-lg p-4 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-royal-navy">{invite.guestName}</h3>
                          {getStatusBadge(invite.rsvpStatus)}
                        </div>
                        <p className="text-sm text-slate-gray">{invite.email}</p>
                        <p className="text-sm text-slate-gray">
                          {invite.event.title} • {format(new Date(invite.event.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {invite.rsvpStatus === 'accepted' && (invite.guestCount ?? 0) > 0 && (
                          <Badge variant="outline" className="text-royal-navy border-royal-navy">
                            Bringing {invite.guestCount} guest{(invite.guestCount ?? 0) > 1 ? 's' : ''}
                          </Badge>
                        )}
                        {invite.rsvpStatus === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => sendReminder(invite.id)}
                            className="btn-outline-gold font-inter text-xs"
                          >
                            <Send className="mr-1 h-3 w-3" />
                            Remind
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {invite.message && (
                      <div className="bg-warm-beige/20 rounded p-3">
                        <p className="text-sm font-medium text-royal-navy mb-1">Message:</p>
                        <p className="text-sm text-slate-gray">{invite.message}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-xs text-slate-gray">
                      <span>
                        Invited: {invite.sentAt ? format(new Date(invite.sentAt), 'MMM dd') : 'Not sent'}
                      </span>
                      {invite.viewedAt && (
                        <span>Viewed: {format(new Date(invite.viewedAt), 'MMM dd')}</span>
                      )}
                      {invite.rsvpAt && (
                        <span>Responded: {format(new Date(invite.rsvpAt), 'MMM dd')}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}