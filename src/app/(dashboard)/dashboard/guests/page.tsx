"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, FileUp, Trash2, Edit, Mail } from 'lucide-react';


interface Guest {
  id: string;
  guestName: string;
  email?: string;
  rsvpStatus: 'PENDING' | 'CONFIRMED' | 'DECLINED';
  eventId: string;
  event: {
    title: string;
  };
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGuests();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredGuests(
        guests.filter((guest) =>
          guest.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guest.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredGuests(guests);
    }
  }, [searchTerm, guests]);

  const fetchGuests = async () => {
    try {
      setError(null);
      const response = await fetch('/api/guests');
      if (!response.ok) {
        throw new Error('Failed to fetch guests');
      }
      const data = await response.json();
      setGuests(data.guests || []);
      setFilteredGuests(data.guests || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch guests';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (guestId: string) => {
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`/api/guests/${guestId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete guest');
        }

        setGuests((prev) => prev.filter((guest) => guest.id !== guestId));
        resolve('Guest deleted successfully');
      } catch (err) {
        reject(err);
      }
    });

    toast.promise(promise, {
      loading: 'Deleting guest...',
      success: 'Guest deleted successfully',
      error: 'Failed to delete guest',
    });
  };

  const handleResendInvite = async (guestId: string) => {
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`/api/guests/${guestId}/resend-invite`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ baseUrl: process.env.NEXT_PUBLIC_APP_URL }),
        });

        if (!response.ok) {
          throw new Error('Failed to resend invitation');
        }

        resolve('Invitation sent successfully');
      } catch (err) {
        reject(err);
      }
    });

    toast.promise(promise, {
      loading: 'Sending invitation...',
      success: 'Invitation sent successfully',
      error: 'Failed to send invitation',
    });
  };

  const getRsvpStatusBadge = (status: string) => {
    const map: Record<string,string> = {
      PENDING: 'badge-soft-pending',
      CONFIRMED: 'badge-soft-success',
      DECLINED: 'badge-soft-declined'
    };
    return <Badge className={`${map[status] || 'badge-soft-pending'} capitalize`}>{status.toLowerCase()}</Badge>;
  };

  

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <Card className="w-full max-w-4xl text-center mx-auto shadow-stats-card">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-red-600 font-playfair-display">Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 font-inter">
            <p className="text-lg text-red-600">{error}</p>
            <Button onClick={fetchGuests} className="wedding-button-primary">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="section-frame py-8 space-y-8 animate-fade-up-soft">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="accent-bar-gold">
            <h1 className="text-4xl font-bold text-royal-navy font-playfair-display leading-tight">Guest Management</h1>
          </div>
          <p className="text-slate-gray font-inter text-base md:text-lg">Manage your event guests and their RSVP status</p>
        </div>
        <div className="flex gap-3 pt-2">
          <Button asChild variant="outline" className="btn-outline-gold font-inter font-medium rounded-lg px-5 py-2.5">
            <Link href="/dashboard/guests/import">
              <FileUp className="w-4 h-4 mr-2" /> Import
            </Link>
          </Button>
          <Button asChild className="btn-gradient-primary font-inter font-semibold tracking-wide rounded-lg px-6 py-2.5">
            <Link href="/dashboard/guests/new">
              <Plus className="w-4 h-4 mr-2" /> Add Guest
            </Link>
          </Button>
        </div>
      </div>
      <Card className="wedding-elevated-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-royal-navy">Guest Directory</CardTitle>
          <CardDescription className="text-slate-gray">Search, review and manage guests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-gray absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search guests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-elevated h-12 rounded-lg"
              />
            </div>
          </div>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-pearl-beige/40">
                  <TableHead className="font-semibold text-royal-navy">Name</TableHead>
                  <TableHead className="font-semibold text-royal-navy">Email</TableHead>
                  <TableHead className="font-semibold text-royal-navy">Event</TableHead>
                  <TableHead className="font-semibold text-royal-navy">RSVP Status</TableHead>
                  <TableHead className="font-semibold text-royal-navy">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-slate-gray">No guests found</TableCell>
                  </TableRow>
                ) : (
                  filteredGuests.map((guest) => (
                    <TableRow key={guest.id} className="transition-colors hover:bg-pearl-beige/50">
                      <TableCell className="font-medium text-royal-navy">{guest.guestName}</TableCell>
                      <TableCell className="text-slate-gray">{guest.email || '-'}</TableCell>
                      <TableCell className="text-slate-gray">{guest.event.title}</TableCell>
                      <TableCell>{getRsvpStatusBadge(guest.rsvpStatus)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleResendInvite(guest.id)}
                            title="Send Email"
                            className="hover:text-gold-foil"
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" asChild className="hover:text-gold-foil">
                            <Link href={`/dashboard/guests/${guest.id}/edit`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(guest.id)}
                            title="Delete Guest"
                            className="hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
