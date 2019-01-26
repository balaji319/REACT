/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * For form helper text
 * @type Array
 */
export const helperText = {

    voicemail_id: 'This is the all numbers identifier of this mailbox. This must not be a duplicate of an existing voicemail ID or the voicemail ID of a phone on the system, minimum of 2 characters.'
    ,voicemail_pass:'This is the password that is used to gain access to the voicemail box when dialing in to check messages max 10 characters, minimum of 2 characters.'
    ,voicemail_name:'This is name associated with this voicemail box. max 100 characters, minimum of 2 characters.'
    ,voicemail_active:'This option allows you to set the voicemail box to active or inactive. If the box is inactive you cannot leave messages on it and you cannot check messages in it.'
    ,voicemail_email:'This is the e-mail that the converted audio file will sent to. Max 100 characters, minimum of 2 characters and 2 e-mail addresses max.'
    ,voicemail_admin_group:'This is the administrative user group for this record, this allows admin viewing of this recoird restricted by user group. Default is --ALL-- which allows any admin user to view this record.'
    ,voicemail_delete:'This optional setting allows you to have the voicemail messages deleted from the system after they have been emailed out. Default is N.'
    ,voicemail_greeting:'This optional setting allows you to define a voicemail greeting audio file from the audio store. Default is blank.'
    ,voicemail_zone:'This setting allows you to set the zone that this voicemail box will be set to when the time is logged for a message. Default is set in the System Settings.'
    ,voicemail_options:'This optional setting allows you to define additional voicemail settings. It is recommended that you leave this blank unless you know what you are doing.'
};

