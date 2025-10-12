'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Info, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const rsvpSchema = z.object({
  response: z.enum(['attending', 'not-attending']),
  guestCount: z.number().min(1).optional(),
  guestEmails: z.array(z.string().email()).optional(),
  message: z.string().optional(),
});

type RSVPFormValues = z.infer<typeof rsvpSchema>;

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description?: string;
  guestLimit?: number;
}

interface Guest {
  id: string;
  name: string;
  email: string;
  rsvpStatus?: 'attending' | 'not-attending';
  invitationToken: string;
  guestLimit?: number;
}

export default function RSVPPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [guestEmailsInput, setGuestEmailsInput] = useState('');

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    setError: setFormError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RSVPFormValues>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      guestCount: 1,
      guestEmails: [],
      message: '',
    },
  });

  const responseValue = watch('response');
  const guestCountValue = watch('guestCount') ?? 1;

  useEffect(() => {
    if (!token) {
      return;
    }

    const fetchInvitation = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const response = await fetch(`/api/rsvp/${token}`);
        const data = await response.json();

        if (!response.ok) {
          setLoadError(data.error || 'Failed to load invitation details.');
          return;
        }

        setEvent(data.event);
        setGuest(data.guest);

        reset();
        setGuestEmailsInput('');
        clearErrors();

        if (data.guest.rsvpStatus === 'attending' || data.guest.rsvpStatus === 'not-attending') {
          setValue('response', data.guest.rsvpStatus);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setLoadError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    void fetchInvitation();
  }, [token, reset, clearErrors, setValue]);

  useEffect(() => {
    if (responseValue !== 'attending') {
      setGuestEmailsInput('');
      setValue('guestEmails', []);
      clearErrors('guestEmails');
    }
  }, [responseValue, setValue, clearErrors]);

  const onSubmit = async (values: RSVPFormValues) => {
    try {
      if (values.response === 'attending') {
        const count = values.guestCount ?? 1;
        const expectedAdditionalGuests = Math.max(0, count - 1);
        const providedGuests = values.guestEmails?.length ?? 0;

        if (providedGuests !== expectedAdditionalGuests) {
          setFormError('guestEmails', {
            type: 'manual',
            message: `Please provide exactly ${expectedAdditionalGuests} email${expectedAdditionalGuests === 1 ? '' : 's'} for your additional guest${expectedAdditionalGuests === 1 ? '' : 's'}.`,
          });
          return;
        }
      }

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

      toast.success('Your RSVP has been submitted. Thank you!');

      setTimeout(() => {
        router.push(`/invite/${guest?.id}`);
      }, 1500);
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

  if (loadError || !event || !guest) {
    return (
      <div className="min-h-screen bg-pearl-beige/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-destructive">
              {loadError || 'Invalid Invitation'}
            </CardTitle>
            <CardDescription>
              This invitation link appears to be invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-gray">Please contact the event organizer for assistance.</p>
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>Will you be attending?</Label>
              <Select
                value={responseValue ?? ''}
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

            {responseValue === 'attending' && (
              <>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Number of Guests (including yourself)
                  </Label>
                  {(() => {
                    const limit = event?.guestLimit ?? guest?.guestLimit ?? 1;
                    const maxGuests = Math.max(1, limit);
                    const guestCountOptions = Array.from({ length: maxGuests }, (_, index) => index + 1);

                    return (
                      <Select
                        value={guestCountValue?.toString() ?? ''}
                        onValueChange={(value) => {
                          const count = Number.parseInt(value, 10);
                          setValue('guestCount', count);
                          setGuestEmailsInput('');
                          setValue('guestEmails', []);
                          clearErrors('guestEmails');
                        }}
                      >
                        <SelectTrigger className="wedding-input">
                          <SelectValue placeholder="Select guest count" />
                        </SelectTrigger>
                        <SelectContent>
                          {guestCountOptions.map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? 'Guest' : 'Guests'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  })()}
                  {event?.guestLimit && (
                    <p className="text-xs text-slate-gray">
                      You can invite up to {event.guestLimit} guests (including yourself)
                    </p>
                  )}
                </div>

                {(() => {
                  if (!guestCountValue || guestCountValue <= 1) {
                    return null;
                  }

                  const additionalGuests = Math.max(0, guestCountValue - 1);

                  return (
                    <div className="space-y-3">
                      <Label className="text-royal-navy font-inter">Additional Guest Emails</Label>
                      <p className="text-sm text-slate-gray">
                        Enter the email addresses for your {additionalGuests} additional guest
                        {additionalGuests === 1 ? '' : 's'}, separated by commas.
                      </p>
                      <Input
                        type="text"
                        placeholder="guest1@example.com, guest2@example.com"
                        value={guestEmailsInput}
                        onChange={(event) => {
                          const value = event.target.value;
                          setGuestEmailsInput(value);

                          const emails = value
                            .split(',')
                            .map((email) => email.trim())
                            .filter((email) => email.length > 0);

                          setValue('guestEmails', emails);

                          const invalidEmails = emails.filter(
                            (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                          );

                          if (invalidEmails.length > 0) {
                            setFormError('guestEmails', {
                              type: 'manual',
                              message: `Some email${invalidEmails.length === 1 ? '' : 's'} look invalid: ${invalidEmails.join(', ')}`,
                            });
                          } else if (emails.length !== additionalGuests) {
                            setFormError('guestEmails', {
                              type: 'manual',
                              message: `Please provide exactly ${additionalGuests} email${additionalGuests === 1 ? '' : 's'}.`,
                            });
                          } else {
                            clearErrors('guestEmails');
                          }
                        }}
                        className="wedding-input"
                      />
                      {errors.guestEmails && (
                        <p className="text-sm text-destructive">{errors.guestEmails.message}</p>
                      )}
                    </div>
                  );
                })()}
              </>
            )}

            <div className="space-y-2">
              <Label>Message (Optional)</Label>
              <Textarea
                placeholder="Leave a message for the couple..."
                className="wedding-textarea"
                onChange={(event) => setValue('message', event.target.value)}
              />
            </div>

            <Button type="submit" className="w-full wedding-button-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit RSVP'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}