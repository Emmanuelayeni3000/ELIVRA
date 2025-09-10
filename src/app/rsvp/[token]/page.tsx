'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, MapPin, Users, Info } from 'lucide-react';
import { format } from 'date-fns';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const rsvpSchema = z.object({
  response: z.enum(['attending', 'not-attending']),
  guestCount: z.number().min(1).optional(),
  dietaryRequirements: z.string().optional(),
  message: z.string().optional(),
});

type RSVPFormValues = z.infer<typeof rsvpSchema>;

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description?: string;
}

interface Guest {
  id: string;
  name: string;
  email: string;
  rsvpStatus?: 'attending' | 'not-attending';
  invitationToken: string;
}

export default function RSVPPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RSVPFormValues>({
    resolver: zodResolver(rsvpSchema),
  });

  // Fetch event and guest details on mount
  useEffect(() => {
    if (!token) return;
    const fetchInvitation = async () => {
      try {
        const response = await fetch(`/api/rsvp/${token}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to load invitation details.');
          return;
        }

        setEvent(data.event);
        setGuest(data.guest);

        // Pre-fill form if guest has already responded
        if (data.guest.rsvpStatus) {
          setValue('response', data.guest.rsvpStatus);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token, setValue]);

  const onSubmit = async (values: RSVPFormValues) => {
    try {
      const response = await fetch(`/api/rsvp/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to submit RSVP.');
        return;
      }

      toast.success("Your RSVP has been submitted. Thank you!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pearl-beige/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl animate-pulse">
          <CardHeader className="space-y-2">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-200 rounded" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !event || !guest) {
    return (
      <div className="min-h-screen bg-pearl-beige/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-destructive">
              {error || 'Invalid Invitation'}
            </CardTitle>
            <CardDescription>
              This invitation link appears to be invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-gray">
              Please contact the event organizer for assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pearl-beige/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-stats-card">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-royal-navy font-playfair-display">
            {event.title}
          </CardTitle>
          <CardDescription className="text-lg font-inter">
            Dear {guest.name}, please confirm your attendance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Event Details */}
          <div className="grid gap-4 p-6 bg-pearl-beige/10 rounded-lg">
            <div className="flex items-center gap-2 text-royal-navy">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">
                {format(new Date(event.date), 'EEEE, MMMM do, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-royal-navy">
              <MapPin className="h-5 w-5" />
              <span>{event.location}</span>
            </div>
            {event.description && (
              <div className="flex items-start gap-2 text-royal-navy">
                <Info className="h-5 w-5 mt-1" />
                <p className="text-sm">{event.description}</p>
              </div>
            )}
          </div>

          {/* RSVP Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>Will you be attending?</Label>
              <Select
                value={watch('response')}
                onValueChange={(value) => setValue('response', value as RSVPFormValues['response'])}
              >
                <SelectTrigger className="wedding-input">
                  <SelectValue placeholder="Select your response" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attending">Yes, I will attend</SelectItem>
                  <SelectItem value="not-attending">No, I cannot attend</SelectItem>
                </SelectContent>
              </Select>
              {errors.response && (
                <p className="text-sm text-destructive">{errors.response.message}</p>
              )}
            </div>

            {watch('response') === 'attending' && (
              <>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Number of Guests (including yourself)
                  </Label>
                  <Select
                    value={watch('guestCount')?.toString() ?? ''}
                    onValueChange={(value) => setValue('guestCount', parseInt(value))}
                  >
                    <SelectTrigger className="wedding-input">
                      <SelectValue placeholder="Select guest count" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'Guest' : 'Guests'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Dietary Requirements</Label>
                  <Textarea
                    placeholder="Please let us know of any dietary requirements..."
                    className="wedding-textarea"
                    onChange={(e) => setValue('dietaryRequirements', e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Message (Optional)</Label>
              <Textarea
                placeholder="Leave a message for the couple..."
                className="wedding-textarea"
                onChange={(e) => setValue('message', e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full wedding-button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit RSVP'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}