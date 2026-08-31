import { Head, Link, usePage } from '@inertiajs/react';
import { Drama, LogIn, Music2, Sparkles, Trophy } from 'lucide-react';
import { dashboard, login, register } from '@/routes';

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
                <div className="pointer-events-none absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center opacity-55" />
                <div className="pointer-events-none absolute inset-0 bg-[#050833]/75" />
                <header className="relative z-10 border-b border-white/10 bg-[#050b2c]/75 backdrop-blur-md">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-3 sm:px-8 lg:px-10">
                        <Link href="/" className="flex items-center gap-3"><span className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-violet-300/30 bg-violet-500/15 p-1.5"><img src="/Event%20Tracker.png" alt="Event Tracker" className="size-full object-contain" /></span><span className="text-lg font-semibold tracking-tight sm:text-xl">Event Tracker</span></Link>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Link href={auth.user ? dashboard() : login()} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:px-4"><span className="inline-flex items-center gap-2">{!auth.user && <LogIn className="size-4" />}{auth.user ? 'Dashboard' : 'Log in'}</span></Link>
                            {!auth.user && <Link href={register()} className="rounded-lg bg-violet-500 px-4 py-2.5 text-sm font-semibold shadow-lg shadow-violet-950/40 transition hover:bg-violet-400 sm:px-5">Register</Link>}
                        </div>
                    </div>
                </header>
                <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-20 sm:px-6 sm:py-24">
                    <section className="mx-auto flex w-full max-w-5xl flex-col items-center text-center"><p className="mb-5 text-sm font-medium uppercase tracking-[0.22em] text-violet-200/80">Find your next experience</p><h1 className="max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">Where will <span className="bg-gradient-to-r from-fuchsia-400 via-violet-400 to-purple-300 bg-clip-text text-transparent">tonight</span> take you?</h1><p className="mt-5 text-lg text-violet-100/80 sm:text-xl">10,000+ experiences waiting</p><Link href={auth.user ? dashboard() : login()} className="mt-9 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-7 py-3.5 text-base font-semibold shadow-xl shadow-violet-950/50 transition duration-200 hover:-translate-y-0.5 hover:from-violet-400 hover:to-fuchsia-400">Find Your Vibe <Sparkles className="size-4" /></Link><div className="mt-14 grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">{categories.map(({ label, icon: Icon }) => <div key={label} className="flex items-center justify-center gap-2 rounded-xl border border-violet-300/20 bg-[#0b1646]/70 px-3 py-3.5 text-sm font-medium text-violet-50 shadow-lg shadow-black/10 backdrop-blur-sm transition hover:-translate-y-1 hover:border-violet-300/50 hover:bg-violet-500/15"><Icon className="size-4 text-fuchsia-400" /><span>{label}</span></div>)}</div></section>
                </main>
            </div>
        </>
    );
}
