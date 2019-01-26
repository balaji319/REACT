<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\ErrorLog;
use Exception;

class GoogleStorageLog extends Model {

    use ErrorLog;

    protected $primaryKey = 'google_storage_log_id';
    public $timestamps = false;
    protected $fillable = ['*'];

    /**
     * Log data
     *
     * @param int $company_id
     * @param int $owner_id
     * @param array $gcs_return
     * @param string $ex_message
     * @param string $ex_trace
     * @param boolean $error
     * @return type
     */
    public static function saveLog($company_id, $owner_id, $gcs_return, $ex_message = null, $ex_trace = null, $error = false) {
        try {
            return GoogleStorageLog::insert([
                        'company_id' => $company_id,
                        'owner_id' => $owner_id,
                        'gs_return' => json_encode($gcs_return),
                        'ex_message' => $ex_message,
                        'ex_trace' => $ex_trace,
                        'error' => $error,
                        'create_datetime' => \Carbon\Carbon::now()->toDateTimeString()
            ]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

}
