<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;

use Illuminate\Validation\ValidationException;

use App\Traits\ErrorLog;

class Handler extends ExceptionHandler
{
    use ErrorLog;

    /**
     * A list of the exception types that are not reported.
     *
     * @var array
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array
     */
    protected $dontFlash = [
        'password',
        'password_confirmation',
    ];

    /**
     * Report or log an exception.
     *
     * @param  \Exception  $exception
     * @return void
     */
    public function report(Exception $exception)
    {
        parent::report($exception);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Exception  $exception
     * @return \Illuminate\Http\Response
     */
    public function render($request, Exception $exception)
    {
        $this->postLogs(config('errorcontants.mysql'), $exception);

        $error_code = ($exception->getCode() != 0) ? $exception->getCode() : 500;

         /*Unauthenticated*/
           if ($exception instanceof \Illuminate\Auth\AuthenticationException) {
                $msg = 'Authentication Failed.';
                return response()->json([
                'status' => '405',
                'msg' => $msg
            ],'405');
            }


         /*validation*/
         if(property_exists($exception, 'validator')){
            $msg = $exception->validator->errors();
                return response()->json([
                'status' => '400',
                'msg' => $msg->first()
            ],'400');
         }


        /*general msg*/
       return response()->json([
            'status' => $error_code,
            'msg' => $exception->getMessage()
        ],$error_code);

        return parent::render($request, $exception);
    }
}

