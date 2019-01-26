<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Exception;
use DB;
use collection;

use App\Traits\ErrorLog;

class Cluster extends Model {

    use ErrorLog;


    protected $connection = 'invdb';
    protected $table = 'clusters';
    public $timestamps = false;
    public $primaryKey = 'cluster_id';

    /**
     * Get dnc by phone number
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param type $phone
     * @param type $fields
     * @return type
     */
    public static function getAll($fields) {
        return Cluster::where('phone_number', '<>', '', 'AND')->get($fields);
    }

    /**
     * Get DB's Details irrespective company id 
     * @return [Object] db's details
     */
    public function getDbDetails(){
        try {

            $db_ext = DB::connection($this->connection);
      
            return $db_ext->table($this->table.' as InvCluster')
            ->select('InvCluster.application_dns', 'InvCluster.company_id', 'InvDb.db_id', 'InvDb.db_port', 'InvDb.db_name', 'InvDb.db_username', 'InvDb.db_password', 'InvDb.db_description', 'InvDb.timezone', 'InvIp.ipstring', 'InvDbSlave.db_id', 'InvDbSlave.db_port', 'InvDbSlave.db_name', 'InvDbSlave.db_username', 'InvDbSlave.db_password', 'InvDbSlave.db_description', 'InvDbSlave.timezone', 'InvIpSlave.ipstring')
            ->join('db as InvDb', 'InvCluster.cluster_id', '=','InvDb.cluster_id')
            ->join('ip as InvIp','InvIp.ip_id' , '=', 'InvDb.ip_id')
            ->leftJoin('db as InvDbSlave', 'InvDbSlave.db_id', '=', 'InvDb.db_id')
            ->leftJoin('ip as InvIpSlave', 'InvIpSlave.ip_id', '=',  'InvDbSlave.ip_id')
            ->where('InvCluster.application_id', config('configs.application_id_x5') )
            ->where('InvDb.dbtype_id',  config('configs.db_type_mysql'))
            ->where('InvDb.is_slave', false)
            ->orderBy('InvDb.db_description', 'ASC')
            ->get();

                
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            return collect([]);
        }
    }

    /**
     * Get DB's Details respective company id 
     * @return [Object] db's details
     */
    public function getDbDetailsCompId($company_ids){
        try {         

            $db_ext = DB::connection($this->connection);
                  
            return $db_ext->table($this->table.' as InvCluster')
            ->select('InvCluster.application_dns', 'InvCluster.company_id', 'InvDb.db_id', 'InvDb.db_port', 'InvDb.db_name', 'InvDb.db_username', 'InvDb.db_password', 'InvDb.db_description', 'InvDb.timezone', 'InvIp.ipstring', 'InvDbSlave.db_id', 'InvDbSlave.db_port', 'InvDbSlave.db_name', 'InvDbSlave.db_username', 'InvDbSlave.db_password', 'InvDbSlave.db_description', 'InvDbSlave.timezone', 'InvIpSlave.ipstring')
            ->join('db as InvDb', 'InvCluster.cluster_id', '=','InvDb.cluster_id')
            ->leftjoin('ip as InvIp','InvIp.ip_id' , '=', 'InvDb.ip_id')
            ->leftJoin('db as InvDbSlave', 'InvDbSlave.db_id', '=', 'InvDb.db_id')
            ->leftJoin('ip as InvIpSlave', 'InvIpSlave.ip_id', '=',  'InvDbSlave.ip_id')
            ->where('InvCluster.application_id', config('configs.application_id_x5') )
            ->whereIn('InvCluster.company_id', $company_ids )
            ->where('InvDb.dbtype_id',  config('configs.db_type_mysql'))
            ->where('InvDb.is_slave', false)
            ->orderBy('InvDb.db_description', 'ASC')
            ->get();

                
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            return collect([]);
        }
    }


    /*
     * Get DB's Details respective company id - login purposeLogin
     * @return [Object] db's details
     */
    public function getDbDetailsCompIdLogin($company_ids){
        try {         

            $db_ext = DB::connection($this->connection);
                  
            return $db_ext->table($this->table.' as InvCluster')
            ->select('InvCluster.application_dns', 'InvCluster.company_id', 'InvDb.db_id','InvDb.db_name', 'InvDb.db_description', 'InvDb.timezone', 'InvDbSlave.db_id', 'InvDbSlave.db_name','InvDbSlave.db_description', 'InvDbSlave.timezone')
            ->join('db as InvDb', 'InvCluster.cluster_id', '=','InvDb.cluster_id')
            ->leftjoin('ip as InvIp','InvIp.ip_id' , '=', 'InvDb.ip_id')
            ->leftJoin('db as InvDbSlave', 'InvDbSlave.db_id', '=', 'InvDb.db_id')
            ->leftJoin('ip as InvIpSlave', 'InvIpSlave.ip_id', '=',  'InvDbSlave.ip_id')
            ->where('InvCluster.application_id', config('configs.application_id_x5') )
            ->whereIn('InvCluster.company_id', $company_ids )
            ->where('InvDb.dbtype_id',  config('configs.db_type_mysql'))
            ->where('InvDb.is_slave', false)
            ->orderBy('InvDb.db_description', 'ASC')
            ->get();

                
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            return collect([]);
        }
    }

     /*
     * Get current Company ID upon db id
     * @return [Object] db's details
     */
    public function getCurrentDbDetails($db_id){
        try {         

            $db_ext = DB::connection($this->connection);
                  
            return $db_ext->table($this->table.' as InvCluster')    
            ->select('InvCluster.application_dns', 'InvCluster.company_id', 'InvDb.db_id', 'InvDb.db_port', 'InvDb.db_name', 'InvDb.db_username', 'InvDb.db_password', 'InvDb.db_description', 'InvDb.timezone', 'InvIp.ipstring', 'InvDbSlave.db_id', 'InvDbSlave.db_port', 'InvDbSlave.db_name', 'InvDbSlave.db_username', 'InvDbSlave.db_password', 'InvDbSlave.db_description', 'InvDbSlave.timezone', 'InvIpSlave.ipstring')        
            ->join('db as InvDb', 'InvCluster.cluster_id', '=','InvDb.cluster_id')
            ->leftjoin('ip as InvIp','InvIp.ip_id' , '=', 'InvDb.ip_id')
            ->leftJoin('db as InvDbSlave', 'InvDbSlave.db_id', '=', 'InvDb.db_id')
            ->leftJoin('ip as InvIpSlave', 'InvIpSlave.ip_id', '=',  'InvDbSlave.ip_id')
            ->where('InvCluster.application_id', config('configs.application_id_x5') )   
            ->where('InvDb.db_id', $db_id )
            ->where('InvDb.dbtype_id',  config('configs.db_type_mysql'))
            ->where('InvDb.is_slave', false)
            ->orderBy('InvDb.db_description', 'ASC')
            ->first();
       

                
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            return collect([]);
        }
    }

    /*
     * Get DB's Count respective company id - db_id
     * @return [Object] db's details
     */
    public function getDbDetailsCompIdCount($company_ids,$db_id){
        try {  

            $db_ext = DB::connection($this->connection);
                  
            return $db_ext->table($this->table.' as InvCluster')
            ->select('InvCluster.application_dns', 'InvCluster.company_id', 'InvDb.db_id','InvDb.db_name', 'InvDb.db_description', 'InvDb.timezone', 'InvDbSlave.db_id', 'InvDbSlave.db_name','InvDbSlave.db_description', 'InvDbSlave.timezone')
            ->join('db as InvDb', 'InvCluster.cluster_id', '=','InvDb.cluster_id')
            ->leftjoin('ip as InvIp','InvIp.ip_id' , '=', 'InvDb.ip_id')
            ->leftJoin('db as InvDbSlave', 'InvDbSlave.db_id', '=', 'InvDb.db_id')
            ->leftJoin('ip as InvIpSlave', 'InvIpSlave.ip_id', '=',  'InvDbSlave.ip_id')
            ->where('InvCluster.application_id', config('configs.application_id_x5') )
            ->where('InvCluster.company_id', $company_ids )
            ->where('InvDb.db_id', $db_id )
            ->where('InvDb.dbtype_id',  config('configs.db_type_mysql'))
            ->where('InvDb.is_slave', false)
            ->orderBy('InvDb.db_description', 'ASC')
            ->count();

                
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            return collect([]);
        }
    }


}
