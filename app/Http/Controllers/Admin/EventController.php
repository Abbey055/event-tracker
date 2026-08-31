<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

use App\Models\User;
use App\Models\Event;
use App\Models\EventNotification;

use Inertia\Inertia;


class EventController extends Controller
{
    public function index(){

    if (!auth() ->user()->isAdmin()){

    abort(403, 'u are not authorized');
    }

    $events = Event::withcount('tickets') ->latest()->paginate(10);

    return Inertia::render('Admin/Events', ['events'=>$events]);



    }

    public function store(Request $request)
    {
        
  if (!auth() ->user()->isAdmin()){

    abort(403, 'u are not authorized');
    }
    $validated = $request ->validate([
        'name' => 'required|string|max:300',
        'description' => 'required|string',
        'event_date' => 'required|date|after:now',
        'venue' => 'nullable|string|max:300',
        'organizer_name' => 'nullable|string|max:150',
        'organizer_email' => 'nullable|email|max:255',
        'capacity' => 'nullable|integer|min:1',
        'image_url' => 'nullable|url|max:2048',
        'video_url' => 'nullable|url|max:2048',
        'image' => 'nullable|file|image|max:10240',
        'video' => 'nullable|file|mimetypes:video/mp4,video/webm,video/quicktime|max:51200',
        'ticket_categories' => 'nullable|array',
    ]);
    $validated = $this->storeUploads($request, $validated);
    Event::create($validated);

    return back()-> with('success', 'event created');

    }

    public function update (Request $request, Event $event)

    {

     if (!auth() ->user()->isAdmin()){

    abort(403, 'u are not authorized');
    }

      $validated = $request ->validate([
        'name' => 'required|string|max:300',
        'description' => 'required|string',
        'event_date' => 'required|date|after:now',
        'venue' => 'nullable|string|max:300',
        'organizer_name' => 'nullable|string|max:150',
        'organizer_email' => 'nullable|email|max:255',
        'capacity' => 'nullable|integer|min:1',
        'image_url' => 'nullable|url|max:2048',
        'video_url' => 'nullable|url|max:2048',
        'image' => 'nullable|file|image|max:10240',
        'video' => 'nullable|file|mimetypes:video/mp4,video/webm,video/quicktime|max:51200',
        'ticket_categories' => 'nullable|array',
    ]);

    $oldImage = $event->image_url;
    $oldVideo = $event->video_url;
    $validated = $this->storeUploads($request, $validated);
    if (!$request->hasFile('image')) {
        unset($validated['image_url']);
    }
    if (!$request->hasFile('video')) {
        unset($validated['video_url']);
    }
    $event ->update($validated);
    if ($request->hasFile('image') && $oldImage) {
        Storage::disk('public')->delete($this->storagePath($oldImage));
    }
    if ($request->hasFile('video') && $oldVideo) {
        Storage::disk('public')->delete($this->storagePath($oldVideo));
    }
    foreach ($event->followers()->wherePivot('notify_changes', true)->get() as $follower) {
        EventNotification::create([
            'user_id' => $follower->id,
            'event_id' => $event->id,
            'type' => 'event_updated',
            'title' => 'Event details updated',
            'message' => "{$event->name} has new event information.",
        ]);
    }

    return back()->with('success', 'event updated');
    }

    private function storeUploads(Request $request, array $validated): array
    {
        if ($request->hasFile('image')) {
            $validated['image_url'] = Storage::disk('public')->url(
                $request->file('image')->store('events/images', 'public')
            );
        }

        if ($request->hasFile('video')) {
            $validated['video_url'] = Storage::disk('public')->url(
                $request->file('video')->store('events/videos', 'public')
            );
        }

        unset($validated['image'], $validated['video']);
        return $validated;
    }

    private function storagePath(string $url): string
    {
        $path = parse_url($url, PHP_URL_PATH) ?: $url;
        return str_starts_with($path, '/storage/') ? substr($path, 9) : ltrim($path, '/');
    }




    public function destroy ( Event $event)

    {

     if (!auth() ->user()->isAdmin()){

    abort(403, 'u are not authorized');
    }

    

    $event ->delete();
    return back()-> with('success', 'event deleted');


    }
    



}
