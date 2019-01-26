<?php 
namespace App\Traits;
use App\VicidialUser;
use Carbon\Carbon;
use config;

trait TimeConvert{


	public function secConvert($sec, $precision)
    {
        $sec = round($sec, 0);
        if ($sec < 1) {
            return "00:00:00";
        } else {
            if ($precision == 'HF') {
                $precision = 'H';
            } else {
                if (($sec < 3600) and ( $precision != 'S')) {
                    $precision = 'H';
                }
            }
            if ($precision == 'H') {
                $fhour_h = ($sec / 3600);
                $fhour_h_int = floor($fhour_h);
                $fhour_h_int = intval("$fhour_h_int");
                $fhour_h_int = ($fhour_h_int < 10) ? "0$fhour_h_int" : $fhour_h_int;
                $fhour_m = ($fhour_h - $fhour_h_int);
                $fhour_m = ($fhour_m * 60);
                $fhour_m_int = floor($fhour_m);
                $fhour_m_int = intval("$fhour_m_int");
                $fhour_s = ($fhour_m - $fhour_m_int);
                $fhour_s = ($fhour_s * 60);
                $fhour_s = round($fhour_s, 0);
                if ($fhour_s < 10) {
                    $fhour_s = "0$fhour_s";
                }
                if ($fhour_m_int < 10) {
                    $fhour_m_int = "0$fhour_m_int";
                }
                $ftime = "$fhour_h_int:$fhour_m_int:$fhour_s";
            }
            elseif ($precision == 'M') {
                $ftime = gmdate("i:s", $sec);
            }
            elseif ($precision == 'S') {
                $ftime = $sec;
            }
            return "$ftime";
        }
    }


    public function setTimeBegin($shift, $start_date, $end_date)
    {
        $time_begin = '';
        $time_end = '';
        $now_date = date("Y-m-d");
        $now_time = date("Y-m-d H:i:s");
        if ($shift == 'AM') {
            if (strlen($time_begin) < 6) {
                $time_begin = "00:00:00";
            }
            if (strlen($time_end) < 6) {
                $time_end = "11:59:59";
            }
        }
        if ($shift == 'PM') {
            if (strlen($time_begin) < 6) {
                $time_begin = "00:00:00";
            }
            if (strlen($time_end) < 6) {
                $time_end = "23:59:59";
            }
        }
        if ($shift == 'ALL') {
            if (strlen($time_begin) < 6) {
                $time_begin = "00:00:00";
            }
            if (strlen($time_end) < 6) {
                $time_end = "23:59:59";
            }
        }
        $query_date_begin = "$start_date $time_begin";
        $query_date_end = "$end_date $time_end";
        return (['query_date_begin' => $query_date_begin, 'query_date_end' => $query_date_end,'now_date'=>$now_date,'now_time'=>$now_time]);
    }

    public function getCsv($domain, $file, $post_data)
    {
        $level_8_user = VicidialUser::csvDetail();
        
        if (!$level_8_user) {
            throw new Exception('Cannot locate level 8 user');
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://'.$domain.config('configs.csv_file_address_for_agent_details').$file);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
        curl_setopt($ch, CURLOPT_HEADER, 1);
        curl_setopt($ch, CURLOPT_USERPWD, "{$level_8_user[0]['user']}:{$level_8_user[0]['pass']}");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_VERBOSE, 0);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 0);
        curl_setopt($ch, CURLOPT_TIMEOUT, 600);
        $start_time_curl = time();
        $response = curl_exec($ch);
        $return['curl_time'] = time() - $start_time_curl;
        $return['error_no'] = curl_errno($ch);
        $return['error'] = curl_error($ch);
        $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $return['body'] = substr($response, $header_size);
        curl_close($ch);
        return $return;
    }

    public function setTimeBeginInbound($startdate, $enddate, $hourly_breakdown, $show_disposition_status, $ignore_afterhours){ 
        global $hpd;
        $time_begin = ''; $time_end = '';
        $now_date = date("Y-m-d");
        $now_time = date("Y-m-d H:i:s");
        $_starttime = date("U");
        $time_begin = "00:00:00";
        $time_end = "23:59:59";
        
        $query_date_begin_array = array();
        $query_date_begin = "$startdate $time_begin";
        $query_date_endrray = array();
        $query_date_end = "$enddate $time_end";

        $sq_date_ary = explode(' ', $query_date_begin);
        $sq_day_ary = explode('-', $sq_date_ary[0]);
        $sq_time_ary = explode(':', $sq_date_ary[1]);
        $eq_date_ary = explode(' ', $query_date_end);
        $eq_day_ary = explode('-', $eq_date_ary[0]);
        $eq_time_ary = explode(':', $eq_date_ary[1]);
        $sq_epoch_day = mktime(0, 0, 0, $sq_day_ary[1], $sq_day_ary[2], $sq_day_ary[0]);

        $sq_epoch = mktime($sq_time_ary[0], $sq_time_ary[1], $sq_time_ary[2], $sq_day_ary[1], $sq_day_ary[2], $sq_day_ary[0]);
        $eq_epoch = mktime($eq_time_ary[0], $eq_time_ary[1], $eq_time_ary[2], $eq_day_ary[1], $eq_day_ary[2], $eq_day_ary[0]);
        $sq_sec = ( ($sq_time_ary[0] * 3600) + ($sq_time_ary[1] * 60) + ($sq_time_ary[2] * 1) );
        $eq_sec = ( ($eq_time_ary[0] * 3600) + ($eq_time_ary[1] * 60) + ($eq_time_ary[2] * 1) );

        $duration_sec = ($eq_epoch - $sq_epoch);
        $duration_day = intval(($duration_sec / 86400) + 1);

        if (($eq_sec < $sq_sec) and ( $duration_day < 1)) {
            $eq_epoch = ($sq_epoch_day + ($eq_sec + 86400) );
            $query_date_end = date("Y-m-d H:i:s", $eq_epoch);
            $duration_day++;
        }

        $d = 0; $q = 0; $hr = 0; $shift_hrs = 0; $recalc = 1;
        while ($d < $duration_day) {
            $dsq_epoch = ($sq_epoch + ($d * 86400) + ($hr * 3600));
            if ($recalc == 1) {

            }//pending
            if ($hourly_breakdown == "1") { $deq_epoch = $dsq_epoch + 3599; } else {
                $deq_epoch = ($sq_epoch_day + ($eq_sec + ($d * 86400) + ($hr * 3600)) );
                if ($eq_sec < $sq_sec) { $deq_epoch = ($deq_epoch + 86400); }
            }
            $day_start[$q] = date("Y-m-d H:i:s", $dsq_epoch);
            $dayend[$q] = date("Y-m-d H:i:s", $deq_epoch);

            $date_start[$q] = date("Y-m-d", $dsq_epoch);
            $time_start[$q] = date("H:i:s", $dsq_epoch);
            $dateend[$q] = date("Y-m-d", $deq_epoch);
            $timeend[$q] = date("H:i:s", $deq_epoch);
            //  $hourly_breakdown = ($hourly_breakdown=='1') ? true:false ; //remove
            if ($hr >= ($hpd - 1) || !$hourly_breakdown) {
                $d++;
                $hr = 0;
                if (date("H:i:s", $deq_epoch) > $time_end) {
                    $dayend[$q] = date("Y-m-d ", $deq_epoch).$time_end;
                }
                $recalc = 1;
            } else {
                $hr++;
            }
            $q++;
        }
        $prev_week = $day_start[0];
        $prev_month = $day_start[0];
        $prev_qtr = $day_start[0];

        $i = 0;
        $h = 4;
        $j = 0;
        $z_hour = 1;
        $active_time = 0;
        $hour = ($sq_time_ary[0] - 1);
        $start_sec = ($sq_sec - 900);
        $end_sec = ($sq_sec - 1);
        if ($sq_time_ary[1] > 14) {
            $h = 1;
            $hour++;
            if ($hour < 10) { $hour = "0$hour"; }
        }
        if ($sq_time_ary[1] > 29) { $h = 2; }
        if ($sq_time_ary[1] > 44) { $h = 3; }
        while ($i < 96) {
            $start_sec = ($start_sec + 900);
            $end_sec = ($end_sec + 900);
            $time = '      ';
            if ($h >= 4) {
                $hour++;
                if ($z_hour == '00') {
                    $start_sec = 0;
                    $end_sec = 899;
                }
                $h = 0;
                if ($hour < 10) { $hour = "0$hour"; }
                $stime = "$hour:00";
                $etime = "$hour:15";
                $time = "+$stime-$etime+";
            }
            if ($h == 1) {
                $stime = "$hour:15";
                $etime = "$hour:30";
                $time = " $stime-$etime ";
            }
            if ($h == 2) {
                $stime = "$hour:30";
                $etime = "$hour:45";
                $time = " $stime-$etime ";
            }
            if ($h == 3) {
                $z_hour = $hour;
                $z_hour++;
                if ($z_hour < 10) { $z_hour = "0$z_hour"; }
                if ($z_hour == 24) { $z_hour = "00"; }
                $stime = "$hour:45";
                $etime = "$z_hour:00";
                $time = " $stime-$etime ";
                if ($z_hour == '00') { $hour = ($z_hour - 1); }
            }

            if (( ($start_sec >= $sq_sec) and ( $end_sec <= $eq_sec) and ( $eq_sec > $sq_sec) ) or ( ($start_sec >= $sq_sec) and ( $eq_sec < $sq_sec) ) or ( ($end_sec <= $eq_sec) and ( $eq_sec < $sq_sec) )) {
                $hmdisplay[$j] = $time;
                $hmstart[$j] = $stime;
                $hmend[$j] = $etime;
                $hmsepoch[$j] = $start_sec;
                $hmeepoch[$j] = $end_sec;

                $j++;
            }

            $h++;
            $i++;
        }
        $tot_intervals = $q;
        if ($hourly_breakdown == "1") {
            $cnt = 0;
            $day_start = array();
            $dayend = array();
            for ($i = 0; $i < $q; $i++) {
                for ($j = 0; $j < 24; $j++) {
                    $k = ($j < 10) ? "0$j" : $j;
                    $day_start[$cnt] = $date_start[$i]." $k:00:00";
                    $dayend[$cnt] = $date_start[$i]." $k:59:59";
                    $cnt++;
                }
            }
            $tot_intervals = $cnt;
        }
        return (array('duration_day' => $duration_day, 'query_date_begin' => $query_date_begin, 'query_date_end' => $query_date_end, 'now_time' => $now_time, 'sq_epoch_day' => $sq_epoch_day, 'eq_sec' => $eq_sec, 'sq_sec' => $sq_sec, 'tot_intervals' => $tot_intervals, 'hmsepoch' => $hmsepoch, 'day_start' => $day_start, 'date_start' => $date_start, 'dayend' => $dayend, 'hmstart' => $hmstart, 'time_start' => $time_start, 'timeend' => $timeend, 'hmsepoch' => $hmsepoch, 'hmeepoch' => $hmeepoch));
    }
}
