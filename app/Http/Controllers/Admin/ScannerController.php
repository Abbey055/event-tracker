<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;


use App\Models\User;
use App\Models\Event;
use App\Models\Ticket;
use Barryvdh\DomPDF\Facade\Pdf;
use chillerlan\QRCode\QROptions;
use chillerlan\QRCode\QRCode;
class ScannerController extends Controller
{


  public function  scanner(){
    if (!auth() ->user()->isAdmin()){

    abort(403, 'u are not authorized');
    }
    return Inertia::render('Admin/Scanner');
  }

  public  function apiVerify($barcode)

  {

  $ticket = Ticket::where('barcode', $barcode)->with(['event','user'])->first();

  if(!$ticket){
    return response() ->json([
        'ticket' =>null,
        'message' =>'Invalid ticket barcode',
    ]);

  }
  if(!$ticket ->is_verified){
    $ticket ->verify();
    $ticket ->refresh();
  }
  return response()->json([
     'ticket' =>$ticket,
    'message' =>'Ticket Ok',


  ]);

  }

  public function verify($barcode){

  $ticket  = Ticket::where('barcode',$barcode)
  ->with(['event', 'user'])
  ->firt();

  if(!$ticket){
    return Inertia::render('Tickets/Verify',[

     'ticket' =>null,
     'message' =>'Invalid ticket barcode',

    ]);
  }

    if(!$ticket ->is_verified){
    $ticket ->verify();
   
  }
  return  Inertia :: render('Tickets/Verify',[

     'ticket' =>$ticket,
     'message' =>'verified',

  ]);


  }


    
}
