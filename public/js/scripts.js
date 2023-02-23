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

$(function () {
    let onpageLoad = localStorage.getItem("theme");
    console.log(onpageLoad)
    if (!onpageLoad) {
        onpageLoad = 'dark-theme';
        localStorage.setItem("theme", "dark-theme");
    }
    if (onpageLoad == 'dark-theme') {
        $("#logoImg").attr('src', '/images/logo-white.png')
    } else {
        $("#logoImg").attr('src', '/images/logo-dark.png')
    }
    let element = document.body;
    element.classList.add(onpageLoad);
})

function themeToggle() {
    let element = document.body;
    element.classList.toggle("dark-theme");

    let theme = localStorage.getItem("theme");
    if (theme && theme === "dark-theme") {
        localStorage.setItem("theme", "light");
        $("#logoImg").attr('src', '/images/logo-dark.png')
    } else {
        localStorage.setItem("theme", "dark-theme");
        $("#logoImg").attr('src', '/images/logo-white.png')
    }
}