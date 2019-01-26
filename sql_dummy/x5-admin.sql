-- phpMyAdmin SQL Dump
-- version 4.5.4.1deb2ubuntu2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jun 19, 2018 at 03:47 PM
-- Server version: 5.7.22-0ubuntu0.16.04.1
-- PHP Version: 7.0.30-0ubuntu0.16.04.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `x5-admin`
--

-- --------------------------------------------------------

--
-- Table structure for table `acarrier`
--

CREATE TABLE `acarrier` (
  `id` int(11) NOT NULL,
  `name` varchar(40) DEFAULT NULL,
  `outbound` int(11) DEFAULT NULL,
  `active` int(11) DEFAULT NULL,
  `handycap` decimal(7,5) DEFAULT '0.00000',
  `gatewaystring` varchar(40) DEFAULT NULL,
  `lastupdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `percenthandycap` int(11) NOT NULL DEFAULT '0',
  `defaultrate` decimal(7,6) DEFAULT '0.000000',
  `defaultintrarate` decimal(7,6) DEFAULT '0.000000',
  `defaultinterrate` decimal(7,6) DEFAULT '0.000000',
  `tollfree` int(11) DEFAULT '0',
  `tollfreecost` decimal(7,6) DEFAULT '0.000000',
  `nonlergrates` int(11) DEFAULT '0',
  `groupid` int(11) DEFAULT NULL,
  `ytel_company_id` bigint(20) DEFAULT NULL,
  `in_ytel_sbc` int(11) DEFAULT NULL,
  `in_sippro_sbc` int(11) DEFAULT NULL,
  `sscompanyname` varchar(40) DEFAULT NULL,
  `ssroutetable` int(11) DEFAULT NULL,
  `ssaggcapacity` int(11) DEFAULT NULL,
  `sssipprofile` int(11) DEFAULT NULL,
  `ssaggcps` int(11) DEFAULT NULL,
  `ssdigitmaptable` int(11) DEFAULT NULL,
  `ssmincallduration` int(11) DEFAULT NULL,
  `ssmaxcallduration` int(11) DEFAULT NULL,
  `ssservicestate` varchar(40) DEFAULT NULL,
  `ssstoprouteprofile` int(11) DEFAULT NULL,
  `ssendpoints` varchar(4096) DEFAULT NULL,
  `sscompanyid` varchar(40) DEFAULT NULL,
  `sstrunkid` int(11) DEFAULT NULL,
  `ssserviceport` int(11) DEFAULT NULL,
  `ssingressmatch` varchar(20) DEFAULT NULL,
  `ssingressaction1` varchar(20) DEFAULT NULL,
  `ssingressdigit1` varchar(20) DEFAULT NULL,
  `ssingressaction2` varchar(20) DEFAULT NULL,
  `ssingressdigit2` varchar(20) DEFAULT NULL,
  `ssegressmatch` varchar(20) DEFAULT NULL,
  `ssegressaction1` varchar(20) DEFAULT NULL,
  `ssegressdigit1` varchar(20) DEFAULT NULL,
  `ssegressaction2` varchar(20) DEFAULT NULL,
  `ssegressdigit2` varchar(20) DEFAULT NULL,
  `ratelines` int(11) NOT NULL DEFAULT '0',
  `cnam_enabled` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `accesses`
--

CREATE TABLE `accesses` (
  `access_id` smallint(5) UNSIGNED NOT NULL,
  `access_name` varchar(45) NOT NULL,
  `control_id` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `Acct_manager`
--

CREATE TABLE `Acct_manager` (
  `launchpad_id` int(10) NOT NULL,
  `AccountId` varchar(200) NOT NULL,
  `company_id` int(10) NOT NULL,
  `est_training_date` date NOT NULL,
  `est_live_date` date NOT NULL,
  `product_type` varchar(200) NOT NULL,
  `stations` mediumint(9) NOT NULL,
  `admins` mediumint(9) NOT NULL,
  `inbound` varchar(45) NOT NULL,
  `inbound_notes` varchar(200) NOT NULL,
  `local_timezone` tinyint(4) NOT NULL,
  `acct_manager` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `acos`
--

CREATE TABLE `acos` (
  `id` int(10) NOT NULL,
  `parent_id` int(10) DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `foreign_key` int(10) DEFAULT NULL,
  `alias` varchar(255) DEFAULT NULL,
  `lft` int(10) DEFAULT NULL,
  `rght` int(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `actions_table`
--

CREATE TABLE `actions_table` (
  `id` int(11) NOT NULL,
  `dataId` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `user` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `admin_access_keys`
--

CREATE TABLE `admin_access_keys` (
  `id` int(11) NOT NULL,
  `admin_access_method_id` int(10) UNSIGNED NOT NULL,
  `requester_id` int(10) UNSIGNED DEFAULT NULL,
  `requester_ip` varchar(45) DEFAULT NULL,
  `code` varchar(45) DEFAULT NULL,
  `create_datetime` datetime NOT NULL,
  `authorized_datetime` datetime DEFAULT NULL,
  `tried` tinyint(2) UNSIGNED NOT NULL DEFAULT '0',
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `expired` tinyint(1) UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `admin_access_methods`
--

CREATE TABLE `admin_access_methods` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(11) UNSIGNED NOT NULL,
  `contact_id` int(11) UNSIGNED NOT NULL,
  `method` varchar(20) DEFAULT 'sms' COMMENT 'sms/email/secretword',
  `secret_hints` varchar(255) DEFAULT NULL,
  `secret` varchar(255) DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `from_time` time DEFAULT NULL,
  `to_time` time DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `comment` varchar(255) DEFAULT NULL COMMENT 'Use for CS to ID call in person’s ID'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `admin_access_temp_codes`
--

CREATE TABLE `admin_access_temp_codes` (
  `id` int(10) UNSIGNED NOT NULL,
  `contact_id` int(10) UNSIGNED NOT NULL,
  `requester_id` int(10) UNSIGNED NOT NULL COMMENT 'tel admin user_id',
  `requester_ip` varchar(45) DEFAULT NULL COMMENT 'ytel admin IP',
  `code` varchar(45) NOT NULL,
  `request_datetime` datetime NOT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `tried` tinyint(2) NOT NULL DEFAULT '0',
  `expired` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `admin_company_logs`
--

CREATE TABLE `admin_company_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED NOT NULL,
  `submitter_id` int(10) UNSIGNED NOT NULL COMMENT 'user.user_id',
  `type` varchar(15) NOT NULL DEFAULT 'warning',
  `message` varchar(500) NOT NULL,
  `create_datetime` datetime NOT NULL,
  `dismiss_by_cs` tinyint(1) NOT NULL DEFAULT '1',
  `dismissed` tinyint(1) NOT NULL DEFAULT '0',
  `dismissed_by` int(10) UNSIGNED DEFAULT NULL,
  `dismiss_datetime` datetime DEFAULT NULL,
  `priority` tinyint(2) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `admin_search_histories`
--

CREATE TABLE `admin_search_histories` (
  `id` int(11) NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `search_string` varchar(255) DEFAULT NULL,
  `search_datetime` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `agent_ip_log`
--

CREATE TABLE `agent_ip_log` (
  `iplog_id` bigint(20) NOT NULL,
  `ip_address` varchar(16) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `event_date` datetime DEFAULT NULL,
  `user` varchar(8) DEFAULT NULL,
  `browser` varchar(255) DEFAULT NULL,
  `server` varchar(16) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `api_keys`
--

CREATE TABLE `api_keys` (
  `id` int(11) NOT NULL,
  `api_class_name` varchar(255) DEFAULT NULL,
  `api_function_name` varchar(255) NOT NULL,
  `api_key` varchar(255) NOT NULL,
  `for` varchar(255) DEFAULT NULL,
  `enable` tinyint(1) NOT NULL DEFAULT '1',
  `create_datetime` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `api_logs`
--

CREATE TABLE `api_logs` (
  `api_log_id` int(11) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `method` varchar(45) DEFAULT NULL,
  `x5_contact_id` int(11) DEFAULT NULL,
  `api_group` varchar(45) DEFAULT NULL,
  `api_method` varchar(255) DEFAULT NULL,
  `response` text,
  `create_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `apps`
--

CREATE TABLE `apps` (
  `app_id` int(11) NOT NULL,
  `app_key` varchar(45) DEFAULT NULL,
  `app_type_id` int(11) DEFAULT NULL,
  `app_name` varchar(45) DEFAULT NULL,
  `app_subtitle` varchar(255) DEFAULT NULL,
  `app_description` varchar(1000) DEFAULT NULL,
  `app_price_text` varchar(45) DEFAULT NULL,
  `app_features` text,
  `app_icon` varchar(45) DEFAULT NULL,
  `app_showcast_icon` varchar(45) DEFAULT NULL,
  `in_front` tinyint(1) DEFAULT '0',
  `order` int(11) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `purchase_method` varchar(20) DEFAULT NULL COMMENT 'open-ticket,shopping-cart,text',
  `purchase_method_text` text,
  `version` varchar(10) DEFAULT NULL,
  `last_update` datetime DEFAULT NULL,
  `change_logs` text
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `app_companies`
--

CREATE TABLE `app_companies` (
  `id` int(11) NOT NULL,
  `company_id` int(10) UNSIGNED NOT NULL,
  `app_id` smallint(2) NOT NULL,
  `db_id` int(11) DEFAULT NULL,
  `options` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `app_files`
--

CREATE TABLE `app_files` (
  `app_files` int(11) NOT NULL,
  `app_id` int(11) DEFAULT NULL,
  `file_type` varchar(45) DEFAULT NULL,
  `file_thumb` varchar(45) DEFAULT NULL,
  `file_path` varchar(45) DEFAULT NULL,
  `file_title` varchar(45) DEFAULT NULL,
  `order` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `app_types`
--

CREATE TABLE `app_types` (
  `app_type_id` int(11) NOT NULL,
  `type_name` varchar(45) DEFAULT NULL,
  `type_description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `cake_sessions`
--

CREATE TABLE `cake_sessions` (
  `id` varchar(255) NOT NULL DEFAULT '',
  `data` text,
  `expires` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `client_ccreport_info`
--

CREATE TABLE `client_ccreport_info` (
  `id` int(11) NOT NULL,
  `url` text NOT NULL,
  `client_id` varchar(255) DEFAULT NULL,
  `request` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `dashboards`
--

CREATE TABLE `dashboards` (
  `dashboard_id` int(11) UNSIGNED NOT NULL,
  `dashboard_name` varchar(45) NOT NULL,
  `x5_contact_id` int(10) UNSIGNED NOT NULL,
  `dashboard_descriptions` varchar(300) DEFAULT NULL,
  `cols` tinyint(1) DEFAULT '3',
  `order` tinyint(2) NOT NULL,
  `locked` tinyint(1) NOT NULL DEFAULT '0',
  `enable` tinyint(1) NOT NULL DEFAULT '1',
  `update_datetime` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `dashboard_permissions`
--

CREATE TABLE `dashboard_permissions` (
  `id` int(11) NOT NULL,
  `dashboard_id` varbinary(16) NOT NULL,
  `company` tinyint(1) NOT NULL DEFAULT '0',
  `contact_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `dashboard_widgets`
--

CREATE TABLE `dashboard_widgets` (
  `id` int(11) NOT NULL,
  `dashboard_id` int(10) UNSIGNED NOT NULL,
  `widget_id` int(10) UNSIGNED NOT NULL,
  `col` tinyint(2) UNSIGNED NOT NULL,
  `row` tinyint(2) UNSIGNED NOT NULL,
  `size_x` tinyint(2) NOT NULL,
  `size_y` tinyint(2) NOT NULL,
  `extra` varchar(500) DEFAULT NULL,
  `xy_position` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `db_col_change_logs`
--

CREATE TABLE `db_col_change_logs` (
  `change_log_id` int(10) UNSIGNED NOT NULL,
  `x5_contact_id` int(10) UNSIGNED NOT NULL,
  `x5_contact_username` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `db_id` int(10) UNSIGNED NOT NULL,
  `db_name` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `db_col_setting_id` int(10) UNSIGNED DEFAULT NULL,
  `vici_db_table` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `vici_db_field` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `other` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `original_value` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `new_value` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `success` tinyint(1) NOT NULL DEFAULT '0',
  `change_datetime` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `db_col_permissions`
--

CREATE TABLE `db_col_permissions` (
  `row_id` int(11) NOT NULL,
  `model` varchar(10) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'Contact' COMMENT 'Global > Company > Contact',
  `model_id` int(10) UNSIGNED DEFAULT NULL COMMENT 'Company ID or Contact ID',
  `db_col_setting_id` int(10) UNSIGNED DEFAULT NULL,
  `db_col_setting_group_id` int(10) UNSIGNED DEFAULT NULL,
  `level` tinyint(4) NOT NULL DEFAULT '0' COMMENT '0: No Access, 1: Read Access, 2: Read&Write Access',
  `entry_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `db_col_settings`
--

CREATE TABLE `db_col_settings` (
  `db_col_setting_id` int(10) UNSIGNED NOT NULL,
  `vici_version` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `vici_db_table` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `vici_db_field` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `vici_label` varchar(60) COLLATE utf8_unicode_ci DEFAULT NULL,
  `alian` varchar(60) COLLATE utf8_unicode_ci DEFAULT NULL,
  `type` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `type_extra` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  `class` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `default` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `tooltip` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `note` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `enable` tinyint(1) DEFAULT '1',
  `order` smallint(6) DEFAULT '0',
  `update_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `db_col_settings_new`
--

CREATE TABLE `db_col_settings_new` (
  `db_col_setting_id` int(10) UNSIGNED NOT NULL,
  `vici_version` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `vici_db_table` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `vici_db_field` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `vici_label` varchar(60) COLLATE utf8_unicode_ci DEFAULT NULL,
  `alian` varchar(60) COLLATE utf8_unicode_ci DEFAULT NULL,
  `type` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `type_extra` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  `class` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `default` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `tooltip` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `note` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `enable` tinyint(1) DEFAULT '1',
  `order` smallint(6) DEFAULT '0',
  `update_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `db_col_settings_old`
--

CREATE TABLE `db_col_settings_old` (
  `db_col_setting_id` int(10) UNSIGNED NOT NULL,
  `vici_version` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `vici_db_table` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `vici_db_field` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `vici_label` varchar(60) COLLATE utf8_unicode_ci DEFAULT NULL,
  `alian` varchar(60) COLLATE utf8_unicode_ci DEFAULT NULL,
  `type` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `type_extra` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  `class` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `default` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `tooltip` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `note` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `enable` tinyint(1) DEFAULT '1',
  `order` smallint(6) DEFAULT '0',
  `update_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `db_col_setting_db_col_setting_display_groups`
--

CREATE TABLE `db_col_setting_db_col_setting_display_groups` (
  `db_col_setting_id` int(10) UNSIGNED NOT NULL,
  `db_col_setting_display_group_id` int(10) UNSIGNED NOT NULL,
  `row_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `db_col_setting_db_col_setting_groups`
--

CREATE TABLE `db_col_setting_db_col_setting_groups` (
  `db_col_setting_group_id` int(10) UNSIGNED NOT NULL,
  `db_col_setting_id` int(10) UNSIGNED NOT NULL,
  `row_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `db_col_setting_display_groups`
--

CREATE TABLE `db_col_setting_display_groups` (
  `db_col_setting_display_group_id` int(10) UNSIGNED NOT NULL,
  `db_col_setting_id` int(10) UNSIGNED NOT NULL,
  `group_title` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `group_description` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL,
  `create_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `db_col_setting_groups`
--

CREATE TABLE `db_col_setting_groups` (
  `db_col_setting_group_id` int(10) UNSIGNED NOT NULL,
  `group_name` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `group_description` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL,
  `note` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `create_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `gcm_messages`
--

CREATE TABLE `gcm_messages` (
  `gcm_message_id` int(11) NOT NULL,
  `gcm_record_id` int(10) UNSIGNED DEFAULT NULL,
  `message_id` varchar(100) DEFAULT NULL,
  `gcm_message_data_id` int(10) UNSIGNED DEFAULT NULL,
  `fetched` tinyint(1) DEFAULT '0',
  `create_datetime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fetch_datetime` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `gcm_message_datas`
--

CREATE TABLE `gcm_message_datas` (
  `gcm_message_data_id` int(11) UNSIGNED NOT NULL,
  `message_data` varchar(500) DEFAULT NULL,
  `create_datetime` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `gcm_message_histories`
--

CREATE TABLE `gcm_message_histories` (
  `gcm_message_history_id` int(10) UNSIGNED NOT NULL,
  `gcm_record_id` int(10) UNSIGNED NOT NULL,
  `gcm_message_id` int(10) UNSIGNED NOT NULL,
  `result` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `gcm_records`
--

CREATE TABLE `gcm_records` (
  `gcm_record_id` int(11) UNSIGNED NOT NULL,
  `x5_contact_id` int(10) UNSIGNED NOT NULL,
  `reg_id` varchar(255) NOT NULL,
  `type` tinyint(3) NOT NULL DEFAULT '1' COMMENT '1:desktop,2:android,3:ios',
  `create_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_datetime` timestamp NULL DEFAULT NULL,
  `disconnected` tinyint(1) DEFAULT '0',
  `disconnect_reason` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `google_storage_files`
--

CREATE TABLE `google_storage_files` (
  `google_storage_file_id` int(11) NOT NULL,
  `product_type_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `owner_id` int(11) DEFAULT NULL,
  `bucket_type` int(11) DEFAULT '1',
  `object_folder` varchar(255) DEFAULT NULL,
  `object_name` varchar(255) DEFAULT NULL,
  `file_link` varchar(255) DEFAULT NULL,
  `public` tinyint(1) DEFAULT '0',
  `gs_id` varchar(255) DEFAULT NULL,
  `gs_size` int(11) DEFAULT NULL,
  `gs_object` text,
  `upload_datetime` datetime DEFAULT NULL,
  `remove_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `google_storage_logs`
--

CREATE TABLE `google_storage_logs` (
  `google_storage_log_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `error` int(11) DEFAULT '0',
  `gs_return` text,
  `ex_message` text,
  `ex_trace` text,
  `create_datetime` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(8, '2016_06_01_000001_create_oauth_auth_codes_table', 1),
(9, '2016_06_01_000002_create_oauth_access_tokens_table', 1),
(10, '2016_06_01_000003_create_oauth_refresh_tokens_table', 1),
(11, '2016_06_01_000004_create_oauth_clients_table', 1),
(12, '2016_06_01_000005_create_oauth_personal_access_clients_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `notification_settings`
--

CREATE TABLE `notification_settings` (
  `notification_setting_id` int(11) NOT NULL,
  `company_id` int(11) DEFAULT NULL,
  `x5_contact_id` int(11) DEFAULT NULL,
  `product_type_id` int(11) DEFAULT NULL,
  `notification_method` int(11) DEFAULT NULL,
  `options` varchar(255) DEFAULT NULL,
  `reference_id` varchar(255) DEFAULT NULL,
  `destination` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `create_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `oauth_access_tokens`
--

CREATE TABLE `oauth_access_tokens` (
  `id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `client_id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scopes` text COLLATE utf8mb4_unicode_ci,
  `revoked` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `oauth_access_tokens`
--

INSERT INTO `oauth_access_tokens` (`id`, `user_id`, `client_id`, `name`, `scopes`, `revoked`, `created_at`, `updated_at`, `expires_at`) VALUES
('0ad94d6c02f120d57ace95d80d81b47acb76228fce4196fd9256ddf180a75a13be4649046afcaa65', 3538, 1, 'Personal Access Token', '[]', 0, '2018-06-18 00:06:16', '2018-06-18 00:06:16', '2019-06-18 05:36:16'),
('0e4a3ffb3c6b18405b71dd4fb30aa059477e4e1cca242660f82aa44891d53ea6dedc63413f24ffe2', 3538, 1, 'Personal Access Token', '[]', 0, '2018-06-15 00:55:35', '2018-06-15 00:55:35', '2019-06-15 06:25:35'),
('20a9f7a4638c17c813a91d0fc6b33589d79d009f32b3e2a9c7228fc296476c94c455ed716d0bd731', NULL, 1, 'Personal Access Token', '[]', 0, '2018-06-11 06:09:20', '2018-06-11 06:09:20', '2019-06-11 11:39:20'),
('276414f5d7dc37b00ed279943d2da2ef0e82f3bf98d90ad04975644f6d21c3a72fbc44fbea232c4f', NULL, 1, 'Personal Access Token', '[]', 0, '2018-06-11 06:00:53', '2018-06-11 06:00:53', '2019-06-11 11:30:53'),
('533b2fdf6a4c68e71d0a39a22e97a18d56865fd19aa32d8e3ca2af0fbad2779b541925ef1319a1b0', 3538, 1, 'Personal Access Token', '[]', 0, '2018-06-15 00:53:44', '2018-06-15 00:53:44', '2019-06-15 06:23:44'),
('5896b6058a8bf04d41cd19cffbeec18cb9d981879a14bf9f3ad0fde8a70afc2877a5922237a5e816', 3539, 1, 'Personal Access Token', '[]', 0, '2018-06-11 06:27:20', '2018-06-11 06:27:20', '2019-06-11 11:57:20'),
('adba6997bb4f29ea5829ec1317fa52618807224e3e795c05004379259959d5ae46eb40db45d5bf5a', 3538, 1, 'Personal Access Token', '[]', 0, '2018-06-13 00:16:38', '2018-06-13 00:16:38', '2019-06-13 05:46:38'),
('b85a7de0d6e18a199769f969ad873362cc8b17c1d18163047ebb252e4c526502d1e0d29d8a33b594', 3538, 1, 'Personal Access Token', '[]', 0, '2018-06-19 04:41:15', '2018-06-19 04:41:15', '2019-06-19 10:11:15'),
('d6c8cd38d33cb4babb9580449171095893555da2f47b61d15096c1503f2ffa38db912b087c38363b', 3538, 1, 'Personal Access Token', '[]', 0, '2018-06-18 01:30:37', '2018-06-18 01:30:37', '2019-06-18 07:00:37');

-- --------------------------------------------------------

--
-- Table structure for table `oauth_auth_codes`
--

CREATE TABLE `oauth_auth_codes` (
  `id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `scopes` text COLLATE utf8mb4_unicode_ci,
  `revoked` tinyint(1) NOT NULL,
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `oauth_clients`
--

CREATE TABLE `oauth_clients` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `secret` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `redirect` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `personal_access_client` tinyint(1) NOT NULL,
  `password_client` tinyint(1) NOT NULL,
  `revoked` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `oauth_clients`
--

INSERT INTO `oauth_clients` (`id`, `user_id`, `name`, `secret`, `redirect`, `personal_access_client`, `password_client`, `revoked`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Laravel Personal Access Client', 'EeaoHKSDSQ66lyQH0UQodHcoadbZUIZE5bA5HMDc', 'http://localhost', 1, 0, 0, '2018-06-11 04:20:54', '2018-06-11 04:20:54'),
(2, NULL, 'Laravel Password Grant Client', 'CkXyA7R9XWhozIC7IVyzPQXwos8idvfnh76S645A', 'http://localhost', 0, 1, 0, '2018-06-11 04:20:54', '2018-06-11 04:20:54');

-- --------------------------------------------------------

--
-- Table structure for table `oauth_personal_access_clients`
--

CREATE TABLE `oauth_personal_access_clients` (
  `id` int(10) UNSIGNED NOT NULL,
  `client_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `oauth_personal_access_clients`
--

INSERT INTO `oauth_personal_access_clients` (`id`, `client_id`, `created_at`, `updated_at`) VALUES
(1, 1, '2018-06-11 04:20:54', '2018-06-11 04:20:54');

-- --------------------------------------------------------

--
-- Table structure for table `oauth_refresh_tokens`
--

CREATE TABLE `oauth_refresh_tokens` (
  `id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `access_token_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `revoked` tinyint(1) NOT NULL,
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `push_notification_subscribers`
--

CREATE TABLE `push_notification_subscribers` (
  `push_notification_subscriber_id` int(11) NOT NULL,
  `company_id` int(11) UNSIGNED DEFAULT NULL,
  `user_id` int(11) UNSIGNED DEFAULT NULL COMMENT 'Here is X5 contact Id',
  `browser` varchar(255) DEFAULT NULL,
  `name` varchar(25) DEFAULT NULL,
  `subscriber_id` varchar(45) DEFAULT NULL,
  `subscribe_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `report_id` int(11) NOT NULL,
  `report_name` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `report_files`
--

CREATE TABLE `report_files` (
  `report_file_id` int(11) NOT NULL,
  `unique_id` varchar(36) DEFAULT NULL,
  `db_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `requester_x5_contact_id` int(11) DEFAULT NULL,
  `request_datetime` datetime DEFAULT NULL,
  `finish_datetime` datetime DEFAULT NULL,
  `report_type_id` int(11) DEFAULT NULL,
  `query_from_date` date DEFAULT NULL,
  `query_to_date` date DEFAULT NULL,
  `options` text,
  `options_hash` varchar(32) DEFAULT NULL,
  `google_storage_file_id` int(11) DEFAULT NULL,
  `report_name` text
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `report_file_queues`
--

CREATE TABLE `report_file_queues` (
  `report_file_queue_id` int(11) NOT NULL,
  `report_type_id` int(11) NOT NULL DEFAULT '0',
  `db_id` int(11) DEFAULT '0',
  `company_id` int(11) UNSIGNED DEFAULT '0',
  `requester_x5_contact_id` int(11) UNSIGNED DEFAULT '0',
  `status` int(11) NOT NULL DEFAULT '0',
  `request_datetime` datetime DEFAULT NULL,
  `start_datetime` datetime DEFAULT NULL,
  `finish_datetime` datetime DEFAULT NULL,
  `request_url` text,
  `admin_login_password` varchar(512) DEFAULT NULL,
  `request_data` text,
  `report_file_id` int(11) DEFAULT NULL,
  `google_storage_file_id` int(11) DEFAULT NULL,
  `file_name` varchar(128) DEFAULT NULL,
  `report_name` text,
  `cron_uuid` varchar(128) DEFAULT NULL,
  `notify` varchar(512) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `sso`
--

CREATE TABLE `sso` (
  `sso_id` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `x5_contact_id` int(10) UNSIGNED NOT NULL,
  `remote_ip` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `debug` varchar(1000) COLLATE utf8_unicode_ci DEFAULT NULL,
  `create_datetime` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_components`
--

CREATE TABLE `system_components` (
  `system_component_id` int(11) NOT NULL,
  `system_component_group_id` int(11) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `order` smallint(2) DEFAULT '1',
  `_create` tinyint(1) DEFAULT '0',
  `_read` tinyint(1) DEFAULT '0',
  `_update` tinyint(1) DEFAULT '0',
  `_delete` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `system_component_groups`
--

CREATE TABLE `system_component_groups` (
  `system_component_group_id` int(11) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `order` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `system_permission_models`
--

CREATE TABLE `system_permission_models` (
  `model_id` int(10) UNSIGNED NOT NULL,
  `model_key` varchar(45) NOT NULL,
  `model_name` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `TABLE 74`
--

CREATE TABLE `TABLE 74` (
  `COL 1` varchar(17) DEFAULT NULL,
  `COL 2` varchar(10) DEFAULT NULL,
  `COL 3` varchar(5) DEFAULT NULL,
  `COL 4` varchar(7) DEFAULT NULL,
  `COL 5` varchar(8) DEFAULT NULL,
  `COL 6` varchar(11) DEFAULT NULL,
  `COL 7` varchar(11) DEFAULT NULL,
  `COL 8` varchar(20) DEFAULT NULL,
  `COL 9` varchar(8) DEFAULT NULL,
  `COL 10` varchar(14) DEFAULT NULL,
  `COL 11` varchar(5) DEFAULT NULL,
  `COL 12` varchar(7) DEFAULT NULL,
  `COL 13` varchar(7) DEFAULT NULL,
  `COL 14` varchar(11) DEFAULT NULL,
  `COL 15` varchar(11) DEFAULT NULL,
  `COL 16` varchar(14) DEFAULT NULL,
  `COL 17` varchar(8) DEFAULT NULL,
  `COL 18` varchar(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `TABLE 74`
--

INSERT INTO `TABLE 74` (`COL 1`, `COL 2`, `COL 3`, `COL 4`, `COL 5`, `COL 6`, `COL 7`, `COL 8`, `COL 9`, `COL 10`, `COL 11`, `COL 12`, `COL 13`, `COL 14`, `COL 15`, `COL 16`, `COL 17`, `COL 18`) VALUES
('pplication_dns', 'company_id', 'db_id', 'db_port', 'db_name', 'db_username', 'db_password', 'db_description', 'timezone', 'ipstring', 'db_id', 'db_port', 'db_name', 'db_username', 'db_password', 'db_description', 'timezone', 'ipstring'),
('goodsell.ytel.com', '20,000', '756', '', 'asterisk', '', '', 'goodsell test server', '', '172.31.215.113', '', '', '', '', '', '', '', '');

-- --------------------------------------------------------

--
-- Table structure for table `user_files`
--

CREATE TABLE `user_files` (
  `id` int(11) UNSIGNED NOT NULL,
  `unique_id` varchar(45) NOT NULL,
  `exec_server_id` varchar(30) DEFAULT NULL,
  `google_storage_file_id` int(11) DEFAULT NULL,
  `type` tinyint(3) NOT NULL DEFAULT '1' COMMENT '1:DataLoader (lead)',
  `file_name` varchar(255) NOT NULL,
  `file_size` int(11) DEFAULT NULL,
  `file_type` varchar(20) DEFAULT NULL,
  `server_file_location` varchar(255) DEFAULT NULL,
  `server_file_name` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `uploader_id` int(10) UNSIGNED DEFAULT NULL,
  `upload_datetime` timestamp NULL DEFAULT NULL,
  `total_rows` int(10) UNSIGNED DEFAULT NULL,
  `cols` varchar(1000) DEFAULT NULL,
  `delimiter` varchar(10) DEFAULT NULL,
  `processed` tinyint(1) DEFAULT '0',
  `removed` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `user_file_process_automations`
--

CREATE TABLE `user_file_process_automations` (
  `user_file_process_automation_id` int(11) NOT NULL,
  `company_id` int(11) DEFAULT NULL,
  `x5_contact_id` int(11) DEFAULT NULL,
  `db_id` int(11) DEFAULT NULL,
  `webserver_dns` varchar(100) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `automation_type` int(11) DEFAULT NULL,
  `options` varchar(1000) DEFAULT NULL,
  `file_name` varchar(100) DEFAULT NULL,
  `exec_times` int(11) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `active` tinyint(1) DEFAULT NULL,
  `interval` int(11) DEFAULT NULL COMMENT 'in minutes',
  `last_run` datetime DEFAULT NULL,
  `next_run` datetime DEFAULT NULL,
  `create_datetime` datetime DEFAULT NULL,
  `update_datetime` datetime DEFAULT NULL,
  `random_key` varchar(45) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `user_file_process_automation_posts`
--

CREATE TABLE `user_file_process_automation_posts` (
  `user_file_process_automation_post_id` int(11) NOT NULL,
  `user_file_process_automation_id` int(11) DEFAULT NULL,
  `type` smallint(3) DEFAULT NULL,
  `method` tinyint(2) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `inputs` varchar(500) DEFAULT NULL,
  `order` smallint(3) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `user_file_process_queues`
--

CREATE TABLE `user_file_process_queues` (
  `id` int(11) NOT NULL,
  `user_file_id` int(10) UNSIGNED DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `requester_id` int(10) UNSIGNED DEFAULT NULL,
  `db_id` int(11) DEFAULT NULL,
  `exec_server_id` varchar(30) DEFAULT NULL,
  `webserver_dns` varchar(45) DEFAULT NULL,
  `list_id` varchar(20) DEFAULT NULL,
  `dupcheck` varchar(30) DEFAULT NULL,
  `settings` text,
  `remote_file_location` varchar(100) DEFAULT NULL,
  `current_row` int(11) DEFAULT '0',
  `success_rows` int(11) DEFAULT '0',
  `bad_rows` int(11) DEFAULT '0',
  `total_rows` int(11) DEFAULT '0',
  `empty_total_rows` int(11) DEFAULT '0',
  `status` tinyint(2) DEFAULT '0',
  `create_datetime` timestamp NULL DEFAULT NULL,
  `start_datetime` timestamp NULL DEFAULT NULL,
  `update_datetime` timestamp NULL DEFAULT NULL,
  `finish_datetime` timestamp NULL DEFAULT NULL,
  `php_id` varchar(6) DEFAULT NULL,
  `exec_times` int(11) DEFAULT '0',
  `time_spent` int(11) DEFAULT NULL,
  `success` tinyint(1) DEFAULT '0',
  `error` tinyint(1) DEFAULT '0',
  `error_google_storage_file_id` int(11) DEFAULT NULL,
  `user_canceled` tinyint(1) DEFAULT '0',
  `cancel_user_id` int(10) UNSIGNED DEFAULT NULL,
  `sync_process_type` smallint(2) DEFAULT '0' COMMENT 'null/0:only one process each time, 1:sync process for not same list, 2: sync process for all tasks',
  `message` varchar(100) DEFAULT NULL,
  `last_ytelsettings_return` varchar(300) DEFAULT NULL,
  `last_body_raw` mediumtext,
  `pull_count` int(11) DEFAULT '0' COMMENT 'pull down to the ',
  `check_status_count` int(11) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Stand-in structure for view `v5_contacts`
--
CREATE TABLE `v5_contacts` (
`v5_contact_id` int(10) unsigned
,`company_id` int(10) unsigned
,`username` varchar(45)
,`password` varchar(255)
,`create_datetime` datetime
,`enable` tinyint(1)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v5_contact_permissions`
--
CREATE TABLE `v5_contact_permissions` (
`row_id` int(10) unsigned
,`v5_contact_id` int(10) unsigned
,`permission` varchar(45)
,`permission_extra` varchar(100)
);

-- --------------------------------------------------------

--
-- Table structure for table `widgets`
--

CREATE TABLE `widgets` (
  `widget_id` int(10) UNSIGNED NOT NULL,
  `widget_name` varchar(45) NOT NULL,
  `widget_title` varchar(45) NOT NULL,
  `widget_descriptions` varchar(150) NOT NULL,
  `type` varchar(45) NOT NULL,
  `type_extra` varchar(300) DEFAULT NULL,
  `enable` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `widget_filters`
--

CREATE TABLE `widget_filters` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `widget_id` int(11) NOT NULL,
  `filter_val` text NOT NULL,
  `db_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `widget_types`
--

CREATE TABLE `widget_types` (
  `type` varchar(45) NOT NULL,
  `html` text,
  `option_html` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `x5_contacts`
--

CREATE TABLE `x5_contacts` (
  `x5_contact_id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `username` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8 NOT NULL,
  `create_datetime` datetime NOT NULL,
  `is_admin` tinyint(1) NOT NULL DEFAULT '0',
  `enable` tinyint(1) NOT NULL DEFAULT '1',
  `delete_datetime` datetime DEFAULT NULL,
  `leadbeam_user` tinyint(1) NOT NULL DEFAULT '0',
  `leadbeam_is_admin` tinyint(1) NOT NULL DEFAULT '0',
  `profile_picture` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `udid` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `sms_otp` varchar(10) COLLATE utf8_unicode_ci NOT NULL,
  `otp_verify` enum('0','1') COLLATE utf8_unicode_ci NOT NULL,
  `time_requested` varchar(30) COLLATE utf8_unicode_ci NOT NULL DEFAULT '0000-00-00 00:00:00',
  `qrcode` varchar(10) COLLATE utf8_unicode_ci DEFAULT NULL,
  `db_last_used` int(11) DEFAULT NULL,
  `max_list` int(11) NOT NULL DEFAULT '150',
  `timezone` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_level` tinyint(1) NOT NULL DEFAULT '1',
  `load_leads` tinyint(2) NOT NULL DEFAULT '2',
  `modify_leads` tinyint(2) NOT NULL DEFAULT '2',
  `download_list` tinyint(2) NOT NULL DEFAULT '1',
  `delete_list` tinyint(2) NOT NULL DEFAULT '1',
  `modify_list` tinyint(2) NOT NULL DEFAULT '2',
  `modify_user` tinyint(2) NOT NULL DEFAULT '2',
  `delete_user` tinyint(2) NOT NULL DEFAULT '1',
  `modify_campaign` tinyint(2) NOT NULL DEFAULT '2',
  `delete_campaign` tinyint(1) NOT NULL DEFAULT '1',
  `view_call_reports` tinyint(1) NOT NULL DEFAULT '1',
  `view_agent_reports` tinyint(1) NOT NULL DEFAULT '1',
  `view_time_clock_reports` tinyint(1) NOT NULL DEFAULT '1',
  `modify_user_access` tinyint(2) NOT NULL DEFAULT '2',
  `dataloader_download_lead` tinyint(1) DEFAULT '1',
  `dataloader_delete_lead` tinyint(1) DEFAULT '1',
  `beta_test_allow` tinyint(1) DEFAULT '0',
  `beta_test_enable` tinyint(1) DEFAULT '0',
  `beta_test_site` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `monitor` tinyint(1) DEFAULT '0',
  `password_new` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `x5_contacts`
--

INSERT INTO `x5_contacts` (`x5_contact_id`, `company_id`, `name`, `username`, `password`, `create_datetime`, `is_admin`, `enable`, `delete_datetime`, `leadbeam_user`, `leadbeam_is_admin`, `profile_picture`, `udid`, `sms_otp`, `otp_verify`, `time_requested`, `qrcode`, `db_last_used`, `max_list`, `timezone`, `user_level`, `load_leads`, `modify_leads`, `download_list`, `delete_list`, `modify_list`, `modify_user`, `delete_user`, `modify_campaign`, `delete_campaign`, `view_call_reports`, `view_agent_reports`, `view_time_clock_reports`, `modify_user_access`, `dataloader_download_lead`, `dataloader_delete_lead`, `beta_test_allow`, `beta_test_enable`, `beta_test_site`, `monitor`, `password_new`) VALUES
(3538, 20000, NULL, 'aarti', '$2y$10$xc82sPI4Diaie6i7kdg3PuFBsItsHoScp2O7XPPAwzM/LZn9AfZiq', '2018-10-10 00:00:00', 0, 1, NULL, 0, 0, NULL, '111', '111', '0', '0000-00-00 00:00:00', NULL, NULL, 150, NULL, 1, 2, 2, 1, 1, 2, 2, 1, 2, 1, 1, 1, 1, 2, 1, 1, 0, 0, NULL, 0, NULL),
(3539, 20000, NULL, 'balaji', '$2a$10$sHBEgMkk0eL/fPeO/WaAYetG9S0MNROKkB.L2Htwf5epyYmt3Ubx2', '2018-10-10 00:00:00', 0, 1, NULL, 0, 0, NULL, '111', '111', '0', '0000-00-00 00:00:00', NULL, NULL, 150, NULL, 1, 2, 2, 1, 1, 2, 2, 1, 2, 1, 1, 1, 1, 2, 1, 1, 0, 0, NULL, 0, NULL),
(3540, 20000, NULL, 'balaji', '$2y$10$TQc5hoEwJtMostlbqtkzjOCziKgVdy83AZCrYs0ICpbPJm.bFzQ7.', '2018-10-10 00:00:00', 0, 1, NULL, 0, 0, NULL, '111', '111', '0', '0000-00-00 00:00:00', NULL, NULL, 150, NULL, 1, 2, 2, 1, 1, 2, 2, 1, 2, 1, 1, 1, 1, 2, 1, 1, 0, 0, NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `x5_contacts_change_logs`
--

CREATE TABLE `x5_contacts_change_logs` (
  `change_log_id` int(11) NOT NULL,
  `x5_contact_id` int(11) NOT NULL,
  `x5_contact_username` varchar(45) NOT NULL,
  `company_id` int(11) NOT NULL,
  `db_id` int(11) NOT NULL,
  `db_name` varchar(255) NOT NULL,
  `device` varchar(255) NOT NULL,
  `osVersion` varchar(255) NOT NULL,
  `osName` varchar(255) NOT NULL,
  `original_value` varchar(255) NOT NULL,
  `new_value` varchar(255) NOT NULL,
  `success` varchar(255) NOT NULL,
  `change_datetime` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `x5_contact_accesses`
--

CREATE TABLE `x5_contact_accesses` (
  `x5_contact_access_id` int(11) NOT NULL,
  `db_id` int(11) DEFAULT NULL,
  `model` int(11) NOT NULL,
  `foreign_key` int(11) DEFAULT NULL,
  `type` int(11) NOT NULL,
  `link_id` varchar(45) DEFAULT NULL,
  `_create` tinyint(1) NOT NULL DEFAULT '0',
  `_read` tinyint(1) NOT NULL DEFAULT '0',
  `_update` tinyint(1) NOT NULL DEFAULT '0',
  `_delete` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `x5_contact_groups`
--

CREATE TABLE `x5_contact_groups` (
  `x5_contact_group_id` int(11) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `super` tinyint(1) DEFAULT '0',
  `type` smallint(2) DEFAULT '2',
  `group_name` varchar(45) DEFAULT NULL,
  `group_description` varchar(255) DEFAULT NULL,
  `create_datetime` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_datetime` datetime DEFAULT NULL,
  `delete_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `x5_contact_links`
--

CREATE TABLE `x5_contact_links` (
  `x5_contact_link_id` int(11) NOT NULL,
  `x5_contact_id` int(11) DEFAULT NULL,
  `link_type` varchar(255) DEFAULT NULL,
  `link_id` varchar(255) DEFAULT NULL,
  `create_datetime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_datetime` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `x5_contact_links`
--

INSERT INTO `x5_contact_links` (`x5_contact_link_id`, `x5_contact_id`, `link_type`, `link_id`, `create_datetime`, `update_datetime`) VALUES
(1, 441, 'company_id', '102504', '2015-11-10 17:32:20', '2015-11-10 17:32:20'),
(2, 320, 'company_id', '102504', '2015-11-10 17:32:20', '2015-11-10 17:32:20'),
(3, 320, 'company_id', '103496', '2015-11-10 17:32:20', '2015-11-10 17:32:20'),
(4, 3538, 'company_id', '103460', '2015-11-10 17:32:20', '2018-06-19 09:51:06'),
(5, 898, 'company_id', '103533', '2015-11-16 09:42:00', '2015-11-16 09:42:00'),
(6, 898, 'company_id', '103496', '2015-11-16 09:42:00', '2015-11-16 09:42:00'),
(7, 320, 'company_id', '100327', '2015-11-16 09:42:00', '2015-11-16 09:42:00'),
(8, 1064, 'company_id', '100968', '2015-12-01 15:00:00', '2015-12-01 15:00:00'),
(9, 898, 'company_id', '103636', '2015-12-16 18:30:00', '2015-12-16 18:30:00'),
(10, 898, 'company_id', '103638', '2015-12-16 18:30:00', '2015-12-16 18:30:00'),
(11, 898, 'company_id', '103642', '2015-12-16 18:30:00', '2015-12-16 18:30:00'),
(12, 898, 'company_id', '103649', '2015-12-16 18:30:00', '2015-12-16 18:30:00'),
(13, 898, 'company_id', '103651', '2015-12-16 18:30:00', '2015-12-16 18:30:00'),
(14, 898, 'company_id', '103640', '2015-12-16 18:30:00', '2015-12-16 18:30:00'),
(15, 898, 'company_id', '103650', '2015-12-16 18:30:00', '2015-12-16 18:30:00'),
(16, 1158, 'company_id', '30156', '2016-01-10 18:30:00', '2016-01-10 18:30:00'),
(17, 1158, 'company_id', '101140', '2016-01-10 18:30:00', '2016-01-10 18:30:00'),
(18, 1158, 'company_id', '102051', '2016-01-10 18:30:00', '2016-01-10 18:30:00'),
(19, 898, 'company_id', '103682', '2015-12-16 18:30:00', '2015-12-16 18:30:00'),
(20, 898, 'company_id', '103693', '2015-12-16 18:30:00', '2015-12-16 18:30:00'),
(21, 898, 'company_id', '103711', '2015-12-16 18:30:00', '2015-12-16 18:30:00'),
(22, 898, 'company_id', '103731', '2015-12-16 18:30:00', '2015-12-16 18:30:00'),
(23, 898, 'company_id', '103750', '2015-12-16 18:30:00', '2015-12-16 18:30:00'),
(24, 1064, 'company_id', '103156', '2015-12-16 18:30:00', '2015-12-16 18:30:00'),
(27, 1763, 'company_id', '104854', '2016-10-12 15:50:50', '2016-10-12 15:50:50'),
(28, 950, 'company_id', '105097', '2016-12-12 18:08:06', '2016-12-12 18:08:06'),
(29, 970, 'company_id', '105097', '2016-12-12 18:08:06', '2016-12-12 18:08:06'),
(30, 1540, 'company_id', '105097', '2016-12-12 18:08:06', '2016-12-12 18:08:06'),
(31, 1546, 'company_id', '105097', '2016-12-12 18:08:06', '2016-12-12 18:08:06'),
(32, 41, 'company_id', '100327', '2016-12-12 19:01:08', '2016-12-12 19:01:08'),
(33, 2312, 'company_id', '103484', '2017-05-12 19:01:08', '2017-05-12 19:01:08'),
(34, 918, 'company_id', '103484', '2017-05-12 19:01:08', '2017-05-12 19:01:08'),
(37, 2195, 'admin-chat-name', 'Roslyn', '2017-12-20 11:59:15', '2017-12-20 11:59:29'),
(38, 176, 'admin-chat-name', 'MGR-rpaul', '2017-12-20 12:07:16', '2017-12-20 12:07:16'),
(39, 3154, 'admin-chat-name', 'NAGESH', '2018-01-18 15:20:09', '2018-01-18 15:20:20'),
(40, 331, 'admin-chat-name', 'MGR-patri', '2018-02-05 14:19:29', '2018-02-05 14:19:29'),
(41, 3104, 'admin-chat-name', 'Thien Nguyen', '2018-02-12 14:19:55', '2018-02-12 14:20:05'),
(42, 629, 'admin-chat-name', 'MGR-tammy', '2018-06-04 11:56:40', '2018-06-04 11:56:40');

-- --------------------------------------------------------

--
-- Table structure for table `x5_contact_login_logs`
--

CREATE TABLE `x5_contact_login_logs` (
  `id` int(11) NOT NULL,
  `login` varchar(45) DEFAULT NULL,
  `x5_contact_id` int(10) DEFAULT NULL,
  `ytel_user_id` int(11) DEFAULT NULL,
  `sub_domain` varchar(45) DEFAULT NULL,
  `domain` varchar(45) DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `browser` varchar(200) DEFAULT NULL,
  `success` tinyint(1) DEFAULT '0',
  `entry_datetime` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `x5_contact_login_logs`
--

INSERT INTO `x5_contact_login_logs` (`id`, `login`, `x5_contact_id`, `ytel_user_id`, `sub_domain`, `domain`, `ip`, `browser`, `success`, `entry_datetime`) VALUES
(1, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-14 01:10:09'),
(2, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-14 06:31:25'),
(3, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-14 06:31:50'),
(4, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-14 06:32:11'),
(5, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-14 06:32:31'),
(6, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-14 07:13:26'),
(7, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-14 07:13:49'),
(8, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-14 07:14:07'),
(9, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-14 07:15:21'),
(10, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-14 07:15:22'),
(11, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-14 07:15:52'),
(12, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-14 07:15:53'),
(13, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-14 07:16:28'),
(14, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-14 07:16:48'),
(15, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-15 00:52:41'),
(16, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-15 00:53:43'),
(17, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-15 00:55:35'),
(18, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-15 07:09:00'),
(19, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-15 07:09:31'),
(20, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-15 07:09:55'),
(21, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-15 07:09:58'),
(22, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-15 07:10:40'),
(23, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-15 07:12:45'),
(24, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-17 22:12:21'),
(25, 'aarti11', NULL, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 0, '2018-06-17 22:12:28'),
(26, 'aartri', NULL, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 0, '2018-06-17 22:15:06'),
(27, 'aartri', NULL, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 0, '2018-06-17 22:56:43'),
(28, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-17 22:56:59'),
(29, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-18 00:06:15'),
(30, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-18 01:30:37'),
(31, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-18 01:30:46'),
(32, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-18 01:33:39'),
(33, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-18 01:34:34'),
(34, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-18 04:55:15'),
(35, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-18 04:55:24'),
(36, 'aarti', 3538, NULL, '127', '0.1:8000', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36', 1, '2018-06-18 04:55:39');

-- --------------------------------------------------------

--
-- Table structure for table `x5_contact_permissions`
--

CREATE TABLE `x5_contact_permissions` (
  `row_id` int(10) UNSIGNED NOT NULL,
  `x5_contact_id` int(10) UNSIGNED NOT NULL,
  `permission` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `permission_extra` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `x5_contact_system_permissions`
--

CREATE TABLE `x5_contact_system_permissions` (
  `row_id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `x5_contact_id` int(10) UNSIGNED DEFAULT NULL,
  `model_id` int(10) UNSIGNED DEFAULT NULL,
  `sub_item` varchar(45) DEFAULT NULL,
  `level` tinyint(2) DEFAULT '2',
  `create_datetime` datetime DEFAULT NULL,
  `update_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `x5_contact_tokens`
--

CREATE TABLE `x5_contact_tokens` (
  `x5_contact_token_id` int(11) NOT NULL,
  `x5_contact_id` int(10) UNSIGNED NOT NULL,
  `type` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `create_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expire_datetime` datetime NOT NULL,
  `use_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `x5_contact_x5_contact_groups`
--

CREATE TABLE `x5_contact_x5_contact_groups` (
  `id` int(11) NOT NULL,
  `x5_contact_id` int(10) UNSIGNED DEFAULT NULL,
  `x5_contact_group_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `x5_logs`
--

CREATE TABLE `x5_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `server_name` varchar(10) DEFAULT NULL,
  `group_key` varchar(10) DEFAULT NULL,
  `db_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `x5_contact_id` int(10) UNSIGNED DEFAULT NULL,
  `ytel_user_id` int(11) DEFAULT NULL,
  `user_ip` varchar(40) DEFAULT NULL,
  `class` varchar(255) DEFAULT NULL,
  `method` varchar(255) DEFAULT NULL,
  `action_1` varchar(255) DEFAULT NULL,
  `action_2` varchar(255) DEFAULT NULL,
  `action_3` varchar(255) DEFAULT NULL,
  `id_1` varchar(255) DEFAULT NULL,
  `id_2` varchar(255) DEFAULT NULL,
  `id_3` varchar(255) DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `field` varchar(255) DEFAULT NULL,
  `from_data` varchar(255) DEFAULT NULL,
  `to_data` varchar(255) DEFAULT NULL,
  `from_data_text` mediumtext,
  `to_data_text` mediumtext,
  `success` tinyint(1) DEFAULT '1',
  `message` varchar(255) DEFAULT NULL,
  `change_datetime` datetime DEFAULT CURRENT_TIMESTAMP,
  `sql_log` text
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `x6_settings`
--

CREATE TABLE `x6_settings` (
  `x6_setting_id` int(11) NOT NULL,
  `company_id` int(11) DEFAULT NULL,
  `app_id` int(11) DEFAULT NULL,
  `system_id` varchar(45) DEFAULT NULL,
  `token` varchar(45) DEFAULT NULL,
  `options` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure for view `v5_contacts`
--
DROP TABLE IF EXISTS `v5_contacts`;

CREATE ALGORITHM=UNDEFINED DEFINER=`cron`@`172.31.254.%` SQL SECURITY DEFINER VIEW `v5_contacts`  AS  select `x5_contacts`.`x5_contact_id` AS `v5_contact_id`,`x5_contacts`.`company_id` AS `company_id`,`x5_contacts`.`username` AS `username`,`x5_contacts`.`password` AS `password`,`x5_contacts`.`create_datetime` AS `create_datetime`,`x5_contacts`.`enable` AS `enable` from `x5_contacts` ;

-- --------------------------------------------------------

--
-- Structure for view `v5_contact_permissions`
--
DROP TABLE IF EXISTS `v5_contact_permissions`;

CREATE ALGORITHM=UNDEFINED DEFINER=`cron`@`172.31.254.%` SQL SECURITY DEFINER VIEW `v5_contact_permissions`  AS  select `x5_contact_permissions`.`row_id` AS `row_id`,`x5_contact_permissions`.`x5_contact_id` AS `v5_contact_id`,`x5_contact_permissions`.`permission` AS `permission`,`x5_contact_permissions`.`permission_extra` AS `permission_extra` from `x5_contact_permissions` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `acarrier`
--
ALTER TABLE `acarrier`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `accesses`
--
ALTER TABLE `accesses`
  ADD PRIMARY KEY (`access_id`),
  ADD UNIQUE KEY `access_id_UNIQUE` (`access_id`),
  ADD UNIQUE KEY `tab_name_UNIQUE` (`control_id`);

--
-- Indexes for table `Acct_manager`
--
ALTER TABLE `Acct_manager`
  ADD PRIMARY KEY (`launchpad_id`);

--
-- Indexes for table `acos`
--
ALTER TABLE `acos`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `actions_table`
--
ALTER TABLE `actions_table`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `admin_access_keys`
--
ALTER TABLE `admin_access_keys`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_aak_admin_access_method_id_idx` (`admin_access_method_id`),
  ADD KEY `fk_aak_requester_id_idx` (`requester_id`);

--
-- Indexes for table `admin_access_methods`
--
ALTER TABLE `admin_access_methods`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_aam_company_id_idx` (`company_id`),
  ADD KEY `fk_aam_contact_id_idx` (`contact_id`),
  ADD KEY `fk_aam_contact_id` (`company_id`,`contact_id`);

--
-- Indexes for table `admin_access_temp_codes`
--
ALTER TABLE `admin_access_temp_codes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_aatc_contact_id_idx` (`contact_id`),
  ADD KEY `fk_aatc_requester_id_idx` (`requester_id`);

--
-- Indexes for table `admin_company_logs`
--
ALTER TABLE `admin_company_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_acl_company_id_idx` (`company_id`),
  ADD KEY `fk_acl_submitter_id_idx` (`submitter_id`),
  ADD KEY `fk_acl_dismissed_by_idx` (`dismissed_by`);

--
-- Indexes for table `admin_search_histories`
--
ALTER TABLE `admin_search_histories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ash_user_id_idx` (`user_id`),
  ADD KEY `i_ash_search_string` (`search_string`);

--
-- Indexes for table `agent_ip_log`
--
ALTER TABLE `agent_ip_log`
  ADD PRIMARY KEY (`iplog_id`);

--
-- Indexes for table `api_keys`
--
ALTER TABLE `api_keys`
  ADD PRIMARY KEY (`id`),
  ADD KEY `i_ak_class_name` (`api_class_name`),
  ADD KEY `i_ak_function_name` (`api_function_name`),
  ADD KEY `i_ak_class_function_name` (`api_class_name`,`api_function_name`),
  ADD KEY `i_ak_enable` (`enable`);

--
-- Indexes for table `api_logs`
--
ALTER TABLE `api_logs`
  ADD PRIMARY KEY (`api_log_id`),
  ADD KEY `i_al_name` (`name`),
  ADD KEY `i_al_method` (`method`),
  ADD KEY `i_al_x5_contact_id` (`x5_contact_id`),
  ADD KEY `i_al_api_group` (`api_group`),
  ADD KEY `i_ai_api_method` (`api_method`);

--
-- Indexes for table `apps`
--
ALTER TABLE `apps`
  ADD PRIMARY KEY (`app_id`),
  ADD UNIQUE KEY `app_key_UNIQUE` (`app_key`),
  ADD KEY `fk_a_app_type_id_idx` (`app_type_id`);

--
-- Indexes for table `app_companies`
--
ALTER TABLE `app_companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `i_ac_unique_1` (`company_id`,`app_id`,`db_id`);

--
-- Indexes for table `app_files`
--
ALTER TABLE `app_files`
  ADD PRIMARY KEY (`app_files`),
  ADD KEY `fk_af_app_id_idx` (`app_id`);

--
-- Indexes for table `app_types`
--
ALTER TABLE `app_types`
  ADD PRIMARY KEY (`app_type_id`);

--
-- Indexes for table `cake_sessions`
--
ALTER TABLE `cake_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `i_cs_expires` (`expires`);

--
-- Indexes for table `client_ccreport_info`
--
ALTER TABLE `client_ccreport_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `client_id` (`client_id`);

--
-- Indexes for table `dashboards`
--
ALTER TABLE `dashboards`
  ADD PRIMARY KEY (`dashboard_id`);

--
-- Indexes for table `dashboard_permissions`
--
ALTER TABLE `dashboard_permissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dashboard_widgets`
--
ALTER TABLE `dashboard_widgets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `db_col_change_logs`
--
ALTER TABLE `db_col_change_logs`
  ADD PRIMARY KEY (`change_log_id`);

--
-- Indexes for table `db_col_permissions`
--
ALTER TABLE `db_col_permissions`
  ADD PRIMARY KEY (`row_id`),
  ADD UNIQUE KEY `dcp_u1` (`model`,`model_id`,`db_col_setting_id`),
  ADD UNIQUE KEY `dcp_u2` (`model`,`model_id`,`db_col_setting_group_id`),
  ADD KEY `dcp_db_col_setting_id_idx` (`db_col_setting_id`),
  ADD KEY `dcp_db_col_setting_group_id_idx` (`db_col_setting_group_id`);

--
-- Indexes for table `db_col_settings`
--
ALTER TABLE `db_col_settings`
  ADD PRIMARY KEY (`db_col_setting_id`),
  ADD UNIQUE KEY `dcs_u1` (`vici_version`,`vici_db_table`,`vici_db_field`);

--
-- Indexes for table `db_col_settings_new`
--
ALTER TABLE `db_col_settings_new`
  ADD PRIMARY KEY (`db_col_setting_id`),
  ADD UNIQUE KEY `dcs_u1` (`vici_version`,`vici_db_table`,`vici_db_field`);

--
-- Indexes for table `db_col_settings_old`
--
ALTER TABLE `db_col_settings_old`
  ADD PRIMARY KEY (`db_col_setting_id`),
  ADD UNIQUE KEY `dcs_u1` (`vici_version`,`vici_db_table`,`vici_db_field`);

--
-- Indexes for table `db_col_setting_db_col_setting_display_groups`
--
ALTER TABLE `db_col_setting_db_col_setting_display_groups`
  ADD PRIMARY KEY (`row_id`);

--
-- Indexes for table `db_col_setting_db_col_setting_groups`
--
ALTER TABLE `db_col_setting_db_col_setting_groups`
  ADD PRIMARY KEY (`row_id`),
  ADD UNIQUE KEY `dcsdcsg_u1` (`db_col_setting_group_id`,`db_col_setting_id`),
  ADD KEY `dcsdcsg_db_col_setting_id_idx` (`db_col_setting_id`);

--
-- Indexes for table `db_col_setting_display_groups`
--
ALTER TABLE `db_col_setting_display_groups`
  ADD PRIMARY KEY (`db_col_setting_display_group_id`);

--
-- Indexes for table `db_col_setting_groups`
--
ALTER TABLE `db_col_setting_groups`
  ADD PRIMARY KEY (`db_col_setting_group_id`);

--
-- Indexes for table `gcm_messages`
--
ALTER TABLE `gcm_messages`
  ADD PRIMARY KEY (`gcm_message_id`),
  ADD KEY `fk_gm_gcm_message_data_id_idx` (`gcm_message_data_id`),
  ADD KEY `fk_gm_gcm_record_id_idx` (`gcm_record_id`);

--
-- Indexes for table `gcm_message_datas`
--
ALTER TABLE `gcm_message_datas`
  ADD PRIMARY KEY (`gcm_message_data_id`);

--
-- Indexes for table `gcm_message_histories`
--
ALTER TABLE `gcm_message_histories`
  ADD PRIMARY KEY (`gcm_message_history_id`);

--
-- Indexes for table `gcm_records`
--
ALTER TABLE `gcm_records`
  ADD PRIMARY KEY (`gcm_record_id`);

--
-- Indexes for table `google_storage_files`
--
ALTER TABLE `google_storage_files`
  ADD PRIMARY KEY (`google_storage_file_id`);

--
-- Indexes for table `google_storage_logs`
--
ALTER TABLE `google_storage_logs`
  ADD PRIMARY KEY (`google_storage_log_id`),
  ADD KEY `i_gsl_company_id` (`company_id`),
  ADD KEY `i_gsl_cc_id` (`company_id`,`owner_id`),
  ADD KEY `i_gsl_owner_id` (`owner_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notification_settings`
--
ALTER TABLE `notification_settings`
  ADD PRIMARY KEY (`notification_setting_id`),
  ADD KEY `i_ns_production_type_id` (`product_type_id`),
  ADD KEY `i_ns_type` (`notification_method`),
  ADD KEY `i_ns_company_id` (`company_id`),
  ADD KEY `i_ns_x5_contact_id` (`x5_contact_id`),
  ADD KEY `i_ns_company_id_x5_contact_id` (`company_id`,`x5_contact_id`);

--
-- Indexes for table `oauth_access_tokens`
--
ALTER TABLE `oauth_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `oauth_access_tokens_user_id_index` (`user_id`);

--
-- Indexes for table `oauth_auth_codes`
--
ALTER TABLE `oauth_auth_codes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `oauth_clients`
--
ALTER TABLE `oauth_clients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `oauth_clients_user_id_index` (`user_id`);

--
-- Indexes for table `oauth_personal_access_clients`
--
ALTER TABLE `oauth_personal_access_clients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `oauth_personal_access_clients_client_id_index` (`client_id`);

--
-- Indexes for table `oauth_refresh_tokens`
--
ALTER TABLE `oauth_refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `oauth_refresh_tokens_access_token_id_index` (`access_token_id`);

--
-- Indexes for table `push_notification_subscribers`
--
ALTER TABLE `push_notification_subscribers`
  ADD PRIMARY KEY (`push_notification_subscriber_id`),
  ADD KEY `fk_pns_customer_id_idx` (`user_id`),
  ADD KEY `fk_pns_company_id_idx` (`company_id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`report_id`);

--
-- Indexes for table `report_files`
--
ALTER TABLE `report_files`
  ADD PRIMARY KEY (`report_file_id`),
  ADD KEY `i_rf_unique_id` (`unique_id`),
  ADD KEY `i_rf_db_id_company_id` (`db_id`,`company_id`),
  ADD KEY `i_rf_report_type_id` (`report_type_id`),
  ADD KEY `i_rf_options_hash` (`options_hash`),
  ADD KEY `i_rf_requester_x5_contact_id` (`requester_x5_contact_id`),
  ADD KEY `i_rf_request_datetime` (`request_datetime`) USING BTREE;

--
-- Indexes for table `report_file_queues`
--
ALTER TABLE `report_file_queues`
  ADD PRIMARY KEY (`report_file_queue_id`),
  ADD UNIQUE KEY `fk_rfq_google_storage_file_id` (`google_storage_file_id`) USING BTREE,
  ADD UNIQUE KEY `i_rfq_cron_uuid` (`cron_uuid`) USING BTREE,
  ADD KEY `fk_rfq_company_id` (`company_id`),
  ADD KEY `fk_rfq_requester_x5_contact_id` (`requester_x5_contact_id`),
  ADD KEY `fk_rfq_report_type_id` (`report_type_id`),
  ADD KEY `i_rfq_status` (`status`) USING BTREE,
  ADD KEY `fk_rfq_report_file_id` (`report_file_id`);

--
-- Indexes for table `sso`
--
ALTER TABLE `sso`
  ADD PRIMARY KEY (`sso_id`),
  ADD KEY `s_x5_contact_id_idx` (`x5_contact_id`);

--
-- Indexes for table `system_components`
--
ALTER TABLE `system_components`
  ADD PRIMARY KEY (`system_component_id`),
  ADD KEY `fk_sc_system_component_group_id_idx` (`system_component_group_id`);

--
-- Indexes for table `system_component_groups`
--
ALTER TABLE `system_component_groups`
  ADD PRIMARY KEY (`system_component_group_id`);

--
-- Indexes for table `system_permission_models`
--
ALTER TABLE `system_permission_models`
  ADD PRIMARY KEY (`model_id`);

--
-- Indexes for table `user_files`
--
ALTER TABLE `user_files`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_id_UNIQUE` (`unique_id`);

--
-- Indexes for table `user_file_process_automations`
--
ALTER TABLE `user_file_process_automations`
  ADD PRIMARY KEY (`user_file_process_automation_id`);

--
-- Indexes for table `user_file_process_automation_posts`
--
ALTER TABLE `user_file_process_automation_posts`
  ADD PRIMARY KEY (`user_file_process_automation_post_id`);

--
-- Indexes for table `user_file_process_queues`
--
ALTER TABLE `user_file_process_queues`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ufpq_requester_id_idx` (`requester_id`),
  ADD KEY `fk_ufpq_user_file_id_idx` (`user_file_id`),
  ADD KEY `fk_ufpq_list_id` (`list_id`),
  ADD KEY `fk_ufpq_exec_server_id` (`exec_server_id`),
  ADD KEY `fk_ufpq_dupcheck` (`dupcheck`),
  ADD KEY `i_ufpq_status` (`status`),
  ADD KEY `i_ufpq_pull_count` (`pull_count`);

--
-- Indexes for table `widgets`
--
ALTER TABLE `widgets`
  ADD PRIMARY KEY (`widget_id`);

--
-- Indexes for table `widget_filters`
--
ALTER TABLE `widget_filters`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `widget_types`
--
ALTER TABLE `widget_types`
  ADD PRIMARY KEY (`type`),
  ADD UNIQUE KEY `type_UNIQUE` (`type`);

--
-- Indexes for table `x5_contacts`
--
ALTER TABLE `x5_contacts`
  ADD PRIMARY KEY (`x5_contact_id`),
  ADD KEY `i_xc_company_id` (`company_id`),
  ADD KEY `i_xc_username` (`username`) USING BTREE;

--
-- Indexes for table `x5_contacts_change_logs`
--
ALTER TABLE `x5_contacts_change_logs`
  ADD PRIMARY KEY (`change_log_id`);

--
-- Indexes for table `x5_contact_accesses`
--
ALTER TABLE `x5_contact_accesses`
  ADD PRIMARY KEY (`x5_contact_access_id`),
  ADD UNIQUE KEY `i_xca_1` (`model`,`foreign_key`,`type`,`link_id`,`db_id`) USING BTREE,
  ADD KEY `i_xca_model` (`model`,`foreign_key`,`db_id`) USING BTREE,
  ADD KEY `i_xca_type` (`type`,`link_id`,`db_id`) USING BTREE;

--
-- Indexes for table `x5_contact_groups`
--
ALTER TABLE `x5_contact_groups`
  ADD PRIMARY KEY (`x5_contact_group_id`);

--
-- Indexes for table `x5_contact_links`
--
ALTER TABLE `x5_contact_links`
  ADD PRIMARY KEY (`x5_contact_link_id`);

--
-- Indexes for table `x5_contact_login_logs`
--
ALTER TABLE `x5_contact_login_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `x5_contact_permissions`
--
ALTER TABLE `x5_contact_permissions`
  ADD PRIMARY KEY (`row_id`),
  ADD UNIQUE KEY `xcp_u1` (`x5_contact_id`,`permission`),
  ADD KEY `xcp_x5_contact_id_idx` (`x5_contact_id`);

--
-- Indexes for table `x5_contact_system_permissions`
--
ALTER TABLE `x5_contact_system_permissions`
  ADD PRIMARY KEY (`row_id`);

--
-- Indexes for table `x5_contact_tokens`
--
ALTER TABLE `x5_contact_tokens`
  ADD PRIMARY KEY (`x5_contact_token_id`);

--
-- Indexes for table `x5_contact_x5_contact_groups`
--
ALTER TABLE `x5_contact_x5_contact_groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_xcxcg_x5_contact_id_idx` (`x5_contact_id`),
  ADD KEY `fk_xcxcg_x5_contact_group_id_idx` (`x5_contact_group_id`);

--
-- Indexes for table `x5_logs`
--
ALTER TABLE `x5_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `i_il_action_1` (`action_1`),
  ADD KEY `i_il_action_2` (`action_2`),
  ADD KEY `i_il_action_3` (`action_3`),
  ADD KEY `i_il_id_1` (`id_1`),
  ADD KEY `i_il_id_2` (`id_2`),
  ADD KEY `i_il_id_3` (`id_3`),
  ADD KEY `i_il_model` (`model`),
  ADD KEY `i_il_field` (`field`),
  ADD KEY `i_il_class` (`class`),
  ADD KEY `i_il_method` (`method`),
  ADD KEY `i_il_group_key` (`group_key`),
  ADD KEY `i_xl_group_actions` (`action_1`,`action_2`,`action_3`),
  ADD KEY `i_xl_action_123` (`action_1`,`action_2`,`action_3`),
  ADD KEY `i_xl_company_id` (`company_id`),
  ADD KEY `i_xl_contact_id` (`x5_contact_id`),
  ADD KEY `i_xl_g_db_id_company_id_contact_id` (`db_id`,`company_id`,`x5_contact_id`),
  ADD KEY `i_xl_success` (`success`),
  ADD KEY `i_xl_db_id` (`db_id`);

--
-- Indexes for table `x6_settings`
--
ALTER TABLE `x6_settings`
  ADD PRIMARY KEY (`x6_setting_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accesses`
--
ALTER TABLE `accesses`
  MODIFY `access_id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `Acct_manager`
--
ALTER TABLE `Acct_manager`
  MODIFY `launchpad_id` int(10) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `acos`
--
ALTER TABLE `acos`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `actions_table`
--
ALTER TABLE `actions_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `admin_access_keys`
--
ALTER TABLE `admin_access_keys`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `admin_access_methods`
--
ALTER TABLE `admin_access_methods`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `admin_access_temp_codes`
--
ALTER TABLE `admin_access_temp_codes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `admin_company_logs`
--
ALTER TABLE `admin_company_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `admin_search_histories`
--
ALTER TABLE `admin_search_histories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `agent_ip_log`
--
ALTER TABLE `agent_ip_log`
  MODIFY `iplog_id` bigint(20) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `api_keys`
--
ALTER TABLE `api_keys`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `api_logs`
--
ALTER TABLE `api_logs`
  MODIFY `api_log_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `apps`
--
ALTER TABLE `apps`
  MODIFY `app_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `app_companies`
--
ALTER TABLE `app_companies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `app_files`
--
ALTER TABLE `app_files`
  MODIFY `app_files` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `app_types`
--
ALTER TABLE `app_types`
  MODIFY `app_type_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `client_ccreport_info`
--
ALTER TABLE `client_ccreport_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
--
-- AUTO_INCREMENT for table `dashboards`
--
ALTER TABLE `dashboards`
  MODIFY `dashboard_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `dashboard_permissions`
--
ALTER TABLE `dashboard_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `dashboard_widgets`
--
ALTER TABLE `dashboard_widgets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `db_col_change_logs`
--
ALTER TABLE `db_col_change_logs`
  MODIFY `change_log_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `db_col_permissions`
--
ALTER TABLE `db_col_permissions`
  MODIFY `row_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `db_col_settings`
--
ALTER TABLE `db_col_settings`
  MODIFY `db_col_setting_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `db_col_settings_new`
--
ALTER TABLE `db_col_settings_new`
  MODIFY `db_col_setting_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `db_col_settings_old`
--
ALTER TABLE `db_col_settings_old`
  MODIFY `db_col_setting_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `db_col_setting_db_col_setting_display_groups`
--
ALTER TABLE `db_col_setting_db_col_setting_display_groups`
  MODIFY `row_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `db_col_setting_db_col_setting_groups`
--
ALTER TABLE `db_col_setting_db_col_setting_groups`
  MODIFY `row_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `db_col_setting_display_groups`
--
ALTER TABLE `db_col_setting_display_groups`
  MODIFY `db_col_setting_display_group_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `db_col_setting_groups`
--
ALTER TABLE `db_col_setting_groups`
  MODIFY `db_col_setting_group_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `gcm_messages`
--
ALTER TABLE `gcm_messages`
  MODIFY `gcm_message_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `gcm_message_histories`
--
ALTER TABLE `gcm_message_histories`
  MODIFY `gcm_message_history_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `gcm_records`
--
ALTER TABLE `gcm_records`
  MODIFY `gcm_record_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `google_storage_files`
--
ALTER TABLE `google_storage_files`
  MODIFY `google_storage_file_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `google_storage_logs`
--
ALTER TABLE `google_storage_logs`
  MODIFY `google_storage_log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=233035;
--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
--
-- AUTO_INCREMENT for table `notification_settings`
--
ALTER TABLE `notification_settings`
  MODIFY `notification_setting_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `oauth_clients`
--
ALTER TABLE `oauth_clients`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `oauth_personal_access_clients`
--
ALTER TABLE `oauth_personal_access_clients`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `push_notification_subscribers`
--
ALTER TABLE `push_notification_subscribers`
  MODIFY `push_notification_subscriber_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `report_files`
--
ALTER TABLE `report_files`
  MODIFY `report_file_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `report_file_queues`
--
ALTER TABLE `report_file_queues`
  MODIFY `report_file_queue_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `system_components`
--
ALTER TABLE `system_components`
  MODIFY `system_component_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `system_component_groups`
--
ALTER TABLE `system_component_groups`
  MODIFY `system_component_group_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `system_permission_models`
--
ALTER TABLE `system_permission_models`
  MODIFY `model_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `user_files`
--
ALTER TABLE `user_files`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `user_file_process_automations`
--
ALTER TABLE `user_file_process_automations`
  MODIFY `user_file_process_automation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;
--
-- AUTO_INCREMENT for table `user_file_process_automation_posts`
--
ALTER TABLE `user_file_process_automation_posts`
  MODIFY `user_file_process_automation_post_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;
--
-- AUTO_INCREMENT for table `user_file_process_queues`
--
ALTER TABLE `user_file_process_queues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `widgets`
--
ALTER TABLE `widgets`
  MODIFY `widget_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `widget_filters`
--
ALTER TABLE `widget_filters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `x5_contacts`
--
ALTER TABLE `x5_contacts`
  MODIFY `x5_contact_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3541;
--
-- AUTO_INCREMENT for table `x5_contacts_change_logs`
--
ALTER TABLE `x5_contacts_change_logs`
  MODIFY `change_log_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `x5_contact_accesses`
--
ALTER TABLE `x5_contact_accesses`
  MODIFY `x5_contact_access_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `x5_contact_groups`
--
ALTER TABLE `x5_contact_groups`
  MODIFY `x5_contact_group_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `x5_contact_links`
--
ALTER TABLE `x5_contact_links`
  MODIFY `x5_contact_link_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;
--
-- AUTO_INCREMENT for table `x5_contact_login_logs`
--
ALTER TABLE `x5_contact_login_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;
--
-- AUTO_INCREMENT for table `x5_contact_permissions`
--
ALTER TABLE `x5_contact_permissions`
  MODIFY `row_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `x5_contact_system_permissions`
--
ALTER TABLE `x5_contact_system_permissions`
  MODIFY `row_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `x5_contact_tokens`
--
ALTER TABLE `x5_contact_tokens`
  MODIFY `x5_contact_token_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `x5_contact_x5_contact_groups`
--
ALTER TABLE `x5_contact_x5_contact_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `x5_logs`
--
ALTER TABLE `x5_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `x6_settings`
--
ALTER TABLE `x6_settings`
  MODIFY `x6_setting_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_access_keys`
--
ALTER TABLE `admin_access_keys`
  ADD CONSTRAINT `fk_aak_admin_access_method_id` FOREIGN KEY (`admin_access_method_id`) REFERENCES `admin_access_methods` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `admin_access_methods`
--
ALTER TABLE `admin_access_methods`
  ADD CONSTRAINT `fk_aam_company_id` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_aam_contact_id` FOREIGN KEY (`company_id`,`contact_id`) REFERENCES `contacts` (`company_id`, `contact_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `admin_access_temp_codes`
--
ALTER TABLE `admin_access_temp_codes`
  ADD CONSTRAINT `fk_aatc_contact_id` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`contact_id`),
  ADD CONSTRAINT `fk_aatc_requester_id` FOREIGN KEY (`requester_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `admin_company_logs`
--
ALTER TABLE `admin_company_logs`
  ADD CONSTRAINT `fk_acl_company_id` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`),
  ADD CONSTRAINT `fk_acl_dismissed_by` FOREIGN KEY (`dismissed_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_acl_submitter_id` FOREIGN KEY (`submitter_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `admin_search_histories`
--
ALTER TABLE `admin_search_histories`
  ADD CONSTRAINT `fk_ash_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `apps`
--
ALTER TABLE `apps`
  ADD CONSTRAINT `fk_a_app_type_id` FOREIGN KEY (`app_type_id`) REFERENCES `app_types` (`app_type_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `app_files`
--
ALTER TABLE `app_files`
  ADD CONSTRAINT `fk_af_app_id` FOREIGN KEY (`app_id`) REFERENCES `apps` (`app_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `gcm_messages`
--
ALTER TABLE `gcm_messages`
  ADD CONSTRAINT `fk_gm_gcm_message_data_id` FOREIGN KEY (`gcm_message_data_id`) REFERENCES `gcm_message_datas` (`gcm_message_data_id`),
  ADD CONSTRAINT `fk_gm_gcm_record_id` FOREIGN KEY (`gcm_record_id`) REFERENCES `gcm_records` (`gcm_record_id`);

--
-- Constraints for table `push_notification_subscribers`
--
ALTER TABLE `push_notification_subscribers`
  ADD CONSTRAINT `fk_pns_company_id` FOREIGN KEY (`company_id`) REFERENCES `x5_contacts` (`x5_contact_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_pns_customer_id` FOREIGN KEY (`user_id`) REFERENCES `x5_contacts` (`x5_contact_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `report_file_queues`
--
ALTER TABLE `report_file_queues`
  ADD CONSTRAINT `fk_rfq_company_id` FOREIGN KEY (`company_id`) REFERENCES `x5_contacts` (`company_id`),
  ADD CONSTRAINT `fk_rfq_google_storage_file_id` FOREIGN KEY (`google_storage_file_id`) REFERENCES `google_storage_files` (`google_storage_file_id`),
  ADD CONSTRAINT `fk_rfq_report_file_id` FOREIGN KEY (`report_file_id`) REFERENCES `report_files` (`report_file_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rfq_report_type_id` FOREIGN KEY (`report_type_id`) REFERENCES `reports` (`report_id`),
  ADD CONSTRAINT `fk_rfq_requester_x5_contact_id` FOREIGN KEY (`requester_x5_contact_id`) REFERENCES `x5_contacts` (`x5_contact_id`);

--
-- Constraints for table `system_components`
--
ALTER TABLE `system_components`
  ADD CONSTRAINT `fk_sc_system_component_group_id` FOREIGN KEY (`system_component_group_id`) REFERENCES `system_component_groups` (`system_component_group_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_file_process_queues`
--
ALTER TABLE `user_file_process_queues`
  ADD CONSTRAINT `fk_ufpq_requester_id` FOREIGN KEY (`requester_id`) REFERENCES `x5_contacts` (`x5_contact_id`),
  ADD CONSTRAINT `fk_ufpq_user_file_id` FOREIGN KEY (`user_file_id`) REFERENCES `user_files` (`id`);

--
-- Constraints for table `x5_contact_x5_contact_groups`
--
ALTER TABLE `x5_contact_x5_contact_groups`
  ADD CONSTRAINT `fk_xcxcg_x5_contact_group_id` FOREIGN KEY (`x5_contact_group_id`) REFERENCES `x5_contact_groups` (`x5_contact_group_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_xcxcg_x5_contact_id` FOREIGN KEY (`x5_contact_id`) REFERENCES `x5_contacts` (`x5_contact_id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
