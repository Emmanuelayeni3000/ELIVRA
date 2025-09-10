"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Utensils, Gift, Heart, PartyPopper, Clock, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface Template {
	id: string;
	title: string;
	description: string;
	type: string;
	category: string;
	defaultData: {
		type: string;
		description: string;
		schedule: Array<{
			time: string;
			title: string;
			description?: string;
		}>;
		sections: string[];
		duration: number;
		estimatedGuests: number;
	};
	metadata: {
		isPopular: boolean;
		difficulty: string;
		tags: string[];
	};
}

const TEMPLATE_ICONS = {
	'wedding-ceremony': Heart,
	'wedding-reception': PartyPopper,
	'bridal-shower': Gift,
	'bachelor-party': Users,
	'engagement-party': Heart,
	'rehearsal-dinner': Utensils,
} as const;

export default function EventTemplatesPage() {
	const [templates, setTemplates] = useState<Template[]>([]);
	const [loading, setLoading] = useState<string | null>(null);
	const [selectedCategory, setSelectedCategory] = useState<string>('all');
	const [categories, setCategories] = useState<string[]>([]);
	const router = useRouter();

	useEffect(() => {
		fetchTemplates();
	}, []);

	const fetchTemplates = async () => {
		try {
			const response = await fetch('/api/templates');
			if (!response.ok) throw new Error('Failed to fetch templates');
      
			const data = await response.json();
			const templates: Template[] = data.templates || [];
			setTemplates(templates);
      
			// Extract unique categories
			const uniqueCategories = Array.from(new Set(templates.map((t: Template) => t.category)));
			setCategories(['all', ...uniqueCategories]);
		} catch (error) {
			console.error('Error fetching templates:', error);
			toast.error('Failed to load templates');
		}
	};

	const handleTemplateSelect = async (template: Template) => {
		setLoading(template.id);
		try {
			const response = await fetch('/api/events', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					title: template.title,
					...template.defaultData,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to create event from template');
			}

			toast.success("Event created from template. You can now customize it.");
			router.push(`/dashboard/events/${data.event.id}/edit`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to create event');
		} finally {
			setLoading(null);
		}
	};

	const filteredTemplates = selectedCategory === 'all' 
		? templates 
		: templates.filter(template => template.category === selectedCategory);

	const getTemplateIcon = (templateId: string) => {
		const iconKey = templateId as keyof typeof TEMPLATE_ICONS;
		const IconComponent = TEMPLATE_ICONS[iconKey] || Calendar;
		return <IconComponent className="h-6 w-6" />;
	};

	

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
				<div className="space-y-2">
					<h1 className="text-4xl font-bold text-royal-navy font-playfair-display">
						Event Templates
					</h1>
					<p className="text-slate-gray font-inter">
						Choose a template to quickly create and customize your event
					</p>
				</div>
			</div>

			{/* Category Filter */}
			<div className="mb-8">
				<div className="flex flex-wrap gap-2">
					{categories.map((category) => (
						<Button
							key={category}
							variant={selectedCategory === category ? "default" : "outline"}
							onClick={() => setSelectedCategory(category)}
							className={`capitalize ${
								selectedCategory === category 
									? 'bg-royal-navy text-white' 
									: 'border-royal-navy text-royal-navy hover:bg-royal-navy hover:text-white'
							}`}
						>
							{category === 'all' ? 'All Templates' : category.replace('-', ' ')}
						</Button>
					))}
				</div>
			</div>

			{/* Templates Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredTemplates.map((template) => (
					<Card key={template.id} className="border-2 hover:border-gold-foil transition-colors duration-200">
						<CardHeader className="space-y-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-3">
									<div className="p-2 bg-pearl-beige rounded-lg text-royal-navy">
										{getTemplateIcon(template.id)}
									</div>
									<div>
										<CardTitle className="text-lg font-playfair-display text-royal-navy">
											{template.title}
										</CardTitle>
										<div className="flex items-center space-x-2 mt-1">
											<Badge variant="secondary" className="text-xs">
												{template.category.replace('-', ' ')}
											</Badge>
											{template.metadata.isPopular && (
												<Badge className="text-xs bg-gold-foil text-royal-navy">
													Popular
												</Badge>
											)}
										</div>
									</div>
								</div>
							</div>
							<CardDescription className="text-slate-gray font-inter">
								{template.description}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div className="flex items-center space-x-2">
									<Clock className="h-4 w-4 text-slate-gray" />
									<span className="text-slate-gray">
										{template.defaultData.duration}h duration
									</span>
								</div>
								<div className="flex items-center space-x-2">
									<Users className="h-4 w-4 text-slate-gray" />
									<span className="text-slate-gray">
										~{template.defaultData.estimatedGuests} guests
									</span>
								</div>
							</div>
              
							<div className="flex flex-wrap gap-1">
								{template.metadata.tags.slice(0, 3).map((tag, index) => (
									<div key={index} className="flex items-center space-x-1">
										<Tag className="h-3 w-3 text-slate-gray" />
										<span className="text-xs text-slate-gray">{tag}</span>
									</div>
								))}
							</div>

							<div className="space-y-2">
								<p className="text-sm font-medium text-royal-navy">Includes:</p>
								<ul className="text-sm text-slate-gray space-y-1">
									{template.defaultData.sections.slice(0, 3).map((section, index) => (
										<li key={index} className="flex items-center space-x-2">
											<div className="w-1 h-1 bg-gold-foil rounded-full"></div>
											<span>{section}</span>
										</li>
									))}
									{template.defaultData.sections.length > 3 && (
										<li className="text-xs text-slate-gray/70">
											+{template.defaultData.sections.length - 3} more sections
										</li>
									)}
								</ul>
							</div>

							<Button 
								onClick={() => handleTemplateSelect(template)}
								disabled={loading === template.id}
								className="w-full bg-royal-navy hover:bg-royal-navy/90 text-white"
							>
								{loading === template.id ? 'Creating...' : 'Use Template'}
							</Button>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Empty State */}
			{filteredTemplates.length === 0 && (
				<div className="text-center py-12">
					<Calendar className="h-12 w-12 mx-auto mb-4 text-slate-gray/50" />
					<p className="text-slate-gray">No templates found for the selected category.</p>
				</div>
			)}
		</div>
	);
}
