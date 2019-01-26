<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\X5Contact;
class ReportFile extends Model
{
    protected $table = "report_files";
//    protected $connection = 'dyna';
    protected $primaryKey = 'report_file_id';
    public $incrementing = false;
    public $timestamps = false;
    
    /**
     * Apifor process report for request file for download.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param type $request
     * @param type $company_id
     * @param type $db_id
     * @param type $utc_offset
     * @return type
     * @throws \App\Exception
     */
    public static function processReport($request, $company_id,$db_id , $utc_offset) {
        try {
            $page_size = $request->input('limit') ?? 25;
            $search = '%' . $request->input('search') . '%';
            return ReportFile::join('x5_contacts','x5_contacts.x5_contact_id','report_files.requester_x5_contact_id')
                    ->join('reports','reports.report_id','report_files.report_type_id')
                    ->select(DB::raw('report_file_id ,unique_id , TIMESTAMPADD(HOUR,'.$utc_offset.',report_files.request_datetime) as request_datetime,
                                TIMESTAMPADD(HOUR,'.$utc_offset.',report_files.finish_datetime) as finish_datetime,report_type_id,reports.report_name,report_files.report_name AS r_name,x5_contacts.username,
                                x5_contacts.name,reports.report_name'))
                    ->where('report_files.db_id', $db_id)
                    ->whereIn('report_files.company_id',$company_id)        #for search .
                    ->where(function($q) use( $search) {
                            $q->Where('report_file_id', 'like', $search)
                            ->orWhere('unique_id', 'like', $search)
                            ->orWhere('report_files.request_datetime', 'like', $search)
                            ->orWhere('report_files.finish_datetime', 'like', $search)
                            ->orWhere('report_type_id', 'like', $search)
                            ->orWhere('x5_contacts.username', 'like', $search)
                            ->orWhere('x5_contacts.name', 'like', $search)
                            ->orWhere('reports.report_name', 'like', $search);
                        })
                    ->orderBy('request_datetime','DESC')
                    ->Paginate($page_size);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }
}