<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class CompanyDb extends Model
{
    protected $connection = 'invdb';
    protected $table = 'company_dbs';
    public $timestamps = false;
    public $primaryKey = 'id';
}
