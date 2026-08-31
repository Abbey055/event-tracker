<?php

namespace App\Console\Commands;

use App\Models\EventNotification;
use App\Models\Event;
use Illuminate\Console\Command;

class SendEventReminders extends Command
{
    protected $signature = 'events:send-reminders';
    protected $description = 'Create in-app reminders for followed events';

    public function handle(): int
    {
        Event::with('followers')
            ->where('event_date', '>', now())
            ->where('event_date', '<=', now()->addDays(2))
            ->each(function (Event $event) {
                foreach ($event->followers as $user) {
                    $minutesUntilEvent = now()->diffInMinutes($event->event_date, false);
                    $reminderMinutes = (int) ($user->pivot->reminder_minutes ?? 1440);

                    if ($minutesUntilEvent < 0 || $minutesUntilEvent > $reminderMinutes) {
                        continue;
                    }

                    $alreadySent = EventNotification::where('user_id', $user->id)
                        ->where('event_id', $event->id)
                        ->where('type', 'event_reminder')
                        ->whereDate('created_at', today())
                        ->exists();

                    if (!$alreadySent) {
                        EventNotification::create([
                            'user_id' => $user->id,
                            'event_id' => $event->id,
                            'type' => 'event_reminder',
                            'title' => 'Event reminder',
                            'message' => "{$event->name} starts soon at " . ($event->venue ?: 'the scheduled venue') . '.',
                        ]);
                    }
                }
            });

        return self::SUCCESS;
    }
}
