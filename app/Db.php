<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Exception;
use DB as rawQery;
use collection;

use App\Traits\ErrorLog;

class Db extends Model
{
	protected $connection = 'invdb';
    protected $table = 'db';
    public $timestamps = false;
    public $primaryKey = 'db_id';

     /**
     * Get DB's Details respective DB ID
     * @return [Object] db's details
     */
    public function getDbDetailsDbId($db_id){
        try {  
            $db_ext = rawQery::connection($this->connection);
                  
            return $db_ext->table($this->table.' as InvDb')
            ->select('InvDb.db_id',
                            'InvDb.db_port',
                            'InvDb.db_name',
                            'InvDb.db_username',
                            'InvDb.db_password',
                            'InvDb.db_description',
                            'InvIp.ipstring')
            ->join('ip as InvIp', 'InvDb.ip_id', '=','InvIp.ip_id')           
            ->where('InvDb.db_id', $db_id )
            ->where('InvDb.dbtype_id',  config('configs.db_type_mysql'))
            ->first();

                
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            return collect([]);
        }
    }
}
