"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type UpdateEventFormValues = {
	title: string;
	type: 'wedding' | 'reception' | 'shower' | 'rehearsal' | 'other';
	date: string;
	time?: string;
	location: string;
	description?: string;
	hashtag?: string;
};

// NOTE: Using Promise-based params type to align with Next.js generated PageProps expectation
// The build currently expects params to be a Promise; we unwrap it into local state.
export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
	const [id, setId] = useState<string>('');
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);

	const form = useForm<UpdateEventFormValues>({
		defaultValues: {
			title: '',
			type: 'wedding',
			date: '',
			time: '',
			location: '',
			description: '',
			hashtag: '',
		},
	});

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
		watch,
		setValue,
	} = form;

	// Resolve params promise once (client component) and set id
	useEffect(() => {
		let active = true;
		params.then(p => { if (active) setId(p.id); });
		return () => { active = false; };
	}, [params]);

	useEffect(() => {
		if (!id) return; // Wait until id is resolved
    
		const fetchEvent = async () => {
			try {
				const response = await fetch(`/api/events/${id}`);
				const data = await response.json();

				if (!response.ok) {
					setError(data.error || 'Failed to fetch event.');
					return;
				}

				// Populate form with fetched data
				reset({
					title: data.event.title,
					type: data.event.type || 'wedding',
					date: format(new Date(data.event.date), 'yyyy-MM-dd'), // Format date for input type="date"
					time: data.event.time || '',
					location: data.event.location,
					description: data.event.description || '',
					hashtag: data.event.hashtag || '',
				});
			} catch (err: unknown) { // Fixed 'any' to 'unknown'
				setError(err instanceof Error ? err.message : 'An unexpected error occurred while fetching event.');
			}
		};

		fetchEvent();
	}, [id, reset]);

	const onSubmit = async (values: UpdateEventFormValues) => {
		setError(null);

		// Basic validation
		if (!values.title?.trim()) {
			setError('Event title is required');
			return;
		}
		if (!values.date?.trim()) {
			setError('Event date is required');
			return;
		}
		if (!values.location?.trim()) {
			setError('Event location is required');
			return;
		}

		try {
			const response = await fetch(`/api/events/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(values),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || 'Failed to update event.');
				return;
			}

			router.push('/dashboard/events'); // Redirect to events list on success
		} catch (err: unknown) { // Fixed 'any' to 'unknown'
			setError(err instanceof Error ? err.message : 'An unexpected error occurred during update.');
		}
	};

	

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-pearl-beige">
				<p className="text-blush font-inter">Error: {error}</p> {/* Applied typography */}
			</div>
		);
	}

	return (
		<div className="section-frame py-8 animate-fade-up-soft">
			<Card className="w-full max-w-3xl mx-auto wedding-elevated-card">
				<CardHeader>
					<div className="accent-bar-gold mb-2">
						<CardTitle className="text-3xl font-bold text-royal-navy font-playfair-display">Edit Event</CardTitle>
					</div>
					<CardDescription className="text-slate-gray font-inter">
						Update the details for your event.
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6 md:p-8">
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6 lg:space-y-8"> {/* Adjusted spacing */}
						<div className="grid gap-2">
							<Label htmlFor="title" className="text-royal-navy font-inter">Event Title</Label> {/* Applied typography */}
							<Input
								id="title"
								type="text"
								placeholder="e.g., Wedding Ceremony, Reception"
								{...register('title')}
								disabled={isSubmitting}
								className="input-elevated h-12"
							/>
							{errors.title && <p className="text-sm text-blush font-inter">{errors.title.message}</p>} {/* Applied typography */}
						</div>

						<div className="grid gap-2">
							<Label htmlFor="type" className="text-royal-navy font-inter">Event Type</Label>
							<Select
								value={watch('type')}
								onValueChange={(value) => setValue('type', value as UpdateEventFormValues['type'])}
								disabled={isSubmitting}
							>
								<SelectTrigger className="input-elevated h-12">
									<SelectValue placeholder="Select event type" />
								</SelectTrigger>
								<SelectContent className="bg-white">
									<SelectItem value="wedding">Wedding Ceremony</SelectItem>
									<SelectItem value="reception">Wedding Reception</SelectItem>
									<SelectItem value="shower">Bridal/Baby Shower</SelectItem>
									<SelectItem value="rehearsal">Rehearsal Dinner</SelectItem>
									<SelectItem value="other">Other Celebration</SelectItem>
								</SelectContent>
							</Select>
							{errors.type && <p className="text-sm text-blush font-inter">{errors.type.message}</p>}
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6"> {/* Adjusted spacing */}
							<div className="grid gap-2">
								<Label htmlFor="date" className="text-royal-navy font-inter">Date</Label> {/* Applied typography */}
								<Input
									id="date"
									type="date"
									{...register('date')}
									disabled={isSubmitting}
									className="input-elevated h-12"
								/>
								{errors.date && <p className="text-sm text-blush font-inter">{errors.date.message}</p>} {/* Applied typography */}
							</div>
							<div className="grid gap-2">
								<Label htmlFor="time" className="text-royal-navy font-inter">Time (Optional)</Label>
								<Input
									id="time"
									type="time"
									{...register('time')}
									disabled={isSubmitting}
									className="input-elevated h-12"
								/>
								{errors.time && <p className="text-sm text-blush font-inter">{errors.time.message}</p>}
							</div>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="location" className="text-royal-navy font-inter">Location</Label> {/* Applied typography */}
							<Input
								id="location"
								type="text"
								placeholder="e.g., Grand Ballroom, City Hall"
								{...register('location')}
								disabled={isSubmitting}
								className="input-elevated h-12"
							/>
							{errors.location && <p className="text-sm text-blush font-inter">{errors.location.message}</p>} {/* Applied typography */}
						</div>
						<div className="grid gap-2">
							<Label htmlFor="description" className="text-royal-navy font-inter">Description (Optional)</Label> {/* Applied typography */}
							<Textarea
								id="description"
								placeholder="A brief description of the event..."
								{...register('description')}
								disabled={isSubmitting}
								className="input-elevated min-h-[120px]"
							/>
						</div>

						{/* Wedding Hashtag - Only show for wedding and reception */}
						{(watch('type') === 'wedding' || watch('type') === 'reception') && (
							<div className="grid gap-2">
								<Label htmlFor="hashtag" className="text-royal-navy font-inter flex items-center gap-2">
									<span className="text-gold-foil">#</span>
									Wedding Hashtag (Optional)
								</Label>
								<Input
									id="hashtag"
									placeholder="e.g., #TobiMart2025"
									{...register('hashtag')}
									disabled={isSubmitting}
									className="input-elevated h-12"
								/>
								<p className="text-xs text-slate-gray font-inter">
									Perfect for social media! Guests can use this hashtag when sharing photos and memories.
								</p>
							</div>
						)}
						
						{error && <p className="text-center text-sm text-blush font-inter">{error}</p>} {/* Applied typography */}
						<div className="flex gap-4 pt-2">
							<Button
								type="button"
								variant="outline"
								className="flex-1 btn-outline-gold"
								onClick={() => router.back()}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								className="flex-1 btn-gradient-primary"
								disabled={isSubmitting}
							>
								{isSubmitting ? 'Updating Event...' : 'Update Event'}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
