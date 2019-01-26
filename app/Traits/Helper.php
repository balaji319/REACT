<?php

namespace App\Traits;

use File;
use Cache;

trait Helper {

    /**
     * Get the domain name and include $tldLength segments of the tld.
     *
     * @param int $tldLength Number of segments your tld contains. For example: `example.com` contains 1 tld.
     *   While `example.co.uk` contains 2.
     * @return string Domain name without subdomains.
     */
    public function getDomain($url) {
        $tldLength = 1;
        $segments = explode('.', $url);
        $domain = array_slice($segments, -1 * ($tldLength + 1));
        return implode('.', $domain);
    }

    /**
     * Get the subdomains for a host.
     *
     * @param int $tldLength Number of segments your tld contains. For example: `example.com` contains 1 tld.
     *   While `example.co.uk` contains 2.
     * @return array An array of subdomains.
     */
    public function getSubdomains($url) {
        $url = parse_url($url, PHP_URL_HOST);
        return strstr(str_replace("www.", "", $url), ".", true);
    }

    /**
     * Get the IP the client is using, or says they are using.
     *
     * @param bool $safe Use safe = false when you think the user might manipulate their HTTP_CLIENT_IP
     *   header. Setting $safe = false will also look at HTTP_X_FORWARDED_FOR
     * @return string The client IP.
     */
    public function clientIp() {
        $ipaddress = '';
        if (isset($_SERVER['HTTP_CLIENT_IP']))
            $ipaddress = $_SERVER['HTTP_CLIENT_IP'];
        else if (isset($_SERVER['HTTP_X_FORWARDED_FOR']))
            $ipaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
        else if (isset($_SERVER['HTTP_X_FORWARDED']))
            $ipaddress = $_SERVER['HTTP_X_FORWARDED'];
        else if (isset($_SERVER['HTTP_FORWARDED_FOR']))
            $ipaddress = $_SERVER['HTTP_FORWARDED_FOR'];
        else if (isset($_SERVER['HTTP_FORWARDED']))
            $ipaddress = $_SERVER['HTTP_FORWARDED'];
        else if (isset($_SERVER['REMOTE_ADDR']))
            $ipaddress = $_SERVER['REMOTE_ADDR'];
        else
            $ipaddress = 'UNKNOWN';
        return $ipaddress;
    }

    /**
     * Get valid URL (http/https)
     *
     * @param url string
     *
     * @return http/https url string
     */
    public function getValidUrl($url) {

        $full_url = 'https://';

        if (\App::environment('local')) {
            $full_url = 'http://';
        }


        return $full_url . $url;
    }

    /**
     * Generate unique string
     *
     * @return string
     */
    public function uniqueId($limit) {
        $date = date_create();
        $date_timestamp = date_timestamp_get($date);
        $unique_id = substr(base_convert(sha1(uniqid(mt_rand())), $limit, 36), 0, $limit) . $date_timestamp;
        return wordwrap($unique_id, 8, '-', true);
    }

}
