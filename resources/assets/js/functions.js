"use strict";

(function ($) {
    $(window).on('load', function () {
        // PAGE IS FULLY LOADED
        // FADE OUT YOUR OVERLAYING DIV
        $(".loader-backdrop").fadeOut('normal');
    });

    var $body = $('body');

    var current_path = window.location.pathname.split('/').pop();
    if (current_path == '') {
        current_path = 'index.html';
    }
    var $current_menu = $('a[href="' + current_path + '"]');

    if ($current_menu.length > 0) {
        $('li.menu').removeClass('open selected');
        $('.main-menu li').removeClass('active open selected');

        if ($current_menu.parent().hasClass('menu')) {
            $current_menu.parent().addClass('open selected');
        } else {
            $current_menu.parent().addClass('active').parents('.menu').addClass('open selected');
        }
    }

    var slideDuration = 250;
    $("ul.nav-menu > li.menu").on("click", function () {
        var menuLi = this;
        $("ul.nav-menu > li.menu").not(menuLi).removeClass("open");
        $("ul.nav-menu > li.menu ul").not($("ul", menuLi)).slideUp(slideDuration);
        $(" > ul", menuLi).slideToggle(slideDuration, function () {
            $(menuLi).toggleClass("open");
        });
    });

    $("ul.sub-menu li").on('click', function (e) {
        var $current_sm_li = $(this);
        var $current_sm_li_parent = $current_sm_li.parent();

        if ($current_sm_li_parent.parent().hasClass("active")) {
            console.log('has parent');
            $("li ul", $current_sm_li_parent).not($("ul", $current_sm_li)).slideUp(slideDuration, function () {
                $("li", $current_sm_li_parent).not($current_sm_li).removeClass("active");
            });

        } else {
            $("ul.sub-menu li ul").not($(" ul", $current_sm_li)).slideUp(slideDuration, function () {
                //$("ul.sub-menu li").not($current_sm_li).removeClass("active");console.log('has not parent');
            });
        }

        $(" > ul", $current_sm_li).slideToggle(slideDuration, function () {
            $($current_sm_li).toggleClass("active");
        });

        e.stopPropagation();
    });
    
    //vector Map
    if ($.isFunction($.fn.vectorMap)) {
        $('#vmap').vectorMap({ map: 'world_en' });
    }
    
    //popover
    $('[data-toggle="popover"]').popover();
    
    //tooltip
    $('[data-toggle="tooltip"]').tooltip();

    new PerfectScrollbar('.main-menu');
    new PerfectScrollbar('.gx-main-content');
    new PerfectScrollbar('.dropdown-menu-perfectscrollbar');
    new PerfectScrollbar('.dropdown-menu-perfectscrollbar1');


    var $window = $(window);
    $window.on('resize', function () {

        var window_width = $window.outerWidth();
        if (window_width < 992) {
            $('.menu-toggle').bigSlide({
                easyClose: true,
                menuWidth: "280px",
                beforeOpen: function () {
                    $(".menu-backdrop").toggle();
                    $(".menu-backdrop").toggleClass("in");
                },
                afterClose: function () {
                    $(".menu-backdrop").toggle();
                    $(".menu-backdrop").toggleClass("in");
                }
            });

            $('#gxModuleSideNav').bigSlide({
                menu: '#gxModuleSidebar',
                easyClose: true,
                menuWidth: "230px",
                side: 'left',
                beforeOpen: function () {
                    $(".menu-backdrop").toggle();
                    $(".menu-backdrop").toggleClass("in");
                },
                afterClose: function () {
                    $(".menu-backdrop").toggle();
                    $(".menu-backdrop").toggleClass("in");
                }
            });

            $('#gxChatModuleSideNav').bigSlide({
                menu: '#gxChatModuleSidebar',
                easyClose: true,
                menuWidth: "280px",
                side: 'left',
                beforeOpen: function () {
                    $(".menu-backdrop").toggle();
                    $(".menu-backdrop").toggleClass("in");
                },
                afterClose: function () {
                    $(".menu-backdrop").toggle();
                    $(".menu-backdrop").toggleClass("in");
                }
            });
        } else {
            $('.menu-toggle').bigSlide().bigSlideAPI.destroy();
        }

    }).trigger('resize');


    // $('.collapse').collapse();

    // Add slideUp animation to Bootstrap dropdown when collapsing.
    $('.dropdown, .split-dropdown').on('show.bs.dropdown', function () {
        $(this).find('.dropdown-menu').first().stop(true, true).slideDown(200);
    });

    $('.dropdown, .split-dropdown').on('hide.bs.dropdown', function () {
        $(this).find('.dropdown-menu').first().stop(true, true).slideUp(200);
    });

    /*Custom Modules Height*/

    if ($('.custom-scrollbar').length > 0) {
        calc_height();
        $(window).on('resize', function () {
            calc_height();
        });
    }

    if ($('.custom-side-scrollbar').length > 0) {
        if ($(window).width() >= 991) {
            module_sidebar_height();
        } else {
            mobile_module_sidebar_height();
        }
        $(window).on('resize', function () {
            var win = $(this); //this = window
            if (win.width() >= 991) {
                module_sidebar_height();
            } else {
                mobile_module_sidebar_height();
            }
        });
    }

    if ($('.chat-list-scroll').length > 0) {
        chat_list_height();
        $(window).on('resize', function () {
            chat_list_height();
        });
    }

    if ($('.chat-sidenav-scroll').length > 0) {
        if ($(window).width() >= 991) {
            chat_module_sidebar_height();
        } else {
            mobile_chat_module_sidebar_height()
        }
        $(window).on('resize', function () {
            var win = $(this); //this = window
            if (win.width() >= 991) {
                chat_module_sidebar_height();
            } else {
                mobile_chat_module_sidebar_height();
            }
        });
    }

})(jQuery);

function calc_height() {
    var body_height = jQuery('body').height();
    var main_header_height = jQuery('.main-header').outerHeight();
    var main_footer_height = jQuery('.gx-footer').outerHeight();

    var main_content_padding = parseInt(jQuery('.gx-main-content').css('padding-top'));

    var gxwrapper_margin = parseInt(jQuery('.gx-wrapper').css('margin-bottom'));

    var gxmodule_margin = parseInt(jQuery('.gx-module').css('margin-top')) + parseInt(jQuery('.gx-module').css('margin-bottom'));

    var modulebox_header_height = jQuery('.module-box-header').outerHeight();

    var modulebox_topbar_height = jQuery('.module-box-topbar').outerHeight();

    var module_listScroll_padding = parseInt(jQuery('.module-list-scroll').css('padding-top')) + parseInt(jQuery('.module-list-scroll').css('padding-bottom'));

    var todo_main_footer = jQuery('.todo-main-footer').outerHeight();

    var scrollbar_height = body_height - (main_header_height + main_content_padding + gxwrapper_margin + gxmodule_margin + main_footer_height + modulebox_header_height + modulebox_topbar_height + module_listScroll_padding + todo_main_footer);
    jQuery('.custom-scrollbar').height(scrollbar_height);
}

/*Sidebar height*/
function module_sidebar_height() {
    var body_height = jQuery('body').height();
    var main_header_height = jQuery('.main-header').outerHeight();
    var main_footer_height = jQuery('.gx-footer').outerHeight();

    var main_content_padding = parseInt(jQuery('.gx-main-content').css('padding-top'));

    var gxwrapper_margin = parseInt(jQuery('.gx-wrapper').css('margin-bottom'));

    var gxmodule_padding = parseInt(jQuery('.gx-module').css('padding-top'));
    var gxmodule_margin = parseInt(jQuery('.gx-module').css('margin-top')) + parseInt(jQuery('.gx-module').css('margin-bottom'));

    var module__sideheader_height = jQuery('.module-side-header').outerHeight();

    var scrollbar_height = body_height - (main_header_height + main_content_padding + gxwrapper_margin + gxmodule_padding + gxmodule_margin + module__sideheader_height + main_footer_height);
    jQuery('.custom-side-scrollbar').height(scrollbar_height);
}

function mobile_module_sidebar_height() {
    var body_height = jQuery('body').height();

    var module__sideheader_height = jQuery('.module-side-header').outerHeight();

    var scrollbar_height = body_height - (module__sideheader_height);
    jQuery('.custom-side-scrollbar').height(scrollbar_height);
}

/*Chat Panel Height*/

function chat_list_height() {
    var body_height = jQuery('body').height();
    var main_header_height = jQuery('.main-header').outerHeight();
    var main_footer_height = jQuery('.gx-footer').outerHeight();

    var main_content_padding = parseInt(jQuery('.gx-main-content').css('padding-top'));

    var gxwrapper_margin = parseInt(jQuery('.gx-wrapper').css('margin-bottom'));

    var chat_module_margin = parseInt(jQuery('.chat-module').css('margin-top')) + parseInt(jQuery('.chat-module').css('margin-bottom'));

    var chatMain_header_height = jQuery('.chat-main-header').outerHeight();
    var chatMain_footer_height = jQuery('.chat-main-footer').outerHeight();

    var scrollbar_height = body_height - (main_header_height + main_content_padding + gxwrapper_margin + chat_module_margin + chatMain_header_height + chatMain_footer_height + main_footer_height);
    jQuery('.chat-list-scroll').height(scrollbar_height);
}

/*Chat Panel Sidebar Height*/
function chat_module_sidebar_height() {
    var body_height = jQuery('body').height();
    var main_header_height = jQuery('.main-header').outerHeight();
    var main_footer_height = jQuery('.gx-footer').outerHeight();

    var main_content_padding = parseInt(jQuery('.gx-main-content').css('padding-top'));

    var gxwrapper_margin = parseInt(jQuery('.gx-wrapper').css('margin-bottom'));

    var chat_module_margin = parseInt(jQuery('.chat-module').css('margin-top')) + parseInt(jQuery('.chat-module').css('margin-bottom'));

    var module_sideheader_height = jQuery('.chat-sidenav-header').outerHeight();

    var scrollbar_height = body_height - (main_header_height + main_content_padding + gxwrapper_margin + chat_module_margin + module_sideheader_height + main_footer_height);
    jQuery('.chat-sidenav-scroll').height(scrollbar_height);
}

function mobile_chat_module_sidebar_height() {
    var body_height = jQuery('body').height();

    var module_sideheader_height = jQuery('.chat-sidenav-header').outerHeight();

    var scrollbar_height = body_height - (module_sideheader_height);
    jQuery('.chat-sidenav-scroll').height(scrollbar_height);
}