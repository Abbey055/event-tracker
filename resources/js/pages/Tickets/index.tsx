import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle2,
    Download,
    ImageIcon,
    MapPin,
    Heart,
    Bell,
    BellRing,
    Info,
    Users,
    PlayCircle,
    QrCode,
    Ticket as TicketIcon,
    XCircle,
    ArrowRight,
    Search,
    SlidersHorizontal,
    Clock3,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface Event {
    id: number;
    name: string;
    description: string;
    event_date: string;
    venue?: string | null;
    organizer_name?: string | null;
    organizer_email?: string | null;
    capacity?: number;
    tickets_count?: number;
    available_tickets?: number;
    image_url?: string | null;
    video_url?: string | null;
    ticket_categories?: { name: string; price: number }[] | null;
    is_following?: boolean;
    is_favorite?: boolean;
    status?: 'upcoming' | 'ongoing' | 'completed';
}

interface EventNotification {
    id: number;
    event_id: number | null;
    type: string;
    title: string;
    message: string;
    read_at: string | null;
    created_at: string;
}

interface Ticket {
    id: number;
    barcode: string;
    is_verified: boolean;
    verified_at: string | null;
    created_at: string;
    event: Event;
}

interface Props {
    events: Event[];
    userTickets: Ticket[];
    notifications?: EventNotification[];
}

export default function TicketsIndex({ events, userTickets, notifications = [] }: Props) {
    const { auth } = usePage().props;
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const hiddenQrRef = useRef<HTMLDivElement>(null);

    const handleRegister = (eventId: number) => {
        router.post(`/tickets/register/${eventId}`);
    };

    const showQRCode = (ticket: Ticket) => {
        setSelectedTicket(ticket);
    };

    const toggleFollow = (event: Event) => {
        if (event.is_following) {
            router.delete(`/tickets/${event.id}/follow`);
        } else {
            router.post(`/tickets/${event.id}/follow`, { notify_changes: true, reminder_minutes: 1440 });
        }
    };

    const toggleFavorite = (event: Event) => {
        if (event.is_favorite) {
            router.delete(`/tickets/${event.id}/favorite`);
        } else {
            router.post(`/tickets/${event.id}/favorite`);
        }
    };

    const [isGenerating, setIsGenerating] = useState(false);
    const [tempTicket, setTempTicket] = useState<Ticket | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [eventFilter, setEventFilter] = useState<'all' | 'upcoming' | 'ongoing'>('all');

    const filteredEvents = events.filter((event) => {
        const matchesFilter = eventFilter === 'all' || event.status === eventFilter;
        const query = searchTerm.trim().toLowerCase();
        const matchesSearch = !query || [event.name, event.description, event.venue, event.organizer_name]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(query));

        return matchesFilter && matchesSearch;
    });

    const followingCount = events.filter((event) => event.is_following).length;
    const upcomingTickets = userTickets.filter((ticket) => !ticket.is_verified).length;

    const generateTicketCanvas = async (ticket: Ticket): Promise<HTMLCanvasElement> => {
        setIsGenerating(true);
        setTempTicket(ticket);

        try {
            await new Promise((resolve) => setTimeout(resolve, 500));

            const container = hiddenQrRef.current;
            const svgElement = container?.querySelector('svg');

            if (!svgElement) {
                console.error('Hidden QR container contents:', container?.innerHTML);
                throw new Error('Could not generate QR code.');
            }

            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgElement);
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            return await new Promise<HTMLCanvasElement>((resolve, reject) => {
                const image = new Image();

                image.onload = () => {
                    const canvas = document.createElement('canvas');
                    const scale = 3;
                    const width = 350 * scale;
                    const height = 550 * scale;
                    canvas.width = width;
                    canvas.height = height;

                    const context = canvas.getContext('2d');
                    if (!context) {
                        URL.revokeObjectURL(url);
                        reject(new Error('Could not create ticket canvas.'));
                        return;
                    }

                    context.fillStyle = '#ffffff';
                    context.beginPath();
                    context.roundRect(0, 0, width, height, 20 * scale);
                    context.fill();

                    const gradient = context.createLinearGradient(0, 0, width, 100 * scale);
                    gradient.addColorStop(0, '#1e4aef');
                    gradient.addColorStop(1, '#6366f1');
                    context.fillStyle = gradient;
                    context.beginPath();
                    context.roundRect(0, 0, width, 100 * scale, [20 * scale, 20 * scale, 0, 0]);
                    context.fill();

                    context.fillStyle = '#ffffff';
                    context.font = `bold ${22 * scale}px sans-serif`;
                    context.textAlign = 'center';
                    context.fillText(ticket.event.name.toUpperCase(), width / 2, 45 * scale);

                    context.font = `${14 * scale}px sans-serif`;
                    context.fillText(
                        new Date(ticket.event.event_date).toLocaleString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                        }),
                        width / 2,
                        75 * scale,
                    );

                    context.fillStyle = '#f8fafc';
                    context.beginPath();
                    context.arc(0, 100 * scale, 15 * scale, 0, Math.PI * 2);
                    context.fill();

                    context.beginPath();
                    context.arc(width, 100 * scale, 15 * scale, 0, Math.PI * 2);
                    context.fill();

                    context.setLineDash([10 * scale, 10 * scale]);
                    context.strokeStyle = '#e2e8f0';
                    context.lineWidth = 2 * scale;
                    context.beginPath();
                    context.moveTo(20 * scale, 100 * scale);
                    context.lineTo((width - 20 * scale), 100 * scale);
                    context.stroke();
                    context.setLineDash([]);

                    context.fillStyle = '#64748b';
                    context.font = `bold ${12 * scale}px sans-serif`;
                    context.fillText('DIGITAL ENTRY PASS', width / 2, 140 * scale);

                    const qrSize = 220 * scale;
                    const qrX = (width - qrSize) / 2;
                    const qrY = 160 * scale;
                    context.drawImage(image, qrX, qrY, qrSize, qrSize);

                    context.fillStyle = '#0f172a';
                    context.font = `bold ${24 * scale}px monospace`;
                    const barcode = ticket.barcode.split('').join(' ');
                    context.fillText(barcode, width / 2, 430 * scale);

                    context.fillStyle = '#94a3b8';
                    context.font = `${10 * scale}px sans-serif`;
                    context.fillText('VALID FOR SINGLE ENTRY ONLY', width / 2, 460 * scale);

                    context.fillStyle = '#1e293b';
                    context.font = `bold ${12 * scale}px sans-serif`;
                    context.fillText('NON-TRANSFERABLE', width / 2, 510 * scale);
                    URL.revokeObjectURL(url);
                    resolve(canvas);
                };

                image.onerror = () => {
                    URL.revokeObjectURL(url);
                    reject(new Error('Could not load generated QR code.'));
                };

                image.src = url;
            });
        } finally {
            setIsGenerating(false);
            setTempTicket(null);
        }
    };

    const downloadTicketImage = async (ticket: Ticket) => {
        try {
            setIsGenerating(true);
            const canvas = await generateTicketCanvas(ticket);
            const pngUrl = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');

            downloadLink.href = pngUrl;
            downloadLink.download = `ticket-${ticket.barcode}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        } catch (error) {
            console.error('Failed to download ticket image:', error);
        } finally {
            setIsGenerating(false);
            setTempTicket(null);
        }
    };

    const downloadTicketPDF = async (ticket: Ticket) => {
        try {
            setIsGenerating(true);
            const canvas = await generateTicketCanvas(ticket);
            const pngUrl = canvas.toDataURL('image/png', 1.0);

            const pdfWidth = 100;
            const pdfHeight = 157;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [pdfWidth, pdfHeight],
            });

            doc.addImage(pngUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            doc.save(`ticket-${ticket.barcode}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Could not generate ticket PDF.');
        } finally {
            setIsGenerating(false);
            setTempTicket(null);
        }
    };

    return (
        <>
            <Head title="My Tickets" />

            <div className="et-page-enter mx-auto flex w-full min-w-0 max-w-[1440px] flex-col gap-8 px-4 py-4 sm:gap-10 sm:px-6 sm:py-6 lg:px-8">
                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-5 text-white shadow-lg transition-shadow duration-300 hover:shadow-xl sm:p-8">
                    <div className="relative z-10 max-w-2xl">
                        <div className="mb-4 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-sm backdrop-blur-sm">
                            <TicketIcon className="mr-2 size-4" /> Event Tracker
                        </div>
                        <h1 className="mobile-page-title text-3xl font-bold tracking-tight sm:text-4xl">Welcome back{auth?.user?.name ? `, ${auth.user.name.split(' ')[0]}` : ''}.</h1>
                        <p className="mobile-page-subtitle mt-3 max-w-xl text-base text-blue-100 sm:text-lg">Discover your next experience, keep up with events you follow, and access every ticket in one secure place.</p>
                    </div>
                    <div className="absolute -top-20 -right-16 size-64 rounded-full bg-blue-400/30 blur-3xl" />
                    <div className="absolute -bottom-24 -left-12 size-64 rounded-full bg-fuchsia-500/25 blur-3xl" />
                </section>

                <section className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border bg-card p-4 shadow-sm"><p className="text-2xl font-bold text-primary">{followingCount}</p><p className="mt-1 text-sm text-muted-foreground">Events you&apos;re following</p></div>
                    <div className="rounded-2xl border bg-card p-4 shadow-sm"><p className="text-2xl font-bold text-primary">{upcomingTickets}</p><p className="mt-1 text-sm text-muted-foreground">Upcoming tickets</p></div>
                    <div className="rounded-2xl border bg-card p-4 shadow-sm"><p className="text-2xl font-bold text-primary">{notifications.filter((notification) => !notification.read_at).length}</p><p className="mt-1 text-sm text-muted-foreground">Unread updates</p></div>
                </section>

                {notifications.length > 0 && (
                    <Card id="updates" className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <BellRing className="h-5 w-5 text-blue-600" />
                                Event updates
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {notifications.map((notification) => (
                                <div key={notification.id} className="flex items-start justify-between gap-4 rounded-lg bg-background p-3">
                                    <div>
                                        <p className="font-medium">{notification.title}</p>
                                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                                    </div>
                                    {!notification.read_at && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => router.patch(`/tickets/notifications/${notification.id}/read`)}
                                        >
                                            Mark read
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Available Events Section */}
                <div className="space-y-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="w-full"><p className="mobile-page-subtitle text-sm font-medium text-primary">Discover</p><h2 className="mobile-page-title text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Explore events</h2><p className="mobile-page-subtitle mt-1 text-sm text-muted-foreground">Find experiences worth remembering.</p></div>
                        <div className="relative w-full sm:max-w-xs"><Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search events or venues" className="h-10 w-full rounded-xl border bg-background pr-3 pl-9 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary" /></div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <SlidersHorizontal className="mr-1 size-4 text-muted-foreground" />
                        {(['all', 'upcoming', 'ongoing'] as const).map((filter) => <Button key={filter} type="button" size="sm" variant={eventFilter === filter ? 'default' : 'outline'} onClick={() => setEventFilter(filter)} className="rounded-full capitalize">{filter}</Button>)}
                    </div>

                    {filteredEvents.length > 0 ? (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredEvents.map((event, eventIndex) => {
                                const isRegistered = userTickets.some((ticket) => ticket.event.id === event.id);

                                return (
                                    <div
                                        key={event.id}
                                        className="et-card-enter et-event-card group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card text-card-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
                                        style={{ '--et-delay': `${Math.min(eventIndex, 5) * 55}ms` } as React.CSSProperties}
                                    >
                                        <div className="relative flex h-24 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-2.5 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 sm:h-36 sm:p-5">
                                            {event.image_url ? (
                                                <img src={event.image_url} alt={event.name} className="h-full w-full object-cover" />
                                            ) : (
                                            <Calendar className="size-8 text-slate-300 transition-colors group-hover:text-blue-200 sm:size-12" />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                            <div className="absolute top-3 right-3 flex gap-2">
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="secondary"
                                                    className="h-8 w-8 rounded-full bg-white/90 shadow-sm hover:bg-white"
                                                    onClick={() => toggleFavorite(event)}
                                                    aria-label={event.is_favorite ? 'Remove from saved events' : 'Save event'}
                                                >
                                                    <Heart className={`et-icon-pop h-4 w-4 transition-transform ${event.is_favorite ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="secondary"
                                                    className="h-8 w-8 rounded-full bg-white/90 shadow-sm hover:bg-white"
                                                    onClick={() => toggleFollow(event)}
                                                    aria-label={event.is_following ? 'Unfollow event' : 'Follow event'}
                                                >
                                                    {event.is_following ? <BellRing className="et-icon-pop h-4 w-4 text-blue-600" /> : <Bell className="et-icon-pop h-4 w-4 text-slate-600" />}
                                                </Button>
                                            </div>
                                            <Badge className="absolute bottom-3 left-3 bg-white/90 text-slate-800 hover:bg-white">
                                                {event.status === 'ongoing' ? 'Ongoing' : event.status === 'completed' ? 'Completed' : 'Upcoming'}
                                            </Badge>
                                        </div>

                                        <div className="flex min-w-0 flex-1 flex-col p-2.5 sm:p-5">
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                                                    {new Date(event.event_date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </Badge>
                                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="size-3.5" />{new Date(event.event_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                                            </div>
                                            <h3 className="mobile-page-title mb-1 text-lg font-bold leading-tight tracking-tight transition-colors group-hover:text-primary sm:text-left">
                                                {event.name}
                                            </h3>
                                            <p className="mobile-page-subtitle mb-2 line-clamp-1 flex-1 text-sm text-muted-foreground sm:text-left sm:line-clamp-2">
                                                {event.description}
                                            </p>
                                            <div className="mb-2 flex flex-wrap gap-3 text-xs text-muted-foreground sm:justify-start">
                                                {event.venue && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{event.venue}</span>}
                                                {event.available_tickets !== null && event.available_tickets !== undefined && (
                                                    <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{event.available_tickets} seats left</span>
                                                )}
                                            </div>
                                            <Button
                                                onClick={() => setSelectedEvent(event)}
                                                disabled={isRegistered}
                                                className={`h-9 w-full font-semibold shadow-sm transition-all ${
                                                    isRegistered
                                                        ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                                        : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02]'
                                                }`}
                                            >
                                                {isRegistered ? (
                                                    <>
                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                        Registered
                                                    </>
                                                ) : (
                                                    <>
                                                        View Details
                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex animate-in fade-in-50 flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center">
                            <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                                <Calendar className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold">No events scheduled</h3>
                            <p className="text-muted-foreground">Check back later for exciting upcoming events.</p>
                        </div>
                    )}
                </div>

                <Separator className="my-2" />

                {/* My Tickets Section */}
                <div id="my-tickets" className="scroll-mt-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="w-full">
                            <h2 className="mobile-page-title text-2xl font-bold tracking-tight text-foreground">My Tickets</h2>
                            <p className="mobile-page-subtitle text-muted-foreground">Access your passes and view status.</p>
                        </div>
                    </div>

                    {userTickets.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {userTickets.map((ticket) => (
                                <Card
                                    key={ticket.id}
                                    className="overflow-hidden border-l-4 border-zinc-700 shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <CardHeader className="bg-zinc-50/50 pb-4 dark:bg-zinc-950/70">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-2">
                                                <Badge
                                                    variant={ticket.is_verified ? 'default' : 'secondary'}
                                                    className={`transition-colors ${
                                                        ticket.is_verified
                                                            ? 'border-transparent bg-green-500 text-white hover:bg-green-600'
                                                            : 'border-yellow-200 bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                    }`}
                                                >
                                                    {ticket.is_verified ? (
                                                        <span className="flex items-center gap-1">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Verified
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1">
                                                            <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
                                                            Pending Check-in
                                                        </span>
                                                    )}
                                                </Badge>
                                                <div className="w-fit rounded border bg-background px-2 py-1 font-mono text-xs text-muted-foreground">
                                                    {ticket.barcode}
                                                </div>
                                                <CardTitle className="mt-2 text-xl">{ticket.event.name}</CardTitle>
                                                <CardDescription className="flex items-center gap-2 mt-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {new Date(ticket.event.event_date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                    })}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between rounded-lg border bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-950">
                                            <div className="rounded-md border border-zinc-200 bg-white p-2 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                                                <QRCodeSVG
                                                    value={ticket.barcode}
                                                    size={80}
                                                    level="H"
                                                    includeMargin
                                                    bgColor="#ffffff"
                                                    fgColor="#0f172a"
                                                />
                                            </div>
                                            <div className="text-sm">
                                                <div className="font-medium text-foreground">Digital Pass</div>
                                                <div className="text-xs text-muted-foreground">Scan at entrance</div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-primary hover:bg-primary/5 hover:text-primary"
                                                onClick={() => showQRCode(ticket)}
                                            >
                                                View
                                            </Button>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="gap-2 border-t bg-zinc-50/50 p-4 dark:bg-zinc-950/70">
                                        <Button
                                            onClick={() => downloadTicketPDF(ticket)}
                                            variant="outline"
                                            disabled={isGenerating}
                                            className="flex-1 text-xs font-medium hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                                        >
                                            {isGenerating && tempTicket?.id === ticket.id ? (
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                            ) : (
                                                <Download className="mr-2 h-3.5 w-3.5" />
                                            )}
                                            PDF Ticket
                                        </Button>
                                        <Button
                                            onClick={() => downloadTicketImage(ticket)}
                                            variant="outline"
                                            disabled={isGenerating}
                                            className="flex-1 text-xs font-medium hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                                        >
                                            <ImageIcon className="mr-2 h-3.5 w-3.5" />
                                            PNG
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex animate-in fade-in-50 flex-col items-center justify-center rounded-2xl border border-dashed bg-slate-50/50 p-12 text-center dark:bg-slate-900/50">
                            <TicketIcon className="mb-4 h-10 w-10 text-slate-300" />
                            <h3 className="text-lg font-medium text-muted-foreground">No tickets yet</h3>
                            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                                You haven&apos;t registered for any events yet. Browse the upcoming events above to get started.
                            </p>
                            <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="mt-6">
                                Browse Events
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Event Details Dialog */}
            {selectedEvent && (
                <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                    <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                        {selectedEvent.image_url && (
                            <img src={selectedEvent.image_url} alt={selectedEvent.name} className="h-56 w-full rounded-lg object-cover" />
                        )}
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-2xl">
                                <Info className="h-5 w-5 text-primary" />
                                {selectedEvent.name}
                            </DialogTitle>
                            <DialogDescription>{selectedEvent.description}</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-lg border p-4">
                                <div className="mb-1 flex items-center gap-2 text-sm font-medium"><Calendar className="h-4 w-4 text-primary" /> Date and time</div>
                                <p className="text-sm text-muted-foreground">{new Date(selectedEvent.event_date).toLocaleString()}</p>
                            </div>
                            <div className="rounded-lg border p-4">
                                <div className="mb-1 flex items-center gap-2 text-sm font-medium"><MapPin className="h-4 w-4 text-primary" /> Venue</div>
                                <p className="text-sm text-muted-foreground">{selectedEvent.venue || 'Venue will be announced'}</p>
                            </div>
                            <div className="rounded-lg border p-4">
                                <div className="mb-1 flex items-center gap-2 text-sm font-medium"><Users className="h-4 w-4 text-primary" /> Organizer</div>
                                <p className="text-sm text-muted-foreground">{selectedEvent.organizer_name || 'Event organizer'}</p>
                                {selectedEvent.organizer_email && <p className="text-xs text-muted-foreground">{selectedEvent.organizer_email}</p>}
                            </div>
                            <div className="rounded-lg border p-4">
                                <div className="mb-1 flex items-center gap-2 text-sm font-medium"><TicketIcon className="h-4 w-4 text-primary" /> Availability</div>
                                <p className="text-sm text-muted-foreground">
                                    {selectedEvent.available_tickets === null || selectedEvent.available_tickets === undefined
                                        ? 'Seat availability has not been configured.'
                                        : selectedEvent.available_tickets + ' of ' + selectedEvent.capacity + ' seats available'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold">Ticket categories and prices</h3>
                            {selectedEvent.ticket_categories && selectedEvent.ticket_categories.length > 0 ? (
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {selectedEvent.ticket_categories.map((category) => (
                                        <div key={category.name} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                                            <span>{category.name}</span>
                                            <span className="font-semibold">{category.price === 0 ? 'Free' : `${category.price.toLocaleString()} UGX`}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Ticket pricing will be announced by the organizer.</p>
                            )}
                        </div>

                        {selectedEvent.video_url && (
                            <a href={selectedEvent.video_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                                <PlayCircle className="h-4 w-4" /> Watch event video
                            </a>
                        )}

                        <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                            <Button type="button" variant="outline" onClick={() => toggleFavorite(selectedEvent)}>
                                <Heart className={`mr-2 h-4 w-4 ${selectedEvent.is_favorite ? 'fill-red-500 text-red-500' : ''}`} />
                                {selectedEvent.is_favorite ? 'Saved' : 'Save event'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => toggleFollow(selectedEvent)}>
                                {selectedEvent.is_following ? <BellRing className="mr-2 h-4 w-4" /> : <Bell className="mr-2 h-4 w-4" />}
                                {selectedEvent.is_following ? 'Following' : 'Follow event'}
                            </Button>
                            <Button type="button" onClick={() => { handleRegister(selectedEvent.id); setSelectedEvent(null); }} disabled={(selectedEvent.available_tickets !== null && selectedEvent.available_tickets !== undefined && selectedEvent.available_tickets <= 0) || userTickets.some((ticket) => ticket.event.id === selectedEvent.id)}>
                                {userTickets.some((ticket) => ticket.event.id === selectedEvent.id) ? 'Registered' : 'Get Ticket'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* QR Code Dialog / Mobile Pass View */}
            {selectedTicket && (
                <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
                    <DialogContent className="max-w-[400px] overflow-hidden rounded-[2.5rem] border-0 p-0 shadow-2xl">
                        <DialogHeader className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-indigo-800 p-10 text-center text-white">
                            <div className="absolute -bottom-4 -left-4 h-8 w-8 rounded-full bg-white shadow-inner dark:bg-slate-900" />
                            <div className="absolute -bottom-4 -right-4 h-8 w-8 rounded-full bg-white shadow-inner dark:bg-slate-900" />
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                            <DialogTitle className="relative mb-1 text-2xl font-extrabold leading-tight tracking-tight text-white">
                                {selectedTicket.event.name.toUpperCase()}
                            </DialogTitle>
                            <DialogDescription className="relative flex items-center justify-center gap-2 text-sm font-medium text-blue-100">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(selectedTicket.event.event_date).toLocaleString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                })}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="relative flex flex-col items-center gap-8 bg-white p-10 dark:bg-slate-900">
                            {/* Boundary line */}
                            <div className="absolute top-0 left-10 right-10 border-t-2 border-dashed border-slate-200 dark:border-slate-800" />

                            <div className="transition-transform duration-300 hover:scale-105">
                                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xl ring-4 ring-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:ring-indigo-950/50">
                                    <QRCodeSVG
                                        value={`${window.location.origin}/tickets/verify/${selectedTicket.barcode}`}
                                        size={200}
                                        level="H"
                                        className="h-auto w-full transition-all"
                                    />
                                </div>
                            </div>

                            <div className="w-full space-y-5 text-center">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Verification ID</p>
                                    <p className="font-mono text-2xl font-black tracking-[0.3em] text-slate-900 dark:text-white">
                                        {selectedTicket.barcode}
                                    </p>
                                </div>

                                <div className="flex items-center justify-center">
                                    {selectedTicket.is_verified ? (
                                        <Badge className="rounded-full border-none bg-emerald-500 px-4 py-1.5 text-white shadow-md hover:bg-emerald-600">
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Ticket Verified
                                        </Badge>
                                    ) : (
                                        <Badge className="animate-pulse rounded-full border-none bg-indigo-600 px-4 py-1.5 text-white shadow-lg">
                                            <div className="mr-2 h-2 w-2 rounded-full bg-white" />
                                            Ready to Scan
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="grid w-full grid-cols-2 gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
                                <Button
                                    variant="outline"
                                    className="h-11 rounded-xl border-slate-200 text-xs font-semibold hover:bg-slate-50"
                                    onClick={() => downloadTicketPDF(selectedTicket)}
                                    disabled={isGenerating}
                                >
                                    <Download className="mr-2 h-4 w-4 text-blue-600" />
                                    PDF
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-11 rounded-xl border-slate-200 text-xs font-semibold hover:bg-slate-50"
                                    onClick={() => downloadTicketImage(selectedTicket)}
                                    disabled={isGenerating}
                                >
                                    <ImageIcon className="mr-2 h-4 w-4 text-indigo-600" />
                                    Image
                                </Button>
                                <Button
                                    className="col-span-2 h-11 rounded-xl bg-slate-900 font-bold text-white shadow-xl hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                                    onClick={() => setSelectedTicket(null)}
                                >
                                    Done
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Hidden Container for Client-Side Generation */}
            <div
                ref={hiddenQrRef}
                style={{ position: 'fixed', top: '-10000px', left: '-10000px', opacity: 0, pointerEvents: 'none' }}
            >
                {tempTicket && (
                    <QRCodeSVG
                        value={`${window.location.origin}/tickets/verify/${tempTicket.barcode}`}
                        size={256}
                    />
                )}
            </div>
        </>
    );
}
