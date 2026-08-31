<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE events ALTER COLUMN capacity DROP DEFAULT');
        DB::statement('ALTER TABLE events ALTER COLUMN capacity DROP NOT NULL');
        DB::table('events')->update(['capacity' => null]);
    }

    public function down(): void
    {
        DB::table('events')->whereNull('capacity')->update(['capacity' => 100]);
        DB::statement("ALTER TABLE events ALTER COLUMN capacity SET DEFAULT 100");
        DB::statement('ALTER TABLE events ALTER COLUMN capacity SET NOT NULL');
    }
};
