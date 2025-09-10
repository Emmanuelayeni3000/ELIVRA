"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, MapPin, Type, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const createEventSchema = z.object({
	title: z.string().min(1, 'Event title is required'),
	type: z.enum(['wedding', 'reception', 'shower', 'rehearsal', 'other']).describe('Please select an event type'),
	date: z.date({
		message: 'Please select a date',
	}),
	time: z.string().optional(),
	location: z.string().min(1, 'Event location is required'),
	description: z.string().optional(),
	capacity: z.number().min(1, 'Capacity must be at least 1').optional(),
	dressCode: z.string().optional(),
	additionalInfo: z.string().optional(),
});

type CreateEventFormValues = z.infer<typeof createEventSchema>;

export default function CreateEventPage() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		watch,
		setValue,
	} = useForm<CreateEventFormValues>({
		resolver: zodResolver(createEventSchema),
	});

	const onSubmit = async (values: CreateEventFormValues) => {
		setError(null);
		try {
			const response = await fetch('/api/events', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(values),
			});

			const data = await response.json();

			if (!response.ok) {
				const errorMsg = data.error || 'Failed to create event.';
				setError(errorMsg);
				toast.error(errorMsg);
				return;
			}

			toast.success("Event created successfully!");
			router.push('/dashboard/events');
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
			setError(errorMessage);
			toast.error(errorMessage);
		}
	};

	return (
		<div className="section-frame py-8 animate-fade-up-soft">
			<Card className="max-w-4xl mx-auto wedding-elevated-card">
				<CardHeader>
					<div className="accent-bar-gold mb-2">
						<div className="flex items-center gap-2">
							<CalendarIcon className="h-6 w-6 text-royal-navy" />
							<CardTitle className="text-3xl font-bold text-royal-navy font-playfair-display">
								Create New Event
							</CardTitle>
						</div>
					</div>
					<CardDescription className="text-slate-gray font-inter">
						Fill in the details for your upcoming celebration event.
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6 md:p-8">
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
						{/* Basic Information */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<Label className="text-royal-navy font-inter flex items-center gap-2">
									<Type className="h-4 w-4" />
									Event Title
								</Label>
								<Input
									placeholder="e.g., Wedding Ceremony"
									{...register('title')}
									disabled={isSubmitting}
									className="input-elevated h-12"
								/>
								{errors.title && (
									<p className="text-sm text-destructive font-inter">{errors.title.message}</p>
								)}
							</div>

							<div className="space-y-2">
								<Label className="text-royal-navy font-inter">Event Type</Label>
								<Select
									{...register('type')}
									value={watch('type')}
									onValueChange={(value: 'wedding' | 'reception' | 'shower' | 'rehearsal' | 'other') => setValue('type', value)}
									disabled={isSubmitting}
								>
									<SelectTrigger className="input-elevated h-12">
										<SelectValue placeholder="Select event type" />
									</SelectTrigger>
									          <SelectContent className="bg-white">
										<SelectItem value="wedding">Wedding Ceremony</SelectItem>
										<SelectItem value="reception">Reception</SelectItem>
										<SelectItem value="shower">Bridal Shower</SelectItem>
										<SelectItem value="rehearsal">Rehearsal Dinner</SelectItem>
										<SelectItem value="other">Other</SelectItem>
									</SelectContent>
								</Select>
								{errors.type && (
									<p className="text-sm text-destructive font-inter">{errors.type.message}</p>
								)}
							</div>
						</div>

						{/* Date and Time */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<Label className="text-royal-navy font-inter flex items-center gap-2">
									<CalendarIcon className="h-4 w-4" />
									Date
								</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												'input-elevated h-12 w-full justify-start text-left font-normal',
												!watch('date') && 'text-muted-foreground'
											)}
										>
											{watch('date') ? (
												format(watch('date'), 'PPP')
											) : (
												<span>Pick a date</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="p-0 bg-white w-80" align="start">
										<Calendar
											mode="single"
											selected={watch('date')}
											onSelect={(date) => date && setValue('date', date)}
											initialFocus
											className="w-full"
										/>
									</PopoverContent>
								</Popover>
								{errors.date && (
									<p className="text-sm text-destructive font-inter">{errors.date.message}</p>
								)}
							</div>

							<div className="space-y-2">
								<Label className="text-royal-navy font-inter flex items-center gap-2">
									<Clock className="h-4 w-4" />
									Time
								</Label>
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
													<SelectItem key={hour} value={hour.toString()} className="hover:bg-[#1D3557] hover:text-white cursor-pointer">
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
													<SelectItem key={minute} value={minute.toString().padStart(2, '0')} className="hover:bg-[#1D3557] hover:text-white cursor-pointer">
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
												<SelectItem value="AM" className="hover:bg-[#1D3557] hover:text-white cursor-pointer">AM</SelectItem>
												<SelectItem value="PM" className="hover:bg-[#1D3557] hover:text-white cursor-pointer">PM</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</div>
						</div>

						{/* Location */}
						<div className="space-y-2">
							<Label className="text-royal-navy font-inter flex items-center gap-2">
								<MapPin className="h-4 w-4" />
								Location
							</Label>
							<Input
								placeholder="e.g., Grand Ballroom, City Hall"
								{...register('location')}
								disabled={isSubmitting}
								className="input-elevated h-12"
							/>
							{errors.location && (
								<p className="text-sm text-destructive font-inter">{errors.location.message}</p>
							)}
						</div>

						{/* Capacity */}
						<div className="space-y-2">
							<Label className="text-royal-navy font-inter flex items-center gap-2">
								<Users className="h-4 w-4" />
								Expected Guests
							</Label>
							<Input
								type="number"
								placeholder="e.g., 100"
								{...register('capacity', { valueAsNumber: true })}
								disabled={isSubmitting}
								className="input-elevated h-12"
							/>
							{errors.capacity && (
								<p className="text-sm text-destructive font-inter">{errors.capacity.message}</p>
							)}
						</div>

						{/* Additional Details */}
						<div className="space-y-2">
							<Label className="text-royal-navy font-inter flex items-center gap-2">
								<FileText className="h-4 w-4" />
								Event Description
							</Label>
							<Textarea
								placeholder="Share more details about your event..."
								{...register('description')}
								disabled={isSubmitting}
								className="input-elevated min-h-[120px]"
							/>
						</div>

						{error && (
							<div className="bg-destructive/10 p-3 rounded-md">
								<p className="text-sm text-destructive font-inter text-center">{error}</p>
							</div>
						)}

						<div className="flex gap-4 pt-4">
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
								{isSubmitting ? 'Creating Event...' : 'Create Event'}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
