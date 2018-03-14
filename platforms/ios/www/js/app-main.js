CommunityApp.main = (function () {
    var application;

    function getApplication() {
        return application;
    }

    var getServiceUrl = function () {
        var tokenValidationServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.authConfig.authPath + CommunityApp.configuration.authConfig.tokenValidationPath;
        return tokenValidationServiceUrl;
    };

    function initializeApp() {
        console.log("Kendo initializeApp Start");
        CommunityApp.session.currentUser.remove();
        var tokenValidationServiceUrl = getServiceUrl();
        var accessToken = CommunityApp.session.accessToken.load();

        var accessTokenOptions = {
            url: tokenValidationServiceUrl,
            requestType: "POST",
            dataType: "JSON",
            callBack: fnTokenValidationCallback,
            data: "=" + (accessToken && accessToken.token ? accessToken.token : "n/a")
        };

        console.log("Token validation start");
        CommunityApp.dataAccess.callService(accessTokenOptions);


        function fnTokenValidationCallback(response)
        {
            console.log("Token validation response: " + JSON.stringify(response));

            if (response.data && response.data.StatusMessage)
            {
                switch (response.data.StatusMessage.toString().toLowerCase()) {
                    case "valid":
                        CommunityApp.userAccount.viewModel.authenticate(response.data.UserId, response.data.Username, response.data.Token);
                        break;
                    default:
                        CommunityApp.session.clear(true);
                        CommunityApp.userAccount.viewModel.set("isUserLoggedIn", false);
                        break;
                }
            }
            else
            {
                CommunityApp.session.clear(true);
                CommunityApp.userAccount.viewModel.set("isUserLoggedIn", false);
            }
            

            CommunityApp.lang.setPreferredLanguage(function (language) {

                console.log('preferred lang is: ' + language);

                var multilingual = new Multilingual();
                multilingual.init('body');

                application = new kendo.mobile.Application(document.body, {
                    initial: "#ca-login-view",
                    loading: '<h1>Loading...</h1>',
                    platform: CommunityApp.configuration.appConfig.environment,
                    skin: CommunityApp.configuration.appConfig.skin,
                    init: function (e) {

                        application = this;

                        $("#mainTabStrip").find(".km-button").removeClass("km-state-active");

                        var viewPortWidth = $(window).width();
                        $("#popupNotification").kendoNotification({ position: { bottom: 70 } });

                        if (CommunityApp.userAccount.viewModel.isUserLoggedIn) {
                            this.navigate("#ca-loading-view");
                            CommunityApp.userAccount.viewModel.onLoginSuccess(response.data.Username);
                        }
                        else {
                            this.navigate("#ca-login-view");
                            $("#loginForm").removeClass("display-none");
                        }

                        console.log("width: " + $(window).width() + " and height: " + $(window).height());

                        $(document).ajaxStart(function () {
                            if (application && application !== null && application.pane) {
                                application.showLoading();
                            }
                        });

                        $(document).ajaxStop(function () {
                            if (application && application !== null && application.pane) {
                                application.hideLoading();
                            }
                        });

                        $(document).ajaxError(function () {
                            if (application && application !== null && application.pane) {
                                application.hideLoading();
                            }
                        });

                        $.ajaxSetup({
                            cache: false
                        });
                    }
                });
            });

        }
    }

    var viewShow = function (e) {
        if (CommunityApp.userAccount.viewModel.isUserLoggedIn)
        {
            requestLeftNav();
            requestBottomNav();
            showLibraryUploadButton(e.view);
            showPostShareButton(e.view);
            showThreadAddButton(e.view);
            showEditProfileButton(e.view);
            showClearNotificationsButton(e.view);
            showMoreChatButton(e.view);
            showAddGroupButton(e.view);
            showAddRolesButton(e.view);
        } 
    };

    var viewHide = function (e) {
        resetYoutubeVideos();
        CommunityApp.libraryScroller.viewModel.resetZoom();
    };

    var showLibraryUploadButton = function (view) {
        var currentViewId = view.id;
        var viewIndex = _.indexOf(CommunityApp.configuration.addLibraryFolderViews, currentViewId);
        var libraryId = view.params.libraryId ? view.params.libraryId : CommunityApp.configuration.appConfig.myPhotosFolderId;

        console.log("library id: " + libraryId);

        if (viewIndex >= 0) {
            CommunityApp.profile.viewModel.isAllowed("author", libraryId, function (response) {
                if (response === true) {
                    showButton(view, true);
                }
                else {
                    showButton(view, false);
                }
            });
        }
        else {
            showButton(view, false);
        }
    };
    
    var requestLeftNav = function () {
        var leftNav = CommunityApp.session.load("left_nav", true);

        if (!leftNav || leftNav.length <= 0) {
            var navServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.navConfig.navPath + CommunityApp.configuration.navConfig.appNav;

            var navOptions = {
                url: navServiceUrl,
                requestType: "GET",
                dataType: "JSON",
                callBack: function (response) {
                    if (response && response.data) {
                        console.log(response.data.ChildrenNodes);
                        //populateLeftNav(response.data.ChildrenNodes);
                        console.log(response.data.ChildrenNodes);
                    }  
                }
            };

            CommunityApp.dataAccess.callService(navOptions, null, null, null, null, null, function () {
                requestLeftNav();
            });
        }
        else {
            populateLeftNav(leftNav);
        }


        function populateLeftNav(items) {
            var navigation = [];

            $.each(items, function (index, item) {
                if (item.ChildrenNodes && item.ChildrenNodes.length > 0) {
                    var node = {
                        header: item.Title,
                        items: []
                    };

                    $.each(item.ChildrenNodes, function (index, item) {
                        var child = {
                            title: item.Title,
                            url: item.Url
                        };

                        node.items.push(child);
                    });

                    navigation.push(node);
                }
                else {
                    var headerNode = {
                        header: "",
                        items: [{
                            title: item.Title,
                            url: item.Url
                        }]
                    };

                    navigation.push(headerNode);
                }
            });

            var navTemplate = kendo.template($('#navigation-template').html());
            var navResult = kendo.render(navTemplate, navigation);
            $("#left-drawer-list").children().not(':first').not(':last').remove();
            $("#left-drawer-list").children().first().after(navResult);

            $(".km-group-title").each(function () {
                if ($(this).siblings(".km-list").length > 0) {
                    $(this).find(".km-text").find(".km-icon").remove();
                    $(this).find(".km-text").append("<span class='km-icon km-arrow-right white pull-right arrow-pos'></span>");

                    $(this).unbind("click");
                    $(this).click(function () {
                        if ($(this).next().hasClass("display-none-virtual")) {
                            $(this).find(".km-text").find(".km-icon").removeClass("km-arrow-right");
                            $(this).find(".km-text").find(".km-icon").addClass("km-arrow-down");
                            $(this).next().slideDown("1000", "swing");
                            $(this).next().removeClass("display-none-virtual");  
                        }  
                        else {
                            $(this).find(".km-text").find(".km-icon").removeClass("km-arrow-down");
                            $(this).find(".km-text").find(".km-icon").addClass("km-arrow-right");
                            $(this).next().slideUp("1000", "swing");
                            $(this).next().addClass("display-none-virtual");
                        }
                    });
                }
            });

            CommunityApp.session.save("left_nav", items, true);
        }
    };

    var requestBottomNav = function () {
        var bottomNav = CommunityApp.session.load("bottom_nav", true);

        if (!bottomNav || bottomNav.length <= 0)
        {
            var bottomNavServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.navConfig.navPath + CommunityApp.configuration.navConfig.appBottomMenu;

            var bottomNavOptions = {
                url: bottomNavServiceUrl,
                requestType: "GET",
                dataType: "JSON",
                callBack: function (response) {
                    if (response && response.data) {
                        populateBottomNav(response.data.ChildrenNodes);
                    }
                }
            };

            CommunityApp.dataAccess.callService(bottomNavOptions, null, null, null, null, null, function () {
                requestBottomNav(); 
            });
        }
        else
        {
            populateBottomNav(bottomNav);
        }

        function populateBottomNav(items)
        {
            var navTemplate = kendo.template($('#bottom-navigation-template').html());
            var navResult = kendo.render(navTemplate, items);
            $("#mainTabStrip").empty();
            $("#mainTabStrip").append(navResult);
            $("#mainTabStrip").find(".km-button").eq(0).addClass("km-state-active");
            CommunityApp.session.save("bottom_nav", items, true);
        }
    };


    var showButton = function (view, show) {
        var navbar = view.header.find(".km-navbar").data("kendoMobileNavBar");
        if (navbar !== null) {
            var rightElement = navbar.rightElement;
            if (rightElement !== null) {
                if (show) {
                    $(rightElement[0].firstChild).show();
                }
                else {
                    $(rightElement[0].firstChild).hide();
                }

            }
        }
    };

    var showPostShareButton = function (view) {
        var currentViewId = view.id;

        var viewIndex = _.indexOf(CommunityApp.configuration.sharePostViews, currentViewId);
        var navbar = view.header.find(".km-navbar").data("kendoMobileNavBar");

        if (navbar !== null)
        {
            var rightElement = navbar.rightElement;

            if (rightElement !== null) {
                if (viewIndex < 0) {
                    $(rightElement[0].children[1]).hide();
                }
                else {
                    $(rightElement[0].children[1]).show();
                }
            }
        }
    };

    var showThreadAddButton = function (view) {
        var currentViewId = view.id;
        var viewIndex = _.indexOf(CommunityApp.configuration.addThreadViews, currentViewId);
        var navbar = view.header.find(".km-navbar").data("kendoMobileNavBar");

        if (navbar !== null) {
            var rightElement = navbar.rightElement;

            if (rightElement !== null) {
                if (viewIndex < 0) {
                    $(rightElement[0].children[2]).hide();
                }
                else {
                    $(rightElement[0].children[2]).show();
                    $(rightElement[0].children[2]).attr("href", "#ca-thread-add?sectionId=" + view.params.sectionId);
                }
            }
        }
    };

    var showEditProfileButton = function (view) {
        var currentViewId = view.id;
        var viewIndex = _.indexOf(CommunityApp.configuration.editProfileViews, currentViewId);
        var navbar = view.header.find(".km-navbar").data("kendoMobileNavBar");

        if (navbar !== null) {
            var rightElement = navbar.rightElement;

            if (rightElement !== null) {
                if (viewIndex < 0) {
                    $(rightElement[0].children[3]).hide();
                }
                else {
					if(view.params.userId !== 'undefined' && typeof view.params.userId !== 'undefined' && view.params.userId != CommunityApp.session.currentUser.load().id) {
						$(rightElement[0].children[3]).hide();
					} else {
						$(rightElement[0].children[3]).show();
						$(rightElement[0].children[3]).attr("href", "#ca-user-edit-profile");
					}
                }
            }
        }
    };

    var showClearNotificationsButton = function (view) {
        var currentViewId = view.id;
        var viewIndex = _.indexOf(CommunityApp.configuration.clearNotificationsViews, currentViewId);
        var navbar = view.header.find(".km-navbar").data("kendoMobileNavBar");

        if (navbar !== null) {
            var rightElement = navbar.rightElement;

            if (rightElement !== null) {
                if (viewIndex < 0) {
                    $(rightElement[0].children[4]).hide();
                }
                else {
                    $(rightElement[0].children[4]).show();
                    $(rightElement[0].children[4]).attr("onclick", "CommunityApp.notifications.viewModel.clear();");
                }
            }
        }
    };

    var resetYoutubeVideos = function () {
        var iframe = $("iframe");
        if (iframe && iframe !== null && typeof iframe !== "undefined") {
            var src = iframe.attr("src");
            if (src && src !== null && src && typeof src !== "undefined") {
                if (src.indexOf("youtube.com") > 0) {
                    iframe.attr("src", "about:blank");
                }
            }
        }
    };

    var showMoreChatButton = function (view) {
        var currentViewId = view.id;
        var viewIndex = _.indexOf(CommunityApp.configuration.chatAddMoreViews, currentViewId);
        var navbar = view.header.find(".km-navbar").data("kendoMobileNavBar");


        if (navbar !== null) {
            var rightElement = navbar.rightElement;

            if (rightElement !== null) {
                if (viewIndex < 0) {
                    $(rightElement[0].children[7]).hide();
                    $(rightElement[0].children[6]).show();
                }
                else {
                    $(rightElement[0].children[7]).show();
                    $(rightElement[0].children[6]).hide();
                }
            }
        }
    };

    var showAddGroupButton = function (view) {
        var currentViewId = view.id;

        var viewIndex = _.indexOf(CommunityApp.configuration.addGroupViews, currentViewId);
        var navbar = view.header.find(".km-navbar").data("kendoMobileNavBar");

        if (navbar !== null) {
            var rightElement = navbar.rightElement;

            if (rightElement !== null) {
                if (viewIndex < 0) {
                    $(rightElement[0].children[8]).hide();
                }
                else {
                    $(rightElement[0].children[8]).show();
                }
            }
        }
    };

    var showAddRolesButton = function (view) {
        var currentViewId = view.id;

        var viewIndex = _.indexOf(CommunityApp.configuration.addRolesViews, currentViewId);
        var navbar = view.header.find(".km-navbar").data("kendoMobileNavBar");

        if (navbar !== null) {
            var rightElement = navbar.rightElement;

            if (rightElement !== null) {
                if (viewIndex < 0) {
                    $(rightElement[0].children[9]).hide();
                }
                else {
                    $(rightElement[0].children[9]).show();
                }
            }
        }
    };

    return {  
        initializeApp: initializeApp,
        getKendoApplication: getApplication,
        viewShow: viewShow,
        viewHide: viewHide
    };
})();




