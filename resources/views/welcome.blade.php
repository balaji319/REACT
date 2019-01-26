<!doctype html>
<html lang="{{ app()->getLocale() }}">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>Account : Ytel</title>
        <link rel="icon" href="https://portal-qa.message360.com/favicon-blue.png" type="image/x-icon">
        <link href="{{asset('css/material-design-iconic-font/css/material-design-iconic-font.min.css')}}" rel="stylesheet" type="text/css">
        <link href="{{asset('css/ytel.css')}}" rel="stylesheet" type="text/css">
        <link href="{{asset('css/font-awesome-4.7.0/css/font-awesome.min.css')}}" rel="stylesheet" type="text/css">
        <link href="{{asset('css/react-notification/react-notifications.css')}}" rel="stylesheet" type="text/css">
        <link href="{{asset('css/weather-icons/css/weather-icons.min.css')}}" rel="stylesheet" type="text/css">
        <link href="{{asset('css/flag/sprite-flags-24x24.css')}}" rel="stylesheet" type="text/css">
        <link href="{{asset('css/animate.css')}}" rel="stylesheet" type="text/css">
        <link href="{{asset('css/bootstrap-rtl.css')}}" rel="stylesheet" type="text/css">
        <link href="{{asset('css/loader.css')}}" rel="stylesheet" type="text/css">
        <link href="{{asset('css/react-select/react-select.css')}}" rel="stylesheet" type="text/css">

    </head>
    <body   style="display:contents !important" >
    <div id="app">
        <div class="initial-load-animation">
            <div class="linkedin-image"></div>
            <div class="loading-bar">
                <div class="blue-bar"></div>
            </div>
            </div>
        </div>
        </div>
        <script src="{{asset('js/app.js')}}" ></script>


    </body>
</html>
