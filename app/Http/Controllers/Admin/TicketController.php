<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TicketController extends Controller
{
    private function authorizeAdmin(): void
    {
        abort_unless(auth()->user()->isAdmin(), 403);
    }

    public function index()
    {
        $this->authorizeAdmin();

        return Inertia::render('Admin/Tickets', [
            'tickets' => Ticket::with(['event', 'user'])->latest()->paginate(15),
        ]);
    }

    public function updateStatus(Request $request, Ticket $ticket)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'status' => 'required|in:issued,checked_in,cancelled,refunded',
        ]);

        $ticket->update([
            'status' => $validated['status'],
            'is_verified' => $validated['status'] === 'checked_in' ? true : $ticket->is_verified,
            'verified_at' => $validated['status'] === 'checked_in' ? now() : $ticket->verified_at,
        ]);

        return back()->with('success', 'Ticket status updated.');
    }
}
