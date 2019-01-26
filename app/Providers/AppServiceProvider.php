<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Validator;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //force hhtps
        if (!\App::environment('local')) {
          \URL::forceScheme('https');
        }
        
        
         Validator::extend('validate_userid', 'App\Helper\CustomValidate@isUserIdValid');
         Validator::extend('unique_id', 'App\Helper\CustomValidate@uniqueId');
         Validator::extend('validate_superuser_del', 'App\Helper\CustomValidate@validateSuperDel');
         Validator::extend('validate_access_cntct_grp', 'App\Helper\CustomValidate@validateAccessContactGrp');
         Validator::extend('validate_access_cntct_grp_edit', 'App\Helper\CustomValidate@validateAccessContactGrpEdit');
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
