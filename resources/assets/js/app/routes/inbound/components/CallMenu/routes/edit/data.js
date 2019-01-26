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

/**
 *
 */
export const scriptTextFieldsPrefix = "--A--";
export const scriptTextFieldsPostfix = "--B--";
export const style_header = {
  backgroundColor: "#15bcd4",
  color: "#FFFFFF",
  fontSize: "20px",
  marginTop: "3px",
  padding: "10px",
  width: "100%"
};

export const list_didRoute = [
  { value: "*REMOVE*", label: "remove" },
  { value: "AGI", label: "Agi" },
  { value: "EXTENSION", label: "Exten" },
  { value: "VOICEMAIL", label: "Voicemail" },
  { value: "PHONE", label: "Phone" },
  { value: "INGROUP", label: "In Group" },
  { value: "CALLMENU", label: "Call Menu" },
  { value: "HANGUP", label: "hangup" },
  { value: "DID", label: "did" }
];

export const option_route_value_0_phone = [
  { value: "1002", label: "1002-208.74.137.100-1002-1002" },
  { value: "1003", label: "1003-208.74.137.100-1003-1003" },
  { value: "1004", label: "1004-208.74.137.100-1004-1004" },
  { value: "1005", label: "1005-208.74.137.100-1005-1005" },
  { value: "1006", label: "1006-208.74.137.100-1006-1006" },
  { value: "1007", label: "1007-208.74.137.100-1007-1007" }
];

export const option_route_value_0_call_menu = [
  { value: "100", label: "1001" },
  { value: "defaultlog", label: "defaultlog" },
  { value: "ptrusteng", label: "ptrusteng" },
  { value: "ptrustspan", label: "ptrustspan" },
  { value: "test222", label: "test222" }
];

export const option_menu_time_check = [
  { value: "0", label: "0 - No Time Check" },
  { value: "1", label: "1 - Time Check" },
];

export const option_track_realtime_report = [
  { value: "0", label: "No RealTime Tracking" },
  { value: "1", label: "RealTime Tracking" },

];
export const option_callmenu_dtf = [
  { value: "0", label: "0 - No DTMF Logging" },
  { value: "1", label: "1 - DTMF Logging Enabled" }
];
export const option_logfields = [
    "NONE",
    "vendor_lead_code",
    "source_id",
    "phone_code",
    "title",
    "first_name",
    "middle_initial",
    "last_name",
    "address1",
    "address2",
    "address3",
    "city",
    "state",
    "province",
    "postal_code",
    "country_code",
    "alt_phone",
    "email",
    "security_phrase",
    "comments",
    "rank",
    "owner",
    "status",
    "user"
];

export const options_callmenu = [
  { value: "0", label: "0" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
  { value: "7", label: "7" },
  { value: "8", label: "8" },
  { value: "9", label: "9" },
  { value: "HASH", label: "#" },
  { value: "STAR", label: "*" },
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
  { value: "8", label: "8" },
  { value: "9", label: "9" },
  { value: "TIMECHECK", label: "TIMECHECK" },
  { value: "TIMEOUT", label: "TIMEOUT" },
  { value: "INVALID", label: "INVALID" },
  { value: "INVALID_2ND", label: "INVALID_2ND" },
  { value: "INVALID_3RD", label: "INVALID_3RD" },
];

export const glabalCallMenuObj =

          [
            {
            "option_value":"0",
            "option_description":"",
            "option_route":"",
            "option_route_value":"",
            "option_route_value_context":"",
            "UpdateRow":"0"
            },
            {
            "option_value":"1",
            "option_description":"",
            "option_route":"",
            "option_route_value":"",
            "option_route_value_context":"",
            "UpdateRow":"0"
            },
            {
            "option_value":"2",
            "option_description":"",
            "option_route":"",
            "option_route_value":"",
            "option_route_value_context":"",
            "UpdateRow":"0"
            },
            {
              "option_value":"3",
              "option_description":"",
              "option_route":"",
              "option_route_value":"",
              "option_route_value_context":"",
              "UpdateRow":"0"
              },
              {
              "option_value":"4",
              "option_description":"",
              "option_route":"",
              "option_route_value":"",
              "option_route_value_context":"",
              "UpdateRow":"0"
              },
              {
              "option_value":"5",
              "option_description":"",
              "option_route":"",
              "option_route_value":"",
              "option_route_value_context":"",
              "UpdateRow":"0"
              },
              {
                "option_value":"6",
                "option_description":"",
                "option_route":"",
                "option_route_value":"",
                "option_route_value_context":"",
                "UpdateRow":"0"
                },
                {
                "option_value":"7",
                "option_description":"",
                "option_route":"",
                "option_route_value":"",
                "option_route_value_context":"",
                "UpdateRow":"0"
                },
                {
                "option_value":"8",
                "option_description":"",
                "option_route":"",
                "option_route_value":"",
                "option_route_value_context":"",
                "UpdateRow":"0"
                },
                {
                  "option_value":"9",
                  "option_description":"",
                  "option_route":"",
                  "option_route_value":"",
                  "option_route_value_context":"",
                  "UpdateRow":"0"
                  },
                  {
                    "option_value":"HASH",
                    "option_description":"",
                    "option_route":"",
                    "option_route_value":"",
                    "option_route_value_context":"",
                    "UpdateRow":"0"
                    },
                    {
                    "option_value":"STAR",
                    "option_description":"",
                    "option_route":"",
                    "option_route_value":"",
                    "option_route_value_context":"",
                    "UpdateRow":"0"
                    },
                    {
                    "option_value":"A",
                    "option_description":"",
                    "option_route":"",
                    "option_route_value":"",
                    "option_route_value_context":"",
                    "UpdateRow":"0"
                    },
                    {
                      "option_value":"B",
                      "option_description":"",
                      "option_route":"",
                      "option_route_value":"",
                      "option_route_value_context":"",
                      "UpdateRow":"0"
                      },
                      {
                      "option_value":"C",
                      "option_description":"",
                      "option_route":"",
                      "option_route_value":"",
                      "option_route_value_context":"",
                      "UpdateRow":"0"
                      },
                      {
                        "option_value":"D",
                        "option_description":"",
                        "option_route":"",
                        "option_route_value":"",
                        "option_route_value_context":"",
                        "UpdateRow":"0"
                        },
                        {
                          "option_value":"TIMECHECK",
                          "option_description":"",
                          "option_route":"",
                          "option_route_value":"",
                          "option_route_value_context":"",
                          "UpdateRow":"0"
                          },
                          {
                          "option_value":"TIMEOUT",
                          "option_description":"",
                          "option_route":"",
                          "option_route_value":"",
                          "option_route_value_context":"",
                          "UpdateRow":"0"
                          },
                          {
                          "option_value":"INVALID",
                          "option_description":"",
                          "option_route":"",
                          "option_route_value":"",
                          "option_route_value_context":"",
                          "UpdateRow":"0"
                          },
                          {
                            "option_value":"INVALID_2ND",
                            "option_description":"",
                            "option_route":"",
                            "option_route_value":"",
                            "option_route_value_context":"",
                            "UpdateRow":"0"
                            },
                            {
                            "option_value":"INVALID_3RD",
                            "option_description":"",
                            "option_route":"",
                            "option_route_value":"",
                            "option_route_value_context":"",
                            "UpdateRow":"0"
                            }


          ]

 export const option_handleOptions = [
            "CID",
            "CIDLOOKUP",
            "CIDLOOKUPRC",
            "CIDLOOKUPRC",
            "CIDLOOKUPALT",
            "CIDLOOKUPRLALT",
            "CIDLOOKUPRCALT",
            "CIDLOOKUPADDR3",
            "CIDLOOKUPRLADDR3",
            "CIDLOOKUPRCADDR3",
            "CIDLOOKUPALTADDR3",
            "CIDLOOKUPRLALTADDR3",
            "CIDLOOKUPRCALTADDR3",
            "ANI",
            "ANILOOKUP",
            "ANILOOKUPRL",
            "VIDPROMPT",
            "VIDPROMPTLOOKUP",
            "VIDPROMPTLOOKUPRL",
            "VIDPROMPTLOOKUPRC",
            "CLOSER",
            "3DIGITID",
            "4DIGITID",
            "5DIGITID",
            "10DIGITID"
        ];
export const option_searchMethod = [
  { value: "LB", label: "LB - Load Balanced" },
  { value: "LO", label: "LO - Load Balanced Overflow" },
  { value: "SO", label: "SO - Server Only" },

      ];
