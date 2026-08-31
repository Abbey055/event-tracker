import { Head, Link, usePage } from '@inertiajs/react';
import { Drama, LogIn, Music2, Sparkles, Trophy } from 'lucide-react';
import { dashboard, login } from '@/routes';

const categories = [
    { label: 'Live Music', icon: Music2 },
    { label: 'Sports', icon: Trophy },
    { label: 'Theater', icon: Drama },
    { label: 'Festivals', icon: Sparkles },
];

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Event Tracker" />
            <div className="relative flex min-h-svh flex-col overflow-hidden bg-[#040a2a] text-white">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(111,38,176,0.42),transparent_48%),radial-gradient(ellipse_at_15%_70%,rgba(28,41,125,0.38),transparent_52%),linear-gradient(180deg,#07103b_0%,#090b37_48%,#03072a_100%)]" />
                <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(115deg,transparent_0%,rgba(128,75,190,0.28)_35%,transparent_52%),linear-gradient(65deg,transparent_12%,rgba(31,71,168,0.3)_48%,transparent_72%)]" />
                <header className="relative z-10 border-b border-white/10 bg-[#050b2c]/75 backdrop-blur-md">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-3 sm:px-8 lg:px-10">
                        <Link href="/" className="flex items-center gap-3"><span className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-violet-300/30 bg-violet-500/15 p-1.5"><img src="/Event%20Tracker.png" alt="Event Tracker" className="size-full object-contain" /></span><span className="text-lg font-semibold tracking-tight sm:text-xl">Event Tracker</span></Link>
                        <Link href={auth.user ? dashboard() : login()} className="rounded-lg bg-violet-500 px-5 py-2.5 text-sm font-semibold shadow-lg shadow-violet-950/40 transition hover:bg-violet-400"><span className="inline-flex items-center gap-2">{!auth.user && <LogIn className="size-4" />}{auth.user ? 'Dashboard' : 'Log in'}</span></Link>
                    </div>
                </header>
                <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-20 sm:px-6 sm:py-24">
                    <section className="mx-auto flex w-full max-w-5xl flex-col items-center text-center"><p className="mb-5 text-sm font-medium uppercase tracking-[0.22em] text-violet-200/80">Find your next experience</p><h1 className="max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">Where will <span className="bg-gradient-to-r from-fuchsia-400 via-violet-400 to-purple-300 bg-clip-text text-transparent">tonight</span> take you?</h1><Link href={auth.user ? dashboard() : login()} className="mt-9 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-7 py-3.5 text-base font-semibold shadow-xl shadow-violet-950/50 transition duration-200 hover:-translate-y-0.5 hover:from-violet-400 hover:to-fuchsia-400">Find Your Vibe <Sparkles className="size-4" /></Link><div className="mt-14 grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">{categories.map(({ label, icon: Icon }) => <div key={label} className="flex items-center justify-center gap-2 rounded-xl border border-violet-300/20 bg-[#0b1646]/70 px-3 py-3.5 text-sm font-medium text-violet-50 shadow-lg shadow-black/10 backdrop-blur-sm transition hover:-translate-y-1 hover:border-violet-300/50 hover:bg-violet-500/15"><Icon className="size-4 text-fuchsia-400" /><span>{label}</span></div>)}</div></section>
                </main>
            </div>
        </>
    );
}
