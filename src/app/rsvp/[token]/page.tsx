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
  bringingGuests: z.enum(['yes', 'no']).optional(),
  guestCount: z.number().min(0).optional(),
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
  guestCount?: number;
  companionEmails?: string[];
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
      bringingGuests: 'no',
      guestCount: 0,
      guestEmails: [],
      message: '',
    },
  });

  const responseValue = watch('response');
  const bringingGuestsValue = watch('bringingGuests');
  const guestCountValue = watch('guestCount') ?? 0;
  const allowedGuestLimit = Math.max(0, guest?.guestLimit ?? event?.guestLimit ?? 0);
  const guestCountOptions = Array.from({ length: allowedGuestLimit }, (_, index) => index + 1);
  const canBringGuests = allowedGuestLimit > 0;
  const showGuestPreferences = responseValue === 'attending';
  const showGuestCountSelect =
    showGuestPreferences && bringingGuestsValue === 'yes' && canBringGuests;
  const companionEmailCount = showGuestCountSelect ? guestCountValue : 0;
  const showCompanionEmailInput = companionEmailCount > 0;

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

        const companionEmails = Array.isArray(data.guest.companionEmails)
          ? data.guest.companionEmails
          : [];
        const clampedGuestLimit = Math.max(0, data.guest.guestLimit ?? data.event.guestLimit ?? 0);
        const storedGuestCount = Math.max(0, data.guest.guestCount ?? 0);
        const adjustedGuestCount = Math.min(storedGuestCount, clampedGuestLimit);
        const bringingGuestsDefault: RSVPFormValues['bringingGuests'] =
          adjustedGuestCount > 0 ? 'yes' : 'no';

        reset({
          bringingGuests: bringingGuestsDefault,
          guestCount: adjustedGuestCount,
          guestEmails: bringingGuestsDefault === 'yes' ? companionEmails : [],
          message: '',
        } as Partial<RSVPFormValues>);

        setValue('bringingGuests', bringingGuestsDefault);
        setValue('guestCount', adjustedGuestCount);
        setValue('guestEmails', bringingGuestsDefault === 'yes' ? companionEmails : []);
        setGuestEmailsInput(
          bringingGuestsDefault === 'yes' ? companionEmails.join(', ') : ''
        );
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
      setValue('bringingGuests', 'no');
      setValue('guestCount', 0);
      setValue('guestEmails', []);
      clearErrors(['guestEmails', 'guestCount', 'bringingGuests']);
    }
  }, [responseValue, setValue, clearErrors]);

  useEffect(() => {
    if (bringingGuestsValue !== 'yes') {
      if (guestCountValue !== 0) {
        setValue('guestCount', 0);
      }
      return;
    }

    if (guestCountValue > allowedGuestLimit) {
      const nextCount = Math.max(0, allowedGuestLimit);
      setValue('guestCount', nextCount);
      setGuestEmailsInput('');
      setValue('guestEmails', []);
      clearErrors('guestEmails');
    }
  }, [bringingGuestsValue, guestCountValue, allowedGuestLimit, setValue, clearErrors]);

  useEffect(() => {
    if (!canBringGuests && bringingGuestsValue === 'yes') {
      setValue('bringingGuests', 'no');
      setValue('guestCount', 0);
      setGuestEmailsInput('');
      setValue('guestEmails', []);
      clearErrors(['guestEmails', 'guestCount', 'bringingGuests']);
    }
  }, [canBringGuests, bringingGuestsValue, setValue, clearErrors]);

  const onSubmit = async (values: RSVPFormValues) => {
    try {
      const bringingGuests = values.bringingGuests === 'yes';
      const normalizedGuestCount = bringingGuests ? Math.max(0, values.guestCount ?? 0) : 0;

      if (values.response === 'attending') {
        if (bringingGuests && !canBringGuests) {
          setFormError('bringingGuests', {
            type: 'manual',
            message: 'This invitation does not include additional guests.',
          });
          return;
        }

        if (bringingGuests) {
          if (normalizedGuestCount <= 0) {
            setFormError('guestCount', {
              type: 'manual',
              message: 'Please select how many guests you will bring.',
            });
            return;
          }

          if (normalizedGuestCount > allowedGuestLimit) {
            setFormError('guestCount', {
              type: 'manual',
              message: `You can bring up to ${allowedGuestLimit} guest${allowedGuestLimit === 1 ? '' : 's'}.`,
            });
            return;
          }
        }

        const providedGuestEmails = bringingGuests ? values.guestEmails?.length ?? 0 : 0;

        if (bringingGuests) {
          if (providedGuestEmails !== normalizedGuestCount) {
            setFormError('guestEmails', {
              type: 'manual',
              message: `Please provide exactly ${normalizedGuestCount} email${normalizedGuestCount === 1 ? '' : 's'} for your guest${normalizedGuestCount === 1 ? '' : 's'}.`,
            });
            return;
          }
        } else {
          if ((values.guestEmails?.length ?? 0) > 0) {
            setGuestEmailsInput('');
            setValue('guestEmails', []);
          }
          clearErrors('guestEmails');
        }

        clearErrors(['guestCount', 'bringingGuests']);
      }

      const payload = {
        response: values.response,
        bringingGuests: values.bringingGuests ?? 'no',
        guestCount: values.response === 'attending' ? normalizedGuestCount : 0,
        guestEmails:
          values.response === 'attending' && bringingGuests ? values.guestEmails ?? [] : [],
        message: values.message ?? '',
      };

      const response = await fetch(`/api/rsvp/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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

            {showGuestPreferences && (
              <>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Will you be bringing guests?
                  </Label>
                  <Select
                    value={bringingGuestsValue ?? ''}
                    onValueChange={(value) => {
                      const selection = value as RSVPFormValues['bringingGuests'];
                      setValue('bringingGuests', selection);

                      if (selection === 'yes') {
                        const nextCount = guestCountOptions.length > 0
                          ? Math.min(Math.max(guestCountValue || 1, 1), allowedGuestLimit)
                          : 0;
                        setValue('guestCount', nextCount);
                        clearErrors(['bringingGuests', 'guestCount']);
                      } else {
                        setValue('guestCount', 0);
                        setGuestEmailsInput('');
                        setValue('guestEmails', []);
                        clearErrors(['bringingGuests', 'guestCount', 'guestEmails']);
                      }
                    }}
                  >
                    <SelectTrigger className="wedding-input">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No, I will attend alone</SelectItem>
                      <SelectItem value="yes" disabled={!canBringGuests}>
                        Yes, I will bring guests
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.bringingGuests && (
                    <p className="text-sm text-destructive">{errors.bringingGuests.message}</p>
                  )}
                  <p className="text-xs text-slate-gray">
                    {canBringGuests
                      ? `You can bring up to ${allowedGuestLimit} guest${allowedGuestLimit === 1 ? '' : 's'}.`
                      : 'This invitation does not include additional guests.'}
                  </p>
                </div>

                {showGuestCountSelect && (
                  <div className="space-y-2">
                    <Label>How many guests will you bring?</Label>
                    <Select
                      value={guestCountValue > 0 ? guestCountValue.toString() : ''}
                      onValueChange={(value) => {
                        const count = Number.parseInt(value, 10);
                        setValue('guestCount', count);
                        setGuestEmailsInput('');
                        setValue('guestEmails', []);
                        clearErrors(['guestCount', 'guestEmails']);
                      }}
                      disabled={guestCountOptions.length === 0}
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
                    {errors.guestCount && (
                      <p className="text-sm text-destructive">{errors.guestCount.message}</p>
                    )}
                    <p className="text-xs text-slate-gray">
                      Select up to {allowedGuestLimit} guest{allowedGuestLimit === 1 ? '' : 's'} to accompany you.
                    </p>
                  </div>
                )}

                {showCompanionEmailInput && (
                  <div className="space-y-3">
                    <Label className="text-royal-navy font-inter">Guest Email Addresses</Label>
                    <p className="text-sm text-slate-gray">
                      Enter the email addresses for your {companionEmailCount} guest
                      {companionEmailCount === 1 ? '' : 's'}, separated by commas.
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
                        } else if (emails.length !== companionEmailCount) {
                          setFormError('guestEmails', {
                            type: 'manual',
                            message: `Please provide exactly ${companionEmailCount} email${companionEmailCount === 1 ? '' : 's'}.`,
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
                )}
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