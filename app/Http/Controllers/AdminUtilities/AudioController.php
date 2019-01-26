<?php

/*
 * Controller for admin utilities dnc number module
 * @author <om@ytel.com>
 * 
 */

namespace App\Http\Controllers\AdminUtilities;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\AudioUploadRequest;
use App\Traits\AccessControl;
use App\Traits\ErrorLog;
use App\Traits\Helper;
use App\Http\Requests\MOHRequest;
use App\VicidialVoicemail;
use App\VicidialAdminLog;
use App\SystemSetting;
use App\VicidialMusicOnHold;
use App\VicidialMusicOnHoldFile;
use App\X5Log;
use App\Servers;
use App\Http\Controllers\AdminUtilities\AdminUtilitiesConstants as AdminUtilities;
use App\Http\Controllers\AdminUtilities\AdminUtilitiesErrors;
use Exception;
use Illuminate\Support\Facades\Storage;
use Session;
use Illuminate\Support\Facades\Input;
class AudioController extends Controller {

    use ErrorLog,
        AccessControl,
        Helper;

    private $audio_file_url;
    private $audio_dir;
    private $audio_web_server;
    private $audio_dir_url;

    /**
     * Instantiate a new controller instance.
     *
     * @return void
     */
    public function __construct() {



       /* $settings = SystemSetting::getAll(['sounds_web_server', 'sounds_web_directory']);
        $this->audio_dir_url = "http://$this->audio_web_server/$this->audio_dir/";
        */
/*
        $settings = SystemSetting::getAll(['sounds_web_server', 'sounds_web_directory']);

        print_r($settings);
        exit;

        $sounds_web_server = isset($settings[0]['sounds_web_server']) && $settings[0]['sounds_web_server'] != '' ? $settings[0]['sounds_web_server'] : '';

        $this->audio_web_server = $sounds_web_server;
        $this->audio_dir = isset($settings[0]['sounds_web_server']) && $settings[0]['sounds_web_directory'] != '' ? $settings[0]['sounds_web_directory'] : '';
        $this->audio_file_url = 'http://' . str_replace(array('https://', 'http://', '/'), "", $sounds_web_server) . '/x5/audio.php';

        $this->audio_dir_url = "http://$this->audio_web_server/$this->audio_dir/";
        

        $this->audio_dir_url = "http://$this->audio_web_server/$this->audio_dir/";*/


    }

    /**
     * Get voice mail list

     * @param Request $request
     * @return array
     */
    public function audioLists() {

        try {

        $settings = SystemSetting::getAll(['sounds_web_server', 'sounds_web_directory']);

        $sounds_web_server = isset($settings[0]['sounds_web_server']) && $settings[0]['sounds_web_server'] != '' ? $settings[0]['sounds_web_server'] : '';

        $this->audio_web_server = $sounds_web_server;
        $this->audio_dir = isset($settings[0]['sounds_web_server']) && $settings[0]['sounds_web_directory'] != '' ? $settings[0]['sounds_web_directory'] : '';
        $this->audio_file_url = 'http://' . str_replace(array('https://', 'http://', '/'), "", $sounds_web_server) . '/x5/audio.php';

        $this->audio_dir_url = "http://$this->audio_web_server/$this->audio_dir/";
        

        //$this->audio_dir_url = "http://$this->audio_web_server/$this->audio_dir/";

            #headers
            $headers = array(
                'http' => array(
                    'method' => "POST",
                    'header' => "Content-type: application/x-www-form-urlencoded",
                    'content' => http_build_query([
                        'action' => 'list-ssdt-ng'
                    ])
                )
            );

            #get file context
            $context = stream_context_create($headers);


            #get audio lists
            $audio_list = json_decode(strstr(@file_get_contents($this->audio_file_url, false, $context), '['));

            return response()->json(['audio_list' => $audio_list, 'audio_dir_url' => $this->audio_dir_url]);
        } catch (Exception $ex) {
            return response()->json(['audio_list' => [], 'audio_dir_url' => '']);
        }
    }
    public function musicOnHoldList(Request $request)
    {
        try {
            $limit = $request->get('limit') ?: \Config::get("configs.pagination_limit");
            $search = $request->get('search') ?: NULL;


            $mohlist=VicidialMusicOnHold::where('remove','N');
              if ($search != NULL) {
                $mohlist = $mohlist->where(function ($query) use ($search) {
                    $query->where("moh_id", "like", "%{$search}%")
                            ->orWhere("moh_name", "like", "%{$search}%");
                });
            }
            $mohlist=$mohlist->paginate($limit);
             return response()->json(['status' => 200,'data' =>$mohlist,'msg' => "Success"],200); 
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }
    public function audioManualRecords()
    {
        try {
            $limit =\Config::get("configs.pagination_limit");
            $audioinfo=VicidialAdminLog::where('event_section','AUDIOSTORE')->where('record_id','manualupload')->paginate($limit);
             return response()->json(['status' => 200,'data' =>$audioinfo,'msg' => "Success"],200); 
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
        
    }
    public function addNewMOHEntry(MOHRequest $request)
    {
        try {
            $user = $request->user();
            $current_company_id = $request->current_company_id;
          
            $access_type_list = $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_CREATE, $user);
           
            if (!empty((SYSTEM_COMPONENT_ADMIN_MOH) && !in_array(SYSTEM_COMPONENT_ADMIN_MOH, $access_type_list))) {
                throw new Exception('Error.',404);
            }
           
             if (VicidialMusicOnHold::duplicateRecords($request['moh_id'])== 0) {
                $add_moh=VicidialMusicOnHold::create($request->all());

                 $lastInsertId=$add_moh->moh_id;
            
                if ($add_moh) {

                    $admin_log = new VicidialAdminLog();

                    $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                    $admin_log['user'] = $user->x5_contact_id;
                    $admin_log['ip_address'] = $this->clientIp();
                    $admin_log['event_section'] = "Music On Hold";
                    $admin_log['event_type'] = "ADD";
                    $admin_log['record_id'] = $request['moh_id'];
                    $admin_log['event_code'] = "ADMIN ADD Music on Hold";
                    $admin_log['event_sql'] ="INSERT INTO vicidial_music_on_hold set moh_id='".$request['moh_id']."', moh_name='".$request['moh_name']."', moh_context='".$request['moh_context']."', user_group='".$request['user_group']."'";
                    $admin_log['event_notes'] = "";
                    
                    $admin_log->save();

                    # Add code for server setting
                    return response()->json(['status' => 200,'msg' => "Success"],200);
                    
                } else {
                    throw new Exception('validation error', 400);
                }
            } else {
                
                    throw new Exception('This record is already present.', 400);
            }
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }
    public function editMOH(Request $request)
    {
        try {

            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $access_type_list = $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE, $user);

            if (!empty((SYSTEM_COMPONENT_ADMIN_MOH) && !in_array(SYSTEM_COMPONENT_ADMIN_MOH, $access_type_list))) {
                throw new Exception('Error.',404);
            }
           
            $moh_id = $request['moh_id'];
            $mohlist=VicidialMusicOnHold::find($moh_id);
          
           return response()->json(['status' => 200,'data' =>$mohlist,'msg' => "Success"],200); 
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }
    public function updateMOH(Request $request)
    {
        try {

            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $moh_id=$request['moh_id'];
            $filename = $request['filename'];
            $query='';
            $access_type_list = $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE, $user);
            if (!in_array(SYSTEM_COMPONENT_ADMIN_MOH, $access_type_list)) {
                throw new ForbiddenException();
            }
            if ($moh_id!="") {
                $music_on_hold=VicidialMusicOnHold::find($moh_id);

                $music_on_hold->fill($request->all())->save();
            }

            $music_on_hold_files=VicidialMusicOnHoldFile::where('moh_id',$moh_id)->get();

            $mohfiles_to_print=count($music_on_hold_files);
            $ranks=($mohfiles_to_print+1);
           

             $o = 0;
                while ($mohfiles_to_print > $o) {
                    $new_rank=0;
                    $mohfiles[$o]=$music_on_hold_files->filename;
                    $mohranks[$o]=$music_on_hold_files->rank;
                    $Ffilename=str_replace(".", "_",$mohfiles[$o]);
                    $new_rank=$request[$Ffilename];

                    $data['rank']=$new_rank;
                    $query=VicidialMusicOnHoldFile::where('moh_id',$moh_id)->where('filename',$mohfiles[$o])->first();
                    $query->fill($data)->save();
                    $o++;
                }


                if (!empty($filename)) {

                    $count=VicidialMusicOnHoldFile::where('moh_id',$moh_id)->where('filename',$filename)->count();

                    if ($count>0) {
                         throw new Exception('Error', 400);
                    }
                    // $music=new VicidialMusicOnHoldFile;
                    $data['rank']=$ranks;
                    $data['filename']=$filename;
                    $data['moh_id']=$moh_id;
                    VicidialMusicOnHoldFile::insert($data);
                    
                }

                $data2['rebuild_music_on_hold']="Y";
                $data2['sounds_update']="Y";
                $servdata['rebuild_conf_files']="Y";

                $server=Servers::first();
                
                $server->fill($data2)->save();

                $server1=Servers::where('generate_vicidial_conf','Y')->where('active_asterisk_server','Y')->first();

                if ($server1) {
                  $server1->fill($servdata);    
                }
                if ($music_on_hold && $query) {
                   $admin_log = new VicidialAdminLog();

                    $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                    $admin_log['user'] = $user->username;
                    $admin_log['ip_address'] = $this->clientIp();
                    $admin_log['event_section'] = "MOH";
                    $admin_log['event_type'] = "MODIFY";
                    $admin_log['record_id'] = $request['moh_id'];
                    $admin_log['event_code'] = "ADMIN MODIFY MOH";
                    $admin_log['event_sql'] ="UPDATE vicidial_music_on_hold SET moh_name='".$request['moh_name']."',user_group='".$request['user_group']."', active='".$request['active']."',random='".$request['random']."' WHERE moh_id='".$request['moh_id']."'";
                    $admin_log['event_notes'] = "";
                    $admin_log['user_group'] = $request['user_group'];
                    $admin_log->save();
                }
           return response()->json(['status' => 200,'msg' => "Success"],200); 
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }
    public function destroy(Request $request)
    {
        try {
            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $moh_id=$request['moh_id'];
            $access_type_list = $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_DELETE, $user);
            if (!in_array(SYSTEM_COMPONENT_ADMIN_MOH, $access_type_list)) {
               throw new Exception('Error.',404);
            }

            $vicidial_music_on_hold_file=VicidialMusicOnHoldFile::where('moh_id',$moh_id)->get();

            if ($vicidial_music_on_hold_file) {
                foreach ($vicidial_music_on_hold_file as $value) {
                    $value->delete();
                }
            }
            $vicidial_music_on_hold=VicidialMusicOnHold::find($moh_id);

            if ($vicidial_music_on_hold) {
                $data['remove']='Y';
                $vicidial_music_on_hold->update($data);
            } else {
                throw new Exception('Error.',404);
            }

             $admin_log = new VicidialAdminLog();

                        $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                        $admin_log['user'] = $user->username;
                        $admin_log['ip_address'] = $this->clientIp();
                        $admin_log['event_section'] = "MOH";
                        $admin_log['event_type'] = "MODIFY";
                        $admin_log['record_id'] = $request['moh_id'];
                        $admin_log['event_code'] = "ADMIN MODIFY MOH";
                        $admin_log['event_sql'] = "UPDATE vicidial_music_on_hold SET remove='Y' WHERE moh_id='".$request['moh_id']."'";
                        $admin_log['event_notes'] = "";
                        $admin_log['user_group'] = $request['user_group'];
                        $admin_log->save();

             return response()->json(['status' => 200,'msg' => "Success"],200); 

        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    public function uploadAudio(AudioUploadRequest $request)
    {
       
        try {
            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $current_application_dns = $request->current_application_dns;
          
            $url = 'http://' . str_replace(array('https://', 'http://', '/'), "", $current_application_dns) . '/x5/audio.php';

            // $file=$request->file('audiofilename');

            $files_dir = '../storage/tempf/';

            $file_type=$request->file('audiofilename')->getClientOriginalExtension();

            $filename=$request->file('audiofilename')->getClientOriginalName();
              
            $savefile=$request->file('audiofilename')->move($files_dir,$filename);

            if (empty($savefile)) {
                 throw new Exception("Cannot upload your file to the server, please try again.", 411);
            } 

            $file_path = $files_dir . $filename;

            $target_url=$url;
            // return $target_url;
                $origin_file_path = $file_path;


                $file_path = $this->convertToPhoneAudio($file_path);

                if (function_exists('curl_file_create')) { // php 5.5+
                  $cFile = curl_file_create($file_path);
                } else { // 
                  $cFile = '@' . realpath($file_path);
                }

                $post = array('action' => 'upload', 'file' =>  $cFile);
                $ch = curl_init();

                curl_setopt($ch, CURLOPT_TIMEOUT, 20);
                curl_setopt($ch, CURLOPT_URL, $target_url);
                curl_setopt($ch, CURLOPT_POST, 1);
                curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
                $result = curl_exec($ch);

                if (curl_errno($ch))
                {
                    throw new Exception('Cannot upload your file, please try again or contact Ytel Smart Support. Error: ' . curl_error($ch), 400);
                }
                else
                {
                    // return "hello";
                    $return_file_info = json_decode($result, TRUE);
                    $AF_orig = $return_file_info['tmp_name'];
                    $AF_path = $return_file_info['name'];
                     $data = array();

                    $data['rebuild_music_on_hold']="Y";
                    $data['sounds_update']="Y";
                  
                    $server=Servers::first();
                    
                    $server->fill($data)->save();


                    $admin_log = new VicidialAdminLog();

                    $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                    $admin_log['user'] = $user->x5_contact_id;
                    $admin_log['ip_address'] = $this->clientIp();
                    $admin_log['event_section'] = "AUDIOSTORE";
                    $admin_log['event_type'] = "LOAD";
                    $admin_log['record_id'] = "manualupload";
                    $admin_log['event_code'] = "ADMIN UPLOAD AUDIO URL";
                    $admin_log['event_sql'] = "UPDATE servers SET rebuild_music_on_hold='Y',sounds_update='Y'";
                    $admin_log['event_notes'] =  $filename;
                    $admin_log['user_group'] = "---ALL---";
                    
                    $admin_log->save();
                  
                    /*@unlink($origin_file_path);
                    @unlink($file_path);*/

                    if($origin_file_path !=""){
                        if(file_exists($origin_file_path))
                        {
                            @unlink($origin_file_path);    
                        }
                    }
                    if($file_path !=""){
                        if(file_exists($file_path))
                        {
                            @unlink($file_path);
                        }
                    }
                     return response()->json(['status' => 200,'msg' => "Your file has been uploaded successfully to the server."],200); 
                  
                }
        } catch (Exception $e) {
             {
                @unlink($origin_file_path);
                @unlink($file_path);

                if ($e->getMessage())
                {
                    $message = $e->getMessage();
                }
                else
                {
                    $message = 'Something went wrong, please try again or contact Ytel Smart Support.';
                }

                return response()->json(['status' => 404,'msg' => $message],404); 
            }
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
       
        // echo 'here'.$request->file('audiofilename')->getClientOriginalName();exit;
    }



     public function audioListForInbound() {

        try {

            #headers
            $headers = array(
                'http' => array(
                    'method' => "POST",
                    'header' => "Content-type: application/x-www-form-urlencoded",
                    'content' => http_build_query([
                        'action' => 'list-ssdt-ng'
                    ])
                )
            );

            #get file context
            $context = stream_context_create($headers);

            #get audio lists
            $return['files'] = json_decode(strstr(@file_get_contents($this->audio_file_url, false, $context), '['));




            $result = SystemSetting::getAll(['sounds_web_server', 'sounds_web_directory']);


             $sound_directory = $result[0]['sounds_web_directory'];
            //***********************************************
            //need to check
            // $dbs = $this->Session->read('dbs');

            // $return['url'] = "http://" . $dbs[$this->Session->read('current_db_id')]['InvCluster']['application_dns'] . DS . $sound_directory . DS;
            //***********************************************
             
               
            return json_encode($return);
           
        } catch (Exception $ex) {
            return response()->json(['audio_list' => [], 'audio_dir_url' => '']);
        }
    }

}
