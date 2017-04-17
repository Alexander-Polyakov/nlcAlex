(function () {

    function YOURAPPNAME(doc) {
        var _self = this;

        _self.doc = doc;
        _self.window = window;
        _self.html = _self.doc.querySelector('html');
        _self.body = _self.doc.body;
        _self.location = location;
        _self.hash = location.hash;
        _self.Object = Object;
        _self.scrollWidth = 0;

        _self.bootstrap();
    }

    YOURAPPNAME.prototype.bootstrap = function () {
        var _self = this;

        // Initialize window scollBar width
        _self.scrollWidth = _self.scrollBarWidth();
    };

    // Window load types (loading, dom, full)
    YOURAPPNAME.prototype.appLoad = function (type, callback) {
        var _self = this;

        switch (type) {
            case 'loading':
                if (_self.doc.readyState === 'loading') callback();

                break;
            case 'dom':
                _self.doc.onreadystatechange = function () {
                    if (_self.doc.readyState === 'complete') callback();
                };

                break;
            case 'full':
                _self.window.onload = function (e) {
                    callback(e);
                };

                break;
            default:
                callback();
        }
    };

    // Detect scroll default scrollBar width (return a number)
    YOURAPPNAME.prototype.scrollBarWidth = function () {
        var _self = this,
            outer = _self.doc.createElement("div");
        outer.style.visibility = "hidden";
        outer.style.width = "100px";
        outer.style.msOverflowStyle = "scrollbar";

        _self.body.appendChild(outer);

        var widthNoScroll = outer.offsetWidth;

        outer.style.overflow = "scroll";

        var inner = _self.doc.createElement("div");

        inner.style.width = "100%";
        outer.appendChild(inner);

        var widthWithScroll = inner.offsetWidth;

        outer.parentNode.removeChild(outer);

        return widthNoScroll - widthWithScroll;
    };

    YOURAPPNAME.prototype.initSwitcher = function () {
        var _self = this;

        var switchers = _self.doc.querySelectorAll('[data-switcher]');

        if (switchers && switchers.length > 0) {
            for (var i = 0; i < switchers.length; i++) {
                var switcher = switchers[i],
                    switcherOptions = _self.options(switcher.dataset.switcher),
                    switcherElems = switcher.children,
                    switcherTargets = _self.doc.querySelector('[data-switcher-target="' + switcherOptions.target + '"]').children;

                for (var y = 0; y < switcherElems.length; y++) {
                    var switcherElem = switcherElems[y],
                        parentNode = switcher.children,
                        switcherTarget = switcherTargets[y];

                    if (switcherElem.classList.contains('active')) {
                        for (var z = 0; z < parentNode.length; z++) {
                            parentNode[z].classList.remove('active');
                            switcherTargets[z].classList.remove('active');
                        }
                        switcherElem.classList.add('active');
                        switcherTarget.classList.add('active');
                    }

                    switcherElem.children[0].addEventListener('click', function (elem, target, parent, targets) {
                        return function (e) {
                            e.preventDefault();
                            if (!elem.classList.contains('active')) {
                                for (var z = 0; z < parentNode.length; z++) {
                                    parent[z].classList.remove('active');
                                    targets[z].classList.remove('active');
                                }
                                elem.classList.add('active');
                                target.classList.add('active');
                            }
                        };

                    }(switcherElem, switcherTarget, parentNode, switcherTargets));
                }
            }
        }
    };

    YOURAPPNAME.prototype.str2json = function (str, notevil) {
        try {
            if (notevil) {
                return JSON.parse(str
                    .replace(/([\$\w]+)\s*:/g, function (_, $1) {
                        return '"' + $1 + '":';
                    })
                    .replace(/'([^']+)'/g, function (_, $1) {
                        return '"' + $1 + '"';
                    })
                );
            } else {
                return (new Function("", "var json = " + str + "; return JSON.parse(JSON.stringify(json));"))();
            }
        } catch (e) {
            return false;
        }
    };

    YOURAPPNAME.prototype.options = function (string) {
        var _self = this;

        if (typeof string != 'string') return string;

        if (string.indexOf(':') != -1 && string.trim().substr(-1) != '}') {
            string = '{' + string + '}';
        }

        var start = (string ? string.indexOf("{") : -1), options = {};

        if (start != -1) {
            try {
                options = _self.str2json(string.substr(start));
            } catch (e) {
            }
        }

        return options;
    };

    YOURAPPNAME.prototype.popups = function (options) {
        var _self = this;

        var defaults = {
            reachElementClass: '.js-popup',
            closePopupClass: '.js-close-popup',
            currentElementClass: '.js-open-popup',
            changePopupClass: '.js-change-popup'
        };

        options = $.extend({}, options, defaults);

        var plugin = {
            reachPopups: $(options.reachElementClass),
            bodyEl: $('body'),
            topPanelEl: $('.top-panel-wrapper'),
            htmlEl: $('html'),
            closePopupEl: $(options.closePopupClass),
            openPopupEl: $(options.currentElementClass),
            changePopupEl: $(options.changePopupClass),
            bodyPos: 0
        };

        plugin.openPopup = function (popupName) {
            plugin.reachPopups.filter('[data-popup="' + popupName + '"]').addClass('opened');
            plugin.bodyEl.css('overflow-y', 'scroll');
            plugin.topPanelEl.css('padding-right', scrollSettings.width);
            plugin.htmlEl.addClass('popup-opened');
        };

        plugin.closePopup = function (popupName) {
            plugin.reachPopups.filter('[data-popup="' + popupName + '"]').removeClass('opened');
            setTimeout(function () {
                plugin.bodyEl.removeAttr('style');
                plugin.htmlEl.removeClass('popup-opened');
                plugin.topPanelEl.removeAttr('style');
            }, 500);
        };

        plugin.changePopup = function (closingPopup, openingPopup) {
            plugin.reachPopups.filter('[data-popup="' + closingPopup + '"]').removeClass('opened');
            plugin.reachPopups.filter('[data-popup="' + openingPopup + '"]').addClass('opened');
        };

        plugin.init = function () {
            plugin.bindings();
        };

        plugin.bindings = function () {
            plugin.openPopupEl.on('click', function (e) {
                e.preventDefault();
                var pop = $(this).attr('data-open-popup');
                plugin.openPopup(pop);
            });

            plugin.closePopupEl.on('click', function (e) {
                var pop;
                if (this.hasAttribute('data-close-popup')) {
                    pop = $(this).attr('data-close-popup');
                } else {
                    pop = $(this).closest(options.reachElementClass).attr('data-popup');
                }

                plugin.closePopup(pop);
            });

            plugin.changePopupEl.on('click', function (e) {
                var closingPop = $(this).attr('data-closing-popup');
                var openingPop = $(this).attr('data-opening-popup');

                plugin.changePopup(closingPop, openingPop);
            });

            plugin.reachPopups.on('click', function (e) {
                var target = $(e.target);
                var className = options.reachElementClass.replace('.', '');
                if (target.hasClass(className)) {
                    plugin.closePopup($(e.target).attr('data-popup'));
                }
            });
        };

        if (options)
            plugin.init();

        return plugin;
    };

    var app = new YOURAPPNAME(document);

    app.appLoad('loading', function () {
        console.log('App is loading... Paste your app code here.');
        // App is loading... Paste your app code here. 4example u can run preloader event here and stop it in action appLoad dom or full
    });

    app.appLoad('dom', function () {
        console.log('DOM is loaded! Paste your app code here (Pure JS code).');
        // DOM is loaded! Paste your app code here (Pure JS code).
        // Do not use jQuery here cause external libs do not loads here...

        app.initSwitcher(); // data-switcher="{target='anything'}" , data-switcher-target="anything"
    });


    app.appLoad('full', function (e) {

        $('.main-slider').owlCarousel({
            loop: true,
            items: 1,
            autoHeight: true,
            dots: 1,
            responsive: {
                0: {
                    nav: false
                },
                767: {
                    nav: true
                }

            }
        });

        $('.review-slider').owlCarousel({
            loop: true,
            items: 1,
            // autoplay: true,
            autoplayTimeout: 5000,
            // autoHeight: true,
            responsive: {
                0: {
                    nav: false,
                    dots: true
                },
                767: {
                    nav: true,
                    dots: false
                }
            }
        });

        $('.company-slider').owlCarousel({
            loop: true,
            items: 1,
            autoHeight: true,
            dots: 1,
            nav: 1,
        });

        var mobileCondition = null;

        function tableOverflowAuto() {
            var table = $("table"),
                tableWrapper = '<div class="ova"></div>';

            table.wrap(tableWrapper);
        };

        tableOverflowAuto();

        function sayAboutSliderTransform() {
            var allSlidesCount = $(".say-about-grid__item").length,
                slides = $(".say-about-grid__item"),
                owl = $(".say-about"),
                hasDots = false,
                hasNav = false,
                wrapper = '<div class="say-about-grid"></div>';

            if ($(window).width() > 767 && mobileCondition !== false) {
                var needSlides = 4;
                $('.say-about').owlCarousel('destroy');
                hasDots = false;
                hasNav = true;
                mobileCondition = false;
                for (var i = 0; i < allSlidesCount; i = i + needSlides) {
                    slides.slice(i, i + needSlides).wrapAll(wrapper);
                }
            } else if ($(window).width() <= 767 && mobileCondition !== true) {
                $('.say-about').owlCarousel('destroy');
                hasDots = true;
                hasNav = false;
                if (mobileCondition === false) {
                    slides.unwrap();
                };
                mobileCondition = true;
            }

            owl.owlCarousel({
                loop: true,
                items: 1,
                margin: 10,
                nav: hasNav,
                dots: hasDots,
            });
        }

        sayAboutSliderTransform();

        var myTimeOut;

        $(window).resize(function() {
            clearTimeout(myTimeOut);
            myTimeOut = setTimeout(mySliderTransform, 100);
        });

        function mySliderTransform(){
            sayAboutSliderTransform();
        }


        $(".js-toggle-menu").click(function () {
            $(".js-mobile-menu").addClass("open");
            $(".js-overlay").addClass("open");
        });

        $(".js-overlay, .js-menu-close").click(function () {
            $(".js-mobile-menu").removeClass("open");
            $(".js-overlay").removeClass("open");
        });


        $(".js-open-popup").click(function () {
            $(".js-popup-feedback").addClass("open");
            $(".js-overlay").addClass("open");
        });

        $(".js-overlay, .js-close-popup").click(function () {
            $(".js-popup-feedback").removeClass("open");
            $(".js-overlay").removeClass("open");
        });




        $(".js-dropmenu-button").click(function (e) {
            e.preventDefault();

            var thisItem = $(this).closest(".js-dropmenu-item ");

            thisItem.find(".js-dropmenu-content").slideToggle(400);

        });

        $(".js-accordion-toggle").click(function (e) {
            var accordion = $(this).closest(".js-accordion"),
                thisItem = $(this).closest('.js-accordion-item'),
                allItems = accordion.find('.js-accordion-item'),
                allContent = accordion.find('.js-accordion-content'),
                thisContent = thisItem.find(".js-accordion-content"),
                tableScroll = thisContent.find('.table-scroll'),
                jspScrollable = allContent.find(".jspScrollable"),
                jsScroll = tableScroll.find('.js-scroll'),
                delay = 400;

            if (jspScrollable.length) {
                setTimeout(function () {
                    jspScrollable.data().jsp.destroy();
                }, delay);

            }
            if (tableScroll.length) {
                setTimeout(function () {
                    jsScroll.jScrollPane({autoReinitialise: true});

                    var needHeight = thisContent.find('table').outerHeight() + 15;
                    tableScroll.find(".jspContainer").css('height', needHeight);
                }, delay);
            }

            if (thisItem.hasClass('open')) {
                allContent.stop().slideUp(delay);
                thisItem.removeClass("open");
            } else {
                allContent.stop().slideUp(delay);
                thisContent.stop().slideDown(delay);
                allItems.removeClass("open");
                thisItem.addClass("open");

                setTimeout(function () {
                    var itemOffsetTop = thisItem.offset().top;
                    $('html, body').animate({
                        scrollTop: itemOffsetTop
                    }, 300);
                }, delay);
            }
        });
        (function() {
            if (window.pluso)if (typeof window.pluso.start == "function") return;
            if (window.ifpluso==undefined) { window.ifpluso = 1;
                var d = document, s = d.createElement('script'), g = 'getElementsByTagName';
                s.type = 'text/javascript'; s.charset='UTF-8'; s.async = true;
                s.src = ('https:' == window.location.protocol ? 'https' : 'http')  + '://share.pluso.ru/pluso-like.js';
                var h=d[g]('body')[0];
                h.appendChild(s);
            }
        })();
    });
})();