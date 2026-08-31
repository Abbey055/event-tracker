<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\ScannerController;
use App\Http\Controllers\Admin\TicketController as AdminTicketController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::prefix('admin')->group(function () {
        Route::get('events', [EventController::class, 'index'])->name('admin.events');
        Route::get('tickets', [AdminTicketController::class, 'index'])->name('admin.tickets');

        Route::get('scanner', function () {
            abort_unless(auth()->user()->isAdmin(), 403);
            return Inertia::render('Admin/Scanner');
        })->name('admin.scanner.page');
    });

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::put('users/{user}/role', [UserController::class, 'updateRole'])->name('users.updateRole');
        Route::patch('users/{user}/status', [UserController::class, 'toggleStatus'])->name('users.toggleStatus');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
       //event management

       Route::post('/events', [EventController::class, 'store'])->name('events.store');
       Route::put('/events/{event}', [EventController::class, 'update'])->name('events.update');
       Route::delete('/events/{event}', [EventController::class, 'destroy'])->name('events.destroy');
       Route::patch('/tickets/{ticket}/status', [AdminTicketController::class, 'updateStatus'])->name('tickets.status');

       //Scanner 
       Route::post('/scanner', [ScannerController::class, 'scanner'])->name('scanner');
       Route::put('/apiVerify/{barcode}', [ScannerController::class, 'apiVerify'])->name('verify.api');
       


    });

    // user routes


    Route::prefix('tickets') ->name ('tickets.')->group(
        function(){

        Route::get('/', [App\Http\Controllers\User\TicketController::class,'index'])->name('index');
        Route::post('/register/{event}', [App\Http\Controllers\User\TicketController::class,'register'])->name('register');
        Route::post('/{event}/follow', [App\Http\Controllers\User\TicketController::class, 'follow'])->name('follow');
        Route::delete('/{event}/follow', [App\Http\Controllers\User\TicketController::class, 'unfollow'])->name('unfollow');
        Route::post('/{event}/favorite', [App\Http\Controllers\User\TicketController::class, 'favorite'])->name('favorite');
        Route::delete('/{event}/favorite', [App\Http\Controllers\User\TicketController::class, 'unfavorite'])->name('unfavorite');
        Route::patch('/notifications/{notification}/read', [App\Http\Controllers\User\TicketController::class, 'readNotification'])->name('notifications.read');
        Route::get('/download/{ticket}', [App\Http\Controllers\User\TicketController::class,'download'])->name('download');
        Route::get('/scan', [App\Http\Controllers\User\TicketController::class,'scan'])->name('scan');
        Route::get('/download-image/{ticket}', [App\Http\Controllers\User\TicketController::class,'downloadImage'])->name('download-image');
        Route::get('/verify/{barcode}', [App\Http\Controllers\User\TicketController::class,'verify'])->name('verify');
        Route::get('/payment/callback', [App\Http\Controllers\User\TicketController::class, 'paymentCallback'])->name('payment.callback');

        



        }

    );

});

Route::post('/flutterwave/webhook', [App\Http\Controllers\User\TicketController::class, 'paymentWebhook'])
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class])
    ->name('payments.flutterwave.webhook');





require __DIR__.'/settings.php';
