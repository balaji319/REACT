<?php

/*
 * Admin utilities module error messages
 * @author Omprakash Pachkawade<om@ytel.com>
 * 
 */
namespace App\Http\Controllers\AdminUtilities;

class AdminUtilitiesErrors {

    
    const REQ_SCRIPT_ID             =   'Script id required. Please try again!';
    const SCRIPT_UPDATE_ERROR       =   'Error occurred while updating script active. Please try again!';
    const SCRIPT_ACTIVATED          =   'Script Activated Successfully.';
    const SCRIPT_DEACTIVATED        =   'Script Deactivated Successfully.';
    const REQ_SCRIPT_ID_STATUS      =   'List id or status is missing. Please try again!';
    const RECORD_DELETED            =   'Record successfully deleted.';
    const SCRIPT_DELETE_ERROR       =   'Error occurred while deleting script. Please try again!';
    const REQ_FROM_NEW_SCRIPT_ID    =   'From script id & new script id is required. Please try again!';
    const SCRIPT_NOT_FOUND          =   'We can not locate your Script, please check your input.';
    const SCRIPT_CLONE_ERROR        =   'Error occurred while cloning script. Please try again!.';
    const RECORD_MODIFIED           =   'Record successfully modified.';
    const RECORD_MODIFIED_ERROR     =   'Error occurred while modifiding record. Please try again!.';
    const RECORD_CREATED            =   'Record created successfully.';
    const RECORD_CREATED_ERROR      =   'Error occurred while creating new record. Please try again!.';
    
    const DNC_ADD_SUCCESS           =   ' Phone number added successfully.';
    const DNC_ADD_DUPLICATE         =   ' Phone number is already in the DNC List.';
    const DNC_ADD_INVALID           =   ' Phone number is invalid.';
    const DNC_DELETE_SUCCESS        =   ' Phone number deleted successfully.';
    
    const VOICEMAIL_UPDATE_ERROR    =   'Error occurred while updating voicemail active. Please try again!';
    const VOICEMAIL_ACTIVATED       =   'Voicemail Activated Successfully.';
    const VOICEMAIL_DEACTIVATED     =   'Voicemail Deactivated Successfully.';
    const REQ_VOICEMAIL_ID_STATUS   =   'Voicemail id or status is missing. Please try again!';
    const VOICEMAIL_DELETE_ERROR    =   'Error occurred while deleting voicemail. Please try again!';
    const REQ_VOICEMAIL_ID          =   'Voicemail id required. Please try again!';
    const VOICEMAIL_NOT_FOUND       =   'We can not locate your Voicemail, please check your input.';



    const SHIFT_RECORD_CREATED_ERROR =   'Shift ID must be unique.';
    const SHIFT_NOT_FOUND            =   'We can not locate your Shift, please check your input.';
}
