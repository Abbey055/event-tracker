import { createInertiaApp } from '@inertiajs/react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Event Tracker';

class FriendlyErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('Application error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <main className="flex min-h-svh items-center justify-center bg-background px-6 text-center">
                    <div className="max-w-md space-y-4">
                        <h1 className="text-2xl font-semibold">We hit a small problem</h1>
                        <p className="text-muted-foreground">Please refresh the page and try again. Your information is safe.</p>
                        <Button type="button" onClick={() => window.location.reload()}>Refresh page</Button>
                    </div>
                </main>
            );
        }

        return this.props.children;
    }
}

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                <FriendlyErrorBoundary>{app}</FriendlyErrorBoundary>
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
