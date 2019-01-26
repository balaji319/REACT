<?php namespace App\Traits;

use Monolog\Handler\RotatingFileHandler;
use Monolog\Logger;
use Exception;

trait ErrorLog {
	/**
	 * Error logging in modularlogs files
	 *
	 * @param 
	 * @return string Domain name without subdomains.
	 */
	public function postLogs($module_name,Exception $ex) {

		$request = request();

		$data=[
                'request' => $request->url()
                ,'parameter' => json_encode($request->all())
                ,'error' => $ex->getMessage()
                ,'error_line' => $ex->getLine()
                ,'error_file' => $ex->getFile()
                ,'request_headers' =>  json_encode(array_merge($request->server->all(),$request->headers->all()))
            ];
            # log in files
            $log = new Logger('Modulelogs');
            $log->pushHandler(new RotatingFileHandler(storage_path('/logs/'.$module_name.'logs.log'))); 
            $log->info("\n  : ",$data);
	}
}