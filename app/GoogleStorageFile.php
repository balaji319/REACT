<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\ErrorLog;
use Exception;

class GoogleStorageFile extends Model {

    use ErrorLog;

    const BUCKET_TYPE_COMPANY_ID = 1;
    const BUCKET_TYPE_YTEL = 2;
    const BUCKET_YTEL_X5 = 'ytel-cc-dev';

    protected $primaryKey = 'google_storage_log_id';
    public $timestamps = false;
    protected $fillable = ['*'];

}
