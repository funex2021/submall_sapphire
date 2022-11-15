jQuery(window).on("load", function () {
    $('#preloader').fadeOut(500);
    $('#main-wrapper').addClass('show');
});


jQuery(document).ready(function () {

    $(function () {
        for (var nk = window.location,
                 o = $(".menu a, .settings-menu a").filter(function () {
                     return this.href == nk;
                 })
                     .addClass("active")
                     .parent()
                     .addClass("active"); ;) {
            // console.log(o)
            if (!o.is("li")) break;
            o = o.parent()
                .addClass("show")
                .parent()
                .addClass("active");
        }

    });



});