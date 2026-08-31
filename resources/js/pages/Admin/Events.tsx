import { Head, router, useForm } from '@inertiajs/react';
import { CalendarIcon, ImagePlus, Pencil, Plus, Trash2, UserRound, Video } from 'lucide-react';
import { type DragEvent, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface Event {
    id: number;
    name: string;
    description: string;
    event_date: string;
    tickets_count?: number;
    created_at: string;
    venue?: string | null;
    organizer_name?: string | null;
    organizer_email?: string | null;
    capacity?: number;
    image_url?: string | null;
    video_url?: string | null;
    ticket_categories?: { name: string; price: number }[] | null;
}

interface FileDropzoneProps {
    label: string;
    accept: string;
    file: File | null;
    existingUrl?: string | null;
    onChange: (file: File | null) => void;
    icon: typeof ImagePlus;
}

function FileDropzone({ label, accept, file, existingUrl, onChange, icon: Icon }: FileDropzoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl ?? null);
    const isImage = accept.startsWith('image/');

    useEffect(() => {
        if (!file) {
            setPreviewUrl(existingUrl ?? null);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [existingUrl, file]);

    const selectFile = (selectedFile: File | undefined) => {
        if (selectedFile) onChange(selectedFile);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragging(false);
        selectFile(event.dataTransfer.files[0]);
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => event.key === 'Enter' && inputRef.current?.click()}
            onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition-colors ${dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'}`}
        >
            <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(event) => selectFile(event.target.files?.[0])} />
            {previewUrl && isImage ? (
                <img src={previewUrl} alt="Selected event" className="mx-auto mb-2 h-24 max-w-full rounded-lg object-cover" />
            ) : previewUrl ? (
                <video src={previewUrl} className="mx-auto mb-2 h-24 max-w-full rounded-lg object-cover" muted />
            ) : (
                <Icon className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
            )}
            <p className="text-sm font-medium">{file?.name ?? label}</p>
            <p className="mt-1 text-xs text-muted-foreground">Drag and drop or click to browse</p>
            {existingUrl && !file && <p className="mt-1 truncate text-xs text-primary">Existing file will be kept</p>}
            {file && <button type="button" className="mt-2 text-xs text-destructive hover:underline" onClick={(event) => { event.stopPropagation(); onChange(null); }}>Remove selected file</button>}
        </div>
    );
}

interface Props {
    events: {
        data: Event[];
        current_page: number;
        last_page: number;
    };
}

export default function Events({ events }: Props) {
    const [showDialog, setShowDialog] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        description: '',
        event_date: '',
        venue: '',
        organizer_name: '',
        organizer_email: '',
        capacity: '',
        image_url: '',
        video_url: '',
        image: null as File | null,
        video: null as File | null,
        ticket_categories: [
            { name: 'VIP', price: 0 },
            { name: 'Ordinary', price: 0 },
            { name: 'VVIP', price: 0 },
        ],
    });

    const openCreateDialog = () => {
        setEditingEvent(null);
        reset();
        setShowDialog(true);
    };

    const openEditDialog = (event: Event) => {
        setEditingEvent(event);
        setData({
            name: event.name,
            description: event.description,
            event_date: event.event_date.slice(0, 16),
            venue: event.venue ?? '',
            organizer_name: event.organizer_name ?? '',
            organizer_email: event.organizer_email ?? '',
            capacity: event.capacity?.toString() ?? '',
            image_url: event.image_url ?? '',
            video_url: event.video_url ?? '',
            image: null,
            video: null,
            ticket_categories: event.ticket_categories?.length ? event.ticket_categories.map((category) => ({ name: category.name, price: Number(category.price) })) : [
                { name: 'VIP', price: 0 },
                { name: 'Ordinary', price: 0 },
                { name: 'VVIP', price: 0 },
            ],
        });
        setShowDialog(true);
    };

    const submit = () => {
        const options = {
            onSuccess: () => {
                reset();
                setShowDialog(false);
            },
        };

        if (editingEvent) {
            put(`/admin/events/${editingEvent.id}`, { ...options, forceFormData: true });
        } else {
            post('/admin/events', { ...options, forceFormData: true });
        }
    };

    const handleDelete = (eventId: number) =>{
        if(confirm('Are you sure you want to delete?')){
            router.delete(`/admin/events/${eventId}`);
        }
    };

    return (
        <>
            <Head title="Events" />
            <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                            <CalendarIcon className="h-8 w-8" /> Events
                        </h1>
                        <p className="text-muted-foreground">Create and manage your events.</p>
                    </div>
                    <Button type="button" onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" /> Add event
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All events</CardTitle>
                        <CardDescription>View and manage scheduled events.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>
                                        <span className="inline-flex items-center gap-2">
                                            <UserRound className="h-4 w-4" />
                                            Registrations
                                        </span>
                                    </TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {events.data.map((event) => (
                                    <TableRow key={event.id}>
                                        <TableCell className="font-medium">{event.name}</TableCell>
                                        <TableCell>{event.description}</TableCell>
                                        <TableCell>{new Date(event.event_date).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="inline-flex items-center gap-1.5">
                                                <UserRound className="h-3.5 w-3.5" />
                                                {event.tickets_count ?? 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button type="button" variant="outline" className="mr-2" onClick={() => openEditDialog(event)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                            </Button>
                                            <Button type="button" variant="destructive" onClick={() => handleDelete(event.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
                <AlertDialogContent className="max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-lg overflow-y-auto p-4 sm:w-full sm:p-6 lg:max-w-4xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{editingEvent ? 'Edit event' : 'Create event'}</AlertDialogTitle>
                        <AlertDialogDescription>Enter the event details below.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
                        <div className="space-y-2 lg:col-start-1 lg:row-start-1">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={data.name} onChange={(event) => setData('name', event.target.value)} />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>
                        <div className="space-y-2 lg:col-start-2 lg:row-start-1">
                            <Label htmlFor="description">Description</Label>
                            <textarea id="description" value={data.description} onChange={(event) => setData('description', event.target.value)} className="min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm" />
                            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                        </div>
                        <div className="space-y-2 lg:col-span-2">
                            <Label htmlFor="event_date">Event date</Label>
                            <Input id="event_date" type="datetime-local" value={data.event_date} onChange={(event) => setData('event_date', event.target.value)} />
                            {errors.event_date && <p className="text-sm text-destructive">{errors.event_date}</p>}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
                            <div className="space-y-2">
                                <Label htmlFor="venue">Venue / location</Label>
                                <Input id="venue" value={data.venue} onChange={(event) => setData('venue', event.target.value)} placeholder="Main Hall" />
                                {errors.venue && <p className="text-sm text-destructive">{errors.venue}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="capacity">Available seats</Label>
                                <Input id="capacity" type="number" min="1" value={data.capacity} onChange={(event) => setData('capacity', event.target.value)} placeholder="Optional" />
                                {errors.capacity && <p className="text-sm text-destructive">{errors.capacity}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="organizer_name">Organizer</Label>
                                <Input id="organizer_name" value={data.organizer_name} onChange={(event) => setData('organizer_name', event.target.value)} placeholder="Organizer name" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="organizer_email">Organizer email</Label>
                                <Input id="organizer_email" type="email" value={data.organizer_email} onChange={(event) => setData('organizer_email', event.target.value)} placeholder="organizer@example.com" />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label>Ticket fees (UGX)</Label>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    {data.ticket_categories.map((category, index) => (
                                        <div key={category.name} className="space-y-1.5">
                                            <Label htmlFor={`ticket-category-${category.name}`} className="text-xs text-muted-foreground">{category.name}</Label>
                                            <Input id={`ticket-category-${category.name}`} type="number" min="0" placeholder="0 for free" value={category.price} onChange={(event) => setData('ticket_categories', data.ticket_categories.map((item, itemIndex) => itemIndex === index ? { ...item, price: Number(event.target.value) || 0 } : item))} />
                                        </div>
                                    ))}
                                </div>
                                {errors.ticket_categories && <p className="text-sm text-destructive">Enter a valid fee for each ticket category.</p>}
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label>Event image</Label>
                                <FileDropzone label="Upload event image" accept="image/*" file={data.image} existingUrl={data.image_url} onChange={(file) => setData('image', file)} icon={ImagePlus} />
                                {errors.image && <p className="text-sm text-destructive">{errors.image}</p>}
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label>Event video</Label>
                                <FileDropzone label="Upload event video" accept="video/mp4,video/webm,video/quicktime" file={data.video} existingUrl={data.video_url} onChange={(file) => setData('video', file)} icon={Video} />
                                {errors.video && <p className="text-sm text-destructive">{errors.video}</p>}
                            </div>
                        </div>
                        <AlertDialogFooter className="lg:col-span-2">
                            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                            <Button type="button" onClick={submit} disabled={processing}>
                                {processing ? 'Saving...' : 'Save event'}
                            </Button>
                        </AlertDialogFooter>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
