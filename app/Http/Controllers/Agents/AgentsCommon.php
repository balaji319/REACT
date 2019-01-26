<?php

/*
 * Admin utilities module error messages
 * @author Omprakash Pachkawade<om@ytel.com>
 * 
 */

namespace App\Http\Controllers\Agents;

use App\Http\Controllers\Agents\AgentsConstants as AgentsUtilities;

class AgentsCommon {

    /**
     * Build success/error response
     * @param String $status
     * @param String $msg
     * @return json
     */
    public static function buildResponse($status, $msg, $data = []) {
        return response()->json([
                    Agents::STATUS => $status
                    , Agents::MESSAGE => $msg
                    , Agents::DATA => $data
        ]);
    }

}
