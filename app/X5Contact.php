<?php

namespace App;

use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Passport\HasApiTokens;

use App\Traits\ErrorLog;

use DB;

class X5Contact  extends Authenticatable
{
    use Notifiable, HasApiTokens, ErrorLog;

    protected $table = 'x5_contacts';
    public $timestamps = false;
    public $primaryKey = 'x5_contact_id';

    protected $fillable = ['username','company_id','password','create_datetime','udid','sms_otp'];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];  


    /**
     * Get Super AdminRole Count
     *
     * @param  [string] company_id
     * @param  [string] contact_id
     * @return [int] count
     */

    public static function getIsSuperAdminCount($company_id,$contact_id){

        try {
           return X5Contact::leftJoin('x5_contact_x5_contact_groups','x5_contacts.x5_contact_id','=','x5_contact_x5_contact_groups.x5_contact_id')
           ->leftJoin('x5_contact_groups','x5_contact_x5_contact_groups.x5_contact_group_id','=','x5_contact_groups.x5_contact_group_id')
           ->where('x5_contacts.enable','=',1)
           ->where('x5_contacts.x5_contact_id','=',$contact_id)
           ->where('x5_contacts.company_id','=',$company_id)
           ->where('x5_contact_groups.super','=',1)
           ->count();
            
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            return 0;
            
        }
        
    }


    /**
     * Get ycc grp list
     *
     * @param  [string] company_id
     * @param  [string] contact_id
     * @return [int] count
     */

    public function getYccGrpList($allowed_cntct_grp,$current_company_id,$limit,$search){

        try {
           return DB::table($this->table.' AS X5Contact')
                  ->select('X5Contact.x5_contact_id','X5Contact.name','X5Contact.username','X5Contact.enable')
                  ->selectRaw('(GROUP_CONCAT(DISTINCT X5ContactGroup.x5_contact_group_id ORDER BY X5ContactGroup.x5_contact_group_id ASC)) AS  X5Contact__group_ids')
                  ->selectRaw('(GROUP_CONCAT(DISTINCT X5ContactGroup.group_name ORDER BY X5ContactGroup.x5_contact_group_id ASC)) AS  X5Contact__group_names')
                  ->leftJoin('x5_contact_x5_contact_groups AS X5ContactX5ContactGroup','X5Contact.x5_contact_id','=','X5ContactX5ContactGroup.x5_contact_id')
                  ->leftJoin('x5_contact_groups AS X5ContactGroup','X5ContactX5ContactGroup.x5_contact_group_id', '=', 'X5ContactGroup.x5_contact_group_id')
                  ->where('X5Contact.company_id',$current_company_id)
                  ->where(function ($query) use ($allowed_cntct_grp) {
                    $query->whereIn('X5ContactX5ContactGroup.x5_contact_group_id',$allowed_cntct_grp)
                          ->orwhereNull('X5ContactX5ContactGroup.x5_contact_group_id');
                  })
                  ->whereNull('X5Contact.delete_datetime')
                  ->when($search,function ($query,$search) {
                    $query->where('X5Contact.x5_contact_id', "like", "%{$search}%")
                          ->orwhere('X5Contact.name', "like", "%{$search}%")
                          ->orwhere('X5Contact.username', "like", "%{$search}%");
                  })
                  ->groupBy('X5Contact.x5_contact_id')
                  ->paginate($limit);
            
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            return 0;
            
        }
    }

    /**
     * Get ycc grp list
     *
     * @param  [string] company_id
     * @param  [string] contact_id
     * @return [int] count
     */

    public function delYccGrp($x5_contact_id,$current_company_id){
        try {
          return X5Contact::where('x5_contact_id',$x5_contact_id)
            ->whereNull('delete_datetime')
            ->where('company_id',$current_company_id)
            ->update(['delete_datetime' => gmdate('Y-m-d H:i:s')]);

        } catch (Exception $e) {
           $this->postLogs(config('errorcontants.mysql'), $e);
           return 0;
        }
      }

      /**
     * Get ycc grp list
     *
     * @param  [string] company_id
     * @param  [string] contact_id
     * @return [int] count
     */

    public function getYccGrpListAll($allowed_cntct_grp,$current_company_id){

        try {
           return DB::table($this->table.' AS X5Contact')
                  ->select('X5Contact.x5_contact_id','X5Contact.name','X5Contact.username')                  
                  ->leftJoin('x5_contact_x5_contact_groups AS X5ContactX5ContactGroup','X5Contact.x5_contact_id','=','X5ContactX5ContactGroup.x5_contact_id')
                  ->leftJoin('x5_contact_groups AS X5ContactGroup','X5ContactX5ContactGroup.x5_contact_group_id', '=', 'X5ContactGroup.x5_contact_group_id')
                  ->where('X5Contact.company_id',$current_company_id)
                  ->where(function ($query) use ($allowed_cntct_grp) {
                    $query->whereIn('X5ContactX5ContactGroup.x5_contact_group_id',$allowed_cntct_grp)
                          ->orwhereNull('X5ContactX5ContactGroup.x5_contact_group_id');
                  })
                  ->whereNull('X5Contact.delete_datetime')                 
                  ->groupBy('X5Contact.x5_contact_id')
                  ->get();
            
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            return 0;
            
        }
    }
}
