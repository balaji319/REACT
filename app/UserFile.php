<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\ErrorLog;
use Exception;

class UserFile extends Model {

    use ErrorLog;

    public $timestamps = false;
    protected $fillable = array('*');

    /**
     * Uploaded files list
     *
     * @param array $data
     * @return \Illuminate\Support\Collection
     * @throws Exception
     */
    public static function uploadedFiles($data) {
        try {

            $user_files = UserFile::join('x5_contacts', 'x5_contacts.x5_contact_id', 'user_files.uploader_id')
                    ->select('x5_contacts.username', 'user_files.unique_id', 'user_files.file_name', 'user_files.file_type', 'user_files.file_size', 'user_files.upload_datetime', 'user_files.total_rows', 'user_files.processed')
                    ->where(function ($query) use($data) {
                        $query->where('x5_contacts.company_id', $data['current_company_id'])
                        ->orWhere('user_files.company_id', $data['current_company_id']);
                    })
                    ->where('user_files.removed', '0');
            if ($data['search'] != NULL) {
                $search = $data['search'];
                $user_files = $user_files->where(function ($query) use ($search) {
                    $query->where('x5_contacts.username', 'like', "%{$search}%")
                            ->orWhere('user_files.unique_id', 'like', "%{$search}%")
                            ->orWhere('user_files.file_name', 'like', "%{$search}%")
                            ->orWhere('user_files.file_type', 'like', "%{$search}%")
                            ->orWhere('user_files.file_size', 'like', "%{$search}%")
                            ->orWhere('user_files.upload_datetime', 'like', "%{$search}%")
                            ->orWhere('user_files.total_rows', 'like', "%{$search}%")
                            ->orWhere('user_files.processed', 'like', "%{$search}%");
                });
            }
            $user_files = $user_files->orderBy('user_files.upload_datetime', 'desc')
                    ->paginate($data['limit']);
            return $user_files;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

}
