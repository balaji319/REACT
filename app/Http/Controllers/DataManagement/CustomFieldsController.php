<?php

namespace App\Http\Controllers\DataManagement;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\CustomRequest;
use App\Traits\Helper;
use App\Traits\ErrorLog;
use App\Traits\AccessControl;
use App\VicidialLists;
use App\VicidialListsFields;
use App\VicidialAdminLog;
use DB;
use Exception;
use App\X5Log;


class CustomFieldsController extends Controller
{
     use Helper,
        AccessControl,
        ErrorLog;

    //for Dynamic table connection
    protected $connection = 'dyna';

    /**
     *Custom Fields list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws \App\Http\Controllers\DataManagement\Exception
     * @throws Exception
     */
    public function customFieldsList(Request $request)
     {
     	try {
     		$limit = $request->get('limit') ?: \Config::get("configs.pagination_limit");
	        $search = $request->get('search') ?: NULL;
	    	$from_lists=VicidialLists::getDate($limit,$search);
	    	// return $from_lists;
		
	    	   $list = $main = array();
	    	 foreach ($from_lists as $key => $from_list) {
	    	 	 $list_id = $from_list->list_id ?: 0;
	    	 
	    	 	$list_count=VicidialListsFields::where('list_id',$list_id)->get();
	    	 	$from_lists[$key]['list_count']=count($list_count);
	    	 }

	        return response()->json(['status' => 200, 'message' => 'Success', 'data' => $from_lists]);
     	} catch (Exception $e) {
     		$this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
     	}
    	
    }
    public function copyCustom(CustomRequest $request)
    {
    	 $table_exists = 0;

    	 $copy_option=$request->copy_option;
    	 $source_field_exists=VicidialListsFields::where('list_id',$request->source_list_id)->count();

    	 $field_exists=VicidialListsFields::where('list_id',$request->list_id)->count();

  
    	 $tablecount_to_print = DB::select("SHOW TABLES LIKE 'custom_$request->list_id';");

    	 if (count($tablecount_to_print)>0) {
    	 	$table_exists=1;
    	 }
    	 if ($source_field_exists<1) {
    	 		throw new Exception('Source list has no custom fields.', 400);
    	 }
    	 if ($copy_option=='REPLACE') {
    	 	
		        if ($table_exists > 0) {

		        	$fields_to_prints=VicidialListsFields::select('field_id','field_label')->where('list_id',$request->list_id)->orderBy('field_rank','field_order','field_label')->get();
		        	// return $fields_to_prints;

		        	 $fields_list = '';
		        	
		        	 foreach ($fields_to_prints as $fields_to_print) {
		                $A_field_id[$o]= $fields_to_print->field_id;
		                $A_field_label[$o]= $fields_to_print->field_label;
		        	 }

		        	while (count($fields_to_prints) > 0) {
                        ### delete field function
                        $this->delete_field_function($A_field_id[$o], $list_id, $A_field_label[$o], $vicidial_list_fields);
                        $o++;
                    }
					

		          //   $o = 0;
		          //   while (count($fields_to_print) > $o) {
		          //                       ### delete field function
		          //       $this->delete_field_function($A_field_id[$o], $list_id, $A_field_label[$o], $vicidial_list_fields);
		          //       $o++;
		            // }
		                            //$leads = implode(",", $A_field_label);
		                            //$this->Session->setFlash("Custom Field Deleted - $list_id|$leads", 'flash-success');
		        }
		            $copy_option = 'APPEND';
    	 }
    	 
    	 // {

		    	 	
		    //             if ($source_field_exists < 1) { $this->Session->setFlash("<B><font color=red>Source list has no custom fields</B></font>\n<BR>", 'flash-error');
		    //             } else {
		    //                 ##### REPLACE option #####
		    //                 if ($copy_option == 'REPLACE') {
						// 		// echo "list_id: " . $list_id;
		    //                     if ($table_exists > 0) {
						// 			$stmt = "SELECT field_id,field_label from vicidial_lists_fields where list_id='$list_id' order by field_rank,field_order,field_label;";

		    //                         $fields_to_print = $this->ViciListsFields->query($stmt);

		    //                         $fields_list = '';
		    //                         $o           = 0;
		    //                         while (count($fields_to_print) > $o) {
		    //                             $rowx              = $fields_to_print[$o]['vicidial_lists_fields'];
		    //                             $A_field_id[$o]    = $rowx['field_id'];
		    //                             $A_field_label[$o] = $rowx['field_label'];
		    //                             $o++;
		    //                         }

		    //                         $o = 0;
		    //                         while (count($fields_to_print) > $o) {
		    //                             ### delete field function
		    //                             $this->delete_field_function($A_field_id[$o], $list_id, $A_field_label[$o], $vicidial_list_fields);
		    //                             $o++;
		    //                         }
		    //                         //$leads = implode(",", $A_field_label);
		    //                         //$this->Session->setFlash("Custom Field Deleted - $list_id|$leads", 'flash-success');
		    //                     }
		    //                     $copy_option = 'APPEND';
		    //                 }

		    //                 ##### APPEND option #####
		    //                 if ($copy_option == 'APPEND') {

		    //                     $stmt = "SELECT field_id,field_label,field_name,field_description,field_rank,field_help,field_type,field_options,field_size,field_max,field_default,field_cost,field_required,multi_position,name_position,field_order from vicidial_lists_fields where list_id='$source_list_id' order by field_rank,field_order,field_label;";

		    //                     $fields_to_print = $this->ViciListsFields->query($stmt);
		    //                     $fields_list     = '';
		    //                     $o               = 0;
		    //                     while (count($fields_to_print) > $o) {
		    //                         $rowx = $fields_to_print[$o]['vicidial_lists_fields'];

		    //                         $A_field_id[$o]          = $rowx['field_id'];
		    //                         $A_field_label[$o]       = $rowx['field_label'];
		    //                         $A_field_name[$o]        = $rowx['field_name'];
		    //                         $A_field_description[$o] = $rowx['field_description'];
		    //                         $A_field_rank[$o]        = $rowx['field_rank'];
		    //                         $A_field_help[$o]        = $rowx['field_help'];
		    //                         $A_field_type[$o]        = $rowx['field_type'];
		    //                         $A_field_options[$o]     = $rowx['field_options'];
		    //                         $A_field_size[$o]        = $rowx['field_size'];
		    //                         $A_field_max[$o]         = $rowx['field_max'];
		    //                         $A_field_default[$o]     = $rowx['field_default'];
		    //                         $A_field_cost[$o]        = $rowx['field_cost'];
		    //                         $A_field_required[$o]    = $rowx['field_required'];
		    //                         $A_multi_position[$o]    = $rowx['multi_position'];
		    //                         $A_name_position[$o]     = $rowx['name_position'];
		    //                         $A_field_order[$o]       = $rowx['field_order'];

		    //                         $o++;
		    //                         $rank_select .= "<option>$o</option>";
		    //                     }

		    //                     $o = 0;
		    //                     while (count($fields_to_print) > $o) {
		    //                         $new_field_exists = 0;
		    //                         if ($table_exists > 0) {
		    //                             $stmt = $this->ViciListsFields->find('count', array(
		    //                                 'conditions' => array('list_id' => $list_id, 'field_label' => $A_field_label[$o])
		    //                             ));

		    //                             if ($stmt > 0) {
		    //                                 $new_field_exists = $stmt;
		    //                             }
		    //                         }
						// 			// echo "new_field_exists: " . $new_field_exists; die;
		    //                         if ($new_field_exists < 1) {
		    //                             $temp_field_label = $A_field_label[$o];
		    //                             if (preg_match("/\|$temp_field_label\|/i", $vicidial_list_fields)) { $A_field_label[$o] = strtolower($A_field_label[$o]); }
										
		    //                             ### add field function
		    //                             $this->add_field_function($A_field_id[$o], $list_id, $A_field_label[$o], $A_field_name[$o], $A_field_description[$o], $A_field_rank[$o], $A_field_help[$o], $A_field_type[$o], $A_field_options[$o], $A_field_size[$o], $A_field_max[$o], $A_field_default[$o], $A_field_required[$o], $A_field_cost[$o], $A_multi_position[$o], $A_name_position[$o], $A_field_order[$o], $vicidial_list_fields, $mysql_reserved_words);

		    //                             if ($table_exists < 1) { $table_exists = 1; }
		    //                         }
		    //                         $o++;
		    //                     }
		    //                     $leads = implode(',', $A_field_label);
		    //                     $this->Session->setFlash("Custom Field Added - $list_id|$leads", 'flash-success');
		    //                 }
		    //                 ##### UPDATE option #####
		    //                 if ($copy_option == 'UPDATE') {
		    //                     if ($DB > 0) { echo "Starting UPDATE copy\n<BR>"; }
		    //                     // if ($table_exists < 1) { $this->Session->setFlash("<B><font color=red>Table does not exist custom_$list_id</B></font>\n<BR>", 'flash-error'); } else {

		    //                         $stmt = "SELECT field_id,field_label,field_name,field_description,field_rank,field_help,field_type,field_options,field_size,field_max,field_default,field_cost,field_required,multi_position,name_position,field_order from vicidial_lists_fields where list_id='$source_list_id' order by field_rank,field_order,field_label;";

		    //                         $fields_to_print = $this->ViciListsFields->query($stmt);
		    //                         $fields_list     = '';
		    //                         $o               = 0;
									
						// 			// print_r($fields_to_print); die;

		    //                         while (count($fields_to_print) > $o) {
		    //                             $rowx = $fields_to_print[$o]['vicidial_lists_fields'];

		    //                             $A_field_id[$o]          = $rowx['field_id'];
		    //                             $A_field_label[$o]       = $rowx['field_label'];
		    //                             $A_field_name[$o]        = $rowx['field_name'];
		    //                             $A_field_description[$o] = $rowx['field_description'];
		    //                             $A_field_rank[$o]        = $rowx['field_rank'];
		    //                             $A_field_help[$o]        = $rowx['field_help'];
		    //                             $A_field_type[$o]        = $rowx['field_type'];
		    //                             $A_field_options[$o]     = $rowx['field_options'];
		    //                             $A_field_size[$o]        = $rowx['field_size'];
		    //                             $A_field_max[$o]         = $rowx['field_max'];
		    //                             $A_field_default[$o]     = $rowx['field_default'];
		    //                             $A_field_cost[$o]        = $rowx['field_cost'];
		    //                             $A_field_required[$o]    = $rowx['field_required'];
		    //                             $A_multi_position[$o]    = $rowx['multi_position'];
		    //                             $A_name_position[$o]     = $rowx['name_position'];
		    //                             $A_field_order[$o]       = $rowx['field_order'];
		    //                             $o++;
		    //                         }
		    //                         $o = 0;
						// 			if($table_exists > 0){
						// 				while (count($fields_to_print) > $o) {
						// 					$stmt = "SELECT field_id from vicidial_lists_fields where list_id='$list_id' and field_label='$A_field_label[$o]';";
						// 					$fieldscount_to_print = $this->ViciListsFields->query($stmt);
						// 					// print_r($fieldscount_to_print); echo "<br>";//die;
						// 					if (count($fieldscount_to_print) > 0) {
						// 						$current_field_id = $fieldscount_to_print[0]['vicidial_lists_fields']['field_id'];
												
						// 						### modify field function
						// 						$this->modify_field_function($table_exists, $current_field_id, $list_id, $A_field_label[$o], $A_field_name[$o], $A_field_description[$o], $A_field_rank[$o], $A_field_help[$o], $A_field_type[$o], $A_field_options[$o], $A_field_size[$o], $A_field_max[$o], $A_field_default[$o], $A_field_required[$o], $A_field_cost[$o], $A_multi_position[$o], $A_name_position[$o], $A_field_order[$o], $vicidial_list_fields);
						// 					}
						// 					$o++;
						// 				}
						// 			} else {
						// 				// create table if not exist..
						// 				$createTable = "CREATE TABLE custom_$list_id (lead_id INT(9) UNSIGNED PRIMARY KEY NOT NULL) ENGINE = MyISAM";
						// 				//$table_update = $this->ViciListsFields->query($createTable);// for dev
						// 				$table_update = $this->ViciListsFieldsCustom->query($createTable); //for preprod
						// 			}
						// 			//die;
		    //                         $leads = implode(',', $A_field_label);
		    //                         $this->Session->setFlash("Custom Field Modified - $list_id|$leads\n<BR>", 'flash-success');
		    //                     // }
		    //                 }
		    //             }
		    //         }
		    //     }
    	 // }
               
    }
    public function fieldList(Request $request)
    {
    	try {
    			$vicidial_lists_fields = VicidialListsFields::where('list_id', $request['list_id'])->get();

            if (!$vicidial_lists_fields) {

                throw new Exception('This record is not present.',404);
            }
           return response()->json(['status' => 200,'data' => $vicidial_lists_fields,'msg' => "Success"],200);
    	} catch (Exception $e) {
    		$this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
    	}
    }
    public function editCustomField(Request $request)
    {
    	try {
    			 $vicidial_lists_fields = VicidialListsFields::find($request['field_id']);
    			
            if (!$vicidial_lists_fields) {

                throw new Exception('This record is not present.',404);
            }
           return response()->json(['status' => 200,'data' => $vicidial_lists_fields,'msg' => "Success"],200);
    	} catch (Exception $e) {
    		$this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
    	}
    }
    public function updateCustomFields(Request $request)
    {

    	try {
    		$user = $request->user();

    		$db_ext = DB::connection($this->connection);

    		$data=$request->all();

    		$A_field_cost              = 0;
	        $A_field_size              = $request['field_size']; ;
	        $table_exists              = 0;
	        $method                    = $request['method'];
	        $field_id 				   = $request['field_id'];
	        $list_id                   = $request['list_id'];
	        $field_label               = $request['field_label'];
	        $field_type                = $request['field_type'];
	        $field_max                = $request['field_max'];
	        $field_default             = $request['field_default'];
	        $field_options             = $request['field_options'];

	    

            $field_db_exists = 0;
		if (($field_type == 'DISPLAY') or ( $field_type == 'SCRIPT'))
		{ 
			$field_db_exists = 1; 
		} else {
				$field_db_exists=$db_ext->select("SHOW COLUMNS from custom_$list_id LIKE '$field_label';");
				
			if (count($field_db_exists) > 0) {
			  $table_exists = 1; 
			}
		}


		if ($field_db_exists > 0) { 
			 // $field_sql =$db_ext->select("ALTER TABLE custom_$list_id MODIFY $field_label;");
			 $field_sql ="ALTER TABLE custom_$list_id MODIFY $field_label ";
		} else { 
			 // $field_sql =$db_ext->select("ALTER TABLE custom_$list_id ADD $field_label;");
			 $field_sql ="ALTER TABLE custom_$list_id ADD $field_label ";
		}

		$field_options_ENUM ='';
		$field_cost         = 1;
		if (($field_type == 'SELECT') or ( $field_type == 'RADIO')) {

			$field_options_array = explode("\n", $field_options);
	
			$field_options_count = count($field_options_array);
			
			$te= 0;
			while ($te < $field_options_count) {
			
				if (preg_match("/,/", $field_options_array[$te])) {
					 $field_options_value_array = explode(",", $field_options_array[$te]);
				
					$field_options_ENUM .= "'$field_options_value_array[0]',";
				}else{
					$field_options_ENUM .= "'$field_options_array[$te]',";
				}
				$te++;
			}
			$field_options_ENUM = preg_replace("/.$/", '', $field_options_ENUM);
			$field_sql .= "ENUM($field_options_ENUM) ";
			$field_cost = strlen($field_options_ENUM);
		}
			
		if (($field_type == 'MULTI') or ( $field_type == 'CHECKBOX')) {

			$field_options_array = explode(",", $field_options);
			$field_options_count = count($field_options_array);
			$te= 0;
			while ($te < $field_options_count) {
				if (preg_match("/,/", $field_options_array[$te])) {
					 $field_options_value_array = explode("\n", $field_options_array[$te]);
					$field_options_ENUM .= "'$field_options_value_array[0]',";
				}else{
					$field_options_ENUM .= "'$field_options_array[$te]',";
				}
				$te++;
			}
			$field_options_ENUM = preg_replace("/.$/", '', $field_options_ENUM);
			$field_sql .= "ENUM($field_options_ENUM) ";
			$field_sql .= "VARCHAR($field_cost) ";
		}


		if (($field_type == 'TEXT') or ( $field_type == 'HIDDEN') or ( $field_type == 'READONLY')) {
			$field_sq.= "VARCHAR($field_max)";
			$field_cost = ($field_max + $field_cost);
		}
		if ($field_type == 'HIDEBLOB') {
			$field_sql.= "BLOB ";
			$field_cost = 15;
		}
		if ($field_type == 'AREA') {
			$field_sql.= "TEXT ";
			$field_cost = 15;
		}
		if ($field_type == 'DATE') {
			$field_sql.= "DATE ";
			$field_cost = 10;
		}
		if ($field_type == 'TIME') {
			$field_sql.= "TIME ";
			$field_cost = 8;
		}
		$field_cost = ($field_cost * 3); # account for utf8 database

		if ((strtoupper($field_default) == 'NULL') or ( $field_type == 'AREA') or ( $field_type == 'DATE') or ( $field_type == 'TIME') or ( $field_default == '') or ($field_type == 'SELECT') or ( $field_type == 'RADIO')) {
			$field_sql.= ";";
		} else {
			$field_sql.= "default '$field_default'";
		}
		if (($field_type == 'DISPLAY') or ( $field_type == 'SCRIPT')) {
			"Non-DB $field_type field type, $field_label\n";

		} else {
			$stmtCUSTOM   =$field_sql;

			$table_update =$db_ext->select($stmtCUSTOM);

			$x5_log_data = new X5Log;
            $x5_log_data['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
            $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
            $x5_log_data['company_id'] = $user->company_id;
            $x5_log_data['user_ip'] = $this->clientIp();
            $x5_log_data['class'] = "CustomFieldsController";
            $x5_log_data['method'] = __FUNCTION__;
            $x5_log_data['model'] = User::class;
            $x5_log_data['action_1'] = "MODIFY";
            $x5_log_data['action_2'] = "CUSTOM_LIST";
            $x5_log_data['action_3'] = "FIELD";
            $x5_log_data['sql_log'] = $field_sql;
            $x5_log_data->save();

		}
	
		 $field_update=VicidialListsFields::where('list_id',$list_id)->where('field_id',$field_id)->first();

		 $data['field_cost']=$field_cost;
		  $fields_update=$field_update->fill($data)->save();

		$stmt = "UPDATE vicidial_lists_fields set field_label='".$data['field_label']."',field_name='".$data['field_name']."',field_description='".$data['field_description']."',field_rank='".$data['field_rank']."',field_help='".$data['field_help']."',field_type='".$data['field_type']."',field_options='".$data['field_options']."',field_size='".$data['field_size']."',field_max='".$data['field_max']."',field_default='".$data['field_default']."',field_required='".$data['field_required']."',field_cost='".$field_cost."',multi_position='".$data['multi_position']."',name_position='".$data['name_position']."',field_order='".$data['field_order']."' where list_id='".$data['list_id']."' and field_id='".$data['field_id']."';";
		
		$x5_log_data = new X5Log;
            $x5_log_data['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
            $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
            $x5_log_data['company_id'] = $user->company_id;
            $x5_log_data['user_ip'] = $this->clientIp();
            $x5_log_data['class'] = "CustomFieldsController";
            $x5_log_data['method'] = __FUNCTION__;
            $x5_log_data['model'] = User::class;
            $x5_log_data['action_1'] = "MODIFY";
            $x5_log_data['action_2'] = "CUSTOM_LIST";
            $x5_log_data['action_3'] = "FIELD";
            $x5_log_data['sql_log'] = $stmt;
            $x5_log_data->save();

		$admin_log = new VicidialAdminLog();

            $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log['user'] = $user->x5_contact_id;
            $admin_log['ip_address'] = $this->clientIp();
            $admin_log['event_section'] = "CUSTOM_FIELDS";
            $admin_log['event_type'] = "MODIFY";
            $admin_log['record_id'] = $list_id;
            $admin_log['event_code'] = "ADMIN MODIFY CUSTOM FIELDS";
            $admin_log['event_sql'] = $stmt;
            $admin_log['event_notes'] = "";
            $admin_log['user_group'] = "";
            $admin_log->save();

			return response()->json(['status' => 200, 'msg' => "successfully Updated"], 200);
    	} catch (Exception $e) {
    		$this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
    	}
    }
    public function addCustomFields(Request $request)
    {
    	try {
    		$user = $request->user();
    		$db_ext = DB::connection($this->connection);
    		$data=$request->all();


    		$A_field_cost= 0;
	        $A_field_size= $request['field_size']; ;
	        $table_exists= 0;
	        $method= $request['method'];
	      
	        $list_id= $request['list_id'];
	        $field_label= $request['field_label'];
	        $field_type= $request['field_type'];
	        $field_max= $request['field_max'];
	        $field_default= $request['field_default'];
	        $field_options= $request['field_options'];

            $field_db_exists=0;
           
            $tablecount_to_print=$db_ext->select("SHOW TABLES LIKE \"custom_$list_id\";");

            if (count($tablecount_to_print) > 0) {
                $table_exists1       = 0;
                $stmt                = "SHOW FIELDS FROM custom_$list_id WHERE FIELD IN ('$field_label');";
                 $tablecount_to_print=$db_ext->select($stmt);

                $table_exists1       = count($tablecount_to_print);
            }
            if ($table_exists1 > 0) {
                throw new Exception('Duplicate.', 400);
            }
            // Column entry check in vicidial_list table starts here

             $columnViciExist = 0;

            $viciCol = "SHOW TABLES LIKE \"vicidial_list\";";
            $countViciColumn=$db_ext->select($viciCol);
        
            if(count($countViciColumn)>0){
                $columnViciExist1=0;
                $viciCol1 = "SHOW FIELDS FROM vicidial_list WHERE FIELD IN ('$field_label');";
                $countViciColumn1=$db_ext->select($viciCol1);

               
                $columnViciExist1 = count($countViciColumn1);
            }
            if($columnViciExist1>0){
            	throw new Exception('Already Exist.', 400);
            }

        $tablecount_to_print=$db_ext->select("SHOW TABLES LIKE \"custom_$list_id\";");
        if (count($tablecount_to_print) > 0) {
        	 $table_exists = 1; 
        	
        }
    
        if ($table_exists < 1) {
			$field_sql = "CREATE TABLE custom_$list_id (lead_id INT(9) UNSIGNED PRIMARY KEY NOT NULL, $field_label ";
		} else {
			// check Column is already exist in table or not
			$table_columns=$db_ext->select("SHOW FIELDS FROM custom_$list_id WHERE FIELD IN ('$field_label'); ");
		
			if(count($table_columns)>0){
				// column is already exist in table, MODIFY it
				$field_sql = "ALTER TABLE custom_$list_id MODIFY $field_label ";
			}else{
				// column is not in table, ADD it
				$field_sql = "ALTER TABLE custom_$list_id ADD $field_label "; 
			}
			
		}
		

        $field_options_ENUM = '';
        $field_cost         = 1;
        if (($field_type == 'SELECT') or ( $field_type == 'RADIO')) {
            $field_options_array = explode("\n", $field_options);
            $field_options_count = count($field_options_array);
            $te                  = 0;
            while ($te < $field_options_count) {
                if (preg_match("/,/", $field_options_array[$te])) {
                    $field_options_value_array = explode(",", $field_options_array[$te]);
                    $field_options_ENUM .= "'$field_options_value_array[0]',";
                }else{
					$field_options_ENUM .= "'$field_options_array[$te]',";
				}
                $te++;
            }
            $field_options_ENUM = preg_replace("/.$/", '', $field_options_ENUM);
            $field_sql .= "ENUM($field_options_ENUM) ";
            $field_cost         = strlen($field_options_ENUM);
        }
		

        if (($field_type == 'MULTI') or ( $field_type == 'CHECKBOX')) {
            $field_options_array = explode("\n", $field_options);
            $field_options_count = count($field_options_array);
            $te                  = 0;
            while ($te < $field_options_count) {
                if (preg_match("/,/", $field_options_array[$te])) {
                    $field_options_value_array = explode(",", $field_options_array[$te]);
                    $field_options_ENUM .= "'$field_options_value_array[0]',";
                }else{
					$field_options_ENUM .= "'$field_options_array[$te]',";
				}
                $te++;
            }
            $field_options_ENUM = preg_replace("/.$/", '', $field_options_ENUM);
            $field_cost         = strlen($field_options_ENUM);
            if ($field_cost < 1) { $field_cost = 1; };
            $field_sql .= "VARCHAR($field_cost) ";
        }
		
        if (($field_type == 'TEXT') or ( $field_type == 'HIDDEN') or ( $field_type == 'READONLY')) {
            if ($field_max < 1) { $field_max = 1; };
            $field_sql .= "VARCHAR($field_max) ";
            $field_cost = ($field_max + $field_cost);
        }
        if ($field_type == 'HIDEBLOB') {
            $field_sql .= "BLOB ";
            $field_cost = 15;
        }
        if ($field_type == 'AREA') {
            $field_sql .= "TEXT ";
            $field_cost = 15;
        }
        if ($field_type == 'DATE') {
            $field_sql .= "DATE ";
            $field_cost = 10;
        }
        if ($field_type == 'TIME') {
            $field_sql .= "TIME ";
            $field_cost = 8;
        }
        $field_cost = ($field_cost * 3); # account for utf8 database
		/**
		* add conditions for SELECT nad RADIO field type
		* When field_typw is SELECT or RADIO then no need to add default value
		*/
        if ((strtoupper($field_default) != 'NULL') and ( $field_type != 'AREA') and ( $field_type != 'DATE') and ( $field_type != 'TIME') and ( $field_default != '') and ($field_type != 'SELECT') and ($field_type != 'RADIO')) {
            $field_sql .= "default '$field_default'";
        }

        if ($table_exists < 1) {
        	$field_sql .= ");"; 
        } else {
        	$field_sql .= ";"; 
        }
		
		// echo $field_sql; die;
	
        if (($field_type == 'DISPLAY') or ( $field_type == 'SCRIPT')) {
            "Non-DB $field_type field type, $field_label\n";
        } else {
            $stmtCUSTOM   = "$field_sql";
            if(strpos($stmtCUSTOM, 'CREATE TABLE') === 0) {
                $stmtCUSTOM = rtrim($stmtCUSTOM, ';');
                $stmtCUSTOM .= " ENGINE = MyISAM";
            }
        
           $table_update=$db_ext->select($stmtCUSTOM);
            //$table_update = $this->ViciListsFields->query($stmtCUSTOM);// for dev
            // $table_update = $this->ViciListsFieldsCustom->query($stmtCUSTOM); //for preprod
            if($table_exists < 1){
	            $sql_create = "Alter TABLE custom_$list_id add unique index ix_lead_id (`lead_id`) ";
	            $table_update=$db_ext->select($sql_create);
	            // $this->ViciListsFields->query($sql_create);
	    	}
	    	$x5_log_data = new X5Log;
            $x5_log_data['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
            $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
            $x5_log_data['company_id'] = $user->company_id;
            $x5_log_data['user_ip'] = $this->clientIp();
            $x5_log_data['class'] = "CustomFieldsController";
            $x5_log_data['method'] = __FUNCTION__;
            $x5_log_data['model'] = User::class;
            $x5_log_data['action_1'] = "ADD";
            $x5_log_data['action_2'] = "CUSTOM_LIST";
            $x5_log_data['action_3'] = "FIELD";
            $x5_log_data['sql_log'] = $stmtCUSTOM;
            $x5_log_data->save();

        }
        $data['field_cost']=$field_cost;
      
        $stmt  = 'INSERT INTO vicidial_lists_fields set field_label="'.$data['field_label'].'",field_name="'.$data['field_name'].'",field_description="'.$data['field_description'].'",field_rank="'.$data['field_rank'].'",field_help="'.$data['field_help'].'",field_type="'.$data['field_type'].'",field_options="'.$data['field_options'].'",field_size="'.$data['field_size'].'",field_max="'.$data['field_max'].'",field_default="'.$data['field_default'].'",field_required="'.$data['field_required'].'",field_cost="'.$data['field_cost'].'",list_id="'.$data['list_id'].'",multi_position="'.$data['multi_position'].'",name_position="'.$data['name_position'].'",field_order="'.$data['field_order'].'";';

        $fields_add=VicidialListsFields::create($data);

        $x5_log_data = new X5Log;
            $x5_log_data['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
            $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
            $x5_log_data['company_id'] = $user->company_id;
            $x5_log_data['user_ip'] = $this->clientIp();
            $x5_log_data['class'] = "CustomFieldsController";
            $x5_log_data['method'] = __FUNCTION__;
            $x5_log_data['model'] = User::class;
            $x5_log_data['action_1'] = "ADD";
            $x5_log_data['action_2'] = "CUSTOM_LIST";
            $x5_log_data['action_3'] = "FIELD";
            $x5_log_data['sql_log'] = $stmt;
            $x5_log_data->save();


            $admin_log = new VicidialAdminLog();

            $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log['user'] = $user->x5_contact_id;
            $admin_log['ip_address'] = $this->clientIp();
            $admin_log['event_section'] = "CUSTOM_FIELDS";
            $admin_log['event_type'] = "ADD";
            $admin_log['record_id'] = $list_id;
            $admin_log['event_code'] = "ADMIN ADD CUSTOM FIELDS";
            $admin_log['event_sql'] = $stmt;
            $admin_log['event_notes'] = "";
            $admin_log['user_group'] = "";
            $admin_log->save();
       
        
            
            $x5_log_data = new X5Log;
            $x5_log_data['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
            $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
            $x5_log_data['company_id'] = $user->company_id;
            $x5_log_data['user_ip'] = $this->clientIp();
            $x5_log_data['class'] = "CustomFieldsController";
            $x5_log_data['method'] = __FUNCTION__;
            $x5_log_data['model'] = User::class;
            $x5_log_data['action_1'] = "ADD";
            $x5_log_data['action_2'] = "CUSTOM_LIST";
            $x5_log_data['action_3'] = "FIELD";
            $x5_log_data['success'] = "success";
            $x5_log_data->save();

            return response()->json(['status' => 200, 'msg' => "successfully Added"], 200);
        } catch (Exception $e) {
    		$this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
    	}
    }
    public function deleteCustomFields(Request $request)
    {
    	try {
    		$user = $request->user();
    		$db_ext = DB::connection($this->connection);

            $field_id = $request['field_id'];
            $list_id  = $request['list_id'];

            $fields_to_print=VicidialListsFields::find($request['field_id']);

            // $stmt            = "SELECT field_label from vicidial_lists_fields where field_id='$field_id'";
            // $fields_to_print = $this->ViciListsFields->query($stmt);

            $field_label = $fields_to_print->field_label;
 
              $stmt = "SHOW TABLES LIKE 'custom_$list_id'";

              $custom_tables=$db_ext->select($stmt);

        if (count($custom_tables) > 0)
        {
               	
             $custom_tables=$db_ext->select("SHOW FIELDS FROM custom_$list_id WHERE FIELD IN ('$field_label'); ");
           
            if(count($custom_tables))
            {
            
	            $stmtCUSTOM = "ALTER TABLE custom_$list_id DROP $field_label;";
	            $custom_tables=$db_ext->select($stmtCUSTOM);
	            // $rsltCUSTOM = $this->ViciListsFields->query($stmtCUSTOM);

	             $x5_log_data = new X5Log;
	            $x5_log_data['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
	            $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
	            $x5_log_data['company_id'] = $user->company_id;
	            $x5_log_data['user_ip'] = $this->clientIp();
	            $x5_log_data['class'] = "CustomFieldsController";
	            $x5_log_data['method'] = __FUNCTION__;
	            $x5_log_data['model'] = User::class;
	            $x5_log_data['action_1'] = "DELETE";
	            $x5_log_data['action_2'] = "CUSTOM_LIST";
	            $x5_log_data['action_3'] = "FIELD";
	            $x5_log_data['id_1'] = $list_id;
	            $x5_log_data['id_2'] = $field_label;
	            $x5_log_data['sql_log'] = $stmtCUSTOM;
	            $x5_log_data->save();
           }
        } 
        
        $stmt= "DELETE FROM vicidial_lists_fields WHERE field_label='".$field_label."' and field_id='".$field_id."' and list_id='".$list_id."' LIMIT 1;";

        $delete_custom_field=VicidialListsFields::where('field_label', $field_label)->where('field_id',$field_id)->where('list_id',$list_id)->first();
        $delete_custom_field->delete();

        $x5_log_data = new X5Log;
            $x5_log_data['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
            $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
            $x5_log_data['company_id'] = $user->company_id;
            $x5_log_data['user_ip'] = $this->clientIp();
            $x5_log_data['class'] = "CustomFieldsController";
            $x5_log_data['method'] = __FUNCTION__;
            $x5_log_data['model'] = User::class;
            $x5_log_data['action_1'] = "DELETE";
            $x5_log_data['action_2'] = "CUSTOM_LIST";
            $x5_log_data['action_3'] = "FIELD";
            $x5_log_data['id_1'] = $list_id;
            $x5_log_data['id_2'] = $field_label;
            $x5_log_data['id_3'] = $field_id;
            $x5_log_data['sql_log'] = $stmt;
            $x5_log_data->save();


            $admin_log = new VicidialAdminLog();

            $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log['user'] = $user->x5_contact_id;
            $admin_log['ip_address'] = $this->clientIp();
            $admin_log['event_section'] = "CUSTOM_FIELDS";
            $admin_log['event_type'] = "DELETE";
            $admin_log['record_id'] = $list_id;
            $admin_log['event_code'] = "ADMIN DELETE CUSTOM FIELDS";
            $admin_log['event_sql'] = $stmt;
            $admin_log['event_notes'] = "";
            $admin_log['user_group'] = "";
            $admin_log->save();


            $x5_log_data = new X5Log;
            $x5_log_data['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
            $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
            $x5_log_data['company_id'] = $user->company_id;
            $x5_log_data['user_ip'] = $this->clientIp();
            $x5_log_data['class'] = "CustomFieldsController";
            $x5_log_data['method'] = __FUNCTION__;
            $x5_log_data['model'] = User::class;
            $x5_log_data['action_1'] = "DELETE";
            $x5_log_data['action_2'] = "CUSTOM_LIST";
            $x5_log_data['action_3'] = "FIELD";
            $x5_log_data['id_1'] = $request['field_id'];
            $x5_log_data['id_2'] = $request['list_id'];
            $x5_log_data->save();



            return response()->json(['status' => 200, 'msg' => "successfully Deleted"], 200);
        } catch (Exception $ex) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }
    public function viewCustomFields(Request $request)
    {
    	try {
    			$vicidial_lists_fields = VicidialListsFields::where('list_id', $request['list_id'])->get();
    			return $vicidial_lists_fields;

	    	if (count($vicidial_lists_fields) < 1) {
	                throw new Exception('There are no custom fields for this list.', 400);
	    	}
	   //  	foreach ($vicidial_lists_fields as $vicidial_lists_field) 
	   //  	{
	   //  		$last_field_rank=0;
	   //  		if ($last_field_rank==$vicidial_lists_field->field_rank) {
	    			
	   //  		}
				// 	if ($last_field_rank=="$A_field_rank[$o]")
				// 		{echo " &nbsp; &nbsp; &nbsp; &nbsp; ";}
				// 	else
				// 		{
				// 		echo "</td></tr>\n";
				// 		echo "<tr bgcolor=white><td align=";
				// 		if ($A_name_position[$o]=='TOP') 
				// 			{echo "left colspan=2";}
				// 		else
				// 			{echo "right";}
				// 		echo "><font size=2><pre>";
				// 		}
				// 	echo "<B>$A_field_name[$o]</B></pre>";
				// 	if ($A_name_position[$o]=='TOP') 
				// 		{
				// 		$helpHTML = "<a href=\"javascript:open_help('HELP_$A_field_label[$o]','$A_field_help[$o]');\">help+</a>";
				// 		if (strlen($A_field_help[$o])<1)
				// 			{$helpHTML = '';}
				// 		echo " &nbsp; <span style=\"position:static;\" id=P_HELP_$A_field_label[$o]></span><span style=\"position:static;background:white;\" id=HELP_$A_field_label[$o]> &nbsp; $helpHTML</span><BR>";
				// 		}
				// 	else
				// 		{
				// 		if ($last_field_rank=="$A_field_rank[$o]")
				// 			{echo " &nbsp;";}
				// 		else
				// 			{echo "</td><td align=left><font size=2><pre>";}
				// 		}
				// 	$field_HTML='';

				// 	if ($A_field_type[$o]=='SELECT')
				// 		{
				// 		$field_HTML .= "<select class=form-control size=1 name=$A_field_label[$o] id=$A_field_label[$o]>\n";
				// 		}
				// 	if ($A_field_type[$o]=='MULTI')
				// 		{
				// 		$field_HTML .= "<select MULTIPLE size=$A_field_size[$o] name=$A_field_label[$o] id=$A_field_label[$o]>\n";
				// 		}
				// 	if ( ($A_field_type[$o]=='SELECT') or ($A_field_type[$o]=='MULTI') or ($A_field_type[$o]=='RADIO') or ($A_field_type[$o]=='CHECKBOX') )
				// 		{
				// 		$field_options_array = explode("\n",$A_field_options[$o]);
				// 		$field_options_count = count($field_options_array);
				// 		$te=0;
				// 		while ($te < $field_options_count)
				// 			{
				// 			if (preg_match("/,/",$field_options_array[$te]))
				// 				{
				// 				$field_selected=''; 
				// 				$field_options_value_array = explode(",",$field_options_array[$te]);
				// 				if ( ($A_field_type[$o]=='SELECT') or ($A_field_type[$o]=='MULTI') )
				// 					{
				// 					if ($A_field_default[$o] == "$field_options_value_array[0]") {$field_selected = 'SELECTED';}
				// 					$field_HTML .= "<option value=\"$field_options_value_array[0]\" $field_selected>$field_options_value_array[1]</option>\n";
				// 					}
				// 					if (($A_field_type[$o]=='RADIO') or ($A_field_type[$o]=='CHECKBOX') )
				// 					{
				// 					if ($A_multi_position[$o]=='VERTICAL') 
				// 						{$field_HTML .= " &nbsp; ";}
				// 					if ($A_field_default[$o] == "$field_options_value_array[0]") {$field_selected = 'CHECKED';}
				// 					$field_HTML .= "<input type=$A_field_type[$o] name=$A_field_label[$o][] id=$A_field_label[$o][] value=\"$field_options_value_array[0]\" $field_selected> $field_options_value_array[1]\n";
				// 					if ($A_multi_position[$o]=='VERTICAL') 
				// 						{$field_HTML .= "<BR>\n";}
				// 					}
				// 				}
				// 			$te++;
				// 			}
				// 		}
				// 	if ( ($A_field_type[$o]=='SELECT') or ($A_field_type[$o]=='MULTI') )
				// 		{
				// 		$field_HTML .= "</select>\n";
				// 		}
				// 	if ($A_field_type[$o]=='TEXT') 
				// 		{
				// 		if ($A_field_default[$o]=='NULL') {$A_field_default[$o]='';}
				// 		$field_HTML .= "<input class=form-control type=text size=$A_field_size[$o] maxlength=$A_field_max[$o] name=$A_field_label[$o] id=$A_field_label[$o] value=\"$A_field_default[$o]\">\n";
				// 		}
				// 	if ($A_field_type[$o]=='AREA') 
				// 		{
				// 		$field_HTML .= "<textarea class=form-control name=$A_field_label[$o] id=$A_field_label[$o] ROWS=$A_field_max[$o] COLS=$A_field_size[$o]></textarea>";
				// 		}
				// 	if ($A_field_type[$o]=='DISPLAY')
				// 		{
				// 		if ($A_field_default[$o]=='NULL') {$A_field_default[$o]='';}
				// 		$field_HTML .= "\n";
				// 		}
				// 	if ($A_field_type[$o]=='READONLY')
				// 		{
				// 		if ($A_field_default[$o]=='NULL') {$A_field_default[$o]='';}
				// 		$field_HTML .= "$A_field_default[$o]\n";
				// 		}
				// 	if ($A_field_type[$o]=='HIDDEN')
				// 		{
				// 		if ($A_field_default[$o]=='NULL') {$A_field_default[$o]='';}
				// 		$field_HTML .= "-- HIDDEN --\n";
				// 		}
				// 	if ($A_field_type[$o]=='HIDEBLOB')
				// 		{
				// 		if ($A_field_default[$o]=='NULL') {$A_field_default[$o]='';}
				// 		$field_HTML .= "-- HIDDEN --\n";
				// 		}
				// 	if ($A_field_type[$o]=='SCRIPT')
				// 		{
				// 		if ($A_field_default[$o]=='NULL') {$A_field_default[$o]='';}
				// 		$field_HTML .= "$A_field_options[$o]\n";
				// 		}
				// 	if ($A_field_type[$o]=='DATE') 
				// 		{
				// 		if ( (strlen($A_field_default[$o])<1) or ($A_field_default[$o]=='NULL') ) {$A_field_default[$o]=0;}
				// 		$day_diff = $A_field_default[$o];
				// 		$default_date = date("Y-m-d", mktime(date("H"),date("i"),date("s"),date("m"),date("d")+$day_diff,date("Y")));

				// 		$field_HTML .= "<input class=form-control type=text size=11 maxlength=10 name=$A_field_label[$o] id=$A_field_label[$o] value=\"$default_date\">\n";
				// 		$field_HTML .= "<script language=\"JavaScript\">\n";
				// 		$field_HTML .= "var o_cal = new tcal ({\n";
				// 		$field_HTML .= "	'formname': 'form_custom_$list_id',\n";
				// 		$field_HTML .= "	'controlname': '$A_field_label[$o]'});\n";
				// 		$field_HTML .= "o_cal.a_tpl.yearscroll = false;\n";
				// 		$field_HTML .= "</script>\n";
				// 		}
				// 	if ($A_field_type[$o]=='TIME') 
				// 		{
				// 			$minute_diff = $A_field_default[$o];
				// 			$default_time = date("H:i:s", mktime(date("H"),date("i")+$minute_diff,date("s"),date("m"),date("d"),date("Y")));
				// 		$default_hour = date("H", mktime(date("H"),date("i")+$minute_diff,date("s"),date("m"),date("d"),date("Y")));
				// 		$default_minute = date("i", mktime(date("H"),date("i")+$minute_diff,date("s"),date("m"),date("d"),date("Y")));
				// 		$field_HTML .= "<input type=hidden name=$A_field_label[$o] id=$A_field_label[$o] value=\"$default_time\">";
				// 		$field_HTML .= "<SELECT class=form-control name=HOUR_$A_field_label[$o] id=HOUR_$A_field_label[$o]>";
				// 		$field_HTML .= "<option>00</option>";
				// 		$field_HTML .= "<option>01</option>";
				// 		$field_HTML .= "<option>02</option>";
				// 		$field_HTML .= "<option>03</option>";
				// 		$field_HTML .= "<option>04</option>";
				// 		$field_HTML .= "<option>05</option>";
				// 		$field_HTML .= "<option>06</option>";
				// 		$field_HTML .= "<option>07</option>";
				// 		$field_HTML .= "<option>08</option>";
				// 		$field_HTML .= "<option>09</option>";
				// 		$field_HTML .= "<option>10</option>";
				// 		$field_HTML .= "<option>11</option>";
				// 		$field_HTML .= "<option>12</option>";
				// 		$field_HTML .= "<option>13</option>";
				// 		$field_HTML .= "<option>14</option>";
				// 		$field_HTML .= "<option>15</option>";
				// 		$field_HTML .= "<option>16</option>";
				// 		$field_HTML .= "<option>17</option>";
				// 		$field_HTML .= "<option>18</option>";
				// 		$field_HTML .= "<option>19</option>";
				// 		$field_HTML .= "<option>20</option>";
				// 		$field_HTML .= "<option>21</option>";
				// 		$field_HTML .= "<option>22</option>";
				// 		$field_HTML .= "<option>23</option>";
				// 		$field_HTML .= "<OPTION value=\"$default_hour\" selected>$default_hour</OPTION>";
				// 		$field_HTML .= "</SELECT>";
				// 		$field_HTML .= "<SELECT name=MINUTE_$A_field_label[$o] id=MINUTE_$A_field_label[$o]>";
				// 		$field_HTML .= "<option>00</option>";
				// 		$field_HTML .= "<option>05</option>";
				// 		$field_HTML .= "<option>10</option>";
				// 		$field_HTML .= "<option>15</option>";
				// 		$field_HTML .= "<option>20</option>";
				// 		$field_HTML .= "<option>25</option>";
				// 		$field_HTML .= "<option>30</option>";
				// 		$field_HTML .= "<option>35</option>";
				// 		$field_HTML .= "<option>40</option>";
				// 		$field_HTML .= "<option>45</option>";
				// 		$field_HTML .= "<option>50</option>";
				// 		$field_HTML .= "<option>55</option>";
				// 		$field_HTML .= "<OPTION value=\"$default_minute\" selected>$default_minute</OPTION>";
				// 		$field_HTML .= "</SELECT>";
				// 		}

				// 	if ($A_name_position[$o]=='LEFT') 
				// 		{
				// 		$helpHTML = "<a href=\"javascript:open_help('HELP_$A_field_label[$o]','$A_field_help[$o]');\">help+</a>";
				// 		if (strlen($A_field_help[$o])<1)
				// 			{$helpHTML = '';}
							
				// 		echo " $field_HTML <span style=\"position:static;\" id=P_HELP_$A_field_label[$o]></span><span style=\"position:static;background:white;\" id=HELP_$A_field_label[$o]> &nbsp; $helpHTML</span>";
				// 		//echo "------------------------------------------------------------------------------------------------------";
				// 		}
				// 	else
				// 		{
				// 		echo " $field_HTML\n-----------------";
				// 		}

				// 	$last_field_rank=$A_field_rank[$o];
				// 	$o++;
				// }

	   //  	}


            if (!$vicidial_lists_fields) {

                throw new Exception('This record is not present.',404);
            }
           return response()->json(['status' => 200,'data' => $vicidial_lists_fields,'msg' => "Success"],200);
    	} catch (Exception $e) {
    		$this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
    	}
    }
}
