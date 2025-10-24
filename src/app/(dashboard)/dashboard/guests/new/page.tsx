"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

interface Event {
  id: string;
  title: string;
}

const addGuestSchema = z.object({
  eventId: z.string().min(1, 'Please select an event'),
  guestName: z.string().min(1, 'Guest name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  guestLimit: z.number().min(1, 'Guest limit must be at least 1').max(10, 'Guest limit cannot exceed 10'),
});

type AddGuestFormValues = z.infer<typeof addGuestSchema>;

export default function AddGuestPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AddGuestFormValues>({
    resolver: zodResolver(addGuestSchema),
    defaultValues: {
      guestName: '',
      email: '',
      eventId: '',
      guestLimit: 1,
    },
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch events';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: AddGuestFormValues) => {
    const promise = new Promise<string>(async (resolve, reject) => {
      try {
        const response = await fetch('/api/guests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to add guest');
        }
        router.push('/dashboard/guests');
        router.refresh();
        resolve('Guest added successfully');
      } catch (err) {
        reject(err);
      }
    });

    toast.promise(promise, {
      loading: 'Adding guest...',
      success: 'Guest added successfully',
      error: 'Failed to add guest',
    });
  };

  

  if (loading) {
    return (
      <div className="section-frame py-8 space-y-6 animate-fade-up-soft">
        <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="wedding-elevated-card">
          <CardHeader>
            <div className="accent-bar-gold mb-2">
              <Skeleton className="h-8 w-48" />
            </div>
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="flex justify-end gap-4">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-28" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchEvents} className="wedding-button-primary">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-6">
        <Card className='bg-gradient-to-tr from-[#F5F0E6] to-white'>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-royal-navy font-playfair-display">No Events Available</CardTitle>
            <CardDescription className="text-slate-gray font-inter">
              You need to create an event before you can add guests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="wedding-button-primary">
              <Link href="/dashboard/events/new">Create Event</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="section-frame py-8 space-y-6 animate-fade-up-soft">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card className="wedding-elevated-card">
        <CardHeader>
          <div className="accent-bar-gold mb-2">
            <CardTitle className="text-3xl font-bold text-royal-navy font-playfair-display">Add New Guest</CardTitle>
          </div>
          <CardDescription className="text-slate-gray font-inter">Add a new guest to your event</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="eventId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-royal-navy font-inter">Event</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an event" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id} className="bg-white">
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guestName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-royal-navy font-inter">Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Guest name" {...field} className="input-elevated h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-royal-navy font-inter">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="guest@example.com" {...field} className="input-elevated h-12" />
                    </FormControl>
                    <FormDescription className="text-slate-gray font-inter">Email is required for sending invitations</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guestLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-royal-navy font-inter">Guest Limit</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="input-elevated h-12">
                          <SelectValue placeholder="Select guest limit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <SelectItem key={num} value={num.toString()} className="bg-white">
                            {num} {num === 1 ? 'Guest' : 'Guests'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-slate-gray font-inter">
                      Maximum number of guests this person can invite to the event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()} className="btn-outline-gold">
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting} className="btn-gradient-primary">
                  {form.formState.isSubmitting ? 'Adding Guest...' : 'Add Guest'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
