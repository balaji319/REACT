<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class Number extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $destinatibn = $this->destination($this->did_route, $this);
        return [
            'did_id' => $this->did_id,
            'did_pattern' => $this->did_pattern,
            'did_description' => $this->did_description,
            'did_active' => $this->when(isset($this->did_active), $this->did_active),
            'did_route' => $this->when(isset($this->did_route), $this->did_route),
            'destination' => $this->when(isset($destinatibn), $destinatibn),
            'is_delete' => $this->when(isset($this->did_active), (strlen($this->did_pattern) < 11) ? true : false)
        ];
    }
    
    /**
     * Find destination
     *
     * @param string $did_route
     * @param array $numbers
     * @return string|int
     */
    private function destination($did_route, $numbers)
    {        
        switch ($did_route) {
            case 'AGENT':
                return $numbers['user'];
                break;
            case 'EXTEN':
                return $numbers['extension'];
                break;
            case 'VOICEMAIL':
                return $numbers['voicemail_ext'];
                break;
            case 'PHONE':
                return $numbers['phone'];
                break;
            case 'IN_GROUP':
                return $numbers['group_id'];
                break;
            case 'CALLMENU':
                return $numbers['menu_id'];
                break;
        }        
    }
}
