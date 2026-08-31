<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->string('payment_status')->default('successful')->after('status');
            $table->string('transaction_id')->nullable()->after('payment_status');
            $table->string('transaction_ref')->nullable()->unique()->after('transaction_id');
            $table->timestamp('paid_at')->nullable()->after('transaction_ref');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn(['payment_status', 'transaction_id', 'transaction_ref', 'paid_at']);
        });
    }
};
