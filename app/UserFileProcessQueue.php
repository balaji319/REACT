<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\ErrorLog;
use Exception;

class UserFileProcessQueue extends Model {

    use ErrorLog;

    /**
     * Data loader queue list
     *
     * @param int $current_company_id
     * @return \Illuminate\Support\Collection
     * @throws Exception
     */
    public static function dataLoaderQueueList($current_company_id, $limit) {

        try {
            $user_file_proccess_queue = UserFileProcessQueue::select('requester.username', 'user_file.file_name', 'user_file.total_rows', 'user_file_process_queues.id', 'user_file_process_queues.list_id', 'user_file_process_queues.webserver_dns', 'user_file_process_queues.current_row', 'user_file_process_queues.success_rows', 'user_file_process_queues.bad_rows', 'user_file_process_queues.total_rows', 'user_file_process_queues.status', 'user_file_process_queues.create_datetime', 'user_file_process_queues.start_datetime', 'user_file_process_queues.update_datetime', 'user_file_process_queues.finish_datetime', 'user_file_process_queues.success', 'user_file_process_queues.error', 'user_file_process_queues.user_canceled')
                    ->join('user_files as user_file', 'user_file.id', 'user_file_process_queues.user_file_id')
                    ->join('x5_contacts as file_uploader', 'file_uploader.x5_contact_id', 'user_file.uploader_id')
                    ->join('x5_contacts as requester', 'requester.x5_contact_id', 'user_file_process_queues.requester_id')
                    ->where(function ($query) use($current_company_id) {
                        $query->where('user_file.company_id', $current_company_id)
                        ->orWhere('user_file_process_queues.company_id', $current_company_id)
                        ->orWhere('requester.company_id', $current_company_id);
                    })
                    ->orderBy('user_file_process_queues.status', 'asc')
                    ->orderBy('user_file_process_queues.finish_datetime', 'desc')
                    ->orderBy('user_file_process_queues.create_datetime', 'desc')
                    ->limit($limit)
                    ->get();
            $user_file_proccess_queue = $user_file_proccess_queue->groupBy('status');
            return $user_file_proccess_queue;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

}
