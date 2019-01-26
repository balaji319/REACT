/********************************** API CONST ******************************* */

/** inbound constatnt **/

export const FETCH_ALL_RECORD_SUCSESS = "Inbound Records Fetched  Sucsessfully";
export const UPDATE_RECORD = "UpdateScuess";
export const FETCH_ALL_RECORD_FAILURE = "Something went wrong !!!!";
export const REQUEST_INBOUND = "Inbound Request";
export const RESPONSE_MESSAGE = "Inbound Response";
export const DELETE_RECORD_SUCSESS = "Inbound Record Delete Sucsessfully ";
export const INBOUND_DELETE_RECORD_SUCSESS = "Inbound Record Delete Sucsessfully ";
export const UPDATE_RECORD_SUCSESS = " Inbound Record Updated Sucsessfully ";
export const CLONE_RECORD_SUCSESS = " Inbound Record CLONE Sucsessfully ";
export const REQUEST_INBOUND_UNCLEAR = " Inbound Request Unclear ";

//comman
export const FETCH_ALL_CAMAIGNTOGROUP_SUCSESS =
  "AssignCampaignToGroup Records Fetched  Sucsessfully";

/** call menu constatnt **/
export const FETCH_ALL_CALLMENU_SUCSESS =
  "CALLMENU Records Fetched  Sucsessfully";
export const UPDATE_CALLMENU_RECORD_SUCSESS =
  " CALLMENU Record Updated Sucsessfully";
export const DELETE_CALLMENU_RECORD_SUCSESS =
  " CALLMENU Record Delete Sucsessfully";
export const CLONE_CALLMENU_RECORD_SUCSESS =
  " CALLMENU Record CLONE Sucsessfully";

/** Did numbers  constatnt **/
export const FETCH_ALL_DID_SUCSESS = "DID Records Fetched  Sucsessfully";
export const UPDATE_DID_RECORD_SUCSESS = " DID Record Updated Sucsessfully";
export const DELETE_DID_RECORD_SUCSESS = " DID Record Delete Sucsessfully";
export const CLONE_DID_RECORD_SUCSESS = " DID Record CLONE Sucsessfully";

/** Did numbers  constatnt **/
export const FETCH_ALL_FPG_DATA_SUCSESS = "FPG  Records Fetched  Sucsessfully";

/********************************** API CONST *******************************/

/** inbound api constatnt **/
export const API_ALL_INBOUND = "api/inbound-lists";
export const API_UPDATE_STATUS_SCRIPT = "api/admin-utilities/set-script-active";
export const API_DELETE_SCRIPT = "api/admin-utilities/delete-script";
export const API_CLONE_SCRIPT = "/api/admin-utilities/clone-script";

export const API_INBOUND_AGENT_GROUP_UPDATE_COMMON =
  "/api/inbound-lists/agents/update";
export const API_INBOUND_AGENT_GROUP_LIST_COMMON =
  "/api/inbound-lists/agents?group_id=";
export const API_INBOUND_ALL_CALLMENU_INBOUND =
  "/api/inbound-call-menu-ingroup";
export const API_FETCH_INBOUND_EDIT_DATA = "/api/inbound-queue-edit/";

export const API_FETCH_INBOUND_NUMBER_EDIT_DATA = "/api/number-edit/";

export const API_ALL_CAMAIGNTOGROUP = "/api/inbound-checkbox";

/** call menu api constatnt **/
export const API_ALL_CALLMENU = "api/callmenu-list";

/** Did numbers api constatnt **/
export const API_ALL_DID = "api/number-lists";

/** Did numbers api constatnt **/
export const API_ALL_FPG = "api/filter-phone-group-list";

/** Did numbers api constatnt **/
export const API_CLONE_INBOUND_NUMBER_DATA = "api/number-clone";

export const API_FETCH_INBOUND_FPG_DATA =
  "api/filter-phone-group/edit?filter_phone_group_id=";

export const API_INBOUND_RECORD_DATA = "/api/number-update";
export const API_UPDATE_INBOUND_FPG_DATA = "api/update-filter-phone-group";

export const API_CREATE_INBOUND_FPG_DATA = "api/add-filter-phone-group/";

export const API_FETCH_CALL_MENU_DATA = "api/callmenu/edit/";

export const API_UPDATE_CALL_MENU_DATA = "api/callmenu/update";

export const API_CREATE_CALL_MENU_DATA = "api/callmenu/create";

export const API_INBOUND_DELETE_RECORD="api/inbound-queue/delete"
export const API_UPDATE_SELECTED_CALL_MENU_DATA="api/add-call-menu-options"
