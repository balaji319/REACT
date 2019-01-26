<?php

namespace App\Http\Controllers\DataManagement;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Traits\Helper;
use App\Traits\ErrorLog;
use App\Traits\AccessControl;
use App\VicidialLists;
use App\UserFileProcessQueue;
use App\UserFile;
use Validator;
use App\X5Log;
use Storage;
use App\GoogleStorageLog;
use App\GoogleStorageFile;
use Exception;

class DataLoaderController extends Controller {

    use Helper,
        AccessControl,
        ErrorLog;

    /**
     * Dashboard list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws \App\Http\Controllers\DataManagement\Exception
     * @throws Exception
     */
    public function dashboardList(Request $request) {
        try {

            $db_id = $request->user()->db_last_used;
            $current_company_id = $request->current_company_id;
            $user = $request->user();
            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $current_company_id, $user);

            if (!in_array(SYSTEM_COMPONENT_DATA_LOADER_ACCESS, $access_permissions)) {
                throw new Exception('Cannot read data loader dashboard, you might not have permission to do this.', 400);
            }

            $data_lists = VicidialLists::selectRaw('active, COUNT(active) as count')->groupBy('active')->get();
            $data_lists = $data_lists->groupBy('active')->toArray();
            $result_array['data_list']['active'] = isset($data_lists['Y'][0]['count']) ? $data_lists['Y'][0]['count'] : 0;
            $result_array['data_list']['non_active'] = isset($data_lists['N'][0]['count']) ? $data_lists['N'][0]['count'] : 0;
            $result_array['data_list']['total'] = ($result_array['data_list']['active'] + $result_array['data_list']['non_active']) ?: 0;

            $file_proccessed_queue = UserFileProcessQueue::where('db_id', $db_id)->selectRaw('status, COUNT(id) as count')->orderBy('status')->get();
            $file_proccessed_queue = $file_proccessed_queue->groupBy('status')->toArray();
            $result_array['data_loader_queue']['in_queue'] = isset($file_proccessed_queue[0][0]['count']) ? $file_proccessed_queue[0][0]['count'] : 0;
            $result_array['data_loader_queue']['in_proccess'] = isset($file_proccessed_queue[1][0]['count']) ? $file_proccessed_queue[1][0]['count'] : 0;
            $result_array['data_loader_queue']['finished'] = isset($file_proccessed_queue[2][0]['count']) ? $file_proccessed_queue[2][0]['count'] : 0;

            $user_files = UserFile::join('x5_contacts as xc', 'xc.x5_contact_id', 'user_files.uploader_id')
                    ->where('exec_server_id', $this->__getServerID())
                    ->where('xc.company_id', $current_company_id)
                    ->where('removed', '0')
                    ->selectRaw("COUNT(id) as count, CASE processed WHEN 0 THEN 'N' WHEN 1 THEN 'Y' ELSE 0 END as processed")
                    ->orderBy('processed')
                    ->get();
            $user_files = $user_files->groupBy('processed')->toArray();
            $result_array['uploaded_files']['proccessed'] = isset($user_files['Y'][0]['count']) ? $user_files['Y'][0]['count'] : 0;
            $result_array['uploaded_files']['not_yet_proccessed'] = isset($user_files['N'][0]['count']) ? $user_files['N'][0]['count'] : 0;

            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $result_array]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.DataLoaderController'), $e);
            throw $e;
        }
    }

    /**
     * Get server ID
     *
     * @return string
     */
    protected function __getServerID() {
        return exec("php -r 'phpinfo();' | grep \"^System\" | awk '{ print $4 }'");
    }

    /**
     * Queue list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws \App\Http\Controllers\DataManagement\Exception
     * @throws Exception
     */
    public function queueList(Request $request) {
        try {

            $current_company_id = $request->current_company_id;
            $user = $request->user();
            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $current_company_id, $user);

            if (!in_array(SYSTEM_COMPONENT_DATA_LOADER_QUEUE, $access_permissions)) {
                throw new Exception('Cannot read data loader queue, you might not have permission to do this.', 400);
            }

            $user_file_proccess_queue = UserFileProcessQueue::dataLoaderQueueList($current_company_id, 20);
            $result_array['queues']['in_queue'] = isset($user_file_proccess_queue[0]) ? $user_file_proccess_queue[0] : [];
            $result_array['queues']['in_process'] = isset($user_file_proccess_queue[1]) ? $user_file_proccess_queue[1] : [];
            $result_array['queues']['finished'] = isset($user_file_proccess_queue[2]) ? $user_file_proccess_queue[2] : [];
            $result_array['company_id'] = $current_company_id;

            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $result_array]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.DataLoaderController'), $e);
            throw $e;
        }
    }

    /**
     * Uploaded files list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws \App\Http\Controllers\DataManagement\Exception
     * @throws Exception
     */
    public function uploadedFilesList(Request $request) {
        try {

            $limit = $request->limit ?: \Config::get('configs.pagination_limit');
            $search = $request->search ?: NULL;
            $current_company_id = $request->current_company_id;
            $user = $request->user();
            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $current_company_id, $user);

            if (!in_array(SYSTEM_COMPONENT_DATA_LOADER_DATA_FILE, $access_permissions)) {
                throw new Exception('Cannot read data loader uploaded files, you might not have permission to do this.', 400);
            }
            $data['limit'] = $limit;
            $data['search'] = $search;
            $data['current_company_id'] = $current_company_id;
            $user_files = UserFile::uploadedFiles($data);

            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $user_files]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.DataLoaderController'), $e);
            throw $e;
        }
    }

    /**
     * Upload CSV file
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws \App\Http\Controllers\DataManagement\Exception
     * @throws Exception
     */
    public function uploadCSVFile(Request $request) {
        try {

            Validator::make($request->all(), [
                'csv_file' => 'required|mimetypes:text/csv,text/plain,application/csv,text/comma-separated-values,application/excel,application/vnd.ms-excel,application/vnd.ms-excel,application/vnd.msexcel,text/anytext,application/octet-stream,application/txt'
                    ], [
                'csv_file.mimetypes' => 'We only accept CSV formatted file, please check your file. If you have further questions, please contact Ytel support. Thanks!'
            ])->validate();
            $current_company_id = $request->current_company_id;
            $current_db_id = $request->user()->db_last_used;
            $user = $request->user();
            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_CREATE, $current_company_id, $user);

            if (!in_array(SYSTEM_COMPONENT_DATA_LOADER_DATA_FILE, $access_permissions)) {
                throw new Exception('Cannot upload file, you might not have permission to do this.', 400);
            }
            set_time_limit(600);
            ini_set('auto_detect_line_endings', true);

            $csv_file = $request->file('csv_file');
            $file_name = $this->uniqueId(18) . '.' . $csv_file->getClientOriginalExtension();
            $file_original_name = $csv_file->getClientOriginalName();
            $file_type = $csv_file->getClientMimeType();
            $file_size = $csv_file->getClientSize();
            $file_real_path = $csv_file->getRealPath();

            $folder_path = 'clients/' . $current_company_id . '/data-loader/data';
            $disk = Storage::disk('gcs');
            $file_path = $folder_path . '/' . $file_name;
            $disk->put($file_path, file_get_contents($csv_file), 'public');
            $file_url = $disk->url($file_path);

            $row_count = $this->getCsvRowCount($file_real_path);

            // Check for delimiter
            $file = fopen($file_real_path, 'r');
            $buffer = fgets($file, 4096);
            fclose($file);
            $tab_count = substr_count($buffer, '\t');
            $pipe_count = substr_count($buffer, ',');

            $delimiter = ',';
            $delim_name = 'comma';
            if ($tab_count > $pipe_count) {
                $delimiter = '\t';
                $delim_name = 'tab';
            }

            // Get header
            $file = fopen($file_real_path, "r");
            $buffer = fgetcsv($file, 4096, $delimiter);
            fclose($file);
            $fields = implode(',', $buffer);

            $gs_object = [
                'file_original_name' => $file_original_name,
                'file_name' => $file_name,
                'file_type' => $file_type,
                'file_size' => $file_size,
            ];

            $google_storage_obj = new GoogleStorageFile();
            $google_storage_obj->company_id = $current_company_id;
            $google_storage_obj->owner_id = $current_db_id;
            $google_storage_obj->bucket_type = GoogleStorageFile::BUCKET_TYPE_COMPANY_ID;
            $google_storage_obj->object_folder = $folder_path;
            $google_storage_obj->object_name = $file_original_name;
            $google_storage_obj->file_link = $file_url;
            $google_storage_obj->public = false;
            $google_storage_obj->gs_id = $user->username . '-' . $current_company_id . '/' . $file_name;
            $google_storage_obj->gs_size = $file_size;
            $google_storage_obj->gs_object = json_encode($gs_object);
            $google_storage_obj->upload_datetime = \Carbon\Carbon::now()->toDateTimeString();
            $google_storage_obj->save();

            GoogleStorageLog::saveLog($current_company_id, $current_db_id, $gs_object, $folder_path);

            $user_file = new UserFile();
            $user_file->exec_server_id = $this->__getServerID();
            $user_file->google_storage_file_id = $google_storage_obj->google_storage_log_id;
            $user_file->unique_id = $this->uniqueId(18);
            $user_file->type = 1;
            $user_file->file_name = $file_original_name;
            $user_file->file_size = $file_size;
            $user_file->file_type = $file_type;
            $user_file->server_file_location = $folder_path;
            $user_file->server_file_name = $file_name;
            $user_file->uploader_id = $user->x5_contact_id;
            $user_file->company_id = $current_company_id;
            $user_file->upload_datetime = \Carbon\Carbon::now()->toDateTimeString();
            $user_file->total_rows = $row_count['c_data'];
//            $user_file->empty_totsal_rows = $row_count['c_empty'];
            $user_file->cols = $fields;
            $user_file->delimiter = $delim_name;
            $user_file->removed = FALSE;
            $user_file->save();

            return response()->json(['status' => 200, 'msg' => 'File uploaded successfully.', 'data' => $user_file]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.DataLoaderController

            '), $e);
            throw $e;
        }
    }

    /**
     * Count CSV file rows
     *
     * @param string $file_location
     * @return array
     */
    protected function getCsvRowCount($file_location) {
        ini_set('auto_detect_line_endings ', true);
        $file = fopen($file_location, "r");
        $c_data = 0;
        $c_empty = 0;
        while (($result = fgetcsv($file)) !== false) {
            if (!array_filter($result) || array(null) === $result) { // ignore blank lines
                $c_empty++;
                continue;
            }
            $c_data++;
        }
        fclose($file);
        return [' c_data' => $c_data, 'c_empty' => $c_empty];
    }

    /**
     * Process file options lists
     *
     * @return \Illuminate\Http\Response
     * @throws \App\Http\Controllers\DataManagement\Exception
     */
    public function fileProcessOptionsList(Request $request) {
        try {

            $current_company_id = $request->current_company_id;
            $user = $request->user();
            $campaign_ids = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_CAMPAIGN, ACCESS_READ, $current_company_id, $user);
            $lists = \App\VicidialLists::select('list_id', 'list_name', 'campaign_id', 'active')->whereIn('campaign_id', $campaign_ids)->orderBy('active')->orderBy('list_id')->orderBy('list_name')->get();
            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $lists]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.DataLoaderController'), $e);
            throw $e;
        }
    }

    /**
     * Get lists fields
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws \App\Http\Controllers\DataManagement\Exception
     */
    public function getFields(Request $request) {
        try {

            Validator::make($request->all(), [
                'list_id' => 'required',
            ])->validate();
            $current_company_id = $request->current_company_id;
            $user = $request->user();
            $list_id = $request->list_id;
            $campaign_ids = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_CAMPAIGN, ACCESS_READ, $current_company_id, $user);
            $list_fields = \App\VicidialListsFields::listsFields($list_id, $campaign_ids);
            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $list_fields]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.DataLoaderController'), $e);
            throw $e;
        }
    }

    /**
     * Get file details
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws \App\Http\Controllers\DataManagement\Exception
     * @throws Exception
     */
    public function getFileInfo(Request $request) {
        try {

            Validator::make($request->all(), [
                'unique_id' => 'required',
            ])->validate();
            $current_company_id = $request->current_company_id;
            $user = $request->user();
            $unique_id = $request->unique_id;

            $permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_DATA_LOADER_DATA_FILE, $permissions)) {
                throw new Exception('Cannot get file details, you might not have permission to do this.', 400);
            }

            $file = UserFile::select('user_files.file_name', 'user_files.file_size', 'user_files.file_type', 'user_files.total_rows', 'user_files.cols')
                    ->join('x5_contacts', 'x5_contacts.x5_contact_id', 'user_files.uploader_id')
                    ->where('user_files.unique_id', $unique_id)
                    ->where('user_files.removed', '0')
                    ->where(function ($query) use($current_company_id) {
                        $query->where('x5_contacts.company_id', $current_company_id)
                        ->orWhere('user_files.company_id', $current_company_id);
                    })
                    ->first();
            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $file]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.DataLoaderController'), $e);
            throw $e;
        }
    }

    /**
     * Get average process time
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws \App\Http\Controllers\DataManagement\Exception
     */
    public function getAvgProcessTime(Request $request) {
        try {

            Validator::make($request->all(), [
                'dupcheck' => 'required|in:NONE,DUPLIST,DUPCAMP,DUPSYS,DUPTITLEALTPHONELIST,DUPTITLEALTPHONESYS',
            ])->validate();
            $db_id = $request->user()->db_last_used;
            $dupcheck = $request->dupcheck;

            $avg_process_time = UserFileProcessQueue::selectRaw('(AVG(time_spent/total_rows)) as avg_pre_row')
                    ->where('db_id', $db_id)
                    ->where('exec_server_id', $this->__getServerID())
                    ->where('dupcheck', $dupcheck)
                    ->whereNotNull('time_spent')
                    ->where('success', TRUE)
                    ->groupBy('dupcheck')
                    ->first();
            if ($avg_process_time === null) {
                $avg_process_time = -1;
            }

            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $avg_process_time]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.DataLoaderController'), $e);
            throw $e;
        }
    }

    /**
     * Process file data
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws \App\Http\Controllers\DataManagement\Exception
     * @throws Exception
     */
    public function processFile(Request $request) {
        try {

            Validator::make($request->all(), [
                'unique_id' => 'required',
                'settings.list_id' => 'required',
                'settings.dupcheck' => 'required|in:NONE, DUPLIST, DUPCAMP, DUPSYS, DUPTITLEALTPHONELIST, DUPTITLEALTPHONESYS',
                    ], [
                'settings.dupcheck.in' => 'Missing Duplicate Check'
            ])->validate();
            $current_company_id = $request->current_company_id;
            $user = $request->user();
            $unique_id = $request->unique_id;
            $list_id = $request->settings['list_id'];
            $process_now = $request->settings['process_now'];
            $fields = $request->settings['fields'];

            $campaign_ids = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_DATA_LOADER_PROCESS_FILE, $campaign_ids)) {
                throw new Exception('Cannot process file, you might not have permission to do this.', 400);
            }

            $file = UserFile::select('user_files.id', 'user_files.unique_id', 'user_files.exec_server_id', 'user_files.google_storage_file_id', 'user_files.type', 'user_files.file_name', 'user_files.file_size', 'user_files.file_type', 'user_files.server_file_location', 'user_files.server_file_name', 'user_files.company_id', 'user_files.uploader_id', 'user_files.upload_datetime', 'user_files.total_rows', 'user_files.cols', 'user_files.delimiter', 'user_files.processed', 'user_files.removed')
                    ->join('x5_contacts', 'x5_contacts.x5_contact_id', 'user_files.uploader_id')
                    ->where('user_files.unique_id', $unique_id);
            if (!$user->is_admin) {
                $file = $file->where('user_files.uploader_id', $user->x5_contact_id);
            } else {
                $file = $file->where(function ($query) use($current_company_id) {
                    $query->where('x5_contacts.company_id', $current_company_id)
                            ->orWhere('user_files.company_id', $current_company_id);
                });
            }
            $file = $file->where('user_files.removed', FALSE)
                    ->first();
            if ($file === null) {
                throw new Exception('Cannot locate file', 400);
            }

            $check_list_exists = \App\VicidialLists::where('list_id', $list_id)->whereIn('campaign_id', $campaign_ids)->count();
            if ($check_list_exists === 0) {
                throw new Exception('List does not exist', 400);
            }

            $field_ok = FALSE;
            foreach ($fields as $key => $value) {
                if ($value > -1) {
                    $field_ok = TRUE;
                    break;
                }
            }

            if (!$field_ok) {
                throw new Exception('No field matches selected', 400);
            }

            $check_file_count = UserFileProcessQueue::where('user_file_id', $file->id)->where('list_id', $list_id)->where('status', '<>', '2')->count();
            if ($check_file_count > 0) {
                throw new Exception('Current file is in queue for the list selected', 400);
            }

            $data = [
                'user_file_id' => $file->id,
                'company_id' => $current_company_id,
                'requester_id' => $user->x5_contact_id,
                'dupcheck' => $request->settings['dupcheck'],
                'settings' => json_encode($request->settings),
                'list_id' => $list_id,
                'current_row' => 0,
                'sync_process_type' => $request->settings['sync_process_type'],
                'exec_server_id' => $this->__getServerID(),
                'webserver_dns' => $request->current_application_dns,
                'db_id' => $user->db_last_used,
                'create_datetime' => \Carbon\Carbon::now()->toDateTimeString()
            ];

            UserFileProcessQueue::insert($data);

            // X5 log
            $x5_log_data['change_datetime'] = $data['create_datetime'];
            $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
            $x5_log_data['company_id'] = $user->company_id;
            $x5_log_data['user_ip'] = $this->clientIp();
            $x5_log_data['class'] = "DataLoaderController";
            $x5_log_data['method'] = __FUNCTION__;
            $x5_log_data['model'] = UserFileProcessQueue::class;
            $x5_log_data['action_1'] = "ADD";
            X5Log::insert($x5_log_data);

            return response()->json(['status' => 200, 'msg' => 'Process request submitted!']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.DataLoaderController'), $e);
            throw $e;
        }
    }

    /**
     * Cancel process
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function cancelFileProcess(Request $request) {
        try {

            Validator::make($request->all(), [
                'process_id' => 'required',
            ])->validate();
            $id = $request->process_id;
            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $hasAccess = $this->hasAccessToCron($id, $current_company_id);
            if ($hasAccess === 0) {
                throw new Exception('Access Delined', 400);
            }

            $in_process_and_not_cancled = UserFileProcessQueue::where('id', $id)->where('status', '1')->where('user_canceled', '0')->count();

            if ($in_process_and_not_cancled === 0) {
                throw new Exception('Stop process request has been sent or process is stopped.');
            }

            UserFileProcessQueue::where('id', $id)->update(['user_canceled' => TRUE, 'cancel_user_id' => $user->x5_contact_id]);

            // X5 log
            $x5_log_data['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
            $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
            $x5_log_data['company_id'] = $user->company_id;
            $x5_log_data['user_ip'] = $this->clientIp();
            $x5_log_data['class'] = "DataLoaderController";
            $x5_log_data['method'] = __FUNCTION__;
            $x5_log_data['model'] = UserFileProcessQueue::class;
            $x5_log_data['action_1'] = "PROCESS_FILE";
            X5Log::insert($x5_log_data);

            return response()->json(['status' => 200, 'msg' => 'Stop process request submitted!']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.DataLoaderController'), $e);
            throw $e;
        }
    }

    /**
     * Remove from in queue
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function deleteFileFromQueue(Request $request) {
        try {

            Validator::make($request->all(), [
                'process_id' => 'required',
            ])->validate();
            $process_id = $request->process_id;
            $user = $request->user();

            $hasAccess = $this->hasAccessToCron($process_id, $request->current_company_id);
            if ($hasAccess === 0) {
                throw new Exception('Access Delined', 400);
            }

            $in_queue = UserFileProcessQueue::where('id', $process_id)->where('status', '0')->count();
            if ($in_queue === 0) {
                throw new Exception('Process is either in progress or finished', 400);
            }

            UserFileProcessQueue::where('id', $process_id)->delete();

            // X5 log
            $x5_log_data['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
            $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
            $x5_log_data['company_id'] = $user->company_id;
            $x5_log_data['user_ip'] = $this->clientIp();
            $x5_log_data['class'] = "DataLoaderController";
            $x5_log_data['method'] = __FUNCTION__;
            $x5_log_data['model'] = UserFileProcessQueue::class;
            $x5_log_data['action_1'] = "REMOVE";
            X5Log::insert($x5_log_data);

            return response()->json(['status' => 200, 'msg' => 'Removed from queue.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.DataLoaderController'), $e);
            throw $e;
        }
    }

    /**
     * Delete uploaded file
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function deleteUploadedFile(Request $request) {
        try {

            Validator::make($request->all(), [
                'file_id' => 'required',
            ])->validate();
            $current_company_id = $request->current_company_id;
            $user = $request->user();
            $file_id = $request->file_id;

            $permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_DELETE, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_DATA_LOADER_DATA_FILE, $permissions)) {
                throw new Exception('Cannot delete file, you might not have permission to do this.', 400);
            }

            $user_file = UserFile::join('x5_contacts', 'x5_contacts.x5_contact_id', 'user_files.uploader_id')
                    ->select('user_files.id', 'user_files.file_name', 'user_files.server_file_name')
                    ->where(function ($query) use($current_company_id) {
                        $query->where('x5_contacts.company_id', $current_company_id)
                        ->orWhere('user_files.company_id', $current_company_id);
                    })
                    ->where('user_files.removed', '0')
                    ->where('user_files.unique_id', $file_id)
                    ->first();
            if ($user_file === null) {
                throw new Exception('Cannot locate file', 400);
            }

            $file_not_finished = UserFileProcessQueue::where('user_file_id', $user_file->id)->where('status', '<>', 2)->count();
            if ($file_not_finished > 0) {
                throw new Exception('File is still in queue or in progress. Please wait until it finished or remove it from the queue first. Thanks.', 400);
            }

            $disk = Storage::disk('gcs');
            $folder_path = 'clients/' . $current_company_id . '/data-loader/data/';
            $file_url = $folder_path . $user_file->server_file_name;
            $exists = $disk->exists($file_url);
            if ($exists) {
                $disk->delete($file_url);
            }

            UserFile::where('unique_id', $file_id)->update(['removed' => 1]);

            // X5 log
            $x5_log_data['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
            $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
            $x5_log_data['company_id'] = $user->company_id;
            $x5_log_data['user_ip'] = $this->clientIp();
            $x5_log_data['class'] = 'DataLoaderController';
            $x5_log_data['method'] = __FUNCTION__;
            $x5_log_data['model'] = UserFile::class;
            $x5_log_data['action_1'] = 'DELETE';
            X5Log::insert($x5_log_data);

            return response()->json(['status' => 200, 'msg' => 'File deleted successfully.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.DataLoaderController'), $e);
            throw $e;
        }
    }

    /**
     * Download CSV
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function downloadCSVFile(Request $request) {
        try {

            Validator::make($request->all(), [
                'file_id' => 'required',
            ])->validate();
            $current_company_id = $request->current_company_id;
            $user = $request->user();
            $file_id = $request->file_id;
            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $current_company_id, $user);

            if (!in_array(SYSTEM_COMPONENT_DATA_LOADER_DATA_FILE, $access_permissions)) {
                throw new Exception('Cannot download csv file, you might not have permission to do this.', 400);
            }

            $file = UserFile::select('user_files.file_name', 'user_files.google_storage_file_id', 'user_files.server_file_name')
                    ->join('x5_contacts', 'x5_contacts.x5_contact_id', 'user_files.uploader_id')
                    ->where('user_files.unique_id', $file_id)
                    ->where('x5_contacts.company_id', $current_company_id)
                    ->first();
            if ($file === null) {
                throw new Exception('Cannot locate file', 400);
            }

            $disk = Storage::disk('gcs');
            $file_url = 'clients/' . $current_company_id . '/data-loader/data/' . $file->server_file_name;
            $exists = $disk->exists($file_url);
            if (!$exists) {
                throw new Exception('Cannot locate file: 2', 400);
            }
            // X5 log
            $x5_log_data['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
            $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
            $x5_log_data['company_id'] = $user->company_id;
            $x5_log_data['user_ip'] = $this->clientIp();
            $x5_log_data['class'] = 'DataLoaderController';
            $x5_log_data['method'] = __FUNCTION__;
            $x5_log_data['model'] = UserFile::class;
            $x5_log_data['action_1'] = 'DOWNLOAD';
            X5Log::insert($x5_log_data);

            $file_name = $file->file_name;
            $file_get_contents = $disk->get($file_url);
            $response = response($file_get_contents, 200);
            $response->header('Content-Type', 'text/csv');
            $response->header('Content-Disposition', 'attachment; filename="$file_name"');
            $response->header('Content-Length ', $disk->size($file_url));
            return $response;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.DataLoaderController'), $e);
            throw $e;
        }
    }

    /**
     * Check count
     *
     * @param int $id
     * @param int $company_id
     * @return int
     */
    protected function hasAccessToCron($id, $company_id) {
        return UserFileProcessQueue::join('user_files', 'user_files.id', 'user_file_process_queues.user_file_id')
                        ->join('x5_contacts', 'x5_contacts.x5_contact_id', 'user_files.uploader_id')
                        ->where('user_file_process_queues.id', $id)
                        ->where('x5_contacts.company_id', $company_id)
                        ->count();
    }

}
