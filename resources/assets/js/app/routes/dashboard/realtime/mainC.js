import React from 'react';





const mainC = ({data}) => {
    return (
     <div id="real-time-report-container" className="container-fluid">
                        <table cellPadding={4} cellSpacing={0} width="100%" style={{marginTop: 5}}>
                            <tbody>
                                <tr>
                                    <td>
                                        <form action="/index.php" method="GET" name="REALTIMEform" id="REALTIMEform" className="ng-pristine ng-valid">
                                            <input type="HIDDEN" name="cursorX" id="cursorX" />
                                            <input type="HIDDEN" name="cursorY" id="cursorY" />
                                            <div className="row realtime-header">
                                                <div className="col-md-8">
                                                    <div className="btn-group hidden-phone hidden-tablet">
                                                        <a id="toggle-options-btn" className="btn btn-ccc btn-font-white dropdown-toggle" data-toggle="dropdown" href="#"><i style={{}} className="icon-filter icon-white" /> <span>Options </span><span className="caret" />
                                                        </a>
                                                        <ul className="dropdown-menu">
                                                            <li id="webphone_visibility" />
                                                            <li><a href="#" onclick="update_variables('adastats','');"><span id="adastatsTXT">+ VIEW MORE STATS</span></a>
                                                            </li>
                                                            <li><a href="#" onclick="update_variables('UGdisplay','');"><span id="UGdisplayTXT">SHOW AGENT GROUP</span></a>
                                                            </li>
                                                            <li><a href="#" onclick="update_variables('SERVdisplay','');"><span id="SERVdisplayTXT">SHOW SERVER INFO</span></a>
                                                            </li>
                                                            <li><a href="#" onclick="update_variables('CALLSdisplay','');"><span id="CALLSdisplayTXT">HIDE WAITING CALLS</span></a>
                                                            </li>
                                                            <li><a href="#" onclick="update_variables('ALLINGROUPstats','');"><span id="ALLINGROUPstatsTXT">SHOW IN-GROUP STATS</span></a>
                                                            </li>
                                                            <li><a href="#" onclick="update_variables('PHONEdisplay','');"><span id="PHONEdisplayTXT">SHOW PHONES</span></a>
                                                            </li>
                                                            <li><a href="#" onclick="update_variables('CUSTPHONEdisplay','');"><span id="CUSTPHONEdisplayTXT">SHOW CUSTPHONES</span></a>
                                                            </li>
                                                            <li><a href="#" onclick="update_variables('SESSIONIDdisplay','');"><span id="SESSIONIDdisplayTXT">SHOW SESSIONID</span></a>
                                                            </li>
                                                        </ul>
                                                    </div>

                                                    <a className="btn btn-ccc btn-font-white left-class" style={{margin: "0px"}} href="#" onclick="showDiv('campaign_select_list');"><span>Edit Panel</span></a><a style={{margin: "0px"}} className="btn btn-ccc btn-font-white left-class" href="#" onclick="update_variables('showhide','');" id="hidebtn"><span id="showhideTXT">Hide Panel</span></a><span id="generic" style={{display: 'inline', opacity: '0.743625'}} />
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="counter hidden-phone hidden-tablet" style={{float: 'right', margin: 6}}><font color="#069"><span title="Reload Now" onclick="update_variables('form_submit','');" style={{zIndex: 20, cursor: 'pointer'}} className="fa fa-circle-o-notch fa-spin" /><b><span style={{color: '#666'}} /></b></font>
                                                    </div>
                                                </div>
                                            </div><b><span style={{position: 'absolute', left: 810, top: 15, zIndex: 20}} id="campaign_select_list_link">
                                      <table width={35} cellPadding={0} cellSpacing={0}><tbody><tr><td align="left">
                                            </td></tr></tbody></table>
                                    </span>
                                    <span style={{position: 'absolute', left: 0, top: 70, zIndex: 21}} id="campaign_select_list"><div id="realtime-report-options-div" className="modal fade"><div className="modal-dialog" style={{width: '65%'}}><div className="modal-content "><div className="modal-header "><button type="button" className="close" data-dismiss="modal" aria-hidden="true">×</button><h4 className="modal-title">Choose Report Display Options</h4></div><div className=" modal-body "><div className="row"><div className="col-md-6"><div className="form-group">Select User Groups<select size={6} name="user_group_filter[]" id="user_group_filter[]" multiple className="form-control tooltip-primary " data-toggle="tooltip" data-placement="top" data-original-title="This is listings of user groups."><option selected value="ALL-GROUPS">ALL-GROUPS - All user groups</option><option value={1000}>1000 - Regular Users</option><option value={1001}>1001 - Closer group</option><option value="Acurian">Acurian - Acurian Testing</option><option value="ADMIN">ADMIN - VICIDIAL ADMINISTRATORS</option><option value="C2C">C2C - Temporary Delete after 112016</option><option value="DANIELTEST">DANIELTEST - DANIELTEST</option><option value="Hanyytel">Hanyytel - Opener group</option><option value="KevinYtel">KevinYtel - Kevin User Group</option><option value="KiranGroup">KiranGroup - Beta Tester</option><option value="KiranGroup2">KiranGroup2 - Beta Tester</option><option value="Newcarr">Newcarr - Newcar</option><option value="VannyTest">VannyTest - Beta Tester</option><option value="WinBack">WinBack - Win Back Team </option></select></div></div><div className="col-md-6"><div className="form-group">Inbound<select name="with_inbound" id="with_inbound" className="form-control tooltip-primary " data-toggle="tooltip" data-placement="top" data-original-title="This is a Inbound, if set yes data will show for inbound call."><option value="N">No</option><option value="Y" selected>Yes</option><option value="O">Only</option></select></div></div><div className="col-md-6" style={{marginTop: 8}}><div className="form-group">Show Presets Stats<select size={1} name="PRESETstats" id="PRESETstats" className="form-control tooltip-primary" data-toggle="tooltip" data-placement="top" data-original-title="This is Show Presets Stats,if set yes it shows Show Presets Stats."><option value={0} selected>NO</option><option value={1}>YES</option></select></div></div></div><div className="row"><div className="col-md-6"><div className="form-group">Dialable Leads Alert<select size={1} name="NOLEADSalert" id="NOLEADSalert" className="form-control tooltip-primary" data-toggle="tooltip" data-placement="top" data-original-title="This is dialable leads alert, if set yes alert will display for dialable leads."><option value selected>NO</option><option value="YES">YES</option></select></div></div><div className="col-md-6"><div className="form-group">Show Drop In-Group Row<select size={1} name="DROPINGROUPstats" id="DROPINGROUPstats" className="form-control tooltip-primary" data-toggle="tooltip" data-placement="top" data-original-title="This show drops in group row, if set yes it show drops in groups"><option value={0} selected>NO</option><option value={1}>YES</option></select></div></div></div><div className="row"><div className="col-md-6"><div className="form-group">Show Carrier Stats<select size={1} name="CARRIERstats" id="CARRIERstats" className="form-control tooltip-primary" data-toggle="tooltip" data-placement="top" data-original-title="This is a show Carrier Stats, if set yes it Show Carrier Stats."><option value={0} selected>NO</option><option value={1}>YES</option></select></div></div><div className="col-md-6"><div className="form-group">Agent Time Stats<select size={1} name="AGENTtimeSTATS" id="AGENTtimeSTATS" className="form-control tooltip-primary" data-toggle="tooltip" data-placement="top" data-original-title="This is a Agent Time Stats, if set yes it shows Agent Time Stats."><option value={0} selected>NO</option><option value={1}>YES</option></select></div></div></div></div><div className="modal-footer"><button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button><input type="button" defaultValue="SUBMIT" onclick="update_variables('form_submit','');" className="btn btn-success" /></div></div></div></div></span>
                                    <span style={{position: 'absolute', left: 10, top: 120, zIndex: 14}} id="agent_ingroup_display" />
                                    <div id="options-btn" className="status-block">
                                    </div>
                                    <div id="stat-table-new"><div id="dash-stats" style={{height: 'auto'}} className="row">
                                        <div style={{height: 'auto', display: 'block'}} className="dashboard col-sm-12 ready tile-pop">
                                          <div className="widget tile-stats col-md-3 tile-pop tile-red" style={{display: 'block', background: '#ccc', overflow: 'unset !important', borderBottom: '4px solid red'}}>
                                            <h3 className="middle-class font-class">Campaigns</h3>

                                    <div className="select-class" style={{backgroundColor: 'white !important'}}>
                                            <select className="form-control" name="groupsw" id="groupsw" >

                                            <option value="040588"> - Kiran Campaign</option><option value="0406">0406 - Starter Campaign </option>
                                            <option value={12345}>12345 - Test Campaign </option><option value={18001}>18001 - Brandons Campaign</option>
                                            <option value={1988}>1988 - Test Campaign </option><option value={2004}>2004 - Test Campaign </option>
                                            <option value={2005}>2005 - Alex Campaign </option><option value={4444}>4444 - 444444 </option>
                                            <option value={888888}>888888 - 9998887777 </option><option value={95959595}>95959595 - InboundTest </option>
                                            <option value="Alest1">Alest1 - Alex Test ABC </option><option value="ALEX">ALEX - Alex Campaign </option>
                                            <option value="alexte">alexte - alextestraining </option><option value="Aroma">Aroma - Aroma Test</option>
                                            <option value="Callbk">Callbk - Call Back test - Agent </option><option value="callbk2">callbk2 - Call Back test - System </option>
                                            <option value="DAN598">DAN598 - danieltesting </option><option value="Garthok">Garthok - General Testing NO TOUCHY </option>
                                            <option value="Jornaya">Jornaya - Jornaya Testing </option><option value="KEVIN">KEVIN - Kevin T - DO NOT DELETE </option>
                                            <option value="LeadBeam">LeadBeam - LeadBeam v2 Testing </option><option value="Newcar">Newcar - New Car </option>
                                            <option value="OnHook">OnHook - Test On Hook </option><option value="Test123">Test123 - Test 12345 </option>
                                            <option value="testvide">testvide - test video </option><option value="VB_Test">VB_Test - VB Test </option>
                                            </select>
                                    </div>
                                          </div>
                                          <div style={{display: 'block', background: '#bcbcbc', borderBottom: '4px solid #036'}} className="widget tile-stats col-md-3 tile-blue">
                                            <h3 className="middle-class font-class">Screen Refresh</h3>
                                            <div className="select-class"> <select onchange="update_variables('form_submit','','');" name="RR" id="RR" className="form-control "><option value={0}>Live</option><option value={4}>4 seconds</option><option value={10}>10 seconds</option><option value={20}>20 seconds</option><option value={30}>30 seconds</option><option value={40}>40 seconds</option><option value={60}>60 seconds</option><option value={120}>2 minutes</option><option value={300}>5 minutes</option><option value={600}>10 minutes</option><option value={1200}>20 minutes</option><option value={1800}>30 minutes</option><option value={2400}>40 minutes</option><option value={3600}>60 minutes</option><option value={7200}>2 hours</option><option value={18000}>5 hours</option><option value={36000}>10 hours</option><option value={54000}>15 hours</option><option value={72000} selected>20 hours</option>&gt;1 day<option value={86400}>1 day</option></select> </div>
                                          </div>
                                          <div style={{display: 'block', background: '#ccc', borderBottom: '4px solid green'}} className="widget tile-stats col-md-3 tile-green">
                                            <h3 className="middle-class font-class"> Monitor </h3>
                                            <div className="select-class"> <select onchange="update_variables('form_submit','','');" name="monitor_active" id="monitor_active" className="form-control  "><option value selected>NONE</option><option value="MONITOR">MONITOR</option><option value="BARGE">BARGE</option></select> </div>
                                          </div>
                                          <div style={{display: 'block', background: '#bcbcbc', borderBottom: '4px solid orange','padding-bottom': '14px'}} className="widget tile-stats col-md-3 tile-orange">
                                            <h3 className="middle-class font-class"> Phone </h3>
                                            <div className="select-class">

                                             <input onchange="update_variables('form_submit','','');" type="text" size={10} maxLength={20} name="monitor_phone" id="monitor_phone" defaultValue placeholder="999-999-9999" className="form-control " /> </div>
                                          </div>
                                        </div>
                                      </div></div><span id="realtime_content" name="realtime_content">{/* ajax-mode */}
                                      <div id="stat-table-div" className="hidden-phone hidden-tablet"><div className="panel panel-primary"><div className="panel-heading"><div className="panel-options">                        {/*<a href="#sample-modal" data-toggle="modal" data-target="#sample-modal-dialog-1" class="bg"><i class="entypo-cog"></i></a>
                                                <a href="#" data-rel="collapse"><i class="entypo-down-open"></i></a>
                                                <a href="#" data-rel="reload"><i class="entypo-arrows-ccw"></i></a>
                                                <a href="#" data-rel="close"><i class="entypo-cancel"></i></a>*/}
                                            </div>
                                          </div>
                                          <table id="stat-table" cellPadding={0} cellSpacing={0} className="table table-bordered stat-table"><tbody><tr><td>DIAL LEVEL:</td><td align="LEFT"> 1.773</td><td>FILTER:</td><td align="LEFT"> 90210</td><td>ORDER:</td><td align="LEFT"> DOWN </td></tr><tr><td>DIALABLE LEADS:</td><td align="LEFT"> 0 </td><td>CALLS TODAY:</td><td align="LEFT"> 40 </td><td>DIAL METHOD:</td><td align="LEFT"> ADAPT_HARD_LIMIT </td></tr><tr><td>DROPPED / ANSWERED:</td><td align="LEFT"> 13 / 13</td><td>STATUSES:</td><td align="LEFT" colSpan={3}> 11, A, AA, AFAX </td></tr><tr><td width={200}>LEADS IN HOPPER:</td><td align="LEFT"> 0 </td><td width={200}>DROPPED PERCENT:</td><td align="LEFT" nowrap="nowrap" width={200}> <div style={{margin: 0}}><span className="label label-danger" style={{height: 17, float: 'left', width: 50, marginRight: 5, textAlign: 'center'}}>100.00%</span><div className="progress" id="prgbar"><div title="100.00%" className="progress-bar progress-bar-danger" style={{width: '100.00%'}} /></div></div></td></tr>
                                            </tbody></table></div></div>
                                      <div id="live-call-info" className="realtime-report-inline-row"><style dangerouslySetInnerHTML={{__html: ".tile-stats h3{font-size:17px;}.tile-stats{border-radius:5px;}" }} /><div className="row" id><div className="col-sm-2">
                                            <div className="tile-stats tile-green">
                                              <div className="num" id="inbound"><font className="status-ID">1</font></div>
                                              <h3>Current Active Calls</h3>
                                            </div>
                                          </div><div className="col-sm-2">
                                            <div className="tile-stats tile-green tile-gray">
                                              <div className="num" id="inbound"><font className="status-ID">0</font></div>
                                              <h3>Outbound Calls</h3>
                                            </div>
                                          </div><div className="col-sm-2">
                                            <div className="tile-stats tile-red queue-class">
                                              <div className="num" id="inbound"><font className="status-ID">1</font></div>
                                              <h3>Calls In Queue</h3>
                                            </div>
                                          </div><input type="hidden" id="call-stats" data-calls={1} data-ringing={0} data-waiting={1} data-in-ivr={0} /></div></div><div className="row"><div className="col-sm-2"><div className="tile-stats tile-gray tile-gray"><div className="num" data-start={0}><font className="status-ID">2</font></div><h3> Agents Logged In</h3></div></div><div className="col-sm-2"><div className="tile-stats  tile-green"><div className="num" data-start={0}>1</div><h3>Agents In Calls</h3></div></div><div className="col-sm-2"><div className="tile-stats tile-gray"><div className="num" data-start={0}>0</div><h3>Available Agents</h3></div></div><div className="col-sm-2"><div className="tile-stats tile-ccc paused-agents-class"><div className="num" data-start={0}>1</div><h3>Paused Agents</h3></div></div><div className="col-sm-2"><div className="tile-stats tile-gray tile-gray"><div className="num" data-start={0}>0</div><h3>Dead Agents</h3></div></div><div className="col-sm-2"><div className="tile-stats tile-ccc tile-gray"><div className="num" data-start={0}>0</div><h3>Agents In Dispo</h3></div></div></div><input type="hidden" id="agent-stats" data-logged-in={2} data-incall={1} data-ready={0} data-paused={1} data-dead={0} data-dispo={0} /><div className="panel panel-primary"><div className="panel-heading1"><div className="panel-options">
                                          </div>
                                        </div>
                                        <div className="panel-body">
                                          <table className="table"><thead><tr><th>STATUS</th><th>CAMPAIGN</th><th>PHONE NUMBER</th><th>SERVER IP</th><th>DIAL TIME</th><th>CALL TYPE</th><th>PRIORITY</th></tr></thead><tbody><tr className="cscLBv2_Morning"><td>LIVE</td><td>LBv2_Morning      </td><td>9492080471</td><td>208.74.137.113 </td><td>   0:49</td><td>IN      </td><td>      99</td></tr></tbody></table></div></div>                    <div className="panel panel-primary">
                                        <div className="panel-body">
                                          <table id="call-log-table" className="table" aria-describedby="table-1_info"><thead><tr><th>STATION</th><th> <a href="#" onclick="update_variables('orderby','user');">AGENT</a>  <span className="call-log-table-user-info"> INFO </span><a href="#" onclick="update_variables('UidORname','');">SHOW ID</a></th><th> STATUS </th><th> PAUSE</th><th> <a href="#" onclick="update_variables('orderby','time');">MM:SS</a></th><th> <a href="#" onclick="update_variables('orderby','campaign');">CAMPAIGN</a></th><th>CALLS</th><th>HOLD</th><th>LIST CODE</th><th>LIST ID</th></tr></thead><tbody><tr className="incall-10-s"><td>SIP/1986      *</td><td><span className="link-hand" onclick="window.open('./User/user_status/1986', '_blank');" target="_blank">Patrick User      </span><span className="call-log-table-user-info link-hand" onclick="ingroup_info('1986','0');">+</span></td><td>INCALL</td><td>&nbsp;</td><td>    0:24</td><td>KEVIN - Kevin T - DO NOT DELETE</td><td>3  </td><td>&nbsp;</td><td>12124198008</td><td>999</td></tr><tr className="agent-paused-5-min"><td>SIP/0405      *</td><td><span className="link-hand" onclick="window.open('./User/user_status/0405', '_blank');" target="_blank">Kiran Gaikwad     </span><span className="call-log-table-user-info link-hand" onclick="ingroup_info('0405','1');">+</span></td><td>PAUSED</td><td>&nbsp;</td><td>   19:15</td><td>040588 - Kiran Campaign </td><td>11 </td><td>&nbsp;</td><td>N/A</td><td>N/A</td></tr></tbody></table></div></div><br /></span>
                                  </b>
                                        </form>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
    );
};

export default main;



