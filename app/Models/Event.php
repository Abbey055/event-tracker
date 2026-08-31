<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
   protected $fillable = [
        'name',
        'description',
        'event_date',
        'venue',
        'organizer_name',
        'organizer_email',
        'capacity',
        'image_url',
        'video_url',
        'ticket_categories',
    ];

    protected $casts = [
        'event_date' => 'datetime',
        'ticket_categories' => 'array',
    ];

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    } 

    public function users()
    {
        return $this->belongsToMany(User::class, 'tickets')->withTimestamps();
    }

    public function followers()
    {
        return $this->belongsToMany(User::class, 'event_follows')
            ->withPivot(['notify_changes', 'reminder_minutes'])
            ->withTimestamps();
    }

    public function favorites()
    {
        return $this->belongsToMany(User::class, 'event_favorites')->withTimestamps();
    }

    public function notifications()
    {
        return $this->hasMany(EventNotification::class);
    }

    
}
