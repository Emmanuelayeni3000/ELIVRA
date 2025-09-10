"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

const updateEventSchema = z.object({
	title: z.string().min(1, 'Event title is required'),
	date: z.string().min(1, 'Event date is required'),
	time: z.string().optional(),
	location: z.string().min(1, 'Event location is required'),
	description: z.string().optional(),
});

type UpdateEventFormValues = z.infer<typeof updateEventSchema>;

// NOTE: Using Promise-based params type to align with Next.js generated PageProps expectation
// The build currently expects params to be a Promise; we unwrap it into local state.
export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
	const [id, setId] = useState<string>('');
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
		watch,
		setValue,
	} = useForm<UpdateEventFormValues>({
		resolver: zodResolver(updateEventSchema),
	});

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
					date: format(new Date(data.event.date), 'yyyy-MM-dd'), // Format date for input type="date"
					time: data.event.time || '',
					location: data.event.location,
					description: data.event.description || '',
				});
			} catch (err: unknown) { // Fixed 'any' to 'unknown'
				setError(err instanceof Error ? err.message : 'An unexpected error occurred while fetching event.');
			}
		};

		fetchEvent();
	}, [id, reset]);

	const onSubmit = async (values: UpdateEventFormValues) => {
		setError(null);
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
								<div className="flex gap-2">
									<div className="flex-1">
										<Label className="text-xs text-slate-gray font-inter">Hour</Label>
										<Select
											value={(() => {
												const time = watch('time');
												if (!time) return '';
												const [hourStr] = time.split(':');
												if (!hourStr) return '';
												const hour24 = parseInt(hourStr);
												const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
												return hour12.toString();
											})()}
											onValueChange={(value) => {
												const currentTime = watch('time') || '00:00';
												const [, minutePart] = currentTime.split(':');
												const minute = minutePart ? minutePart.split(' ')[0] : '00';
												const isPM = currentTime.includes('PM');
												const hour12 = parseInt(value);
												const hour24 = isPM ? (hour12 === 12 ? 12 : hour12 + 12) : (hour12 === 12 ? 0 : hour12);
												const newTime = `${hour24.toString().padStart(2, '0')}:${minute}`;
												setValue('time', newTime);
											}}
											disabled={isSubmitting}
										>
											<SelectTrigger className="input-elevated h-10">
												<SelectValue placeholder="Hour" />
											</SelectTrigger>
											<SelectContent className="bg-white max-h-32 overflow-y-auto">
												{Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
													<SelectItem key={hour} value={hour.toString()} className="hover:bg-royal-navy hover:text-white cursor-pointer">
														{hour}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="flex-1">
										<Label className="text-xs text-slate-gray font-inter">Minute</Label>
										<Select
											value={(() => {
												const time = watch('time');
												if (!time) return '';
												const [, minutePart] = time.split(':');
												return minutePart ? minutePart.split(' ')[0] : '00';
											})() || ''}
											onValueChange={(value) => {
												const currentTime = watch('time') || '00:00';
												const [hourPart] = currentTime.split(':');
												const newTime = `${hourPart}:${value}`;
												setValue('time', newTime);
											}}
											disabled={isSubmitting}
										>
											<SelectTrigger className="input-elevated h-10">
												<SelectValue placeholder="Min" />
											</SelectTrigger>
											<SelectContent className="bg-white max-h-32 overflow-y-auto">
												{Array.from({ length: 12 }, (_, i) => i * 5).map(minute => (
													<SelectItem key={minute} value={minute.toString().padStart(2, '0')} className="hover:bg-royal-navy hover:text-white cursor-pointer">
														{minute.toString().padStart(2, '0')}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="flex-1">
										<Label className="text-xs text-slate-gray font-inter">AM/PM</Label>
										<Select
											value={(() => {
												const time = watch('time');
												if (!time) return '';
												const [hourStr] = time.split(':');
												if (!hourStr) return '';
												const hour24 = parseInt(hourStr);
												return hour24 >= 12 ? 'PM' : 'AM';
											})() || ''}
											onValueChange={(value) => {
												const currentTime = watch('time') || '00:00';
												const [hourPart, minutePart] = currentTime.split(':');
												if (!hourPart) return;
												const hour24 = parseInt(hourPart);
												let newHour24 = hour24;
												if (value === 'PM' && hour24 < 12) {
													newHour24 = hour24 === 0 ? 12 : hour24 + 12;
												} else if (value === 'AM' && hour24 >= 12) {
													newHour24 = hour24 === 12 ? 0 : hour24 - 12;
												}
												const minute = minutePart ? minutePart.split(' ')[0] : '00';
												const newTime = `${newHour24.toString().padStart(2, '0')}:${minute}`;
												setValue('time', newTime);
											}}
											disabled={isSubmitting}
										>
											<SelectTrigger className="input-elevated h-10">
												<SelectValue placeholder="AM/PM" />
											</SelectTrigger>
											<SelectContent className="bg-white max-h-32 overflow-y-auto">
												<SelectItem value="AM" className="hover:bg-royal-navy hover:text-white cursor-pointer">AM</SelectItem>
												<SelectItem value="PM" className="hover:bg-royal-navy hover:text-white cursor-pointer">PM</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
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
