<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\Traits\ErrorLog;

class VicidialList extends Model {

    use ErrorLog;

    protected $connection = 'dyna';
    protected $table = 'vicidial_list';
    public $primaryKey = 'lead_id';
    public $timestamps = false;
    protected $fillable = array('*');
    protected $dates = [
        'expiration_date',
        'list_lastcalldate'
    ];
    protected $dateFormat = 'Y-m-d H:i:s';

    public static function getAll($fields) {
        return VicidialList::take(1000)
                        ->orderBy('entry_date', 'desc')
                        ->get($fields);
    }

    public static function getListReportData($id, $from, $to) {

        if ($from !== '' && $to != '') {
            return VicidialList::
                            where('list_id', $id)
                            ->whereBetween('modify_date', [$from, $to])
                            ->groupBy(['status', 'called_since_last_reset'])
                            ->orderBy('status')
                            ->orderBy('called_since_last_reset')
                            ->get(['status', 'called_since_last_reset', DB::raw('count(*) as total_leads')]);
        } else {
            return VicidialList::
                            where('list_id', $id)
                            ->groupBy(['status', 'called_since_last_reset'])
                            ->orderBy('status')
                            ->orderBy('called_since_last_reset')
                            ->get(['status', 'called_since_last_reset', DB::raw('count(*) as total_leads')]);
        }
    }

    public static function getGmtOffsetForListReport($id, $from, $to, $fields) {

        if ($from !== '' && $to != '') {
            return VicidialList::
                            groupBy('gmt_offset_now')
                            ->where('list_id', $id)
                            ->orderBy('gmt_offset_now')
                            ->whereBetween('modify_date', [$from, $to])
                            ->get($fields);
        } else {
            return VicidialList::
                            groupBy('gmt_offset_now')
                            ->where('list_id', $id)
                            ->orderBy('gmt_offset_now')
                            ->get($fields);
        }
    }

    public static function getEntryListIds($id, $from, $to, $fields) {
        if ($from !== '' && $to != '') {
            return VicidialList::
                            where('list_id', $id)
                            ->whereBetween('modify_date', [$from, $to])
                            ->get($fields);
        } else {
            return VicidialList::
                            where('list_id', $id)
                            ->get($fields);
        }
    }

    public static function getListDownloadData($id, $from, $to, $offset, $limit) {
        if ($from !== '' && $to != '') {
            return VicidialList::
                            where('list_id', $id)
                            ->whereBetween('modify_date', [$from, $to])
                            ->offset($offset)
                            ->limit($limit)
                            ->get();
        } else {
            return VicidialList::
                            where('list_id', $id)
                            ->offset($offset)
                            ->limit($limit)
                            ->get();
        }
    }

}
