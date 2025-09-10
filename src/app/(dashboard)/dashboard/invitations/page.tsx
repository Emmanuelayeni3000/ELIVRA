'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Send, 
  Users, 
  Mail, 
  Filter,
  Search,
  Download,
  Bell
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
}

interface Guest {
  id: string;
  guestName: string;
  email: string;
  rsvpStatus?: string;
  sentAt?: string;
  viewedAt?: string;
}

// --- Added status normalization mapping ---
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Attending',
  declined: 'Declined',
  expired: 'Expired',
};
const normalizeStatus = (status?: string) => {
  if (!status) return undefined;
  const key = status.toLowerCase();
  return STATUS_LABELS[key] || status;
};

export default function BulkInvitationsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [customMessage, setCustomMessage] = useState('');
  const [reminderType, setReminderType] = useState('general');
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [sendingStatus, setSendingStatus] = useState<'idle' | 'sending' | 'completed'>('idle');
  // --- Added pagination state ---
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchGuests = useCallback(async () => {
    if (!selectedEvent) return;
    try {
      const params = new URLSearchParams({
        eventId: selectedEvent,
        limit: String(pageSize),
        page: String(page),
      });
      const response = await fetch(`/api/invites?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch guests');
      const data = await response.json();
      setGuests(data.invites || []);
      if (typeof data.total === 'number') setTotal(data.total); else setTotal(data.invites?.length || 0);
    } catch (error) {
      console.error('Error fetching guests:', error);
      toast.error('Failed to load guests');
    }
  }, [selectedEvent, page, pageSize]);

  useEffect(() => {
    if (selectedEvent) fetchGuests();
  }, [selectedEvent, fetchGuests]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    }
  };

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'sent' && guest.sentAt) ||
                         (filterStatus === 'pending' && !guest.sentAt) ||
                         (filterStatus === 'responded' && guest.rsvpStatus);
    return matchesSearch && matchesFilter;
  });

  // --- Disable logic extracted ---
  const disableBulkActions = loading || sendingStatus === 'sending' || selectedGuests.length === 0;

  const handleSelectAll = () => {
    if (selectedGuests.length === filteredGuests.length) {
      setSelectedGuests([]);
    } else {
      setSelectedGuests(filteredGuests.map(g => g.id));
    }
  };

  const handleSelectGuest = (guestId: string) => {
    setSelectedGuests(prev => prev.includes(guestId) ? prev.filter(id => id !== guestId) : [...prev, guestId]);
  };

  // --- Export handler ---
  const handleExport = async () => {
    if (!selectedEvent) return;
    try {
      const res = await fetch(`/api/invites/export?eventId=${selectedEvent}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'guest-invites.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Export started');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to export');
    }
  };

  // --- Revalidation stub ---
  const revalidateAnalytics = async () => {
    try { await fetch('/api/analytics/revalidate', { method: 'POST' }); } catch {/* silent */}
  };

  const handleSendInvitations = async () => {
    if (selectedGuests.length === 0) {
      toast.error('Please select at least one guest');
      return;
    }
    setLoading(true);
    setSendingStatus('sending');
    setSendingProgress(0);
    try {
      const response = await fetch('/api/invites/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: selectedEvent, guestIds: selectedGuests, message: customMessage }),
      });
      if (!response.ok) throw new Error('Failed to send invitations');
      setSendingProgress(100);
      setSendingStatus('completed');
      toast.success('Invitations sent successfully!');
      await fetchGuests();
      revalidateAnalytics();
      setSelectedGuests([]);
      setShowSendDialog(false);
      setCustomMessage('');
    } catch (error) {
      console.error('Error sending invitations:', error);
      setSendingStatus('idle');
      toast.error(error instanceof Error ? error.message : 'Failed to send invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminders = async () => {
    if (selectedGuests.length === 0) {
      toast.error('Please select at least one guest');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: selectedEvent, inviteIds: selectedGuests, reminderType, customMessage }),
      });
      if (!response.ok) throw new Error('Failed to send reminders');
      toast.success('Reminders sent successfully!');
      setSelectedGuests([]);
      revalidateAnalytics();
      setShowReminderDialog(false);
      setCustomMessage('');
    } catch (error) {
      console.error('Error sending reminders:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send reminders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-frame py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="accent-bar-gold">
            <h1 className="text-4xl font-bold text-royal-navy font-playfair-display">
              Bulk Invitations
            </h1>
          </div>
          <p className="text-slate-gray font-inter text-base md:text-lg">
            Send invitations and reminders to multiple guests at once
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="flex items-center space-x-2 btn-outline-gold" onClick={handleExport} disabled={!selectedEvent || loading}>
            <Download className="h-4 w-4" />
            <span>Export Guest List</span>
          </Button>
        </div>
      </div>

      {/* Event Selection */}
      <Card className="mb-8 wedding-elevated-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Select Event</span>
          </CardTitle>
          <CardDescription>
            Choose the event you want to manage invitations for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedEvent} onValueChange={(v) => { setSelectedEvent(v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{event.title}</span>
                    <span className="text-sm text-slate-gray">
                      {format(new Date(event.date), 'PPP')} • {event.location}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedEvent && (
        <>
          {/* Search and Filter */}
          <Card className="mb-6 wedding-elevated-card">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-gray h-4 w-4" />
                    <Input
                      placeholder="Search guests by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 input-elevated h-12 rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-slate-gray" />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Guests</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="responded">Responded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {selectedGuests.length > 0 && (
            <Card className="mb-6 wedding-elevated-card">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-royal-navy">
                      {selectedGuests.length} guest{selectedGuests.length !== 1 ? 's' : ''} selected
                    </p>
                    <p className="text-sm text-slate-gray">
                      Choose an action to perform on the selected guests
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
                      <DialogTrigger asChild>
                        <Button className="btn-gradient-primary font-inter font-medium" disabled={disableBulkActions}>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Invitations
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Send Invitations</DialogTitle>
                          <DialogDescription>
                            Send invitations to {selectedGuests.length} selected guest{selectedGuests.length !== 1 ? 's' : ''}
                          </DialogDescription>
                        </DialogHeader>
                        
                        {sendingStatus === 'sending' && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Sending invitations...</span>
                                <span>{sendingProgress}%</span>
                              </div>
                              <Progress value={sendingProgress} />
                            </div>
                          </div>
                        )}
                        
                        {sendingStatus === 'idle' && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="custom-message">Custom Message (Optional)</Label>
                              <Textarea
                                id="custom-message"
                                placeholder="Add a personal message to the invitation..."
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                className="min-h-[100px]"
                              />
                            </div>
                          </div>
                        )}
                        
                        {sendingStatus === 'completed' && (
                          <div className="text-center py-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Send className="h-6 w-6 text-green-600" />
                            </div>
                            <p className="text-green-700 font-medium">Invitations sent successfully!</p>
                          </div>
                        )}
                        
                        <DialogFooter>
                          {sendingStatus === 'idle' && (
                            <>
                              <Button variant="outline" onClick={() => setShowSendDialog(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleSendInvitations} disabled={loading}>
                                {loading ? 'Sending...' : 'Send Invitations'}
                              </Button>
                            </>
                          )}
                          {sendingStatus === 'completed' && (
                            <Button onClick={() => setShowSendDialog(false)}>
                              Close
                            </Button>
                          )}
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" disabled={disableBulkActions} className="btn-outline-gold">
                          <Bell className="h-4 w-4 mr-2" />
                          Send Reminders
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Send Reminders</DialogTitle>
                          <DialogDescription>
                            Send reminders to {selectedGuests.length} selected guest{selectedGuests.length !== 1 ? 's' : ''}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="reminder-type">Reminder Type</Label>
                            <Select value={reminderType} onValueChange={setReminderType}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="general">General Reminder</SelectItem>
                                <SelectItem value="rsvp">RSVP Reminder</SelectItem>
                                <SelectItem value="deadline">RSVP Deadline</SelectItem>
                                <SelectItem value="final">Final Reminder</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reminder-message">Custom Message (Optional)</Label>
                            <Textarea
                              id="reminder-message"
                              placeholder="Add a personal message to the reminder..."
                              value={customMessage}
                              onChange={(e) => setCustomMessage(e.target.value)}
                              className="min-h-[100px]"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowReminderDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSendReminders} disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reminders'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Guests Table */}
          <Card className="wedding-elevated-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Guests ({filteredGuests.length})</CardTitle>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedGuests.length === filteredGuests.length && filteredGuests.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all" className="text-sm">
                    Select all
                  </Label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredGuests.length > 0 ? (
                <div className="space-y-3">
                  {filteredGuests.map((guest) => (
                    <div
                      key={guest.id}
                      className="flex items-center justify-between p-4 rounded-lg row-soft"
                    >
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          checked={selectedGuests.includes(guest.id)}
                          onCheckedChange={() => handleSelectGuest(guest.id)}
                        />
                        <div className="space-y-1">
                          <p className="font-medium text-royal-navy">{guest.guestName}</p>
                          <p className="text-sm text-slate-gray">{guest.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {guest.rsvpStatus && (
                          <Badge variant="secondary" className="capitalize">{normalizeStatus(guest.rsvpStatus)}</Badge>
                        )}
                        {guest.sentAt ? (
                          <Badge className="badge-soft-success">
                            Sent
                          </Badge>
                        ) : (
                          <Badge className="badge-soft-pending">
                            Pending
                          </Badge>
                        )}
                        {guest.viewedAt && (
                          <Badge variant="secondary" className="text-xs">
                            Viewed
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-slate-gray/50" />
                  <p className="text-slate-gray">No guests found matching your search criteria</p>
                </div>
              )}
              {/* Pagination Controls */}
              {filteredGuests.length > 0 && (
                <div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-gray">
                    <span>Page {page} of {totalPages}</span>
                    <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                      <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[10,25,50,100].map(size => (
                          <SelectItem key={size} value={String(size)}>{size}/page</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
                    <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!selectedEvent && (
        <Card>
          <CardContent className="text-center py-12">
            <Mail className="h-12 w-12 mx-auto mb-4 text-slate-gray/50" />
            <h3 className="text-lg font-medium text-royal-navy mb-2">Select an Event</h3>
            <p className="text-slate-gray">Choose an event above to start managing invitations</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
