<?php

use Illuminate\Http\Request;

/*
  |--------------------------------------------------------------------------
  | API Routes
  |--------------------------------------------------------------------------
  |
  | Here is where you can register API routes for your application. These
  | routes are loaded by the RouteServiceProvider within a group which
  | is assigned the "api" middleware group. Enjoy building your API!
  |
 */

/*
  |--------------------------------------------------------------------------
  | Authentication
  |--------------------------------------------------------------------------
 */
Route::group([
    'namespace' => 'Auth'
        ], function () {
#Login
    Route::post('auth/login', 'AuthController@login');
#Temp Sign Up
    Route::post('auth/signup', 'AuthController@signup');

    Route::group([
        'middleware' => ['auth:api', 'dyna_connect']
            ], function() {
#Logout
        Route::get('auth/logout', 'AuthController@logout');

#Get Permission By Access Type
        Route::get('get_permission_by_access_type/{access_type}', 'AccessControlController@getPermissionByAccessType');

        /*
          |--------------------------------------------------------------------------
          | API Routes for admin utilities module
          | @author Omprakash Pachkawade<om@ytel.com>
          |--------------------------------------------------------------------------
          |
          | Here is the route for all submodules of admin utilities i.e.
          | Scipts, Audio, Voicemail, DNC Management, Lead Filter List, Call Time, Shifts, Recordnings, Ytel Management, System Audit
          |
         */
#Temp User
#switch DB
        Route::post('update_db', 'AuthController@switchDb');

        /*
          |--------------------------------------------------------------------------
          | API Routes for admin utilities module
          | @author Omprakash Pachkawade<om@ytel.com>
          |--------------------------------------------------------------------------
          |
          | Here is the route for all submodules of admin utilities i.e.
          | Scipts, Audio, Voicemail, DNC Management, Lead Filter List, Call Time, Shifts, Recordnings, Ytel Management, System Audit
          |
         */
#Temp User
        Route::get('user', 'AuthController@user');
    });
});

Route::post('dashboard-statis', 'Dashboard\DashboardController@staticApi');



Route::group(['middleware' => ['auth:api', 'dyna_connect']], function() {

    /*
      |--------------------------------------------------------------------------
      | Dashboard
      |--------------------------------------------------------------------------
     */
    Route::post('get-dashboard-data', 'Dashboard\DashboardController@index');

    /*
      |--------------------------------------------------------------------------
      | Inbound Queues
      |--------------------------------------------------------------------------
     */
    Route::get('inbound-lists', 'Inbound\InboundController@index');
    Route::put('inbound-lists/active-inactive-inbound', 'Inbound\InboundController@activeOrInActiveInbound');
    Route::get('inbound-lists/numbers', 'Inbound\InboundController@numbersByGroupId');
    Route::get('inbound-lists/callmenus', 'Inbound\InboundController@callMenuByGroupId');
    Route::get('inbound-lists/agents', 'Inbound\InboundController@agentsByGroupId');
    Route::put('inbound-lists/agents/update', 'Inbound\InboundController@agentsByGroupIdUpdate');
    Route::get('inbound-lists/campaigns', 'Inbound\InboundController@campaignsByGroupId');
    Route::put('inbound-lists/campaigns/update', 'Inbound\InboundController@campaignsByGroupIdUpdate');
    Route::get('inbound-queue/delete', 'Inbound\InboundController@deleteInboundQueue');


    //********************numbers************************************
    Route::get('number-lists', 'Numbers\NumbersController@index');
    Route::get('number-option-list', 'Numbers\NumbersController@numberOptionList');

    Route::get('number-edit/{data_id}', 'Numbers\NumbersController@numberEdit');
    Route::post('number-update', 'Numbers\NumbersController@numberUpdate');

    Route::post('number-mass-update', 'Numbers\NumbersController@numberMassUpdate');

    Route::post('number-clone', 'Numbers\NumbersController@numberClone');

    Route::get('number-delete', 'Numbers\NumbersController@deleteDid');

    Route::post('number-call-recording', 'Numbers\NumbersController@numberCallRecording');

    Route::get('filter-phone-group-option-list', 'Numbers\NumbersController@filterPhoneGroupOptionList');



    Route::post('download-csv', 'Numbers\NumbersController@inboundExportCsv');
    // Route::get('download-csv-new','Numbers\NumbersController@downloadCsvNew1');
    //********************Call menu************************************
    Route::get('callmenu-list', 'CallMenu\CallMenuController@index');

    Route::post('callmenu/create', 'CallMenu\CallMenuController@store');

    Route::get('callmenu/edit/{menu_id}', 'CallMenu\CallMenuController@edit');

    Route::post('callmenu/update', 'CallMenu\CallMenuController@update');

    Route::post('add-call-menu-options', 'CallMenu\CallMenuController@addCallMenuOptions');

    Route::get('callmenu/delete/{menu_id}', 'CallMenu\CallMenuController@destroy');


    Route::get('call-menu-number-list/{menu_id}', 'CallMenu\CallMenuController@getdidInGroupForCallMenu');

    //*****************update call menu api*********
    Route::get('admin-user-group-list', 'CallMenu\CallMenuController@adminUserGroupList');

    Route::get('call-menu-option/{menu_id}', 'CallMenu\CallMenuController@callMenuOption');

    Route::get('dids-list', 'CallMenu\CallMenuController@getDids');


    Route::get('phone-list', 'CallMenu\CallMenuController@phone');

    //********************Inbound Queue************************************

    Route::post('add-inbound-queue', 'Inbound\InboundController@addInboundQueue');  //add
    Route::post('inbound-queue-clone', 'Inbound\InboundController@cloneInboundQueue');  //clone

    Route::get('get-inbound-queue-agent', 'Inbound\InboundController@getInboundQueueAgent'); //get agent rank
    Route::post('add-inbound-queue-agent', 'Inbound\InboundController@addInboundQueueAgent'); //add agent rank

    Route::get('inbound-queue-edit/{data_id}', 'Inbound\InboundController@editInboundQueue'); //edit
    Route::post('inbound-queue-update', 'Inbound\InboundController@updateInboundQueue');   //update

    Route::post('check-dublicate', 'Inbound\InboundController@checkDuplicate'); //check dublicate

    Route::get('inbound-number-ingroup/{group_id}', 'Inbound\InboundController@getdidInGroup'); //number ingroup list of that perticulat group_id
    Route::get('inbound-call-menu-ingroup/{group_id}', 'Inbound\InboundController@getCallInGroup');  //call menu ingroup list of that perticular group_id
    //************************Filter Phone Group**************************************

    Route::get('filter-phone-group-list', 'Inbound\FilterPhoneGroupController@index');
    Route::get('filter-phone-group/edit', 'Inbound\FilterPhoneGroupController@edit');

    Route::post('add-filter-phone-group', 'Inbound\FilterPhoneGroupController@store');

    Route::post('update-filter-phone-group', 'Inbound\FilterPhoneGroupController@update');

    Route::get('delete-filter-phone-group', 'Inbound\FilterPhoneGroupController@destroy');

    Route::get('download-filter-phone-numbers', 'Inbound\FilterPhoneGroupController@downloadFPGNumbers');

    Route::post('add-filter-phone-group-number', 'Inbound\FilterPhoneGroupController@addFPGNumber');

    Route::post('delete-filter-phone-group-number', 'Inbound\FilterPhoneGroupController@deleteFPGNumber');




    /*
      |--------------------------------------------------------------------------
      | Audio
      |--------------------------------------------------------------------------
     */
    Route::get('audio-list', 'Audio\AudioController@audioList');


    /*
      |--------------------------------------------------------------------------
      | Campaigns
      |--------------------------------------------------------------------------
     */
    Route::get('campaigns-list', 'Campaigns\CampaignController@index');
    Route::put('campaigns-list/active-inactive', 'Campaigns\CampaignController@activeOrDeactive');
    Route::get('generate-campaign-id', 'Campaigns\CampaignController@generateCampaignId');
    Route::post('campaign-clone', 'Campaigns\CampaignController@campaignClone');
    Route::get('check-campaign', 'Campaigns\CampaignController@isExistsCampaign');
    Route::get('campaign-wizard-options-lists', 'Campaigns\CampaignController@campaignWizardOptionsLists');
    Route::post('campaign-wizard', 'Campaigns\CampaignController@campaignWizard');
    Route::get('campaign-disabled-statuses', 'Campaigns\CampaignController@disabledStatusesList');
    Route::put('campaign-disabled-statuses-update', 'Campaigns\CampaignController@disabledStatusesListUpdate');
    Route::get('campaign-inbound', 'Campaigns\CampaignController@inboundList');
    Route::put('campaign-inbound-update', 'Campaigns\CampaignController@inboundListUpdate');
    Route::get('campaign-hopper', 'Campaigns\CampaignController@hopperList');
    Route::get('campaign-reset-hopper', 'Campaigns\CampaignController@resetHopperList');
    Route::get('campaign-edit', 'Campaigns\CampaignController@edit');
    Route::put('campaign-update', 'Campaigns\CampaignController@update');
    Route::get('campaign-delete', 'Campaigns\CampaignController@delete');
    Route::get('campaign-callback', 'Campaigns\CampaignController@callBacklist');
    Route::put('campaign-callback-delete', 'Campaigns\CampaignController@callBackDelete');
    Route::put('campaign-callback-move', 'Campaigns\CampaignController@callBackMove');
    Route::get('campaign-data-list', 'Campaigns\CampaignController@campaignDataList');
    Route::put('campaign-data-list-update', 'Campaigns\CampaignController@campaignDataListUpdate');

    /*
      |--------------------------------------------------------------------------
      | Campaigns Status
      |--------------------------------------------------------------------------
     */
    Route::get('custom-campaign-statuses-list', 'Campaigns\CampaignStatusController@customCampaignStatusesList');
    Route::get('systemwide-campaign-statuses-list', 'Campaigns\CampaignStatusController@systemWideStatusesList');
    Route::put('systemwide-campaign-statuses-list-update', 'Campaigns\CampaignStatusController@systemWideStatusesListUpdate');
    Route::post('add-system-status', 'Campaigns\CampaignStatusController@addNewSystemStatus');
    Route::post('clone-campaign-status', 'Campaigns\CampaignStatusController@cloneCampaignStatus');
    Route::get('edit-campaign-status', 'Campaigns\CampaignStatusController@editCampaignStatus');
    Route::put('update-campaign-status', 'Campaigns\CampaignStatusController@updateCampaignStatus');
    Route::post('add-campaign-status', 'Campaigns\CampaignStatusController@addCampaignStatus');
    Route::delete('delete-campaign-status', 'Campaigns\CampaignStatusController@deleteCampaignStatus');


    /*
      |--------------------------------------------------------------------------
      | Campaigns List Mix
      |--------------------------------------------------------------------------
     */
    Route::get('campaign-list-mix', 'Campaigns\CampaignListMixController@campaignListMix');
    Route::get('campaign-mix-options-lists', 'Campaigns\CampaignListMixController@getCampaignMixOptionLists');
    Route::post('add-campaign-mix-lists', 'Campaigns\CampaignListMixController@addCampaignMixList');

    /*
      |--------------------------------------------------------------------------
      | Campaigns Lead Recycle
      |--------------------------------------------------------------------------
     */
    Route::get('campaign-lead-recycle-list', 'Campaigns\LeadRecycleController@leadRecycleList');
    Route::get('edit-lead-recycle-list', 'Campaigns\LeadRecycleController@editLeadRecycleList');
    Route::post('add-lead-recycle', 'Campaigns\LeadRecycleController@addCampaignLeadRecycle');
    Route::put('update-lead-recycle', 'Campaigns\LeadRecycleController@updateLeadRecycle');
    Route::delete('delete-lead-recycle', 'Campaigns\LeadRecycleController@deleteLeadRecycle');

    /*
      |--------------------------------------------------------------------------
      | Campaigns Pause Code
      |--------------------------------------------------------------------------
     */
    Route::get('pause-code-list', 'Campaigns\PauseCodeController@pauseCodeList');
    Route::get('campaign-wise-pause-code-list', 'Campaigns\PauseCodeController@campaignWisePauseCodeList');
    Route::post('clone-pause-code', 'Campaigns\PauseCodeController@clonePauseCode');
    Route::get('edit-campaign-pause-code-list', 'Campaigns\PauseCodeController@editCampaignPauseCodeList');
    Route::post('add-pause-code', 'Campaigns\PauseCodeController@addPauseCode');
    Route::put('edit-pause-code', 'Campaigns\PauseCodeController@editPauseCode');
    Route::delete('delete-pause-code', 'Campaigns\PauseCodeController@deletePauseCode');

    /*
      |--------------------------------------------------------------------------
      | Campaigns Area code
      |--------------------------------------------------------------------------
     */
    Route::get('area-code-list', 'Campaigns\AreaCodeController@areaCodeList');
    Route::post('clone-area-code', 'Campaigns\AreaCodeController@cloneAreaCode');
    Route::get('edit-area-code-list', 'Campaigns\AreaCodeController@editAreaCodeList');
    Route::put('active-deactive-area-code', 'Campaigns\AreaCodeController@activeOrDeactiveAreaCode');
    Route::put('update-area-code', 'Campaigns\AreaCodeController@updateAreaCode');

    /*
      |--------------------------------------------------------------------------
      | Campaigns call transfer preset
      |--------------------------------------------------------------------------
     */
    Route::get('call-transfer-preset-list', 'Campaigns\CallTransferPresetController@callTransferPresetList');
    Route::get('edit-call-transfer-preset-list', 'Campaigns\CallTransferPresetController@editCallTransferPresetList');
    Route::post('clone-call-transfer-preset', 'Campaigns\CallTransferPresetController@cloneCallTransferPreset');
    Route::post('add-call-transfer-preset', 'Campaigns\CallTransferPresetController@addCallTransferPreset');
    Route::put('update-call-transfer-preset', 'Campaigns\CallTransferPresetController@updateCallTransferPreset');
    Route::delete('delete-call-transfer-preset', 'Campaigns\CallTransferPresetController@deleteCallTransferPreset');
});

/*
  |--------------------------------------------------------------------------
  | Data Management
  |--------------------------------------------------------------------------
 */
Route::group(['middleware' => ['auth:api', 'dyna_connect'], 'namespace' => 'DataManagement'], function() {
    /*
      |--------------------------------------------------------------------------
      | Data List
      |--------------------------------------------------------------------------
     */
    Route::get('get-data-list', 'DataListController@dataList');
    Route::put('active-inactive-list', 'DataListController@activeInactiveList');
    Route::post('add-new-list', 'DataListController@addNewList');
    Route::post('clone-list', 'DataListController@cloneList');
    Route::get('show-list', 'DataListController@showList');
    Route::put('update-list', 'DataListController@updateList');
    Route::delete('delete-list', 'DataListController@deleteList');
    Route::get('download-list-csv', 'DataListController@downloadListCSV');
    Route::get('reset-date-list', 'DataListController@resetDataList');
    Route::get('date-list-report', 'DataListController@dataListReport');
    Route::get('advanced-list-rules', 'DataList\AdvancedListRule@advancedListRule');
    Route::get('show-list-rule', 'DataList\AdvancedListRule@showListRule');
    Route::put('update-list-rule', 'DataList\AdvancedListRule@updateListRule');
    Route::delete('delete-list-rule', 'DataList\AdvancedListRule@deleteListRule');
    Route::post('add-list-rule', 'DataList\AdvancedListRule@addListRule');

    /*
      |--------------------------------------------------------------------------
      | Data loader
      |--------------------------------------------------------------------------
     */
    Route::get('data-loader-dashboard', 'DataLoaderController@dashboardList');
    Route::get('data-loader-queue', 'DataLoaderController@queueList');
    Route::get('data-loader-uploaded-files', 'DataLoaderController@uploadedFilesList');
    Route::get('process-file-options-lists', 'DataLoaderController@fileProcessOptionsList');
    Route::get('get-lists-fields', 'DataLoaderController@getFields');
    Route::get('get-file-info', 'DataLoaderController@getFileInfo');
    Route::get('get-avg-process-time', 'DataLoaderController@getAvgProcessTime');
    Route::post('data-loader-file-upload', 'DataLoaderController@uploadCSVFile');
    Route::post('data-loader-process-file', 'DataLoaderController@processFile');
    Route::delete('delete-file-from-queue', 'DataLoaderController@deleteFileFromQueue');
    Route::delete('delete-uploaded-file', 'DataLoaderController@deleteUploadedFile');
    Route::get('download-csv-file', 'DataLoaderController@downloadCSVFile');
    Route::post('stop-file-process', 'DataLoaderController@cancelFileProcess');
});

/*
  |--------------------------------------------------------------------------
  | Admin Utilities
  |--------------------------------------------------------------------------
 */
Route::prefix('admin-utilities')->group(function () {


    Route::group(['middleware' => ['auth:api', 'dyna_connect']], function() {
#route for scripts
        //**********************SCRIPT*********************************
        Route::get('script-lists', 'AdminUtilities\AdminUtilitiesController@scriptLists');
        Route::post('create-script', 'AdminUtilities\AdminUtilitiesController@store');
        Route::get('script/edit/{script_id}', 'AdminUtilities\AdminUtilitiesController@edit');
        Route::post('update-script', 'AdminUtilities\AdminUtilitiesController@update');
        Route::post('script-active-deactive', 'AdminUtilities\AdminUtilitiesController@scriptActiveDeactive');
        Route::get('script/delete/{script_id}', 'AdminUtilities\AdminUtilitiesController@destroy');
        Route::post('script-clone', 'AdminUtilities\AdminUtilitiesController@scriptClone');


        //**********************AUDIO*********************************

        Route::get('audio-lists', 'AdminUtilities\AudioController@audioLists');

        Route::post('upload-audio', 'AdminUtilities\AudioController@uploadAudio');
        Route::get('music-on-hold-list', 'AdminUtilities\AudioController@musicOnHoldList');
        Route::get('audio-manual-records', 'AdminUtilities\AudioController@audioManualRecords');
        Route::post('add-new-moh-entry', 'AdminUtilities\AudioController@addNewMOHEntry');

        Route::get('edit-moh', 'AdminUtilities\AudioController@editMOH');
        Route::post('update-moh', 'AdminUtilities\AudioController@updateMOH');
        Route::get('delete-moh', 'AdminUtilities\AudioController@destroy');


        //**********************************************************
        Route::post('set-script-active', 'AdminUtilities\AdminUtilitiesController@setScriptActive');
        Route::post('delete-script', 'AdminUtilities\AdminUtilitiesController@deleteScript');
        Route::post('clone-script', 'AdminUtilities\AdminUtilitiesController@cloneScript');
        Route::get('get-script/{id}', 'AdminUtilities\AdminUtilitiesController@getScript');
        Route::post('update-or-create-script', 'AdminUtilities\AdminUtilitiesController@updateOrCreateScript');



#routes for dnc management
        Route::get('get-campaigns', 'AdminUtilities\DncManagementController@getCampaigns');
        Route::post('add-dnc-number', 'AdminUtilities\DncManagementController@addDncNumber');
        Route::post('delete-dnc-number', 'AdminUtilities\DncManagementController@deleteDncNumber');

        Route::get('download-dnc-list', 'AdminUtilities\DncManagementController@downloadDncList');

#route for scripts
        Route::get('voicemail-lists', 'AdminUtilities\VoicemailController@voicemailLists');
        Route::post('voicemail-active-deactive', 'AdminUtilities\VoicemailController@voicemailActiveDeactive');
        Route::post('add-new-voicemail', 'AdminUtilities\VoicemailController@store');
        Route::get('voicemail/delete', 'AdminUtilities\VoicemailController@voicemailDelete');
        Route::get('voicemail/edit/{voicemail_id}', 'AdminUtilities\VoicemailController@voicemailEdit');
        Route::post('update-voicemail', 'AdminUtilities\VoicemailController@update');


        Route::post('set-voicemail-active', 'AdminUtilities\VoicemailController@setVoicemailActive');
        Route::post('delete-voicemail', 'AdminUtilities\VoicemailController@deleteVoicemail');
        Route::get('get-voicemail/{id}', 'AdminUtilities\VoicemailController@getVoicemail');
        Route::post('update-or-create-voicemail', 'AdminUtilities\VoicemailController@updateOrCreateVoicemail');
        Route::get('get-voicemail-timezones', 'AdminUtilities\VoicemailController@getVoicemailTimezones');
        Route::get('get-admin-user-group-lists', 'AdminUtilities\VoicemailController@getAdminUserGroupLists');

#route for scripts
//Route::get('audio-lists', 'Inbound\InboundController@list');
#route for shift
        Route::get('shift-lists', 'AdminUtilities\ShiftsController@shiftLists');
        Route::post('shift-add', 'AdminUtilities\ShiftsController@store');
        Route::get('shift-edit', 'AdminUtilities\ShiftsController@edit');
        Route::post('shift-update', 'AdminUtilities\ShiftsController@update');

        Route::get('shift-delete', 'AdminUtilities\ShiftsController@destroy');
        Route::get('shift-get/{id}', 'AdminUtilities\ShiftsController@getShift');


#route for Lead
        Route::get('leadfilter-lists', 'AdminUtilities\LeadsfilterController@leadLists');
        Route::post('leadfilter-add', 'AdminUtilities\LeadsfilterController@store');
        Route::post('leadfilter-clone', 'AdminUtilities\LeadsfilterController@clone');
        Route::get('leadfilter-edit/{id}', 'AdminUtilities\LeadsfilterController@edit');
        Route::post('leadfilter-update', 'AdminUtilities\LeadsfilterController@update');
        Route::get('leadfilter-delete', 'AdminUtilities\LeadsfilterController@destroy');
        Route::get('test-on-campaign', 'AdminUtilities\LeadsfilterController@testOnCampaign');


        Route::get('leadfilter-get/{id}', 'AdminUtilities\LeadsfilterController@getLead');


#route for Lead
        //*******************Call Time **********************
        Route::get('calltime-lists', 'AdminUtilities\CalltimeController@CallTimeLists');
        Route::post('add-calltime', 'AdminUtilities\CalltimeController@addCallTime');
        Route::get('calltime-edit', 'AdminUtilities\CalltimeController@editCallTime');
        Route::post('update-calltime', 'AdminUtilities\CalltimeController@updateCallTime');
        Route::post('add-state-call-time', 'AdminUtilities\CalltimeController@addStateCallTime');
        Route::post('add-state-rule', 'AdminUtilities\CalltimeController@addStateRules');
        Route::post('add-holiday', 'AdminUtilities\CalltimeController@addHoliday');
        Route::get('delete-holiday', 'AdminUtilities\CalltimeController@deleteHoliday');
        Route::get('delete-state', 'AdminUtilities\CalltimeController@deleteState');

        Route::get('calltime-delete', 'AdminUtilities\CalltimeController@deleteCallTime');



        Route::post('calltime-add', 'AdminUtilities\CalltimeController@updateOrCreateCall');
        Route::get('calltime-get/{id}', 'AdminUtilities\CalltimeController@getCallTime');

//  Route::get('audio-lists', 'Inbound\InboundController@list');
#route for recordings
        Route::any('recording-lists', 'AdminUtilities\RecordingLogsController@Lists');

#route for recordings
        Route::get('audio-manual-lists', 'AdminUtilities\AudiosController@ajaxgetAudioManualrecords');
        Route::get('audio-moh-lists', 'AdminUtilities\MusicOnHoldController@ajaxGetMusicList');


       // Route::get('system-audit-access', 'AdminUtilities\AuditController@accessList');

        Route::get('ycc-contact-list', 'DataManagement\DataManagementController@contactList');
        Route::get('ycc-contactgroup-list', 'DataManagement\DataManagementController@X5Constactgroup');
        Route::get('ycc-contactgroup-record', 'DataManagement\DataManagementController@record');



        //*****************************system audit*********************

        Route::get('system-audit-admin-list', 'AdminUtilities\AuditController@adminList');
        Route::post('system-audit-event', 'AdminUtilities\AuditController@auditEvent');


         Route::post('system-audit-access', 'AdminUtilities\AuditController@systemAuditAccess');

        //**********************YTEL MANAGEMENT*********************************
        #Ytel User
        Route::get('ytel-list', 'Auth\AccessControlController@getYccList');
        Route::delete('ytel-delete', 'Auth\AccessControlController@yccDel');
        Route::post('ytel-post', 'Auth\AccessControlController@storeYtel');
       #Ytel Group
        Route::get('ytel-grp-permission-list', 'Auth\AccessControlController@getYtelEditGrpPermission');
        Route::post('ytel-grp-permission-edit', 'Auth\AccessControlController@updateYtelEditGrpPermission');
        Route::get('ytel-grp-list', 'Auth\AccessControlController@getYccGrpList');
        Route::post('ytel-grp-edit', 'Auth\AccessControlController@updateYtelEditGrp');
        Route::delete('ytel-grp-delete', 'Auth\AccessControlController@yccGrpDel');
        Route::post('ytel-grp-post', 'Auth\AccessControlController@storeYtelGrp');

         #Ytel Permission List
        Route::get('ytel-permission-list', 'Auth\AccessControlController@getYccPermissionList');

         // Route::get('audit-event', 'AdminUtilities\AuditController@auditEventcheck');


         //************************Data management-Custom Fields*****************

            Route::get('custom-fields-list','DataManagement\CustomFieldsController@customFieldsList');
            Route::post('copy-custom-fields','DataManagement\CustomFieldsController@copyCustom');

            Route::get('fields-list','DataManagement\CustomFieldsController@fieldList');
            Route::get('edit-custom-field','DataManagement\CustomFieldsController@editCustomField');

            Route::post('update-custom-fields','DataManagement\CustomFieldsController@updateCustomFields');
            Route::post('add-custom-fields','DataManagement\CustomFieldsController@addCustomFields');

            Route::get('delete-custom-fields','DataManagement\CustomFieldsController@deleteCustomFields');

            Route::get('view-custom-fields','DataManagement\CustomFieldsController@viewCustomFields');


    });
});



/*
  |--------------------------------------------------------------------------
  | Data Management
  |--------------------------------------------------------------------------
 */


Route::resource('data-list', 'DataManagement\DataManagementController');
Route::get('get-data-loader', 'DataManagement\DataManagementController@getDataLoader');
Route::get('get-advanced-rules', 'DataManagement\DataManagementController@getAdvancedListRules');
Route::get('get-custom-fields', 'DataManagement\DataManagementController@getCustomFields');
Route::get('get-search-result', 'DataManagement\DataManagementController@getSearchResult');
Route::get('get-list-ids', 'DataManagement\DataManagementController@getListIds');
Route::post('copy-fields-to-list', 'DataManagement\DataManagementController@copyFieldsToList');
Route::post('set-list-active', 'DataManagement\DataManagementController@setListActive');
Route::get('data-list-report/{list_id}', 'DataManagement\DataManagementController@getListReport');
Route::get('data-list-download/{list_id}', 'DataManagement\DataManagementController@downloadList');

Route::get('get-data-loader', 'DataManagement\DataManagementController@getDataLoader');
Route::get('get-advanced-rules', 'DataManagement\DataManagementController@getAdvancedListRules');
Route::get('get-custom-fields', 'DataManagement\DataManagementController@getCustomFields');
Route::get('get-search-result', 'DataManagement\DataManagementController@getSearchResult');
Route::get('get-list-ids', 'DataManagement\DataManagementController@getListIds');
Route::post('copy-fields-to-list', 'DataManagement\DataManagementController@copyFieldsToList');
Route::post('set-list-active', 'DataManagement\DataManagementController@setListActive');
Route::get('data-list-report/{list_id}', 'DataManagement\DataManagementController@getListReport');
Route::get('data-list-download/{list_id}', 'DataManagement\DataManagementController@downloadList');



/* Recording logs */
/* Route::group([
  'middleware' => ['auth:api','dyna_connect']
  ], function() {
  #Logout
  Route::get('recording-log', 'Recording\RecordingLogController@getRecordingLogs');



  }); */

/*
  Admin Utilities
 */

Route::middleware(['auth:api', 'dyna_connect'])->group(function () {
    /*
      API routes for Recording Logs
     */


    Route::post('recording-log', 'Recording\RecordingLogController@getRecordingLogs');
    Route::get('recording-log/downloadMp3/{filename}', 'Recording\RecordingLogController@downloadMP3');
    Route::post('recording-log/downloadCSV', 'Recording\RecordingLogController@downloadCSV');
});


/* Auth */
Route::group([
    'namespace' => 'Auth'
        ], function () {
#Login
    Route::post('auth/login', 'AuthController@login');
#Temp Sign Up
    Route::post('auth/signup', 'AuthController@signup');

    Route::group([
        'middleware' => ['auth:api', 'dyna_connect']
            ], function() {
#Logout
        Route::get('auth/logout', 'AuthController@logout');



#Temp User
        Route::get('user', 'AuthController@user');
    });
});

/*

  |--------------------------------------------------------------------------
  | Campaigns
  |--------------------------------------------------------------------------
 */

Route::prefix('campaigns')->group(function () {

    Route::get('campaigns-status-list', 'DataManagement\DataManagementController@getStatusData');
});





Route::get('globel-campaignlist', 'Globals\GlobalController@getall');

/*
 * Global api .
 */
Route::group([
    'middleware' => ['auth:api', 'dyna_connect']
        ], function() {
    Route::post('global-api', 'Globals\GlobalController@globalApi');
});



/*
  |--------------------------------------------------------------------------
  | Report
  |--------------------------------------------------------------------------
 */



Route::resource('inboundReport', 'Report\InboundController');
Route::get('inboundReportGetData', 'Report\InboundController@ajaxGetData');

/* * ******
 * Agents Routes.
 */
Route::group([
    'middleware' => [ 'dyna_connect']
        ], function() {
Route::post('csv-inbound-daily-report', 'Report\InboundController@csvInboundDailyReport');              
});
Route::group([
    'middleware' => ['auth:api', 'dyna_connect']
        ], function() {
    //agent Api.
    Route::get('agent-lists', 'Agents\AgentsController@index');       //Get all agents
    Route::post('agent-active', 'Agents\AgentsController@activeUser');       //Active user records.
    Route::post('agent-outbound', 'Agents\AgentsController@activeOutbound');       //Active user records.
    Route::get('agent-edit', 'Agents\AgentsController@edit');       //edit user records.
    Route::post('update-agent', 'Agents\AgentsController@updateAgent');       //update user records.
    Route::post('getOptionList', 'Agents\AgentsController@getOptionList');       //Active user records.
    Route::post('clone-agent', 'Agents\AgentsController@cloneAgent');       //Active user records.
    Route::get('get-agent-list', 'Agents\AgentsController@getAgentList');
    Route::post('delete-agent', 'Agents\AgentsController@deleteAgent');
    Route::post('inbound-group', 'Agents\AgentsController@inboundGroup');   //inbound group
    Route::post('inbound-group-update', 'Agents\AgentsController@inboundGroupupdate');   //inbound group update for user
    Route::post('compaign-rank', 'Agents\AgentsController@compaignRank');    //compaing rank for agent group
    Route::post('compaign-rank-update', 'Agents\AgentsController@compaignRankUpdate');    //compaing rank for agent group
    Route::get('call-back-list', 'Agents\AgentsController@callBacklist');    //compaing rank for agent group
    Route::post('delete-call-back', 'Agents\AgentsController@deleteCallBack');    //compaing rank for agent group
    Route::post('move-call-back', 'Agents\AgentsController@movecallBack');    //compaing rank for agent group
    Route::post('delete-month-call-backs', 'Agents\AgentsController@deleteMonthCallBacks');    //compaing rank for agent group
    Route::get('live-agent', 'Agents\AgentsController@liveAgent');    //get live/logging agent .
    Route::get('user-status-form', 'Agents\AgentsController@userStatusForm');    //get live/logging agent .
    Route::post('user-status-update-form', 'Agents\AgentsController@userStatusUpdateForm');    //get live/logging agent .
    //Agent group api.
    Route::get('agentgroup-lists', 'Agents\AgentsGroupController@index');       //Get all agents group
    Route::get('agent-group-edit', 'Agents\AgentsGroupController@editGroup');       //Get all agents group
    Route::post('agentgroup-edit', 'Agents\AgentsGroupController@edit');       //Get all agents group
    Route::post('agentgroup-delete', 'Agents\AgentsGroupController@delete');       //Get all agents group
    Route::post('agentgroup-create', 'Agents\AgentsGroupController@create');       //Get all agents group
    Route::post('agentgroup-clone', 'Agents\AgentsGroupController@cloneAgentGroup');       //Get all agents group
    //Report Inbound Service DID.

    Route::post('inbound-by-did', 'Report\InboundController@inboundByDid');              #Inbound did list.
    Route::post('download-csv-multi-group-breakdown', 'Report\InboundController@download');              #MULTI-GROUP BREAKDOWN download.
    Route::post('download-csv-hangup', 'Report\InboundController@downloadHangUp');              #MULTI-GROUP BREAKDOWN download.
    Route::post('download-csv-class-status-stats', 'Report\InboundController@downloadCallStatusStats');              #MULTI-GROUP BREAKDOWN download.
    Route::post('download-csv-category-stats', 'Report\InboundController@downloadCategoryStats');              #MULTI-GROUP BREAKDOWN download.
    Route::post('download-csv-intial-stats', 'Report\InboundController@downloadInitialStatus');              #MULTI-GROUP BREAKDOWN download.
    Route::post('download-csv-agent-stats', 'Report\InboundController@downloadAgentStats');              #MULTI-GROUP BREAKDOWN download.
    Route::post('download-csv-final', 'Report\InboundController@downloadFinalCsv');              #MULTI-GROUP BREAKDOWN download.
    Route::get('get-inbound-did-list', 'Report\InboundController@getInboundDidList');              #MULTI-GROUP BREAKDOWN download.
    //Inbound Service Level Report.
    Route::get('get-list-service-report', 'Report\InboundController@getListServiceReport');                           #Inbound Service Level Report API.
    Route::post('inbound-service-level-report', 'Report\InboundController@inboundServiceLevelReport');                #Inbound Service Level Report API.
    Route::post('csv-inbound-service-level', 'Report\InboundController@csvDownloadForServiceApi');                #Inbound Service Level Report API.
    // Inbound Summery Report
    Route::post('inbound-summery-report ', 'Report\InboundController@summeryReport');                #Inbound Summery Report API.
    Route::post('csv-inbound-summery-report', 'Report\InboundController@csvSummeryReport');                #CSV Inbound Summery Report API.
    Route::get('inbound-call-time', 'Report\InboundController@inboundCallTime');                #CSV Inbound Summery Report API.
    # Inbound Daily Report
    Route::post('inbound-daily-report', 'Report\InboundController@inboundDailyReport');                #Inbound Daily Report
    //Route::post('csv-inbound-daily-report', 'Report\InboundController@csvInboundDailyReport');                #Inbound Daily Report
    #Inbound DID Report
    Route::post('inbound-did-report', 'Report\InboundController@inboundDidReport');                #Inbound DID Report.
    Route::post('csv-inbound-did-report', 'Report\InboundController@csvInboundDidReport');         #Inbound DID Report CSV.
    #campaign status list report
    Route::post('campaign-status-list-report', 'Report\ReportCallsController@campaignStatusListReport');         ##campaign status list report
    Route::post('csv-campaign-status-list-report', 'Report\ReportCallsController@csvCampaignStatusListReport');         ##campaign status list report
    //Report agent Team Performance Details
    Route::get('get-allowed-status', 'Report\AgentController@getAllowdedStatus');
    Route::post('team-performance-details', 'Report\AgentController@teamPerformanceDetails');
    Route::post('csv-team-performance-details', 'Report\AgentController@downloadCsvTeamPerReport');

    #Single agent dailly report.
    Route::post('single-agent-daily', 'Report\AgentController@singleAgentDaily');
    Route::post('csv-single-agent-daily', 'Report\AgentController@csvSingleAgentDaily');

    #Agent Stats
    Route::post('agent-stats', 'Report\AgentController@agentStats');
    Route::post('csv-agent-stats', 'Report\AgentController@csvAgentStats');
    
    #Report Download 
    Route::get('get-report-file-list', 'Report\ProcessReportController@index');
    Route::get('get-report-file-queue-list', 'Report\ProcessReportController@getReportFileQueueList');
    
    #export Calls Report
    Route::post('export-calls-report', 'Report\ReportCallsController@exportCallsReport');
});




/* * ****************************   REPORT ROUTES START  ******************************* */


Route::resource('inboundReport', 'Report\InboundController');
Route::get('inboundReportGetData', 'Report\InboundController@ajaxGetData');

Route::group(['middleware' => ['auth:api', 'dyna_connect']], function() {

    /*     * **************   DASHBOARD CAMPAIGN SUMMARY REPORT   ************** */

    Route::post('campaign_summary', 'Report\DashboardSummaryController@index');

    /*     * ********************   TIME CLOCK REPORT   ************************ */

    Route::get('time_clock_user_group', 'Report\TimeClockController@userGroupOptionList');                # Comman User group list
    Route::post('user_time_clock_data', 'Report\TimeClockController@userTimeClockData');                    #Agent Time Clock Report
    Route::post('user_group_time_clock_status_data', 'Report\TimeClockController@userGroupTimeClockStatusData');    #Agent Group Time Clock Status Report
    Route::post('user_time_clock_detail_report', 'Report\TimeClockController@userTimeClockDetailData');   #Agent Time Clock Detail Report

    /*     * ******************    AGENT SECTION REPORT   ********************** */

    Route::get('agent_user_group_option_list', 'Report\AgentController@userGroupOptionList');  #User group list
    Route::get('agent_campaign_option_list', 'Report\AgentController@campaignOptionList');     #Campaign list
    Route::get('agent_user_option_list', 'Report\AgentController@userList');                   #User list
    Route::get('agent_allowed_status', 'Report\AgentController@allowdedStatusList');           #Stauses list
    Route::post('agent_time_detail', 'Report\AgentController@agentTimeDetail');                #Agent Time Detail
    Route::post('agent_status_detail', 'Report\AgentController@agentStatusDetail');            #Agent Status Detail
    Route::post('agent_performance_detail', 'Report\AgentController@agentPerformanceDetail');  #Agent Performance Detail
    Route::post('team_performance_detail', 'Report\AgentController@teamPerformanceDetail'); #Team Performance Detail
    Route::post('single_agent_daily_detail', 'Report\AgentController@singleAgentDailyDetail'); #Single Agent Daily

    Route::post('user_group_login', 'Report\AgentController@userGroupLogin');                   #Agent Group Login Report
    Route::post('agent_stats', 'Report\AgentController@agentStats');                      #Agent Stats
    Route::post('agent_time_sheet', 'Report\AgentController@agentTimeSheet');                  #Agent Time Sheet
    Route::post('agent_login_detail', 'Report\AgentController@agentLoginDetail');              #Agent Login Details

    Route::post('outbound_calling_report', 'Report\OutboundController@outboundCallingReport');

    Route::post('performance_comparison_report', 'Report\AgentController@performanceComparisonReport');   #Performance Comparison Report
    //Call Report
    Route::get('inbound_calls_report_groups_list', 'Report\InboundCallsReportController@inboundGroupsList'); #Inbound Groups Data
    Route::post('inbound_calls_report_by_groups', 'Report\InboundCallsReportController@inboundReportByGroup'); #Inbound Groups Data


    Route::post('outbound_summary_interval_report', 'Report\OutboundController@outboundSummaryIntervalReport'); #Outbound Summary Interval Report
    Route::post('csv_outbound_summary_interval_report', 'Report\OutboundController@csvOutboundSummaryIntervalReport'); #Outbound Summary Interval Report
    #Calls- Fronter - Closer Report
    Route::post('fc_state_report', 'Report\FronterCloserController@fcStates'); #Outbound Summary Interval Report

    Route::post('outbound_calling_report', 'Report\OutboundController@outboundCallingReport');

    Route::post('list_campaign_states_report', 'Report\ListCampaignStatesController@listCampaignStates');    #Lists Campaign Statuses Report

    Route::post('inbound_ivr_report', 'Report\InboundController@inboundIVRReport');    #Inbound IVR Report / Outbound IVR Report-Export : same controller only 'outbound' param is different.
});
