"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

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
import { ArrowLeft } from 'lucide-react';
import { Loading } from '@/components/loading';


const updateGuestSchema = z.object({
	guestName: z.string().min(1, 'Guest name is required'),
	email: z.string().email('Invalid email address').optional().or(z.literal('')),
	phone: z.string().optional(),
	rsvpStatus: z.enum(['PENDING', 'CONFIRMED', 'DECLINED']),
});

type UpdateGuestFormValues = z.infer<typeof updateGuestSchema>;

export default function EditGuestPage({ params }: { params: Promise<{ id: string }> }) {
	const [id, setId] = useState<string>('');
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);

	const form = useForm<UpdateGuestFormValues>({
		resolver: zodResolver(updateGuestSchema),
		defaultValues: {
			guestName: '',
			email: '',
			phone: '',
			rsvpStatus: 'PENDING',
		},
	});

	useEffect(() => {
		let active = true;
		params.then(p => { if (active) setId(p.id); });
		return () => { active = false; };
	}, [params]);

	const fetchGuest = useCallback(async () => {
		if (!id) return; // Wait for id resolution
		try {
			setError(null);
			const response = await fetch(`/api/guests/${id}`);
			if (!response.ok) {
				throw new Error('Failed to fetch guest');
			}
      
			const data = await response.json();
			form.reset(data.guest);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to fetch guest';
			setError(errorMessage);
			toast.error(errorMessage);
		}
	}, [id, form]);

	useEffect(() => {
		fetchGuest();
	}, [fetchGuest, id]);

	const onSubmit = async (values: UpdateGuestFormValues) => {
		const promise = new Promise(async (resolve, reject) => {
			try {
				const response = await fetch(`/api/guests/${id}`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(values),
				});

				if (!response.ok) {
					const data = await response.json();
					throw new Error(data.error || 'Failed to update guest');
				}

				router.push('/dashboard/guests');
				router.refresh();
				resolve('Guest updated successfully');
			} catch (err) {
				reject(err);
			}
		});
		toast.promise(promise, {
			loading: 'Updating guest...',
			success: 'Guest updated successfully',
			error: 'Failed to update guest',
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
						<Button onClick={fetchGuest} className="wedding-button-primary">
							Try Again
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}
	return (
		<div className="section-frame py-8 space-y-6 animate-fade-up-soft">
			<Button
				variant="ghost"
				className="mb-4"
				onClick={() => router.back()}
			>
				<ArrowLeft className="w-4 h-4 mr-2" />
				Back
			</Button>
			<Card className="wedding-elevated-card">
				<CardHeader>
					<div className="accent-bar-gold mb-2">
						<CardTitle className="text-3xl font-bold text-royal-navy font-playfair-display">Edit Guest</CardTitle>
					</div>
					<CardDescription className="text-slate-gray font-inter">
						Update guest information and RSVP status
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
										<FormDescription className="text-slate-gray font-inter">
											Email is required for sending invitations
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-royal-navy font-inter">Phone</FormLabel>
										<FormControl>
											<Input type="tel" placeholder="Phone number" {...field} className="input-elevated h-12" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="rsvpStatus"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-royal-navy font-inter">RSVP Status</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select RSVP status" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="PENDING">Pending</SelectItem>
												<SelectItem value="CONFIRMED">Confirmed</SelectItem>
												<SelectItem value="DECLINED">Declined</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="flex justify-end space-x-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => router.back()}
									className="btn-outline-gold"
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={form.formState.isSubmitting}
									className="btn-gradient-primary"
								>
									{form.formState.isSubmitting ? 'Updating...' : 'Update Guest'}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}