<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\ErrorLog;
use Exception;

class VicidialPauseCode extends Model {

    use ErrorLog;

    protected $connection = 'dyna';
    protected $table = 'vicidial_pause_codes';
    public $primaryKey = 'campaign_id';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = array('*');

    /**
     * Get distinct pause codes
     *
     * @param array $data
     * @return \Illuminate\Support\Collection
     * @throws Exception
     */
    public static function findAll() {
        try {
            return VicidialPauseCode::select('pause_code', 'pause_code_name')
                            ->orderBy('pause_code', 'asc')
                            ->distinct()
                            ->get();
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

}
