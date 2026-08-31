<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->string('venue')->nullable();
            $table->string('organizer_name')->nullable();
            $table->string('organizer_email')->nullable();
            $table->unsignedInteger('capacity')->default(100);
            $table->text('image_url')->nullable();
            $table->text('video_url')->nullable();
            $table->json('ticket_categories')->nullable();
        });

        Schema::create('event_follows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->boolean('notify_changes')->default(true);
            $table->unsignedInteger('reminder_minutes')->default(1440);
            $table->timestamps();
            $table->unique(['event_id', 'user_id']);
        });

        Schema::create('event_favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['event_id', 'user_id']);
        });

        Schema::create('event_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('event_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type');
            $table->string('title');
            $table->text('message');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_notifications');
        Schema::dropIfExists('event_favorites');
        Schema::dropIfExists('event_follows');

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn([
                'venue',
                'organizer_name',
                'organizer_email',
                'capacity',
                'image_url',
                'video_url',
                'ticket_categories',
            ]);
        });
    }
};
