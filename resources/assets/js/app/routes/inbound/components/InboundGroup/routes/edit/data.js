/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export const scriptTextFields = [
  { value: "fullname", label: "Agent Name(fullname)" },
  { value: "vendor_lead_code", label: "vendor_lead_code" },
  { value: "source_id", label: "source_id" },
  { value: "list_id", label: "list_id" },
  { value: "list_name", label: "list_name" },
  { value: "list_description", label: "list_description" },
  { value: "gmt_offset_now", label: "gmt_offset_now" },
  { value: "called_since_last_reset", label: "called_since_last_reset" },
  { value: "phone_code", label: "phone_code" },
  { value: "phone_number", label: "phone_number" },
  { value: "title", label: "title" },
  { value: "first_name", label: "first_name" },
  { value: "middle_initial", label: "middle_initial" },
  { value: "last_name", label: "last_name" },
  { value: "address1", label: "address1" },
  { value: "address2", label: "address2" },
  { value: "address3", label: "address3" },
  { value: "city", label: "city" },
  { value: "state", label: "state" },
  { value: "province", label: "province" },
  { value: "postal_code", label: "postal_code" },
  { value: "country_code", label: "country_code" },
  { value: "gender", label: "gender" },
  { value: "date_of_birth", label: "date_of_birth" },
  { value: "alt_phone", label: "alt_phone" },
  { value: "email", label: "email" },
  { value: "security_phrase", label: "security_phrase" },
  { value: "comments", label: "comments" },
  { value: "lead_id", label: "lead_id" },
  { value: "campaign", label: "campaign" },
  { value: "phone_login", label: "phone_login" },
  { value: "group", label: "group" },
  { value: "channel_group", label: "channel_group" },
  { value: "SQLdate", label: "SQLdate" },
  { value: "epoch", label: "epoch" },
  { value: "uniqueid", label: "uniqueid" },
  { value: "customer_zap_channel", label: "customer_zap_channel" },
  { value: "server_ip", label: "server_ip" },
  { value: "SIPexten", label: "SIPexten" },
  { value: "session_id", label: "session_id" },
  { value: "dialed_number", label: "dialed_number" },
  { value: "dialed_label", label: "dialed_label" },
  { value: "rank", label: "rank" },
  { value: "owner", label: "owner" },
  { value: "camp_script", label: "camp_script" },
  { value: "in_script", label: "in_script" },
  { value: "script_width", label: "script_width" },
  { value: "script_height", label: "script_height" },
  { value: "recording_filename", label: "recording_filename" },
  { value: "recording_id", label: "recording_id" },
  { value: "user_custom_one", label: "user_custom_one" },
  { value: "user_custom_two", label: "user_custom_two" },
  { value: "user_custom_three", label: "user_custom_three" },
  { value: "user_custom_four", label: "user_custom_four" },
  { value: "user_custom_five", label: "user_custom_five" },
  { value: "preset_number_a", label: "preset_number_a" },
  { value: "preset_number_b", label: "preset_number_b" },
  { value: "preset_number_c", label: "preset_number_c" },
  { value: "preset_number_d", label: "preset_number_d" },
  { value: "preset_number_e", label: "preset_number_e" },
  { value: "preset_number_f", label: "preset_number_f" },
  { value: "preset_dtmf_a", label: "preset_dtmf_a" },
  { value: "preset_dtmf_b", label: "preset_dtmf_b" },
  { value: "did_id", label: "did_id" },
  { value: "did_extension", label: "did_extension" },
  { value: "did_pattern", label: "did_pattern" },
  { value: "did_description", label: "did_description" },
  { value: "closecallid", label: "closecallid" },
  { value: "xfercallid", label: "xfercallid" },
  { value: "agent_log_id", label: "agent_log_id" },
  { value: "entry_list_id", label: "entry_list_id" },
  { value: "call_id", label: "call_id" },
  { value: "user_group", label: "user_group" }
];

export const style_header = {
  backgroundColor: "#15bcd4",
  color: "#FFFFFF",
  fontSize: "20px",
  marginTop: "3px",
  padding: "10px",
  width: "100%"
};

/**
 *
 */
export const scriptTextFieldsPrefix = "--A--";
export const scriptTextFieldsPostfix = "--B--";
export const priority_data = [
  {
    value: "99",
    label: "99 -Higher"
  },
  {
    value: "98",
    label: "98 -Higher"
  },
  {
    value: "97",
    label: "97 -Higher"
  },
  {
    value: "96",
    label: "96 -Higher"
  },
  {
    value: "95",
    label: "95 -Higher"
  },
  {
    value: "94",
    label: "94 -Higher"
  },
  {
    value: "93",
    label: "93 -Higher"
  },
  {
    value: "92",
    label: "92 -Higher"
  },
  {
    value: "91",
    label: "91 -Higher"
  },
  {
    value: "90",
    label: "90 -Higher"
  },
  {
    value: "-99",
    label: "99-Lower"
  },
  {
    value: "-98",
    label: "98 -Lower"
  },
  {
    value: "-97",
    label: "97 -Lower"
  }
];

export const list_next_agent_call = [
  { id: "random", name: "Random" },
  { id: "oldest_call_start", name: "Oldest Call Start" },
  { id: "oldest_call_finish", name: "Oldest Call Finish" },
  { id: "oldest_inbound_call_start", name: "oldest_inbound_call_start" },
  { id: "oldest_inbound_call_finish", name: "oldest_inbound_call_finish" },
  { id: "overall_user_level", name: "Overall User Level" },
  { id: "inbound_group_rank", name: "inbound_group_rank" },
  { id: "campaign_rank", name: "Campaign Rank" },
  { id: "ingroup_grade_random", name: "Campaign Rank" },
  { id: "campaign_grade_random", name: "inbound_group_rank" },
  { id: "fewest_calls", name: "Fewest Calls" },
  { id: "fewest_calls_campaign", name: "fewest_calls_campaign" },
  { id: "longest_wait_time", name: ">Longest Wait Time" },
  { id: "ring_all", name: ">ring_all" }
];

export const script_data = [
  {
    value: "NONE",
    label: "NONE"
  },
  {
    value: "1234",
    label: "1234"
  },
  {
    value: "12345678",
    label: "12345678"
  },
  {
    value: "123456a ",
    label: "123456a"
  },
  {
    value: "12345t",
    label: "12345t"
  },
  {
    value: "3000",
    label: "3000"
  },
  {
    value: "4000",
    label: "4000"
  }
];

export const call_lunch_data = [
  {
    value: "NONE",
    label: "NONE"
  },
  {
    value: "SCRIPT",
    label: "SCRIPT"
  },
  {
    value: "WEBFORM ",
    label: "WEBFORM"
  },
  {
    value: "WEBFORMTWO",
    label: "WEBFORMTWO"
  },
  {
    value: "FORM",
    label: "FORM"
  }
];

export const call_time_id_data = [
  {
    value: "24hours",
    label: "24hours"
  },
  {
    value: "12pm-9pm",
    label: "12pm-9pm"
  },
  {
    value: "12pm-6pm ",
    label: "12pm-6pm"
  },
  {
    value: "6pm-9pm",
    label: "6pm-9pm"
  },
  {
    value: "9am-9pm",
    label: "9am-9pm"
  },
  {
    value: "9am-5pm",
    label: "9am-5pm"
  }
];

export const after_hours_action_data = [
  {
    value: "HANGUP",
    label: "HANGUP"
  },
  {
    value: "MESSAGE",
    label: "MESSAGE"
  },
  {
    value: "VOICEMAIL",
    label: "VOICEMAIL"
  },
  {
    value: "IN_GROUP",
    label: "IN_GROUP"
  },
  {
    value: "CALLMENU",
    label: "CALLMENU"
  }
];

export const play_welcome_message_data = [
  {
    value: "ALWAYS",
    label: "ALWAYS"
  },
  {
    value: "NEVER",
    label: "NEVER"
  },
  {
    value: "IF_WAIT_ONLY",
    label: "IF_WAIT_ONLY"
  },
  {
    value: "YES_UNLESS_NODELAY",
    label: "YES_UNLESS_NODELAY"
  }
];
