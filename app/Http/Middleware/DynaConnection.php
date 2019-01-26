<?php

namespace App\Http\Middleware;

use Closure;
use App\Cluster;
use Exception;

class DynaConnection {

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
        public function handle($request, Closure $next) {

        $user_detail = $request->user()->toArray();

        // USER IS AUTHENTICATED GET LAST DB USED AND SET INTO db CONFIG
        if (!empty($user_detail)) {
            $db_obj = new Cluster;
            $db_details = $db_obj->getCurrentDbDetails($user_detail['db_last_used']);
            
            $request->merge(['current_company_id' => $db_details->company_id]);
            $request->merge(['current_application_dns' => $db_details->application_dns]);

            $db_username = (is_null($db_details->db_username) || empty($db_details->db_username)) ? \Config::get("configs.ytel_client_db_user") : $db_details->db_username;

            $db_password = (is_null($db_details->db_password) || empty($db_details->db_password)) ? \Config::get("configs.ytel_client_db_password") : $db_details->db_password;


            \Config::set("database.connections.dyna", [
                "driver" => "mysql",
                "host" => "{$db_details->ipstring}",
                "database" => "{$db_details->db_name}",
                "username" => "{$db_username}",
                "password" => "{$db_password}",
                "unix_socket" => env("DB_SOCKET", ""),
                "charset" => "utf8mb4",
                "collation" => "utf8mb4_unicode_ci",
                "prefix" => "",
                "strict" => false,
                "engine" => null,
            ]);
        }

        return $next($request);
    }

}
