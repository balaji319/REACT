<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\X5Contact;

class ReportFileQueue extends Model
{
    protected $table = "report_file_queues";
//    protected $connection = 'dyna';
    public $primaryKey = 'report_file_queue_id';
    public $incrementing = false;
    public $timestamps = false;
    
    /**
     * query for report file queue file list .
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param type $request
     * @param type $company_id
     * @param type $db_id
     * @return type
     * @throws \App\Exception
     */
    public static function getReportFileQueueList($request, $company_id,$db_id) {
        try {
            return ReportFileQueue::join('x5_contacts','x5_contacts.x5_contact_id','report_file_queues.requester_x5_contact_id')
                    ->join('reports','reports.report_id','report_file_queues.report_type_id')
                    ->select(DB::raw('report_file_queues.report_file_queue_id,report_file_queues.request_datetime,report_file_queues.finish_datetime,report_file_queues.report_type_id,'
                            . 'report_file_queues.report_name AS r_name,report_file_queues.status,x5_contacts.username,x5_contacts.name,reports.report_name'
                            )) //. 'report_file_queues.report_total_rows,report_file_queues.report_last_updated'
                    ->where('report_file_queues.db_id', $db_id)
                    ->whereIn('report_file_queues.company_id',$company_id)        #for search .
                    ->orderBy('request_datetime','DESC')
                    ->limit(30)
                    ->get();
//             SELECT `ReportFileQueue`.`report_file_queue_id`, `ReportFileQueue`.`request_datetime`, `ReportFileQueue`.`finish_datetime`, `ReportFileQueue`.`report_type_id`, `ReportFileQueue`.`report_name`, 
//            `ReportFileQueue`.`status`, `X5Contact`.`username`, `X5Contact`.`name`, `Report`.`report_name`, `ReportFileQueue`.`report_total_rows`, `ReportFileQueue`.`report_last_updated` 
//            FROM `X5_Admin_Live`.`report_file_queues` AS `ReportFileQueue` JOIN `X5_Admin_Live`.`x5_contacts` AS `X5Contact` ON (`ReportFileQueue`.`requester_x5_contact_id` = `X5Contact`.`x5_contact_id`)
//            JOIN `X5_Admin_Live`.`reports` AS `Report` ON (`ReportFileQueue`.`report_type_id` = `Report`.`report_id`)  
//            WHERE `ReportFileQueue`.`db_id` = 510 AND `ReportFileQueue`.`company_id` IN (100968, 103156, 102504)   ORDER BY `request_datetime` DESC  LIMIT 30
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }
}