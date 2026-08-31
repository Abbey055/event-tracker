<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\User;
use App\Models\Event;
use App\Models\Ticket;
use App\Models\EventNotification;
use Barryvdh\DomPDF\Facade\Pdf;
use chillerlan\QRCode\QROptions;
use chillerlan\QRCode\QRCode;

class TicketController extends Controller
{

  public function index()
  {

  $events = Event::withCount('tickets')
      ->orderBy('event_date')
      ->get()
      ->map(function (Event $event) {
          $event->setAttribute('is_following', $event->followers()->whereKey(auth()->id())->exists());
          $event->setAttribute('is_favorite', $event->favorites()->whereKey(auth()->id())->exists());
          $event->setAttribute(
              'available_tickets',
              $event->capacity === null ? null : max(0, $event->capacity - $event->tickets_count)
          );
          $event->setAttribute(
              'status',
              $event->event_date->isFuture()
                  ? 'upcoming'
                  : ($event->event_date->isToday() ? 'ongoing' : 'completed')
          );
          return $event;
      });

  $userTickets = auth()->user()->tickets()->with('event')->latest()->get();
  $notifications = auth()->user()->eventNotifications()->with('event')->latest()->limit(10)->get();

  return Inertia::render('Tickets/index', [
    'events' =>$events,
    'userTickets' =>$userTickets,
    'notifications' => $notifications,
  ]);
  }

  public function follow(Request $request, Event $event)
  {
      $follow = auth()->user()->followedEvents()->syncWithoutDetaching([
          $event->id => [
              'notify_changes' => $request->boolean('notify_changes', true),
              'reminder_minutes' => $request->integer('reminder_minutes', 1440),
          ],
      ]);

      return back()->with('success', 'You are now following this event.');
  }

  public function unfollow(Event $event)
  {
      auth()->user()->followedEvents()->detach($event->id);
      return back()->with('success', 'Event removed from your followed events.');
  }

  public function favorite(Event $event)
  {
      auth()->user()->favoriteEvents()->syncWithoutDetaching([$event->id]);
      return back()->with('success', 'Event saved to your favorites.');
  }

  public function unfavorite(Event $event)
  {
      auth()->user()->favoriteEvents()->detach($event->id);
      return back()->with('success', 'Event removed from your favorites.');
  }

  public function readNotification(EventNotification $notification)
  {
      abort_unless($notification->user_id === auth()->id(), 403);
      $notification->update(['read_at' => now()]);
      return back();
  }

  public function register (Request $request, Event $event){
    $user = auth()->user();


    $existingTicket = Ticket ::where('user_id', $user->id)->where('event_id', $event->id)->first();

    if($existingTicket){
        return back()->with ('error', 'You are registered for this even thanks!');



    }

    if ($event->capacity !== null && $event->tickets()->count() >= $event->capacity) {
        return back()->with('error', 'This event is sold out.');
    }

    $ticket = Ticket :: create ([
        'user_id' =>$user->id,
        'event_id' =>$event->id,
    ]);

    $remainingTickets = $event->capacity === null
        ? null
        : max(0, $event->capacity - $event->tickets()->count());
    if ($remainingTickets !== null && $remainingTickets <= max(1, (int) ceil($event->capacity * 0.1))) {
        $recipients = $event->followers()->wherePivot('notify_changes', true)->get()
            ->merge($event->favorites()->get())
            ->unique('id');

        foreach ($recipients as $recipient) {
            EventNotification::firstOrCreate(
                [
                    'user_id' => $recipient->id,
                    'event_id' => $event->id,
                    'type' => 'almost_sold_out',
                ],
                [
                    'title' => 'Tickets are almost sold out',
                    'message' => "{$event->name} has only {$remainingTickets} tickets remaining.",
                ],
            );
        }
    }

    return  back ()->with('success', 'successfully registered for the event');

  }

  public function verify ($barcode){
    $ticket = Ticket::where('barcode', $barcode)->with(['event', 'user'

    ])->first();
    if(!$ticket){
        return Inertia::render('Tickets/Verify', [
         'ticket' =>null,
         'message' =>'Invalid Ticket',
        ]);



    }

    if(!$ticket ->is_verified){
        $ticket -> verify();

    }
            return Inertia::render('Tickets/Verify', [
'ticket' =>$ticket,
         'message' =>'valid Ticket',
            ]);
  }

  public function  download(Ticket $ticket){

  if($ticket->user_id !==auth()->id()){
    abort(403);
  }

  $ticket -> load('event','user');

  $verificationUrl = route('tickets.verify', $ticket->barcode);

  $qrcode  = new QRCode([

  'addQuietZone' => true,
  ]);
  $qrCodeSvg = $qrcode ->render($verificationUrl);
  
  return response()->json([
'success' =>true,
'ticket' =>$ticket,
'qrCodeSvg' =>$qrCodeSvg

  ]);
  }
    public function scan(){
        return Inertia:: render('Tickets/Scan');
    }

    public  function downloadImage(Ticket $ticket){
  if($ticket->user_id !==auth()->id()){
    abort(403);
  }

  $ticket ->load('event');
  $eventName = htmlspecialchars($ticket ->event->name, ENT_XML1);

  $verificationUrl = route('tickets.verify', $ticket->barcode);

  $qrcode = new QRCode([
    'version' => 5,
    'addQuietZone' => false,

  ]);

  $qrCodeSvg = $qrcode ->render($verificationUrl);

  $qrCodeSvg = preg_replace('/<\?xml.*?\?>/', '', $qrCodeSvg);
  $qrCodeSvg = preg_replace('/<!DOCTYPE.*?>/', '', $qrCodeSvg);


  $width = 300;
  $height = 400;
  $white = '#ffffff';
  $blue = '#4008f7';
  $balck = '#000000';

 $svg =<<<SVG
 
 <?xml version "1.0" encoding = "UTF-8 standalone ="no"?>
 <svg width = "{$width}" height = "{$height}", viewBox ="0 0 {$width} {$height}" xmlns = "http://www.w3.org/2000/svg">
 <!-- Background -->
 <react x ="0" y="0" width = "{$width} height ="{$height}" fill={$white}"/>
 <text x= "50%" y= "40" font-family = "Arial", sans-serif" font-size ="18" font-weight ="bold" fill= "{$blue}"  text-anchor ="middle">
 {$eventName}
 </text>

 <text x= "50%" y="70" font-family ="Arial",sans-serif" font-size="14" fill ="{$black}" text-anchor ="middle">
 SCAN TICKET 
 </text>

<g transform = "translate (50, 90)">
{$qrCodeSvg}
</g>

<text x ="50%" y ="350" font-family ="Courier New, monospace" font-size= "16" font-weight ="bold" fill= "{$black}"text-anchor ="middle" letter-spacing ="2" >
{$ticket->barcode}
</text>
</svg>
SVG;

return response ($svg) ->header('Content-type', 'image/svg+xml')
->header('Content-Disposition', 'attachment; filename ="ticket-'.$ticket->barcode. '.svg');

     }


}

  
