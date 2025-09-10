"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
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
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload } from 'lucide-react';
import { Loading } from '@/components/loading';

interface Event {
  id: string;
  title: string;
}

const importGuestsSchema = z.object({
  eventId: z.string().min(1, 'Please select an event'),
  file: z.instanceof(File)
    .refine((file) => file.type === 'text/csv', 'Only CSV files are allowed')
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size should be less than 5MB'),
});

type ImportGuestsFormValues = z.infer<typeof importGuestsSchema>;

export default function ImportGuestsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ImportGuestsFormValues>({
    resolver: zodResolver(importGuestsSchema),
  });

  useEffect(() => {
  fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
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
    }
  };

  const onSubmit = async (values: ImportGuestsFormValues) => {
    const formData = new FormData();
    formData.append('eventId', values.eventId);
    // cast to unknown then Blob to satisfy TS for FormData.append
    formData.append('file', values.file as unknown as Blob);

    const promise = new Promise<string>(async (resolve, reject) => {
      try {
        const response = await fetch('/api/guests/import', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to import guests');
        }
        const data = await response.json();
        resolve(`Successfully imported ${data.importedCount} guests`);
        router.push('/dashboard/guests');
        router.refresh();
      } catch (err) {
        reject(err);
      }
    });

    toast.promise(promise, {
      loading: 'Importing guests...',
      success: (message) => message as string,
      error: 'Failed to import guests',
    });
  };

  

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
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-royal-navy font-playfair-display">No Events Available</CardTitle>
            <CardDescription className="text-slate-gray font-inter">
              You need to create an event before you can import guests.
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
    <div className="p-6 space-y-6">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <Card className="shadow-stats-card">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-royal-navy font-playfair-display">Import Guests</CardTitle>
          <CardDescription className="text-slate-gray font-inter">
            Import multiple guests using a CSV file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="eventId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-royal-navy font-inter">Event</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an event" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
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
                name="file"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel className="text-royal-navy font-inter">CSV File</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(file);
                          }
                        }}
                        {...field}
                        value={undefined}
                      />
                    </FormControl>
                    <FormDescription className="text-slate-gray font-inter">
                      Upload a CSV file with columns: name, email, phone
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-6 text-sm text-slate-gray font-inter">
                <p className="font-semibold mb-2">CSV Format Requirements:</p>
                <p>Your CSV file should have the following columns (case-sensitive):</p>
                <ul className="list-disc list-inside ml-4">
                  <li><span className="font-bold">name</span> (required)</li>
                  <li><span className="font-bold">email</span> (optional)</li>
                  <li><span className="font-bold">phone</span> (optional)</li>
                </ul>
                <p className="mt-2">Example:</p>
                <Textarea
                  readOnly
                  value={`name,email,phone
John Doe,john.doe@example.com,123-456-7890
Jane Smith,,987-654-3210
Alice Wonderland,alice@example.com,`}
                  className="mt-2 font-mono text-xs"
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="wedding-button-secondary"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="wedding-button-primary"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {form.formState.isSubmitting ? 'Importing...' : 'Import Guests'}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}