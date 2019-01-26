/*
 * Created on Sun Aug 26 2018
 *
 * Copyright (c) 2018 Your Company
 */

import React, { Component } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import Chip from "@material-ui/core/Chip";
import MultiSelect from "@kenshooui/react-multi-select";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import classNames from "classnames";
import DeleteIcon from "@material-ui/icons/Delete";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import KeyboardVoiceICon from "@material-ui/icons/KeyboardVoice";
import Icon from "@material-ui/core/Icon";
import SaveIcon from "@material-ui/icons/Save";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import Divider from "@material-ui/core/Divider";
import DialogContent from "@material-ui/core/DialogContent";
import { fetchGlobal } from "../../../actions/Global";
import { connect } from "react-redux";
import { API_FETCH_DASHBORD_REALTIME_DATA } from "./constant";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import {
  Button,
  ListGroup,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane
} from "reactstrap";
import axios from "axios";
import classnames from "classnames";
import MonthlyRevenue from "../../../components/dashboard/default/MonthlyRevenue";
import Slide from "@material-ui/core/Slide";

function Transition(props) {
  return <Slide direction="down" {...props} />;
}
import {
  announcementsNotification,
  appNotification,
  article,
  authors,
  chartData,
  lineChartData,
  marketingData,
  pieChartData,
  with_inbound_data,
  PRESETstats_data,
  DROPINGROUPstats_data,
  AGENTtimeSTATS_data,
  CARRIERstats_data,
  NOLEADSalert_data,
  screen_refresh_data
} from "./data";

import ReportBox from "../../../components/ReportBox/index";
import InfoCard from "../../../components/InfoCard";
import InFoWithBgImage from "../../../components/InFoWithBgImage";
import SimpleToDo from "../../../components/ToDoCard/index";
import UserDetailTable from "../../../components/dashboard/Common/UserDetailTable";
import UserProfileCard from "../../../components/dashboard/Common/userProfileCard/UserProfileCard";
import MarketingTable from "../../../components/dashboard/Common/MarketingTable";
import RecentActivities from "../../../components/dashboard/Common/RecentActivities/index";

import ProjectsList from "../../../components/dashboard/Common/ProjectsList";
import CountryListBadges from "../../../components/dashboard/Common/CountryListBadges";
import WeatherList from "../../../components/dashboard/Common/WeatherList";

import ContainerHeader from "../../../components/ContainerHeader/index";
import CardHeader from "../../../components/dashboard/Common/CardHeader/index";
import IntlMessages from "../../../util/IntlMessages";
import { Paper } from "@material-ui/core";
import CardBox from "../../../components/CardBox";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import TextField from "@material-ui/core/TextField";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
import ListItemText from "@material-ui/core/ListItemText";

var ar_refresh = 10;
var ar_seconds = 10;
var $start_count = 0;

const styles = theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  formControl: {
    minWidth: 120,
    maxWidth: 300
  },
  chips: {
    display: "flex",
    flexWrap: "wrap"
  },
  chip: {}
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

class Dashboard extends Component {
  constructor() {
    super();

    this.state = {
      RR: "4",
      monitor_phone: "",
      monitor_active: "NONE",
      adastats: "1",
      UGdisplay: "0",
      SERVdisplay: "0",
      CALLSdisplay: "1",
      PHONEdisplay: "0",
      SESSIONIDdisplay: "0",
      CUSTPHONEdisplay: "0",
      ALLINGROUPstats: "",
      activeTab: "1",
      agents_call_list: [],
      agents_list: [],
      campaign_statuses: [],
      with_inbound: "Y",
      PRESETstats: "0",
      DROPINGROUPstats: "0",
      AGENTtimeSTATS: "0",
      NOLEADSalert: "0",
      CARRIERstats: "0",
      live_agents: [],
      live_calls_table_title: [],
      items: [],
      selectedItems: [],
      selectedItemsArray: [],
      audio_dialog: false,
      camp_list: [],
      SelectedCampList: "ALL-ACTIVE",
      name: ["ALL-ACTIVE"],
      live_calls_table_values: [],
      live_calls_table_header: [],
      live_calls_list: [],
      camp_only: [],
      stat_table: [],
      showID: true,
      hideInfoDiv: false
    };
    this.toggle = this.toggle.bind(this);
    this.handleChanges = this.handleChanges.bind(this);
    this.realtime_refresh_display = this.realtime_refresh_display.bind(this);
  }

  handleChange(selectedItems) {
    this.setState({ selectedItems });
  }
  handleTextChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  redirectAgent = name => {
    let strName = name.substring("*", name.length - 1).trim();
    this.props.history.push("/app/agent/agents/userstatus/" + strName);
  };
  handleRefreshChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
    ar_refresh = ar_seconds = event.target.value;
    this.gather_realtime_content();
  };

  handlemonitorChange = () => {
    alert("AAAA");
  };
  hideshowDiv = () => {
    let hideInfoDiv = this.state.hideInfoDiv;
    this.setState({ hideInfoDiv: !hideInfoDiv });
  };

  handledOpenAudioManagerDialog = () => {
    this.setState({ audio_dialog: !this.state.audio_dialog });
  };

  handleRequestCloseAudio = value => {
    alert(value);
    this.setState({ audio_dialog: false });
  };
  getData() {
    setTimeout(() => {
      console.log("Our data is fetched");
      this.setState({
        data: "Hello WallStreet"
      });
    }, 10000);
  }
  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }
  // update_variables(e) {
  //   e.preventDefault();

  //   console.log("The link was clicked.");
  // }

  // handleChange(e) {
  //   //alert(document.getElementById("RR").value);

  //   this.gather_realtime_content();
  // }
  handleChanges(selectedItemsArray) {
    this.setState({ selectedItemsArray });
    console.log(selectedItemsArray);
  }
  handleChange1 = event => {
    let array_data = this.state.camp_only;
    let _this = this;
    console.log("=========================");
    let check = false;
    if (_this.state.name.indexOf("ALL-ACTIVE") > -1) {
      check = true;
    }
    this.setState((prevState, props) => ({
      name: event.target.value
    }));

    setTimeout(function() {
      if (_this.state.name.indexOf("ALL-ACTIVE") > -1) {
        _this.setState({
          name: array_data
        });
      } else {
        if (check) {
          _this.setState({
            name: []
          });
        }
      }
    }, 10);

    console.log(_this.state.name);
    console.log("=========================");
  };

  checkID = () => {
    let showID = this.state.showID;
    this.setState({ showID: !showID });
  };
  componentDidMount() {
    let _this = this;
    let array_data = this.state.camp_only;
    console.log("Component DID MOUNT!");
    if (_this.state.name.indexOf("ALL-ACTIVE") > -1) {
      _this.setState({
        name: array_data
      });

      let path = this.props.history
        ? this.props.history.location.pathname.split("/")[2]
        : "";
      if (path == "dashboard") {
        this.gather_realtime_content();
      }
    }
    ar_refresh = this.state.RR;
    ar_seconds = this.state.RR;
    this.props.fetchGlobal(["agentgroup_custom", "camp", "camp_only"]);
    this.realtime_refresh_display();

    //this.getData();
  }
  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      items: nextPropsFromRedux.Global.agentgroup_custom
        ? nextPropsFromRedux.Global.agentgroup_custom
        : [],
      selectedItems: nextPropsFromRedux.Global.agentgroup_custom
        ? nextPropsFromRedux.Global.agentgroup_custom
        : [],
      camp_list: nextPropsFromRedux.Global.campaigns
        ? nextPropsFromRedux.Global.campaigns
        : "",
      camp_only: nextPropsFromRedux.Global.camp_only
        ? nextPropsFromRedux.Global.camp_only
        : "",
      name: nextPropsFromRedux.Global.camp_only
        ? nextPropsFromRedux.Global.camp_only
        : ""
    });
    let _this = this;
    let array_data = this.state.camp_only;
    if (_this.state.name.indexOf("ALL-ACTIVE") > -1) {
      _this.setState({
        name: array_data
      });
    }
  }

  realtime_refresh_display() {
    console.log("initial" + ar_refresh);
    console.log("secoond " + ar_seconds);
    console.log("Diff" + $start_count);

    if ($start_count < 1) {
      this.gather_realtime_content();
      console.log($start_count);
      //
    }
    $start_count++;
    if (ar_seconds > 0) {
      console.log("ar_seconds Less than 0");
      ar_seconds = ar_seconds - 1;
      //setTimeout(this.realtime_refresh_display(), 10000);
      setTimeout(() => {
        this.realtime_refresh_display();
      }, 1000);
    } else {
      console.log(" ar_seconds Greater than 0");
      ar_seconds = ar_refresh;
      this.gather_realtime_content();
      //setTimeout(this.realtime_refresh_display(), 10000);
      setTimeout(() => {
        this.realtime_refresh_display();
      }, 1000);
      //  setTimeout(this.realtime_refresh_display(), 10000);
    }
  }

  gather_realtime_content() {
    {
      let __this = this;
      var xmlhttp = false;
      if (!xmlhttp && typeof XMLHttpRequest != "undefined") {
        xmlhttp = new XMLHttpRequest();
      }
      if (xmlhttp) {
        //monitor_active = document.getElementById("monitor_active").value;

        var RTajax = 1;
        var DB = "";
        var groups = "ALL-ACTIVE";
        var user_group_filter = "ALL-GROUPS";
        var adastats = "1";
        var showhide = "1";
        var SIPmonitorLINK = "";
        var IAXmonitorLINK = "";
        var usergroup = "";
        var UGdisplay = "1";
        var UidORname = "1";
        var orderby = "timeup";
        var SERVdisplay = "1";
        var CALLSdisplay = "1";
        var PHONEdisplay = "0";
        var SESSIONIDdisplay = "0";
        var CUSTPHONEdisplay = "0";
        var with_inbound = "Y";
        var monitor_active = "";
        var monitor_phone = "9876543210";
        var ALLINGROUPstats = "";
        var RR = "0";
        var DROPINGROUPstats = "0";
        var NOLEADSalert = "";
        var CARRIERstats = "0";
        var PRESETstats = "0";
        var AGENTtimeSTATS = "0";
        var groupQS = "";
        var usergroupQS = "";
        let groupQS_temp = ["ALL-ACTIVE"];
        let usergroupQS_temp = ["ALL-ACTIVE"];
        let selectedCamp = __this.state.name;
        let selectedItems = this.state.selectedItems;
        let selectedItemsArray = this.state.selectedItemsArray;
        let items = this.state.items;

        if (selectedCamp.indexOf("ALL-ACTIVE") > -1) {
          groupQS_temp = ["ALL-ACTIVE"];
        } else {
          var array_camp_temp = selectedCamp;
          var array_key = []; // better to define using [] instead of new Array();
          var array_values = [];
          for (var i = 0; i < array_camp_temp.length; i++) {
            var split = array_camp_temp[i].split(" - "); // just split once
            array_key.push(split[0]); // before the dot
          }
          groupQS_temp = array_key;
        }
        if (selectedItems.length != items.length) {
          usergroupQS_temp = selectedItemsArray;
        }

        adastats = this.state.adastats;
        UGdisplay = this.state.UGdisplay;
        PHONEdisplay = this.state.PHONEdisplay;
        SERVdisplay = this.state.SERVdisplay;
        PHONEdisplay = this.state.PHONEdisplay;
        CALLSdisplay = this.state.CALLSdisplay;
        SESSIONIDdisplay = this.state.SESSIONIDdisplay;
        CUSTPHONEdisplay = this.state.CUSTPHONEdisplay;
        ALLINGROUPstats = this.state.ALLINGROUPstats;
        with_inbound = this.state.with_inbound;
        PRESETstats = this.state.PRESETstats;
        DROPINGROUPstats = this.state.DROPINGROUPstats;
        AGENTtimeSTATS = this.state.AGENTtimeSTATS;
        NOLEADSalert = this.state.NOLEADSalert;
        CARRIERstats = this.state.CARRIERstats;
        monitor_phone =
          this.state.monitor_phone != ""
            ? this.state.monitor_phone
            : monitor_phone;
        monitor_active = this.state.monitor_active;

        var RTupdate_query_new = {
          rt_ajax: "1",
          db: DB,
          groups: groupQS_temp,
          user_group_filter: usergroupQS_temp,
          adastats: adastats,
          showhide: showhide,
          spi_monitor_link: SIPmonitorLINK,
          iax_monitor_link: IAXmonitorLINK,
          usergroup: usergroup,
          ug_display: UGdisplay,
          uid_or_name: UidORname,
          order_by: orderby,
          serv_display: SERVdisplay,
          calls_display: CALLSdisplay,
          phone_display: PHONEdisplay,
          session_id_display: SESSIONIDdisplay,
          cust_phone_display: CUSTPHONEdisplay,
          with_inbound: with_inbound,
          monitor_active: monitor_active,
          monitor_phone: monitor_phone,
          all_ingroup_stats: ALLINGROUPstats,
          rr: RR,
          drop_ingroup_stats: DROPINGROUPstats,
          no_leads_alert: NOLEADSalert,
          carrier_stats: CARRIERstats,
          preset_stats: PRESETstats,
          agent_time_stats: AGENTtimeSTATS
        };

        // xmlhttp.open(
        //   "GET",
        //   "http://127.0.0.1:8000/api/DashboardR/update",
        //   true
        // );
        // xmlhttp.setRequestHeader(
        //   "Content-Type",
        //   "application/x-www-form-urlencoded; charset=UTF-8"
        // );
        // console.log(RTupdate_query);
        // xmlhttp.send(RTupdate_query);

        console.log("======================");
        console.log(this.props);
        console.log(this.props);
        let path = this.props.history
          ? this.props.history.location.pathname.split("/")[2]
          : "";
        console.log("***********************");
        console.log(path);
        let _this = this;
        if (path == "dashboard") {
          axios
            .post(API_FETCH_DASHBORD_REALTIME_DATA, RTupdate_query_new)
            .then(res => {
              _this.setState({
                agents_call_list: res.data.data.agents_call_list,
                live_agents: res.data.data.live_agents,
                campaign_statuses: res.data.data.campaign_statuses,
                live_calls_table_values: res.data.data.live_calls_table_values,
                live_calls_table_header: res.data.data.live_calls_table_header,
                live_calls_list: res.data.data.live_calls_list,
                agents_list: res.data.data.agents_list,
                stat_table: res.data.data.stat_table
                  ? res.data.data.stat_table
                  : []
              });
              console.log("AAAAAAAAAAAa");
              console.log(_this.state.agents_call_list);
            })
            .catch(function(error) {
              console.log(error);
            });
        }
        //  xmlhttp.onreadystatechange = function() {
        //   if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        //     // document.getElementById("realtime_content").innerHTML =
        //     //   xmlhttp.responseText;
        //     //$("#generic").fadeIn("slow").fadeOut(3000);
        //     /*   if ($("#toggle-stat-btn").data('hide'))
        //                     {
        //                         $("#stat-table-div").hide();
        //                     }
        //                     if (showhide == 1)
        //                     {
        //                         $("#stat-table-new").fadeIn(3000);
        //                     }
        //                     else
        //                     {
        //                         $("#stat-table-new").fadeOut(3000);
        //                     }
        //                     if(typeof popup_windows !== 'undefined') {
        //                         $.each(popup_windows, function() {
        //                             if (!this.closed)
        //                             {
        //                                 this.update_value();
        //                             }
        //                         });
        //                     }*/
        //   }
        // };
        //delete xmlhttp;
      }
    }
  }

  update_variables_new = (task_option, task_choice, force_reload) => {
    let adastats = this.state.adastats;
    let UGdisplay = this.state.UGdisplay;
    let SERVdisplay = this.state.SERVdisplay;
    let CALLSdisplay = this.state.CALLSdisplay;
    let PHONEdisplay = this.state.PHONEdisplay;
    let SESSIONIDdisplay = this.state.SESSIONIDdisplay;
    let CUSTPHONEdisplay = this.state.CUSTPHONEdisplay;
    let ALLINGROUPstats = this.state.ALLINGROUPstats;

    task_option == "adastats" &&
      (adastats == "1"
        ? this.setState({ adastats: 2 })
        : this.setState({ adastats: 1 }));

    task_option == "UGdisplay" &&
      (UGdisplay == "1"
        ? this.setState({ UGdisplay: 0 })
        : this.setState({ UGdisplay: 1 }));

    task_option == "SERVdisplay" &&
      (SERVdisplay == "1"
        ? this.setState({ SERVdisplay: 0 })
        : this.setState({ SERVdisplay: 1 }));

    task_option == "CALLSdisplay" &&
      (CALLSdisplay == "1"
        ? this.setState({ CALLSdisplay: 0 })
        : this.setState({ CALLSdisplay: 1 }));

    task_option == "PHONEdisplay" &&
      (PHONEdisplay == "1"
        ? this.setState({ PHONEdisplay: 0 })
        : this.setState({ PHONEdisplay: 1 }));

    task_option == "SESSIONIDdisplay" &&
      (SESSIONIDdisplay == "1"
        ? this.setState({ SESSIONIDdisplay: 0 })
        : this.setState({ SESSIONIDdisplay: 1 }));

    task_option == "CUSTPHONEdisplay" &&
      (CUSTPHONEdisplay == "1"
        ? this.setState({ CUSTPHONEdisplay: 0 })
        : this.setState({ CUSTPHONEdisplay: 1 }));

    task_option == "ALLINGROUPstats" &&
      (ALLINGROUPstats == "1"
        ? this.setState({ ALLINGROUPstats: 0 })
        : this.setState({ ALLINGROUPstats: 1 }));

    console.log("============");
    console.log(this.state);
    console.log("============");
  };
  update_variables(task_option, task_choice, force_reload) {
    if (task_option == "SIPmonitorLINK") {
      if (SIPmonitorLINK == "1") {
        SIPmonitorLINK = "0";
      } else {
        SIPmonitorLINK = "1";
      }
    }
    if (task_option == "IAXmonitorLINK") {
      if (IAXmonitorLINK == "1") {
        IAXmonitorLINK = "0";
      } else {
        IAXmonitorLINK = "1";
      }
    }
    if (task_option == "UidORname") {
      if (UidORname == "1") {
        UidORname = "0";
      } else {
        UidORname = "1";
      }
    }
    if (task_option == "orderby") {
      if (task_choice == "phone") {
        if (orderby == "phoneup") {
          orderby = "phonedown";
        } else {
          orderby = "phoneup";
        }
      }
      if (task_choice == "user") {
        if (orderby == "userup") {
          orderby = "userdown";
        } else {
          orderby = "userup";
        }
      }
      if (task_choice == "group") {
        if (orderby == "groupup") {
          orderby = "groupdown";
        } else {
          orderby = "groupup";
        }
      }
      if (task_choice == "time") {
        if (orderby == "timeup") {
          orderby = "timedown";
        } else {
          orderby = "timeup";
        }
      }
      if (task_choice == "campaign") {
        if (orderby == "campaignup") {
          orderby = "campaigndown";
        } else {
          orderby = "campaignup";
        }
      }
    }
    if (task_option == "adastats") {
      if (adastats == "1") {
        adastats = "2";
        document.getElementById("adastatsTXT").innerHTML = "- VIEW LESS";
      } else {
        adastats = "1";
        document.getElementById("adastatsTXT").innerHTML = "+ VIEW MORE";
      }
    }
    if (task_option == "UGdisplay") {
      if (UGdisplay == "1") {
        UGdisplay = "0";
        document.getElementById("UGdisplayTXT").innerHTML = "SHOW AGENT GROUP";
      } else {
        UGdisplay = "1";
        document.getElementById("UGdisplayTXT").innerHTML = "HIDE AGENT GROUP";
      }
    }
    if (task_option == "SERVdisplay") {
      if (SERVdisplay == "1") {
        SERVdisplay = "0";
        document.getElementById("SERVdisplayTXT").innerHTML =
          "SHOW SERVER INFO";
      } else {
        SERVdisplay = "1";
        document.getElementById("SERVdisplayTXT").innerHTML =
          "HIDE SERVER INFO";
      }
    }
    if (task_option == "CALLSdisplay") {
      if (CALLSdisplay == "1") {
        CALLSdisplay = "0";
        document.getElementById("CALLSdisplayTXT").innerHTML =
          "SHOW WAITING CALLS";
      } else {
        CALLSdisplay = "1";
        document.getElementById("CALLSdisplayTXT").innerHTML =
          "HIDE WAITING CALLS";
      }
    }
    if (task_option == "PHONEdisplay") {
      if (PHONEdisplay == "1") {
        PHONEdisplay = "0";
        document.getElementById("PHONEdisplayTXT").innerHTML = "SHOW PHONES";
      } else {
        PHONEdisplay = "1";
        document.getElementById("PHONEdisplayTXT").innerHTML = "HIDE PHONES";
      }
    }
    if (task_option == "SESSIONIDdisplay") {
      if (SESSIONIDdisplay == "1") {
        SESSIONIDdisplay = "0";
        document.getElementById("SESSIONIDdisplayTXT").innerHTML =
          "SHOW SESSIONID";
      } else {
        SESSIONIDdisplay = "1";
        document.getElementById("SESSIONIDdisplayTXT").innerHTML =
          "HIDE SESSIONID";
      }
    }
    if (task_option == "CUSTPHONEdisplay") {
      if (CUSTPHONEdisplay == "1") {
        CUSTPHONEdisplay = "0";
        document.getElementById("CUSTPHONEdisplayTXT").innerHTML =
          "SHOW CUSTPHONES";
      } else {
        CUSTPHONEdisplay = "1";
        document.getElementById("CUSTPHONEdisplayTXT").innerHTML =
          "HIDE CUSTPHONES";
      }
    }
    if (task_option == "ALLINGROUPstats") {
      if (ALLINGROUPstats == "1") {
        ALLINGROUPstats = "0";
        document.getElementById("ALLINGROUPstatsTXT").innerHTML =
          "SHOW IN-GROUP STATS";
      } else {
        ALLINGROUPstats = "1";
        document.getElementById("ALLINGROUPstatsTXT").innerHTML =
          "HIDE IN-GROUP STATS";
      }
    }
    if (task_option == "showhide") {
      if (showhide == "1") {
        showhide = "0";

        document.getElementById("showhideTXT").innerHTML = "Show Panel";
      } else {
        showhide = "1";

        document.getElementById("showhideTXT").innerHTML = "Hide Panel";
      }
    }
    if (task_option == "form_submit") {
      var RRFORM = document.getElementById("RR");
      RR = RRFORM[RRFORM.selectedIndex].value;
      ar_refresh = RR;
      ar_seconds = RR;
      var with_inboundFORM = document.getElementById("with_inbound");
      with_inbound = with_inboundFORM[with_inboundFORM.selectedIndex].value;
      var monitor_activeFORM = document.getElementById("monitor_active");
      monitor_active =
        monitor_activeFORM[monitor_activeFORM.selectedIndex].value;
      var DROPINGROUPstatsFORM = document.getElementById("DROPINGROUPstats");
      DROPINGROUPstats =
        DROPINGROUPstatsFORM[DROPINGROUPstatsFORM.selectedIndex].value;
      var NOLEADSalertFORM = document.getElementById("NOLEADSalert");
      NOLEADSalert = NOLEADSalertFORM[NOLEADSalertFORM.selectedIndex].value;
      var CARRIERstatsFORM = document.getElementById("CARRIERstats");
      CARRIERstats = CARRIERstatsFORM[CARRIERstatsFORM.selectedIndex].value;
      var AGENTtimeSTATSFORM = document.getElementById("AGENTtimeSTATS");
      AGENTtimeSTATS =
        AGENTtimeSTATSFORM[AGENTtimeSTATSFORM.selectedIndex].value;
      var temp_monitor_phone = document.getElementById("monitor_phone").value;
      var temp_camp_choices = "";
      var selCampVal = [];

      var i;
      var count = 0;
      var selected_all = 0;
      if (selCampVal != null) {
        for (i = 0; i < selCampVal.length; i++) {
          if (selCampVal[i] && selected_all < 1) {
            temp_camp_choices =
              temp_camp_choices + "&groups[]=" + selCampVal[i];
            count++;
            if (selCampVal[i] == "ALL-ACTIVE") {
              selected_all++;
            }
          }
        }
      }
      groupQS = temp_camp_choices;

      var temp_usergroup_choices = "";
      var selCampObj = document.getElementById("user_group_filter[]");
      var i;
      var count = 0;
      var selected_all = 0;
      for (i = 0; i < selCampObj.options.length; i++) {
        if (selCampObj.options[i].selected && selected_all < 1) {
          temp_usergroup_choices =
            temp_usergroup_choices +
            "&user_group_filter[]=" +
            selCampObj.options[i].value;
          count++;
          if (selCampObj.options[i].value == "ALL-ACTIVE") {
            selected_all++;
          }
        }
      }
      usergroupQS = temp_usergroup_choices;
      hideDiv("campaign_select_list");
      if (
        temp_monitor_phone != monitor_phone ||
        force_reload == "YES" ||
        ((monitor_active == "BARGE" ||
          monitor_active == "MONITOR" ||
          monitor_active == "") &&
          temp_monitor_phone != "")
      ) {
        /*Changes By Krishna[S]*/
        monitorActiveQS = "&monitor_active=" + monitor_active;
        if (temp_monitor_phone == "") {
          groupQS = "";
          monitorActiveQS = "";
        }

        reload_url =
          "<?php echo $this->name; ?>" +
          "?RR=" +
          RR +
          groupQS +
          "&adastats=" +
          adastats +
          "&SIPmonitorLINK=" +
          SIPmonitorLINK +
          "&IAXmonitorLINK=" +
          IAXmonitorLINK +
          "&usergroup=" +
          usergroup +
          "&UGdisplay=" +
          UGdisplay +
          "&UidORname=" +
          UidORname +
          "&orderby=" +
          orderby +
          "&SERVdisplay=" +
          SERVdisplay +
          "&CALLSdisplay=" +
          CALLSdisplay +
          "&PHONEdisplay=" +
          PHONEdisplay +
          "&CUSTPHONEdisplay=" +
          CUSTPHONEdisplay +
          "&with_inbound=" +
          with_inbound +
          monitorActiveQS +
          "&monitor_phone=" +
          temp_monitor_phone +
          "&ALLINGROUPstats=" +
          ALLINGROUPstats +
          "&DROPINGROUPstats=" +
          DROPINGROUPstats +
          "&NOLEADSalert=" +
          NOLEADSalert +
          "&CARRIERstats=" +
          CARRIERstats +
          "&PRESETstats=" +
          PRESETstats +
          "&AGENTtimeSTATS=" +
          AGENTtimeSTATS +
          "";
        window.location.href = reload_url;
        /*Changes By Krishna[E]*/
      }
      document.getElementById("monitor_phone").value;
    }
    gather_realtime_content();
  }
  changeToggle = event => {
    event.preventDefault();
    var x = document.getElementById("dropdown-menu-show");
    if (x.style.display === "none" || x.style.display === "") {
      x.style.display = "block";
    } else {
      x.style.display = "none";
    }
  };
  render() {
    const options = [
      { label: "bug", value: 1 },
      { label: "feature", value: 2 },
      { label: "documents", value: 3 },
      { label: "discussion", value: 4 }
    ];
    const { classes, theme } = this.props;

    const liStyle = 'marginLeft:"14px"';
    const {
      items,
      selectedItems,
      selectedItemsArray,
      with_inbound,
      PRESETstats,
      DROPINGROUPstats,
      AGENTtimeSTATS,
      NOLEADSalert,
      CARRIERstats
    } = this.state;
    const { campaign_statuses } = this.state;
    console.log("=======================");
    console.log(campaign_statuses);
    return (
      <div className="dashboard animated slideInUpTiny animation-duration-3">
        <div
          className={{
            display: "flex",
            flexWrap: "wrap"
          }}
        />
        {/* <div className="row">
          <div className="col-lg-12">
            <div className="jr-card">
              <CardHeader
                heading={<IntlMessages id="dashboard.popularArticles" />}
                subHeading={<IntlMessages id="dashboard.loremIpsum" />}
                styleName="mb-0"
              />

              <div className="jr-card-body">
                <div className="row" />
              </div>
            </div>
          </div>
        </div> */}
        <div className="row">
          <div id="real-time-report-container" className="container-fluid">
            <table
              cellPadding={4}
              cellSpacing={0}
              width="100%"
              style={{ marginTop: 5 }}
            >
              <tbody>
                <tr>
                  <td>
                    <form
                      action="/index.php"
                      method="GET"
                      name="REALTIMEform"
                      id="REALTIMEform"
                      className="ng-pristine ng-valid"
                    >
                      <input type="HIDDEN" name="cursorX" id="cursorX" />
                      <input type="HIDDEN" name="cursorY" id="cursorY" />
                      <div className="row realtime-header">
                        <div className="col-md-8">
                          <div className="btn-group hidden-phone hidden-tablet">
                            <a
                              id="toggle-options-btn"
                              onClick={this.changeToggle}
                              href="javascript:void(0)"
                              className="btn btn-ccc btn-font-white dropdown-toggle"
                              data-toggle="dropdown"
                              href="JavaScript:void(0);"
                              style={{ paddingLeft: "0px" }}
                            >
                              <i
                                style={{}}
                                className="icon-filter icon-white"
                              />
                              <button
                                type="button"
                                className="btn drop"
                                style={{ background: "#f1f4f6" }}
                              >
                                Options
                                <span className="caret" />
                              </button>
                            </a>

                            <ul
                              className="dropdown-menu"
                              id="dropdown-menu-show"
                            >
                              <li id="webphone_visibility" />
                              <li style={{ marginLeft: "14px" }}>
                                <a
                                  href="JavaScript:void(0);"
                                  onClick={e =>
                                    this.update_variables_new("adastats", "")
                                  }
                                >
                                  <span id="adastatsTXT">
                                    {" "}
                                    {this.state.adastats == 2
                                      ? "- VIEW LESS"
                                      : "+ VIEW MORE"}
                                  </span>
                                </a>
                              </li>
                              <li style={{ marginLeft: "14px" }}>
                                <a
                                  href="JavaScript:void(0);"
                                  onClick={e =>
                                    this.update_variables_new("UGdisplay", "")
                                  }
                                >
                                  <span id="UGdisplayTXT">
                                    {this.state.UGdisplay == 1
                                      ? "Hide AGENT GROUP "
                                      : "SHOW AGENT GROUP"}
                                  </span>
                                </a>
                              </li>
                              <li style={{ marginLeft: "14px" }}>
                                <a
                                  href="JavaScript:void(0);"
                                  onClick={e =>
                                    this.update_variables_new("SERVdisplay", "")
                                  }
                                >
                                  <span id="SERVdisplayTXT">
                                    {this.state.SERVdisplay == 1
                                      ? " Hide  SERVER INFO"
                                      : " SHOW SERVER INFO"}
                                  </span>
                                </a>
                              </li>
                              <li style={{ marginLeft: "14px" }}>
                                <a
                                  href="JavaScript:void(0);"
                                  onClick={e =>
                                    this.update_variables_new(
                                      "CALLSdisplay",
                                      ""
                                    )
                                  }
                                >
                                  <span id="CALLSdisplayTXT">
                                    {this.state.CALLSdisplay == 0
                                      ? "SHOW WAITING CALLS"
                                      : "HIDE WAITING CALLS"}
                                  </span>
                                </a>
                              </li>
                              <li style={{ marginLeft: "14px" }}>
                                <a
                                  href="JavaScript:void(0);"
                                  onClick={e =>
                                    this.update_variables_new(
                                      "ALLINGROUPstats",
                                      ""
                                    )
                                  }
                                >
                                  <span id="ALLINGROUPstatsTXT">
                                    {this.state.ALLINGROUPstats == 1
                                      ? "HIDE IN-GROUP STATS"
                                      : "SHOW IN-GROUP STATS"}
                                  </span>
                                </a>
                              </li>
                              <li style={{ marginLeft: "14px" }}>
                                <a
                                  href="JavaScript:void(0);"
                                  onClick={e =>
                                    this.update_variables_new(
                                      "PHONEdisplay",
                                      ""
                                    )
                                  }
                                >
                                  <span id="PHONEdisplayTXT">
                                    {this.state.PHONEdisplay == 0
                                      ? "SHOW PHONES "
                                      : "HIDE PHONES "}
                                  </span>
                                </a>
                              </li>
                              <li style={{ marginLeft: "14px" }}>
                                <a
                                  href="JavaScript:void(0);"
                                  onClick={e =>
                                    this.update_variables_new(
                                      "CUSTPHONEdisplay",
                                      ""
                                    )
                                  }
                                >
                                  <span id="CUSTPHONEdisplayTXT">
                                    {this.state.CUSTPHONEdisplay == 0
                                      ? "SHOW CUSTPHONES"
                                      : "HIDE CUSTPHONES"}
                                  </span>
                                </a>
                              </li>
                              <li style={{ marginLeft: "14px" }}>
                                <a
                                  href="JavaScript:void(0);"
                                  onClick={e =>
                                    this.update_variables_new(
                                      "SESSIONIDdisplay",
                                      ""
                                    )
                                  }
                                >
                                  <span id="SESSIONIDdisplayTXT">
                                    {this.state.SESSIONIDdisplay == 0
                                      ? "SHOW SESSIONID"
                                      : "HIDE SESSIONID"}
                                  </span>
                                </a>
                              </li>
                            </ul>
                          </div>

                          <a
                            style={{
                              margin: "0px",
                              marginRight: "-23px",
                              marginLeft: "-23px"
                            }}
                            className="btn btn-ccc btn-font-white left-class"
                            href="JavaScript:void(0);"
                            id="hidebtn"
                          >
                            <button
                              type="button"
                              className="btn"
                              style={{ background: "#f1f4f6" }}
                              onClick={this.handledOpenAudioManagerDialog}
                              id="editPanelTXT"
                            >
                              Edit Panel
                            </button>
                          </a>

                          <Dialog
                            maxWidth="md"
                            fullWidth={true}
                            open={this.state.audio_dialog}
                            TransitionComponent={Transition}
                          >
                            <DialogTitle>
                              Choose Report Display Options
                            </DialogTitle>
                            <Divider />
                            <DialogContent>
                              <div className="w-100">
                                <div>
                                  <div>
                                    <div style={{ height: "25px" }} />
                                    <form
                                      className="row"
                                      noValidate
                                      autoComplete="off"
                                    >
                                      <div className="col-md-6 col-6">
                                        <div className="row">
                                          <div className="col-md-12 col-12">
                                            <FormControl
                                              className="w-100 mb-2"
                                              error
                                            >
                                              <InputLabel htmlFor="age-simple">
                                                Select User Groups
                                              </InputLabel>
                                              <MultiSelect
                                                items={items}
                                                selectedItems={selectedItems}
                                                onChange={this.handleChanges}
                                                selected={selectedItemsArray}
                                                showSelectedItems={0}
                                                value=""
                                                SelectAll={1}
                                                Height={250}
                                              />
                                            </FormControl>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="col-md-6 col-6">
                                        <div className="row">
                                          <div className="col-md-12 col-12">
                                            <FormControl className="w-100 mb-2">
                                              <InputLabel htmlFor="age-simple">
                                                Inbound
                                              </InputLabel>
                                              <Select
                                                onChange={this.handleTextChange(
                                                  "with_inbound"
                                                )}
                                                value={with_inbound}
                                                input={
                                                  <Input id="age-simple" />
                                                }
                                              >
                                                {with_inbound_data.map(
                                                  option => (
                                                    <option
                                                      key={option.value}
                                                      value={option.value}
                                                    >
                                                      {option.label}
                                                    </option>
                                                  )
                                                )}
                                              </Select>
                                              <FormHelperText />
                                            </FormControl>
                                          </div>

                                          <div className="col-md-12 col-12">
                                            <FormControl className="w-100 mb-2">
                                              <InputLabel htmlFor="age-simple">
                                                Show Presets Stats
                                              </InputLabel>
                                              <Select
                                                onChange={this.handleTextChange(
                                                  "PRESETstats"
                                                )}
                                                value={PRESETstats}
                                                input={
                                                  <Input id="age-simple" />
                                                }
                                              >
                                                {PRESETstats_data.map(
                                                  option => (
                                                    <option
                                                      key={option.value}
                                                      value={option.value}
                                                    >
                                                      {option.label}
                                                    </option>
                                                  )
                                                )}
                                              </Select>
                                              <FormHelperText />
                                            </FormControl>
                                          </div>

                                          <div className="col-md-12 col-12">
                                            <FormControl className="w-100 mb-2">
                                              <InputLabel htmlFor="age-simple">
                                                Show Drop In-Group Row
                                              </InputLabel>
                                              <Select
                                                onChange={this.handleTextChange(
                                                  "DROPINGROUPstats"
                                                )}
                                                value={DROPINGROUPstats}
                                                input={
                                                  <Input id="age-simple" />
                                                }
                                              >
                                                {DROPINGROUPstats_data.map(
                                                  option => (
                                                    <option
                                                      key={option.value}
                                                      value={option.value}
                                                    >
                                                      {option.label}
                                                    </option>
                                                  )
                                                )}
                                              </Select>
                                              <FormHelperText />
                                            </FormControl>
                                          </div>

                                          <div className="col-md-12 col-12">
                                            <FormControl className="w-100 mb-2">
                                              <InputLabel htmlFor="age-simple">
                                                Agent Time Stats
                                              </InputLabel>
                                              <Select
                                                onChange={this.handleTextChange(
                                                  "AGENTtimeSTATS"
                                                )}
                                                value={AGENTtimeSTATS}
                                                input={
                                                  <Input id="age-simple" />
                                                }
                                              >
                                                {AGENTtimeSTATS_data.map(
                                                  option => (
                                                    <option
                                                      key={option.value}
                                                      value={option.value}
                                                    >
                                                      {option.label}
                                                    </option>
                                                  )
                                                )}
                                              </Select>
                                              <FormHelperText />
                                            </FormControl>
                                          </div>

                                          <div className="col-md-12 col-12">
                                            <FormControl className="w-100 mb-2">
                                              <InputLabel htmlFor="age-simple">
                                                Show Carrier Stats
                                              </InputLabel>
                                              <Select
                                                value={CARRIERstats}
                                                onChange={this.handleTextChange(
                                                  "CARRIERstats"
                                                )}
                                                input={
                                                  <Input id="age-simple" />
                                                }
                                              >
                                                {CARRIERstats_data.map(
                                                  option => (
                                                    <option
                                                      key={option.value}
                                                      value={option.value}
                                                    >
                                                      {option.label}
                                                    </option>
                                                  )
                                                )}
                                              </Select>
                                            </FormControl>
                                          </div>

                                          <div className="col-lg-12 col-sm-12 col-12">
                                            <FormControl className="w-100 mb-2">
                                              <InputLabel htmlFor="age-simple">
                                                Dialable Leads Alert
                                              </InputLabel>
                                              <Select
                                                value={NOLEADSalert}
                                                onChange={this.handleTextChange(
                                                  "NOLEADSalert"
                                                )}
                                                input={
                                                  <Input id="age-simple" />
                                                }
                                              >
                                                {NOLEADSalert_data.map(
                                                  option => (
                                                    <option
                                                      key={option.value}
                                                      value={option.value}
                                                    >
                                                      {option.label}
                                                    </option>
                                                  )
                                                )}
                                              </Select>
                                              <FormHelperText />
                                            </FormControl>
                                          </div>
                                        </div>
                                      </div>
                                    </form>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                            <DialogActions>
                              <Button
                                onClick={this.handledOpenAudioManagerDialog}
                                color="secondary"
                                className="jr-btn bg-grey text-white"
                              >
                                Close
                              </Button>
                            </DialogActions>
                          </Dialog>

                          <a
                            style={{ margin: "0px" }}
                            className="btn btn-ccc btn-font-white left-class"
                            href="JavaScript:void(0);"
                            id="hidebtn"
                          >
                            <button
                              type="button"
                              className="btn"
                              id="showhideTXT"
                              style={{ background: "#f1f4f6" }}
                              onClick={this.hideshowDiv}
                            >
                              {this.state.hideInfoDiv ? "Show" : "Hide"} Panel
                            </button>
                          </a>
                          <span
                            id="generic"
                            style={{ display: "inline", opacity: "0.743625" }}
                          />
                        </div>
                        <div className="col-md-4">
                          <div
                            className="counter hidden-phone hidden-tablet"
                            style={{ float: "right", margin: 6 }}
                          >
                            <font color="#069">
                              <span
                                title="Reload Now"
                                style={{ zIndex: 20, cursor: "pointer" }}
                                className="fa fa-circle-o-notch fa-spin"
                              />
                              <b>
                                <span style={{ color: "#666" }} />
                              </b>
                            </font>
                          </div>
                        </div>
                      </div>
                      <b>
                        <span
                          style={{
                            position: "absolute",
                            left: 10,
                            top: 120,
                            zIndex: 14
                          }}
                          id="agent_ingroup_display"
                        />
                        <div id="options-btn" className="status-block" />

                        <div
                          id="stat-table-new"
                          style={
                            this.state.hideInfoDiv
                              ? { display: "none" }
                              : { display: "block" }
                          }
                        >
                          <div
                            id="dash-stats"
                            style={{ height: "auto" }}
                            className="row"
                          >
                            <div
                              style={{ height: "auto", display: "block" }}
                              className="dashboard col-sm-12 ready tile-pop"
                              style={{ display: "flex" }}
                            >
                              <div
                                className="widget tile-stats col-md-3 tile-pop tile-red"
                                style={{
                                  display: "block",
                                  background: "rgb(241, 244, 246)",
                                  overflow: "unset !important",
                                  borderBottom: "4px solid red"
                                }}
                                id="SelectCampUDiv"
                              >
                                <div
                                  className="select-class"
                                  style={{
                                    backgroundColor: "white !important"
                                  }}
                                  id="SelectCampDiv"
                                >
                                  <FormControl>
                                    <InputLabel
                                      htmlFor="select-multiple-checkbox"
                                      id="Campaigns_lable"
                                      style={{ marginTop: "15px" }}
                                    >
                                      Campaigns
                                    </InputLabel>
                                    <Select
                                      multiple
                                      value={this.state.name}
                                      onChange={this.handleChange1}
                                      input={
                                        <Input id="select-multiple-checkbox" />
                                      }
                                      renderValue={selected =>
                                        selected.join(", ")
                                      }
                                      MenuProps={MenuProps}
                                      style={{
                                        width: "500px",
                                        marginTop: "6%"
                                      }}
                                      className="RR_value"
                                    >
                                      {this.state.camp_only &&
                                        this.state.camp_only.map(name => (
                                          <MenuItem key={name} value={name}>
                                            <Checkbox
                                              color="primary"
                                              checked={
                                                this.state.name.indexOf(name) >
                                                -1
                                              }
                                            />
                                            <ListItemText primary={name} />
                                          </MenuItem>
                                        ))}
                                    </Select>
                                  </FormControl>
                                  {/* <FormControl className="w-100 mb-2">
                                    <InputLabel htmlFor="age-simple">
                                      From Campaign ID
                                    </InputLabel>
                                    <Select
                                      value={this.state.SelectedCampList}
                                      onChange={this.handleTextChange(
                                        "SelectedCampList"
                                      )}
                                      input={<Input id="age-simple" />}
                                    >
                                      <MenuItem value="ALL-ACTIVE">
                                        ALL-ACTIVE
                                      </MenuItem>
                                      {this.state.camp_list &&
                                        this.state.camp_list.map(option => (
                                          <MenuItem
                                            key={option.campaign_id}
                                            value={option.campaign_id}
                                          >
                                            {" "}
                                            {option.campaign_id} -{" "}
                                            {option.campaign_name}
                                          </MenuItem>
                                        ))}
                                    </Select>
                                  </FormControl> */}
                                </div>
                              </div>
                              <div
                                style={{
                                  display: "block",
                                  background: "rgb(241, 244, 246)",
                                  borderBottom: "4px solid #036"
                                }}
                                className="widget tile-stats col-md-3 tile-blue"
                              >
                                <FormControl className="w-100 mb-2">
                                  <TextField
                                    //onChange={this.handleTextChange("RR")}
                                    onChange={this.handleRefreshChange("RR")}
                                    value={this.state.RR}
                                    input={<Input id="age-simple" />}
                                    id="RR"
                                    select
                                    fullWidth
                                    label="Screen Refresh"
                                    margin="normal"
                                    id="TEST"
                                  >
                                    {screen_refresh_data.map((option, i) => (
                                      <MenuItem key={i} value={option.value}>
                                        {option.name}
                                      </MenuItem>
                                    ))}
                                  </TextField>

                                  <FormHelperText />
                                </FormControl>
                              </div>
                              <div
                                style={{
                                  display: "block",
                                  background: "rgb(241, 244, 246)",
                                  borderBottom: "4px solid green"
                                }}
                                className="widget tile-stats col-md-3 tile-green"
                              >
                                <FormControl className="w-100 mb-2">
                                  <TextField
                                    //onChange={this.handleTextChange("RR")}
                                    onChange={this.handleTextChange(
                                      "monitor_active"
                                    )}
                                    value={this.state.monitor_active}
                                    input={<Input id="age-simple" />}
                                    id="monitor_active"
                                    select
                                    fullWidth
                                    label="Monitor"
                                    margin="normal"
                                  >
                                    <MenuItem value="NONE">NONE</MenuItem>
                                    <MenuItem value="MONITOR">MONITOR</MenuItem>
                                    <MenuItem value="BARGE">BARGE</MenuItem>
                                  </TextField>
                                  <FormHelperText />
                                </FormControl>
                              </div>
                              <div
                                style={{
                                  display: "block",
                                  background: "rgb(241, 244, 246)",
                                  borderBottom: "4px solid orange"
                                }}
                                className="widget tile-stats col-md-3 tile-orange"
                              >
                                <TextField
                                  id="campaign-monitor_phone"
                                  onChange={this.handleTextChange(
                                    "monitor_phone"
                                  )}
                                  label="Phone"
                                  value={this.state.monitor_phone}
                                  margin="normal"
                                  placeholder="999-999-9999"
                                  fullWidth
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <span id="realtime_content" name="realtime_content">
                          {/* ajax-mode */}
                          {!this.state.hideInfoDiv && (
                            <Paper>
                              <div
                                id="stat-table-div"
                                className="hidden-phone hidden-tablet"
                              >
                                <div className="panel panel-primary">
                                  <div className="panel-heading">
                                    <div className="panel-options">
                                      {" "}
                                      {/*<a href="#sample-modal" data-toggle="modal" data-target="#sample-modal-dialog-1" className="bg"><i className="entypo-cog"></i></a>
                                                <a href="JavaScript:void(0);" data-rel="collapse"><i className="entypo-down-open"></i></a>
                                                <a href="JavaScript:void(0);" data-rel="reload"><i className="entypo-arrows-ccw"></i></a>
                                                <a href="JavaScript:void(0);" data-rel="close"><i className="entypo-cancel"></i></a>*/}
                                    </div>
                                  </div>
                                  <table
                                    id="stat-table"
                                    cellPadding={0}
                                    cellSpacing={0}
                                    className="table table-bordered stat-table"
                                  >
                                    <tbody>
                                      <tr>
                                        <td>DIAL LEVEL:</td>
                                        <td align="LEFT">
                                          {campaign_statuses
                                            ? campaign_statuses.dial_level
                                            : ""}
                                        </td>
                                        <td>FILTER:</td>
                                        <td align="LEFT">
                                          {" "}
                                          {campaign_statuses
                                            ? campaign_statuses.dial_filter
                                            : ""}
                                        </td>
                                        <td>ORDER:</td>
                                        <td align="LEFT">
                                          {" "}
                                          {campaign_statuses
                                            ? campaign_statuses.dial_order
                                            : ""}{" "}
                                        </td>
                                      </tr>
                                      {campaign_statuses.adaptive_maximum_level && (
                                        <React.Fragment>
                                          <tr bgcolor="#CCCCCC">
                                            <td>MAX LEVEL:</td>
                                            <td align="LEFT">
                                              {" "}
                                              {campaign_statuses
                                                ? campaign_statuses.adaptive_maximum_level
                                                : ""}{" "}
                                            </td>
                                            <td>DROPPED MAX :</td>
                                            <td align="LEFT">
                                              {campaign_statuses
                                                ? campaign_statuses.adaptive_dropped_percentage
                                                : ""}{" "}
                                            </td>
                                            <td>TARGET DIFF: </td>
                                            <td align="LEFT">
                                              {" "}
                                              {campaign_statuses
                                                ? campaign_statuses.adaptive_dl_diff_target
                                                : ""}{" "}
                                            </td>
                                            <td>INTENSITY: </td>
                                            <td align="LEFT">
                                              {" "}
                                              {campaign_statuses
                                                ? campaign_statuses.adaptive_intensity
                                                : ""}{" "}
                                            </td>
                                          </tr>
                                          <tr bgcolor="#CCCCCC">
                                            <td>DIAL TIMEOUT:</td>
                                            <td align="LEFT">
                                              {" "}
                                              {campaign_statuses
                                                ? campaign_statuses.dial_timeout
                                                : ""}{" "}
                                            </td>
                                            <td>TAPER TIME :</td>
                                            <td align="LEFT">
                                              {campaign_statuses
                                                ? campaign_statuses.adaptive_latest_server_time
                                                : ""}{" "}
                                            </td>
                                            <td>LOCAL TIME: </td>
                                            <td align="LEFT">
                                              {" "}
                                              {campaign_statuses
                                                ? campaign_statuses.local_call_time
                                                : ""}{" "}
                                            </td>
                                            <td>AVAIL ONLY: </td>
                                            <td align="LEFT">
                                              {" "}
                                              {campaign_statuses
                                                ? campaign_statuses.available_only_ratio_tally
                                                : ""}{" "}
                                            </td>
                                          </tr>
                                        </React.Fragment>
                                      )}

                                      <tr>
                                        <td>DIALABLE LEADS:</td>
                                        <td align="LEFT">
                                          {" "}
                                          {campaign_statuses
                                            ? campaign_statuses.dialable_leads
                                            : ""}{" "}
                                        </td>
                                        <td>CALLS TODAY:</td>
                                        <td align="LEFT">
                                          {campaign_statuses
                                            ? campaign_statuses.calls_today
                                            : ""}{" "}
                                        </td>
                                        <td>DIAL METHOD:</td>
                                        <td align="LEFT">
                                          {" "}
                                          {campaign_statuses
                                            ? campaign_statuses.dial_method
                                            : ""}{" "}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>DROPPED / ANSWERED:</td>
                                        <td align="LEFT">
                                          {" "}
                                          {campaign_statuses
                                            ? campaign_statuses.drops_today
                                            : ""}{" "}
                                          /{" "}
                                          {campaign_statuses
                                            ? campaign_statuses.answers_today
                                            : ""}
                                        </td>
                                        <td>STATUSES:</td>
                                        <td align="LEFT" colSpan={3}>
                                          {campaign_statuses
                                            ? campaign_statuses.dial_statuses
                                            : ""}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td width={200}>LEADS IN HOPPER:</td>
                                        <td align="LEFT">
                                          {" "}
                                          {campaign_statuses
                                            ? campaign_statuses.leads_in_hopper
                                            : ""}
                                        </td>
                                        <td width={200}>DROPPED PERCENT:</td>
                                        <td
                                          align="LEFT"
                                          nowrap="nowrap"
                                          width={200}
                                        >
                                          <div style={{ margin: 0 }}>
                                            <span
                                              className={
                                                "label " +
                                                campaign_statuses.lable
                                              }
                                              style={{
                                                height: 17,
                                                float: "left",
                                                width: 50,
                                                marginRight: 5,
                                                textAlign: "center"
                                              }}
                                            >
                                              {campaign_statuses
                                                ? campaign_statuses.drops_answers_today_pct
                                                : ""}
                                            </span>
                                            <div
                                              className="progress"
                                              id="prgbar"
                                            >
                                              <div
                                                title={
                                                  campaign_statuses
                                                    ? campaign_statuses.drops_answers_today_pct
                                                    : ""
                                                }
                                                className={
                                                  campaign_statuses.bar
                                                }
                                                style={{
                                                  width: campaign_statuses
                                                    ? campaign_statuses.drops_answers_today_pct
                                                    : ""
                                                }}
                                              />
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </Paper>
                          )}
                          <Paper>
                            <div
                              id="stat-table-div"
                              className="hidden-phone hidden-tablet"
                            >
                              <table
                                cellPadding={0}
                                cellSpacing={0}
                                width="100%"
                                className="table table-bordered"
                              >
                                <tbody>
                                  {this.state.stat_table != undefined &&
                                    this.state.stat_table.length != 0 &&
                                    this.state.stat_table.map((name, i) => (
                                      <React.Fragment>
                                        <tr
                                          bgcolor={
                                            i / 2 == 0 ? "#E6E6E6" : "white"
                                          }
                                        >
                                          <td>
                                            <b>{name.campaign_id}</b>
                                          </td>
                                          <td>
                                            <b>CALLS TODAY:</b>
                                          </td>
                                          <td align="LEFT">
                                            {name.calls_today}
                                          </td>
                                          <td>
                                            <b>TMA 1:</b>
                                          </td>
                                          <td align="LEFT">{name.tma_1} </td>
                                          <td>
                                            <b>
                                              Average Hold time for Answered
                                              Calls:
                                            </b>
                                          </td>
                                          <td align="LEFT">
                                            {" "}
                                            {name.average_hold_sec_answer_calls}
                                          </td>
                                        </tr>
                                        <tr bgcolor="#E6E6E6">
                                          <td align="LEFT" />
                                          <td>
                                            <b>DROPS TODAY:</b>
                                          </td>
                                          <td align="LEFT">
                                            {" "}
                                            {name.drops_today}
                                          </td>
                                          <td>
                                            <b>TMA 2:</b>
                                          </td>
                                          <td align="LEFT"> {name.tma_2}</td>
                                          <td>
                                            <b>
                                              Average Hold time for Dropped
                                              Calls:
                                            </b>
                                          </td>
                                          <td align="LEFT">
                                            {" "}
                                            {name.average_hold_sec_drop_calls}
                                          </td>
                                        </tr>
                                        <tr bgcolor="#E6E6E6">
                                          <td align="LEFT" />
                                          <td>
                                            <b>ANSWERS TODAY:</b>
                                          </td>
                                          <td align="LEFT">
                                            {" "}
                                            {name.answers_today}
                                          </td>
                                          <td>
                                            <b>DROP PERCENT:</b>
                                          </td>
                                          <td align="LEFT">
                                            {name.average_hold_sec_drop_calls}
                                          </td>
                                          <td>
                                            <b>
                                              Average Hold time for All Calls:
                                            </b>
                                          </td>
                                          <td align="LEFT">
                                            {" "}
                                            {name.average_hold_sec_answer_calls}
                                          </td>
                                        </tr>
                                      </React.Fragment>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </Paper>
                          <div className="row">
                            {this.state.live_calls_list.length != 0 &&
                              Object.keys(this.state.live_calls_list).map(
                                (name, i) => (
                                  <div
                                    className="col-lg-2 col-sm-4 col-12"
                                    key={i}
                                  >
                                    <ReportBox
                                      styleName={
                                        this.state.live_calls_list[name].class +
                                        " tile-stats text-white border-0"
                                      }
                                      title={
                                        this.state.live_calls_list[name].calls
                                      }
                                      detail={
                                        this.state.live_calls_list[name].name
                                      }
                                      subHeadingColor="text-white"
                                      subHeadingColor={
                                        this.state.live_calls_list[name]
                                          .class != "tile-gray"
                                          ? "text-white"
                                          : "black"
                                      }
                                    >
                                      <PieChart
                                        onMouseEnter={this.onPieEnter}
                                      />
                                    </ReportBox>
                                  </div>
                                )
                              )}
                          </div>
                          {this.state.live_calls_list.length == 0 && (
                            <Paper elevation={1}>
                              <div
                                className="alert alert-success"
                                style={{ marginBottom: "20px" }}
                              >
                                <strong>NO LIVE CALLS WAITING</strong>
                              </div>
                            </Paper>
                          )}
                          <div className="col-xs-12" style={{ height: 10 }} />
                          <div className="row">
                            {this.state.agents_call_list.length != 0 &&
                              Object.keys(this.state.agents_call_list).map(
                                (name, i) => (
                                  <div
                                    className="col-lg-2 col-sm-4 col-12"
                                    key={i}
                                  >
                                    <ReportBox
                                      styleName={
                                        this.state.agents_call_list[name]
                                          .color +
                                        " tile-stats text-white border-0"
                                      }
                                      title={
                                        this.state.agents_call_list[name].count
                                      }
                                      detail={
                                        this.state.agents_call_list[name].text
                                      }
                                      subHeadingColor={
                                        (this.state.agents_call_list[name].color != "tile-gray" && this.state.agents_call_list[name].color !="dispo-agents-class")
                                          ? "text-white"
                                          : "black"
                                      }
                                    >
                                      <PieChart
                                        onMouseEnter={this.onPieEnter}
                                      />
                                    </ReportBox>
                                  </div>
                                )
                              )}
                          </div>
                          {this.state.agents_call_list.length == 0 && (
                            <Paper elevation={1}>
                              <div
                                className="alert alert-success"
                                style={{ marginBottom: "20px" }}
                              >
                                <strong>NO AGENTS ON CALLS</strong>
                              </div>
                            </Paper>
                          )}
                          <div className="col-xs-12" style={{ height: 10 }} />
                          {this.state.live_calls_table_values.length != 0 && (
                            <Paper>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>STATUS</TableCell>
                                    <TableCell>CAMPAIGN</TableCell>
                                    <TableCell>PHONE NUMBER</TableCell>
                                    <TableCell> SERVER IP</TableCell>
                                    <TableCell> DIAL TIME</TableCell>
                                    <TableCell>CALL TYPE</TableCell>
                                    <TableCell>PRIORITY</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {this.state.live_calls_table_values.length !=
                                  0 ? (
                                    this.state.live_calls_table_values.map(
                                      (name, i) => (
                                        <TableRow key={i}>
                                          <TableCell>
                                            {
                                              this.state
                                                .live_calls_table_values[i][0]
                                            }
                                          </TableCell>
                                          <TableCell>
                                            {
                                              this.state
                                                .live_calls_table_values[i][1]
                                            }
                                          </TableCell>
                                          <TableCell>
                                            {
                                              this.state
                                                .live_calls_table_values[i][2]
                                            }
                                          </TableCell>
                                          <TableCell>
                                            {
                                              this.state
                                                .live_calls_table_values[i][3]
                                            }
                                          </TableCell>
                                          <TableCell>
                                            {
                                              this.state
                                                .live_calls_table_values[i][4]
                                            }
                                          </TableCell>
                                          <TableCell>
                                            {
                                              this.state
                                                .live_calls_table_values[i][5]
                                            }
                                          </TableCell>
                                          <TableCell>
                                            {
                                              this.state
                                                .live_calls_table_values[i][6]
                                            }
                                          </TableCell>
                                        </TableRow>
                                      )
                                    )
                                  ) : (
                                    <TableRow>
                                      <TableCell />
                                      <TableCell />
                                      <TableCell />
                                      <TableCell />
                                      <TableCell>No live Agents </TableCell>
                                      <TableCell />
                                      <TableCell />
                                      <TableCell />
                                      <TableCell> </TableCell>
                                      <TableCell />
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </Paper>
                          )}
                          <div className="col-xs-12" style={{ height: 10 }} />
                          <Paper>
                            <Table id="tblliveAgentsList">
                              <TableHead>
                                <TableRow>
                                  <TableCell>STATION</TableCell>
                                  <TableCell>
                                    {" "}
                                    <a href="JavaScript:void(0);">AGENT</a>{" "}
                                    <span className="call-log-table-user-info">
                                      {" "}
                                      INFO{" "}
                                    </span>
                                    <a
                                      href="JavaScript:void(0);"
                                      onClick={this.checkID}
                                    >
                                      {" "}
                                      {this.state.showID
                                        ? "SHOW ID"
                                        : "SHOW NAME"}
                                    </a>
                                  </TableCell>

                                  {this.state.monitor_active == "MONITOR" && (
                                    <TableCell> MONITOR </TableCell>
                                  )}
                                  {this.state.monitor_active == "BARGE" && (
                                    <TableCell> BARGE </TableCell>
                                  )}
                                  {this.state.UGdisplay == "1" && (
                                    <TableCell> USER GROUP </TableCell>
                                  )}
                                  {this.state.SERVdisplay == "1" && (
                                    <TableCell>SERVER INFO</TableCell>
                                  )}

                                  <TableCell> STATUS </TableCell>
                                  <TableCell> PAUSE</TableCell>

                                  {this.state.PHONEdisplay == "1" && (
                                    <TableCell>Phone Number</TableCell>
                                  )}
                                  <TableCell>
                                    {" "}
                                    <a href="JavaScript:void(0);">MM:SS</a>
                                  </TableCell>
                                  <TableCell>
                                    {" "}
                                    <a href="JavaScript:void(0);">CAMPAIGN</a>
                                  </TableCell>
                                  <TableCell>CALLS</TableCell>
                                  <TableCell>HOLD</TableCell>
                                  <TableCell>LIST CODE</TableCell>
                                  <TableCell>LIST ID</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {this.state.agents_list != undefined &&
                                this.state.agents_list.length != 0 ? (
                                  this.state.agents_list.map((name, i) => (
                                    <TableRow key={i} className={name.color}>
                                      <TableCell
                                        style={{ color: "white !important" }}
                                        className={"bgtextwhite"}
                                      >
                                        {name.station}
                                      </TableCell>
                                      <TableCell
                                        style={{ color: "white !important" }}
                                        className={"bgtextwhite"}
                                        onClick={() => {
                                          this.redirectAgent(
                                            name.station.split("/")[1]
                                          );
                                        }}
                                      >
                                      <a>
                                        {" "}
                                        {this.state.showID
                                          ? name.user
                                          : name.station.split("/")[1]}
                                          </a>
                                      </TableCell>
                                      {this.state.monitor_active ==
                                        "MONITOR" && (
                                        <TableCell> MONITOR </TableCell>
                                      )}
                                      {this.state.monitor_active == "BARGE" && (
                                        <TableCell> BARGE </TableCell>
                                      )}
                                      {this.state.UGdisplay == "1" && (
                                        <TableCell
                                          style={{ color: "white !important" }}
                                          className={"bgtextwhite"}
                                        >
                                          {" "}
                                          {name.user_group}{" "}
                                        </TableCell>
                                      )}
                                      {this.state.SERVdisplay == "1" && (
                                        <TableCell
                                          style={{ color: "white !important" }}
                                          className={"bgtextwhite"}
                                        >
                                          {" "}
                                          {name.server_ip}{" "}
                                        </TableCell>
                                      )}
                                      <TableCell
                                        style={{ color: "white !important" }}
                                        className={"bgtextwhite"}
                                      >
                                        {name.status}
                                      </TableCell>
                                      <TableCell
                                        style={{ color: "white !important" }}
                                        className={"bgtextwhite"}
                                      >
                                        {name.pausecode}
                                      </TableCell>

                                      {this.state.PHONEdisplay == "1" && (
                                        <TableCell
                                          style={{ color: "white !important" }}
                                          className={"bgtextwhite"}
                                        >
                                          {" "}
                                          {name.phone_number}{" "}
                                        </TableCell>
                                      )}
                                      <TableCell
                                        style={{ color: "white !important" }}
                                        className={"bgtextwhite"}
                                      >
                                        {name.call_time_ms}
                                      </TableCell>
                                      <TableCell
                                        style={{ color: "white !important" }}
                                        className={"bgtextwhite"}
                                      >
                                        {name.campaign}
                                      </TableCell>
                                      <TableCell
                                        style={{ color: "white !important" }}
                                        className={"bgtextwhite"}
                                      >
                                        {name.calls_today}
                                      </TableCell>
                                      <TableCell
                                        style={{ color: "white !important" }}
                                        className={"bgtextwhite"}
                                      />
                                      <TableCell
                                        style={{ color: "white !important" }}
                                        className={"bgtextwhite"}
                                      >
                                        {name.list_code}
                                      </TableCell>
                                      <TableCell
                                        style={{ color: "white !important" }}
                                        className={"bgtextwhite"}
                                      >
                                        {name.list_code}
                                      </TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell />
                                    <TableCell />
                                    <TableCell />
                                    <TableCell />
                                    <TableCell>No live Agents </TableCell>
                                    <TableCell />
                                    <TableCell />
                                    <TableCell />
                                    <TableCell> </TableCell>
                                    <TableCell />
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </Paper>
                          <div
                            id="live-call-info"
                            className="realtime-report-inline-row"
                          >
                            <style
                              dangerouslySetInnerHTML={{
                                __html:
                                  ".tile-stats h3{font-size:17px;}.tile-stats{border-radius:5px;}"
                              }}
                            />
                          </div>
                          <input
                            type="hidden"
                            id="agent-stats"
                            data-logged-in={2}
                            data-incall={1}
                            data-ready={0}
                            data-paused={1}
                            data-dead={0}
                            data-dispo={0}
                          />
                          <div className="panel panel-primary">
                            <div className="panel-heading1">
                              <div className="panel-options" />
                            </div>
                            <div className="panel-body" />
                          </div>{" "}
                          <div className="panel panel-primary">
                            <div className="panel-body" />
                          </div>
                          <br />
                        </span>
                      </b>
                    </form>
                  </td>
                </tr>
              </tbody>
            </table>
            <div
              className="row"
              style={{
                marginRight: "0px",
                marginLeft: "0px"
              }}
            >
              <div className="col-sm-3">
                <span style={{ width: 30 }} className="label ready-general">
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>{" "}
                - Agent waiting for call
              </div>
              <div className="col-sm-3">
                <span style={{ width: 30 }} className="label ready-60-s">
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>{" "}
                - Agent waiting for call &gt; 1 minute
              </div>
              <div className="col-sm-3">
                <span style={{ width: 30 }} className="label ready-5-min">
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>{" "}
                - Agent waiting for call &gt; 5 minutes
              </div>
              <div className="col-sm-3">
                <span style={{ width: 30 }} className="label incall-10-s">
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>{" "}
                - Agent on call &gt; 10 seconds
              </div>
            </div>
            <div
              className="row"
              style={{
                marginRight: "0px",
                marginLeft: "0px"
              }}
            >
              <div className="col-sm-3">
                <span style={{ width: 30 }} className="label incall-1-min">
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>{" "}
                - Agent on call &gt; 1 minute
              </div>
              <div className="col-sm-3">
                <span style={{ width: 30 }} className="label incall-5-min">
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>{" "}
                - Agent on call &gt; 5 minutes
              </div>
              <div className="col-sm-3">
                <span style={{ width: 30 }} className="label agent-paused-10-s">
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>{" "}
                - Agent Paused &gt; 10 second
              </div>
              <div className="col-sm-3">
                <span
                  style={{ width: 30 }}
                  className="label agent-paused-1-min"
                >
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>{" "}
                - Agent Paused &gt; 1 minute
              </div>
            </div>
            <div
              className="row"
              style={{
                marginRight: "0px",
                marginLeft: "0px"
              }}
            >
              <div className="col-sm-3">
                <span
                  style={{ width: 30 }}
                  className="label agent-paused-5-min"
                >
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>{" "}
                - Agent Paused &gt; 5 minutes
              </div>
              <div className="col-sm-3">
                <span
                  style={{ width: 30 }}
                  className="label agent-dispositioning-10-s"
                >
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>{" "}
                - Agent dispositioning call &gt; 10s
              </div>
              <div className="col-sm-3">
                <span
                  style={{ width: 30 }}
                  className="label agent-dispositioning-1-min"
                >
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>{" "}
                - Agent dispositioning call &gt; 1 minute
              </div>
              <div className="col-sm-3">
                <span
                  style={{ width: 30 }}
                  className="label agent-dispositioning-5-min"
                >
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>{" "}
                - Agent dispositioning call &gt; 5 minutes
              </div>
            </div>
            <div
              className="row"
              style={{
                marginRight: "0px",
                marginLeft: "0px"
              }}
            >
              <div className="col-sm-3">
                <span style={{ width: 30 }} className="label agent-in-3-way">
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>{" "}
                - Agent in 3-WAY &gt; 10 seconds
              </div>
              <div className="col-sm-3">
                <span style={{ width: 30 }} className="label black">
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>{" "}
                - Dead call
              </div>
              <div className="col-sm-3">
                <span style={{ width: 30 }} className="label ringing">
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>{" "}
                - Ringing
              </div>
              <div className="col-sm-3" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
function mapStateToProps(state, ownProps) {
  return {
    Global: state.globel
  };
}

const mapDispatchToProps = {
  fetchGlobal
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
