import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Bell, CalendarDays, ChevronRight, Heart, MapPin, Ticket, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { dashboard } from '@/routes';

type UserEvent = { id: number; name: string; event_date: string; venue?: string | null; image_url?: string | null };
type UserTicket = { id: number; barcode: string; is_verified: boolean; event?: UserEvent | null };

interface DashboardProps {
    totalEvents?: number; totalUsers?: number; totalTickets?: number; totalRevenue?: number; totalAttendees?: number;
    upcomingEvents?: number; ongoingEvents?: number; completedEvents?: number;
    userEvents?: UserEvent[]; userTickets?: UserTicket[]; userNotifications?: number;
}

export default function Dashboard({ totalEvents, totalUsers, totalTickets, totalRevenue, totalAttendees, upcomingEvents, ongoingEvents, completedEvents, userEvents = [], userTickets = [], userNotifications = 0 }: DashboardProps) {
    const { auth } = usePage().props;
    const isAdmin = auth.user?.role === 'admin';
    const [greeting, setGreeting] = useState(getGreeting);

    useEffect(() => {
        const updateGreeting = () => setGreeting(getGreeting());
        const interval = window.setInterval(updateGreeting, 60_000);

        updateGreeting();
        return () => window.clearInterval(interval);
    }, []);

    if (!isAdmin) {
        const firstName = auth.user?.name?.split(' ')[0] ?? 'there';
        return <><Head title="Dashboard" /><div className="min-w-0 space-y-6 p-1 sm:space-y-8 sm:p-2">
            <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="w-full"><p className="mobile-page-subtitle text-sm font-medium text-primary">Your dashboard</p><h1 className="mobile-page-title text-3xl font-bold tracking-tight sm:text-4xl">{greeting}, {firstName} <span aria-hidden>👋</span></h1><p className="mobile-page-subtitle mt-1 text-muted-foreground">Ready for your next experience?</p></div><Link href="/tickets" className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground sm:w-auto">Discover events <ChevronRight className="ml-1 size-4" /></Link></section>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><QuickAccess href="/tickets" icon={<CalendarDays />} label="Discover" value={`${userEvents.length} upcoming`} /><QuickAccess href="/tickets#my-tickets" icon={<Ticket />} label="My tickets" value={`${userTickets.length} saved`} /><QuickAccess href="/tickets#updates" icon={<Bell />} label="Updates" value={`${userNotifications} unread`} /><QuickAccess href="/tickets" icon={<Heart />} label="Following" value="View events" /></div>
            <section className="space-y-4"><div className="flex items-center justify-between"><div className="w-full"><h2 className="mobile-page-title text-xl font-semibold sm:text-2xl">Upcoming events</h2><p className="mobile-page-subtitle text-sm text-muted-foreground">Your next opportunities to connect and explore.</p></div><Link href="/tickets" className="shrink-0 text-sm font-medium text-primary">View all</Link></div>{userEvents.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{userEvents.map((event) => <Card key={event.id} className="overflow-hidden transition-shadow hover:shadow-md"><div className="flex h-20 items-center gap-3 bg-gradient-to-br from-blue-600 to-indigo-700 p-3 text-white sm:h-24">{event.image_url ? <img src={event.image_url} alt="" className="size-14 rounded-lg object-cover sm:size-16" /> : <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-white/15 sm:size-16"><CalendarDays className="size-7" /></div>}<div className="min-w-0"><p className="truncate font-semibold">{event.name}</p><p className="mt-1 text-xs text-blue-100">{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p></div></div><CardContent className="space-y-2 p-4"><p className="flex items-center gap-2 truncate text-sm text-muted-foreground"><MapPin className="size-4 shrink-0 text-primary" />{event.venue || 'Venue to be announced'}</p><Link href="/tickets" className="inline-flex items-center text-sm font-medium text-primary">View event <ChevronRight className="ml-1 size-4" /></Link></CardContent></Card>)}</div> : <EmptyState title="No upcoming events yet" text="Explore events to find your next experience." />}</section>
            <section className="space-y-4"><div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold sm:text-2xl">Your tickets</h2><p className="text-sm text-muted-foreground">Quick access to your registered events.</p></div><Link href="/tickets#my-tickets" className="text-sm font-medium text-primary">View tickets</Link></div>{userTickets.length ? <div className="divide-y rounded-2xl border bg-card">{userTickets.slice(0, 4).map((ticket) => <div key={ticket.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-center gap-3"><div className="rounded-lg bg-primary/10 p-2 text-primary"><Ticket className="size-5" /></div><div className="min-w-0"><p className="truncate font-medium">{ticket.event?.name || 'Event ticket'}</p><p className="truncate text-xs text-muted-foreground">{ticket.barcode} · {ticket.event?.venue || 'Venue pending'}</p></div></div><span className="text-xs font-medium text-muted-foreground">{ticket.is_verified ? 'Checked in' : 'Ready to use'}</span></div>)}</div> : <EmptyState title="No tickets yet" text="Your registered tickets will appear here." />}</section>
        </div></>;
    }

    const firstName = auth.user?.name?.split(' ')[0] ?? 'there';
    return <><Head title="Dashboard" /><div className="mx-auto flex min-w-0 w-full max-w-[1440px] flex-1 flex-col gap-4 overflow-x-auto rounded-xl px-4 py-4 sm:px-6 lg:px-8"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><AdminStat label="Total Events" value={totalEvents ?? 0} icon={<CalendarDays />} /><AdminStat label="Revenue" value={`${Number(totalRevenue ?? 0).toLocaleString()} UGX`} /><AdminStat label="Attendees" value={totalAttendees ?? 0} icon={<Users />} /><AdminStat label="Total Users" value={totalUsers ?? 0} icon={<Users />} /><AdminStat label="Total Tickets" value={totalTickets ?? 0} icon={<Ticket />} /></div><div className="flex min-h-[260px] items-center justify-center rounded-xl border border-sidebar-border/70 p-6 text-center"><div><h2 className="text-2xl font-bold">{greeting}, {firstName}</h2><p className="text-muted-foreground">Manage your events, users, tickets, and attendance.</p><p className="mt-4 text-sm text-muted-foreground">Upcoming: {upcomingEvents ?? 0} · Ongoing: {ongoingEvents ?? 0} · Completed: {completedEvents ?? 0}</p></div></div></div></>;
}

function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}

function QuickAccess({ href, icon, label, value }: { href: string; icon: React.ReactNode; label: string; value: string }) { return <Link href={href} className="group rounded-2xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"><div className="mb-5 flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary [&_svg]:size-4">{icon}</div><p className="font-medium">{label}</p><p className="mt-1 text-xs text-muted-foreground">{value}</p></Link>; }
function AdminStat({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) { return <Card><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>{icon && <span className="text-muted-foreground [&_svg]:size-5">{icon}</span>}</CardContent></Card>; }
function EmptyState({ title, text }: { title: string; text: string }) { return <div className="rounded-2xl border border-dashed p-8 text-center"><p className="font-medium">{title}</p><p className="mt-1 text-sm text-muted-foreground">{text}</p></div>; }

Dashboard.layout = { breadcrumb: [{ title: 'Dashboard', href: dashboard() }] };
