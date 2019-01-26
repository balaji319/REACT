<?php

namespace App\Http\Middleware;

use Closure;
use Exception;

use App\X5Contact;

class IsSuperAdmin
{
    /**
     * Handle an incoming request. Check request is SuperAdmin Accessible
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $server_id = config('configs.server_id');
        $user = $request->user();

        $company_id = $user->company_id;
        $contact_id = $user->x5_contact_id;

        $is_super_admin_count = X5Contact::getIsSuperAdminCount($company_id,$contact_id);

        if($is_super_admin_count > 0){
             return $next($request);        
        }

        throw new Exception('Does not have access.',401);

    }
}
