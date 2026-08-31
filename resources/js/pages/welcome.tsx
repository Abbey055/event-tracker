import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, CalendarDays, CheckCircle2, MapPin, Ticket } from 'lucide-react';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Event Tracker" />
            <div className="min-h-svh overflow-x-hidden bg-slate-50 text-slate-950">
                <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
                    <Link href="/" className="flex min-w-0 items-center gap-3"><img src="/Event%20Tracker.png" alt="Event Tracker" className="size-12 shrink-0 rounded-xl object-contain" /><span className="truncate text-base font-semibold sm:text-lg">Event Tracker</span></Link>
                    <nav className="flex shrink-0 items-center gap-2 sm:gap-4">{auth.user ? <Link href={dashboard()} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white">Dashboard</Link> : <><Link href={login()} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-white sm:px-4">Log in</Link><Link href={register()} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium shadow-sm sm:px-4">Register</Link></>}</nav>
                </header>
                <main className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pb-14 pt-14 sm:px-6 md:pt-20 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:pb-24">
                    <section className="max-w-xl"><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"><CheckCircle2 className="size-4" /> Plan better. Attend more.</div><h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.75rem] lg:leading-[1.05]">Your events, tracked with confidence.</h1><p className="mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">Discover upcoming experiences, keep your tickets in one place, and never miss an important event update.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href={register()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-medium text-white">Get started <ArrowRight className="size-4" /></Link><Link href={login()} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 font-medium">I already have an account</Link></div></section>
                    <section className="relative mx-auto w-full max-w-[32rem]"><div className="absolute -inset-5 rounded-[2rem] bg-blue-100/70 blur-2xl" /><div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-xl sm:p-7"><div className="flex items-center justify-between border-b border-slate-100 pb-5"><div className="flex items-center gap-3"><img src="/Event%20Tracker.png" alt="" className="size-16 object-contain sm:size-20" /><div><p className="font-semibold">Event Tracker</p><p className="text-sm text-slate-500">Everything in one place</p></div></div><Ticket className="size-5 text-blue-600" /></div><div className="mt-6 space-y-4"><div className="rounded-2xl bg-slate-950 p-5 text-white"><p className="text-sm text-slate-300">Next event</p><p className="mt-2 text-xl font-semibold">Build something memorable</p><div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300"><span className="inline-flex items-center gap-2"><CalendarDays className="size-4" /> Upcoming</span><span className="inline-flex items-center gap-2"><MapPin className="size-4" /> Your venue</span></div></div><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-blue-50 p-4"><p className="text-2xl font-bold text-blue-700">24/7</p><p className="mt-1 text-sm text-slate-600">Event updates</p></div><div className="rounded-2xl bg-slate-100 p-4"><p className="text-2xl font-bold">1 place</p><p className="mt-1 text-sm text-slate-600">For every ticket</p></div></div></div></div></section>
                </main>
            </div>
        </>
    );
}
