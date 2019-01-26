<?php

namespace App\Http\Controllers\Inbound;

use Illuminate\Http\Request;
use App\Http\Requests\FPGRequest;
use App\Http\Controllers\Controller;
use App\Traits\AccessControl;
use App\Traits\ErrorLog;
use App\Traits\Helper;
use App\VicidialFilterPhoneGroup;
use App\VicidialFilterPhoneNumber;
use App\VicidialAdminLog;
use Exception;

use Rap2hpoutre\FastExcel\FastExcel;
class FilterPhoneGroupController extends Controller
{
    use ErrorLog,
        AccessControl,
        Helper;

    /**
     * Listing of all call filter Phone Group.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws \App\Http\Controllers\CallMenu\Exception
     */
    public function index(Request $request) {
        try {

        		$limit =\Config::get("configs.pagination_limit");
        		$phoneGroup=VicidialFilterPhoneGroup::orderBy('filter_phone_group_id','desc')->paginate($limit);
        		foreach ($phoneGroup as $key => $ftp) {

        			$rsult=VicidialFilterPhoneNumber::getCount($ftp->filter_phone_group_id);

	                $phoneGroup[$key]['phone_count']  = $rsult;
        		}

           return response()->json(['status' => 200,'data' =>$phoneGroup,'msg' => "Success"],200);


        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }
      /**
     * edit of Filter Phone Group(FPG).
     *
     * @param  int $filter_phone_group_id
     * @return \Illuminate\Http\Response
     * @throws \App\Http\Controllers\CallMenu\Exception
     */
    public function edit(Request $request)
    {
    	try {

	    	$filter_phone_group_id=$request['filter_phone_group_id'];
	    	if (empty($filter_phone_group_id) || $filter_phone_group_id == '') {
	                throw new Exception('Request parameter `filter_phone_group_id` is empty', 400);
	         } else {
	         	$result=VicidialFilterPhoneGroup::find($filter_phone_group_id);

	           return response()->json(['status' => 200,'data' =>$result,'msg' => "Record Updated Successfully"],200);

	         }
	    } catch (Exception $e) {
    		$this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
    	}
    }
      /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(FPGRequest $request)
    {
    	try {

			$user = $request->user();

			$result=VicidialFilterPhoneGroup::find($request['filter_phone_group_id']);

				if(empty($result))
				{
					$filter_phone_group=VicidialFilterPhoneGroup::create($request->all());

					$sql="INSERT INTO vicidial_filter_phone_groups (filter_phone_group_id,filter_phone_group_name,filter_phone_group_description,user_group) values('".$request['filter_phone_group_id']."','".$request['filter_phone_group_name']."','".$request['filter_phone_group_description']."','".$request['user_group']."');";


					$admin_log = new VicidialAdminLog();
		            $admin_log['event_date'] =\Carbon\Carbon::now()->toDateTimeString();
		            $admin_log['user'] =$user->username;
		            $admin_log['ip_address']=$this->clientIp();
		            $admin_log['event_section']='ADD_FGN_NUMBERS';
		            $admin_log['event_type'] ='ADD';
		            $admin_log['record_id'] =$request['filter_phone_group_id'];
		            $admin_log['event_code'] ='FGN NUMBER';
		            $admin_log['event_sql'] =$sql;
		            $admin_log['event_notes'] = "";
		            $admin_log['user_group'] =$filter_phone_group->user_group;

	 				return response()->json(['status' => 200,'data' =>$filter_phone_group,'msg' => "Success"],200);
				}
				else {
					throw new Exception('Filter Phone Group ID is already exist.', 400);
				}
		} catch (Exception $e) {
    		$this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
    	}
    }

     /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
   	public function update(FPGRequest $request)
   	{
   		try {

			$user = $request->user();


				$result=VicidialFilterPhoneGroup::find($request['filter_phone_group_id']);

				if($result)
				{
					$result->update($request->all());

					 $sql="UPDATE vicidial_filter_phone_groups set filter_phone_group_name='".$request['filter_phone_group_name']."', filter_phone_group_description='".$request['filter_phone_group_description']."',user_group='".$request['user_group']."' where filter_phone_group_id='".$request['filter_phone_group_id']."'";

					$admin_log = new VicidialAdminLog();
		            $admin_log['event_date'] =\Carbon\Carbon::now()->toDateTimeString();
		            $admin_log['user'] =$user->username;
		            $admin_log['ip_address']=$this->clientIp();
		            $admin_log['event_section']='MODIFY_FGN_NUMBERS';
		            $admin_log['event_type'] ='MODIFY';
		            $admin_log['record_id'] =$request['filter_phone_group_id'];
		            $admin_log['event_code'] ='FGN NUMBER';
		            $admin_log['event_sql'] =$sql;
		            $admin_log['event_notes']= " ";
		            $admin_log['user_group'] =$result->user_group;

		            $admin_log->save();

		            return response()->json(['status' => 200,'msg' => "Record Updated Successfully"],200);

					 // VicidialAdminLog::addLog($user->username, $this->clientIp(), 'MODIFY_FGN_NUMBERS', 'MODIFY', $request['filter_phone_group_id'], 'FGN NUMBER', $sql, '',$filter_phone_group->user_group);

				}
				else {
					throw new Exception('Record not found.', 400);
				}
		} catch (Exception $e) {
   			$this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
   		}

   	}
   	/**
     * Remove the specified resource from storage.
     *
     * @param    $filter_phone_group_id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request) {

    	try {

	    	$user = $request->user();

	        if (empty($request['filter_phone_group_id']) || $request['filter_phone_group_id'] == '') {
	                throw new Exception('Request parameter `filter_phone_group_id` is empty', 400);
	        }
	             $phone_group=VicidialFilterPhoneGroup::find($request['filter_phone_group_id']);
	            if (!empty($phone_group)) {

	                $phone_group->delete();

	                $admin_log = new VicidialAdminLog();
			            $admin_log['event_date'] =\Carbon\Carbon::now()->toDateTimeString();
			            $admin_log['user'] =$user->username;
			            $admin_log['ip_address']=$this->clientIp();
			            $admin_log['event_section']='DELETE_FGN_NUMBERS';
			            $admin_log['event_type'] ='DELETE';
			            $admin_log['record_id'] =$request['filter_phone_group_id'];
			            $admin_log['event_code'] ='ADMIN DELETE FGN NUMBER';
			            $admin_log['event_sql'] ="DELETE FROM vicidial_filter_phone_groups where filter_phone_group_id='".$request['filter_phone_group_id']."'";
			            $admin_log['event_notes']= " ";
			            $admin_log['user_group'] =" ";

			            $admin_log->save();

	                return response()->json(['status' => 200,'msg' => "Record Deleted Successfully"],200);
	            } else {
	                throw new Exception('Record not found.', 400);
	            }

	    } catch (Exception $e) {
    		$this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
    	}

    }
    /**
     * Download phone numbers of respective filter_phone_group_id.
     *
     * @param    $filter_phone_group_id
     * @return \Illuminate\Http\Response
     */
    public function downloadFPGNumbers(Request $request)
    {
    	 try {
    	 	 if (empty($request['filter_phone_group_id']) || $request['filter_phone_group_id'] == '') {
	                throw new Exception('Request parameter `filter_phone_group_id` is empty', 400);
	        }

        	$result=VicidialFilterPhoneNumber::where('filter_phone_group_id',$request['filter_phone_group_id'])->get(['phone_number']);


        	if (count($result)<=0) {
        		 throw new Exception('Record not found', 400);
        	}

  			echo (new FastExcel($result))->download('file.csv');


        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }
    public function addFPGNumber(Request $request)
    {
    	try {

   			$phone_numbers = $request['phone_number'];
			$filter_phone_group_id = $request['filter_phone_group_id'];
			$user = $request->user();
			// return $phone_numbers;
			// $phone_numbers = preg_replace('/[^X\n0-9]/', '',$phone_numbers);

			if (strlen($phone_numbers) > 2)
			{
				$PN=explode(",",$phone_numbers);

				$PNct = count($PN);
				$p=0;
				while ($p < $PNct)
				{

					$filterphonenumber=VicidialFilterPhoneNumber::where('phone_number',$PN[$p])->where('filter_phone_group_id',$filter_phone_group_id)->count();
					// return$filterphonenumber;

					if($filterphonenumber>0)
					{
						$aerror = 1;
					} else {	$data['phone_number']=$PN[$p];
						$data['filter_phone_group_id']=$filter_phone_group_id;
						VicidialFilterPhoneNumber::create($data);


						$admin_log = new VicidialAdminLog;
			            $admin_log['event_date'] =\Carbon\Carbon::now()->toDateTimeString();
			            $admin_log['user'] =$user->username;
			            $admin_log['ip_address']=$this->clientIp();
			            $admin_log['event_section']='ADD_FGN_NUMBERS';
			            $admin_log['event_type'] ='ADD';
			            $admin_log['record_id'] =$filter_phone_group_id;
			            $admin_log['event_code'] ='ADMIN ADD FGN NUMBER';
			            $admin_log['event_sql'] ="INSERT INTO vicidial_filter_phone_numbers (phone_number,filter_phone_group_id) values('".$PN[$p]."','".$filter_phone_group_id."')";
			            $admin_log['event_notes']= " ";
			            $admin_log['user_group'] =" ";

			            $admin_log->save();

						$aerror = 0;
					}
					$p++;
				}
				if($aerror==0)
				{
					return response()->json(['status' => 200,'msg' => "Success"],200);
				} else {
					throw new Exception('Number already exist.', 400);
				}
			}
		} catch (Exception $e) {
    		$this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
    	}
    }
    public function deleteFPGNumber(Request $request)
	{
		try {

			$phone_numbers = $request['phone_number'];
			$filter_phone_group_id = $request['filter_phone_group_id'];
			$user = $request->user();
			// $phone_numbers = preg_replace('/[^X\n0-9]/', '',$phone_numbers);
			if (strlen($phone_numbers) > 2)
			{
					$PN = explode(",",$phone_numbers);
					$PNct = count($PN);
					$p=0;
				while ($p < $PNct)
				{
					$filterphonenumber=VicidialFilterPhoneNumber::where('phone_number',$PN[$p])->where('filter_phone_group_id',$filter_phone_group_id)->count();

						if($filterphonenumber<1)
						{
							$derror = 1;
							throw new Exception('Error.', 400);
						}
						else
						{
							$result=VicidialFilterPhoneNumber::where('phone_number',$PN[$p])->where('filter_phone_group_id',$filter_phone_group_id)->first();
							$result->delete();

							$admin_log = new VicidialAdminLog;
				            $admin_log['event_date'] =\Carbon\Carbon::now()->toDateTimeString();
				            $admin_log['user'] =$user->username;
				            $admin_log['ip_address']=$this->clientIp();
				            $admin_log['event_section']='DELETE_FGN_NUMBERS';
				            $admin_log['event_type'] ='DELETE';
				            $admin_log['record_id'] =$filter_phone_group_id;
				            $admin_log['event_code'] ='ADMIN DELETE FGN NUMBER';
				            $admin_log['event_sql'] ="DELETE FROM vicidial_filter_phone_numbers where phone_number='".$PN[$p]."' and filter_phone_group_id='".$filter_phone_group_id."'";
				            $admin_log['event_notes']= " ";
				            $admin_log['user_group'] =" ";

				            $admin_log->save();
								$derror = 0;
						}

					$p++;
				}
				if($derror==0)
				{
					return response()->json(['status' => 200,'msg' => "Success"],200);
				}
				else {
					throw new Exception('Error.', 400);
				}
			}
		} catch (Exception $e) {
			 $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;

		}
	}
}
