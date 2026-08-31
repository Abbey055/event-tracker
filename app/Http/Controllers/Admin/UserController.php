<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{

public function index()
{
    if (!auth()->user()->isAdmin()){
        abort(403, 'Unauthorized acess. Admin info required');
    }
    $users = User::latest()->paginate(10);

    return Inertia::render('Admin/User', ['users' => $users]);


}

public function  updateRole(Request $request, User $user)


{
    if(!auth()->user()->isAdmin()){
        abort (403, 'Unauthorized access. admin info required');


    }
    $request->validate([
        'role' => 'required|in:admin,user',
    ]);

    $user ->update([

    'role' =>$request ->role,


    ]);

    return back()->with('success', 'user role update is successfully');


}

public function toggleStatus(User $user)
{
    if (!auth()->user()->isAdmin()) {
        abort(403, 'Unauthorized access. admin info required');
    }

    abort_if($user->id === auth()->id(), 422, 'You cannot suspend your own account.');

    $user->update([
        'status' => $user->status === 'suspended' ? 'active' : 'suspended',
    ]);

    return back()->with('success', 'User status updated successfully.');
}

public  function destroy( User $user){

 if(!auth()->user()->isAdmin()){
        abort (403, 'Unauthorized access. admin info required');



    }
    $user ->delete();

    return back()->with('success');

}

}
