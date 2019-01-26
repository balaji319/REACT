<?php

/*
 * Admin utilities module error messages
 * @author Omprakash Pachkawade<om@ytel.com>
 * 
 */

namespace App\Http\Controllers\AdminUtilities;

use App\Http\Controllers\AdminUtilities\AdminUtilitiesConstants as AdminUtilities;

class AdminUtilitiesCommon {

    /**
     * Build success/error response
     * @param String $status
     * @param String $msg
     * @return json
     */
    public static function buildResponse($status, $msg, $data = []) {
        return response()->json([
                    AdminUtilities::STATUS => $status
                    , AdminUtilities::MESSAGE => $msg
                    , AdminUtilities::DATA => $data
        ]);
    }

}
