<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $props = [];

        if ($request->user()->isAdmin()) {
            $props = [
                'totalEvents' => Event::count(),
                'totalUsers' => User::where('role', 'user')->count(),
                'totalTickets' => Ticket::count(),
                'totalRevenue' => Ticket::where('status', '!=', 'refunded')->sum('price'),
                'totalAttendees' => Ticket::where('is_verified', true)->count(),
                'upcomingEvents' => Event::where('event_date', '>', now())->count(),
                'ongoingEvents' => Event::whereDate('event_date', now()->toDateString())->count(),
                'completedEvents' => Event::where('event_date', '<', now()->startOfDay())->count(),
            ];
        } else {
            $props = [
                'userEvents' => Event::where('event_date', '>', now())
                    ->orderBy('event_date')
                    ->take(6)
                    ->get(['id', 'name', 'event_date', 'venue', 'image_url']),
                'userTickets' => $request->user()->tickets()
                    ->with('event:id,name,event_date,venue')
                    ->latest()
                    ->take(6)
                    ->get(['id', 'event_id', 'barcode', 'is_verified']),
                'userNotifications' => $request->user()->eventNotifications()
                    ->whereNull('read_at')
                    ->count(),
            ];
        }

        return Inertia::render('dashboard', $props);
    }
}
