CommunityApp.recentPosts = (function () {

    var getBannerServiceUrl = function() {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.bannerConfig.bannerPath + CommunityApp.configuration.bannerConfig.latestPath;
        return serviceUrl;
    };
    
    var getSecondaryBannerServiceUrl = function() {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.bannerConfig.bannerPath + CommunityApp.configuration.bannerConfig.secondaryPath;
        return serviceUrl;
    };

    var getPostsPagedServiceUrl = function (userId, width, height) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.postConfig.postsPath + CommunityApp.configuration.postConfig.newRecentPostsPagedPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, width, height);
    };

    var getPostsPagedIdServiceUrl = function (userId, width, height) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.postConfig.postsPath + CommunityApp.configuration.postConfig.recentPostId;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, width, height);
    };
    
    var getRecentForumsServiceUrl = function () {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.forumConfig.forumsPath + CommunityApp.configuration.forumConfig.recentForumsPath;
        return serviceUrl;
    };
    
    var getAllStatusesServiceUrl = function (userId) {
        var sutatusesServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.profileConfig.accountPath +
                   CommunityApp.utilities.stringFormat(CommunityApp.configuration.profileConfig.allStatusesPath, userId);
        return sutatusesServiceUrl;
    };

	var swiper;

    var viewModel = kendo.observable({
        firstPost: {},
        pages_read: [],
        selectedTab: 0,
        showStatusUpdate: false,
        processBanners: function(successCallback){
            var mobileLatestOfflineBanners = CommunityApp.session.load(CommunityApp.configuration.bannerConfig.mobileLatestOfflineStore);

            if(mobileLatestOfflineBanners !== null && typeof mobileLatestOfflineBanners !== 'undefined' && mobileLatestOfflineBanners.lenght > 0)
            {
                var latestOffLineId = _.first(mobileLatestOfflineBanners).Id;

                viewModel.getLatestMobileLatestBannerId(function (latestOnlineId) {
                    if(latestOffLineId !== latestOnlineId)
                    {
                        viewModel.saveMobileLatestBannersOffline(function () {
                            successCallback();
                        });
                    }
                });
            }
            else
            {
                viewModel.saveMobileLatestBannersOffline(function () {
                    successCallback();
                });
            }
        },
        getLatestMobileLatestBannerId: function(successCallback){
            var mobileLatestBannerIdServiceUrl = getBannerServiceUrl() + "/id";

            var mobileLatestOptions = {
                url: mobileLatestBannerIdServiceUrl,
                dataType: "JSON",
                requestType: "GET",
                callBack: viewModel.fnGetLatestMobileLatestBannerId,
                sender: {
                    callBack: successCallback
                }
            };

            CommunityApp.dataAccess.callService(mobileLatestOptions);
        },
        fnGetLatestMobileLatestBannerId: function(response, sender)
        {
            if(response && response.data)
            {
                sender.callBack(response.data);
            }
        },
        page: function(url){
            var firstPost = viewModel.get("firstPost");
            return (url + firstPost.Id);
        },
        processLatestPosts: function (successCallback) {
            var offlineSavedPosts = CommunityApp.session.load(CommunityApp.configuration.postConfig.offlineStore);

            //if (offlineSavedPosts !== null && typeof offlineSavedPosts !== 'undefined' && offlineSavedPosts.length > 0)
            if (offlineSavedPosts === null || typeof offlineSavedPosts === 'undefined' || offlineSavedPosts.length < 1 || typeof offlineSavedPosts[0].TypeId === "undefined" || offlineSavedPosts[0].TypeId === "undefined")
            /*{
                var latestOfflineId = offlineSavedPosts[0].Id;

                viewModel.getLatestUpdateId(CommunityApp.configuration.postConfig.recentPostsMax, function (latestId) {
                    if(latestOfflineId !== latestId)
                    {
                        viewModel.loadOffline(CommunityApp.configuration.postConfig.recentPostsMax, function () {
                            successCallback();
                        });
                    }
                });
            }
            else*/
            {
                viewModel.loadOffline(CommunityApp.configuration.postConfig.recentPostsMax, function () {
                    successCallback();
                });
            }
        },
        saveMobileLatestBannersOffline: function(callback){
            var bannerServiceUrl = getBannerServiceUrl();
            var bannerOptions = {
                url: bannerServiceUrl,
                requestType: "GET",
                dataType: "JSON",
                callBack: viewModel.fnLoadBannerCallback,
                sender: {
                    callback: callback
                }
            };

            CommunityApp.dataAccess.callService(bannerOptions);
        },
        fnLoadBannerCallback: function(response, sender) {
            if(response.data)
            {
                var bannerData = response.data;
                CommunityApp.session.save(CommunityApp.configuration.bannerConfig.mobileLatestOfflineStore, bannerData);
                if(sender.callback)
                {
                    sender.callback();
                }
            }
        },
        loadMobileLatestBannersOffline: function () {

            var bannerData = CommunityApp.session.load(CommunityApp.configuration.bannerConfig.mobileLatestOfflineStore);

            if (bannerData && bannerData.length > 0) {
                var i = 0;
                for (i = 0; i < bannerData.length - 1; i++) {
                    var j = 0;
                    for (j = i + 1; j < bannerData.length; j++) {
                        if (bannerData[i].SortOrder > bannerData[j].SortOrder) {
                            var temp = bannerData[i];
                            bannerData[i] = bannerData[j];
                            bannerData[j] = temp;
                        }
                    }
                }

                if (swiper) {
                    swiper.destroy();
                }

                var bannerTemplate = kendo.template($('#recent-posts-banner-tmpl').html());
                var bannerSwiperResult = kendo.render(bannerTemplate, bannerData);
                $("#ca-home-main-view").find(".swiper-wrapper").empty();
                $("#ca-home-main-view").find(".swiper-wrapper").attr("style", "");
                $("#ca-home-main-view").find(".swiper-wrapper").append(bannerSwiperResult);

                swiper = new Swiper('#recentPostBannerSwiper', {
                    loop: true,
                    initialSlide: 0,
                    autoplay: 5000,
                    autoplayDisableOnInteraction: false,
                    pagination: '.swiper-pagination',
                    paginationClickable: true
                });
            }

        },
        getLatestUpdateId: function (max, successCallback) {
            var userId = CommunityApp.base.baseData.currentUser().id;
            var pagedPostsIdServiceUrl = getPostsPagedIdServiceUrl(userId, 282, 185);

            pagedPostsIdServiceUrl += "&page=1&pageSize=" + max;

            var recentPostsIdOptions = {
                url: pagedPostsIdServiceUrl,
                dataType: "JSON",
                requestType: "GET",
                callBack: viewModel.fnGetLatestUpdateIdCallback,
                sender: {
                    callBack: successCallback
                }
            };

            CommunityApp.dataAccess.callService(recentPostsIdOptions);
        },
        fnGetLatestUpdateIdCallback: function (response, sender)
        {
            if(response && response.data)
            {
                sender.callBack(response.data);
            }
        },
        loadOffline: function(max, successCallback){
            var userId = CommunityApp.base.baseData.currentUser().id;
            var recentPostsServiceUrl = getPostsPagedServiceUrl(userId, 282, 185);
            recentPostsServiceUrl += "&page=1&pageSize=" + max;

            var recentPostsOptions = {
                url: recentPostsServiceUrl,
                dataType: 'JSON',
                requestType: 'GET',
                callBack: viewModel.fnLoadOfflineCallback,
                sender: {
                    max: max,
                    callBack: successCallback
                }
            };

            CommunityApp.dataAccess.callService(recentPostsOptions);
        },
        fnLoadOfflineCallback: function(response, sender)
        {
            if (response && response.data)
            {
                var data = CommunityApp.common.injectIndex(1, sender.max, response.data.Items);
                CommunityApp.session.save(CommunityApp.configuration.postConfig.offlineStore, data);
                sender.callBack();
            }
        },
        readOffline: function()
        {
            var offlineSavedPosts = CommunityApp.session.load(CommunityApp.configuration.postConfig.offlineStore);

            if(offlineSavedPosts && offlineSavedPosts.length > 0)
            {
                var recentPostsTemplate = kendo.template($('#posts-thumbs-flip-tmpl').html());
                var result = kendo.render(recentPostsTemplate, offlineSavedPosts);
                $("#recent-posts-list").find(".container-fluid").empty();
                $("#recent-posts-list").find(".container-fluid").append(result);
            }
        },
        read: function(page, view)
        {
            var userId = CommunityApp.base.baseData.currentUser().id;
            var recentPostsServiceUrl = getPostsPagedServiceUrl(userId, 282, 185);
            var pageSize = 20;  
            recentPostsServiceUrl += "&page=" + page + "&pageSize=" + pageSize;

            var recentPostsOptions = {
                url: recentPostsServiceUrl,
                dataType: 'JSON',
                requestType: 'GET',
                callBack: viewModel.fnReadRecentPostsCallback,
                sender: {
                    page: page,
                    pageSize: pageSize,
                    view: view
                }
            };

            var thatPage = page;
            var thatView = view;
            CommunityApp.dataAccess.callService(recentPostsOptions, "recent-posts-list", "<h2 class='centerAlign padding-1'>No posts are found!</h2>", null, null, null, function () {
                viewModel.read(thatPage, thatView);
            });
        },
        fnReadRecentPostsCallback: function(response, sender)
        {
            if(response.data)
            {
                var currentPage = sender.page;
                var pageSize = sender.pageSize;
                var data = response.data.Items;
                var pagingThreshold = 4;

                data = CommunityApp.common.injectIndex(currentPage, pageSize, data);
                var recentPostsTemplate = kendo.template($('#posts-thumbs-flip-tmpl').html());
                var result = kendo.render(recentPostsTemplate, data);
                var pages_read = viewModel.get("pages_read");
                scroller = sender.view.scroller;

                if (currentPage == 1) {
                    $("#recent-posts-list").find(".container-fluid").empty();
                    scroller.reset();
                    pages_read = [];
                }

                $("#recent-posts-list").find(".container-fluid").append(result);
                pages_read.push(currentPage);
                viewModel.set("pages_read", pages_read);

                scroller.unbind("scroll");
                scroller.bind("scroll", function (e) {
                    $("#recent-posts-list").find(".container-fluid").children().each(function () {
                        if ($(this).visible(true)) {
                            viewedIndex = $(this).data("index");
                            total = response.data.Total;
                            pageSize = sender.pageSize;
                            currentPage = sender.page;

                            if (viewedIndex == ((currentPage * pageSize) - pagingThreshold) && (currentPage * pageSize) < total) {

                                currentPage = currentPage + 1;

                                if (pages_read.indexOf(currentPage) < 0) {

                                    pages_read.push(currentPage);
                                    viewModel.set("pages_read", pages_read);

                                    viewModel.read(currentPage, sender.view);  
                                }
                            }
                        }
                    });
                });
            }
        },
        loadStatusUpdate: function (e) {
            console.log("load status update");
            var userId = CommunityApp.base.baseData.currentUser().id;
            var serviceUrl = getAllStatusesServiceUrl(userId);
            
            var pageSize = 20;
            var currentPage = 1;
            var scroller;
            var total = 0;
            var newView;
            var statusesResult;
            var viewedIndex = 0;
            var pagingThreshold = 4;

            var viewArgs = e;
            var recentDatasource = CommunityApp.dataAccess.kendoDataSource(currentPage, pageSize, serviceUrl, "GET", null, null, null, null, function () {
                viewModel.loadStatusUpdate(viewArgs);
            });

            recentDatasource.read().then(function () {

                var view = recentDatasource.view();
                view = CommunityApp.common.injectIndex(currentPage, pageSize, view);
                view = CommunityApp.common.injectValue(view, "class_name", "recent-status");

                var statusListTemplate = kendo.template($("#status-list-tmpl").html());
                var statusesResult = kendo.render(statusListTemplate, view);

                $("#recent-status-update-list").find(".container-fluid").empty();
                $("#recent-status-update-list").find(".container-fluid").append(statusesResult);

                scroller = e.view.scroller;
                scroller.reset();

                scroller.unbind("scroll");
                scroller.bind("scroll", function (e) {
                    $(".recent-status").each(function () {
                        if ($(this).visible()) {
                            viewedIndex = $(this).attr("data-index");
                            total = recentDatasource.total();
                            pageSize = recentDatasource.pageSize();
                            currentPage = recentDatasource.page();

                            if (viewedIndex == ((currentPage * pageSize) - pagingThreshold) && (currentPage * pageSize) < total) {
                                currentPage += 1;
                                recentDatasource.page(currentPage);

                                recentDatasource.read().then(function () {
                                    setTimeout(function () {

                                        console.log("rendering page: " + recentDatasource.page());
                                        newView = recentDatasource.view();
                                        newView = CommunityApp.common.injectIndex(currentPage, pageSize, newView);
                                        newView = CommunityApp.common.injectValue(newView, "class_name", "recent-status");
                                        statusesResult = kendo.render(statusListTemplate, newView);
                                        $("#recent-status-update-list").find(".container-fluid").append(statusesResult);

                                    }, 100);

                                });
                            }
                        }
                    });
                });
            });
        },
        loadForums: function(e)
        {
            var recentServiceUrl = getRecentForumsServiceUrl();

            var pageSize = 20;
            var currentPage = 1;
            var scroller;
            var total = 0;
            var newView;
            var threadDiscussionsResult;
            var viewedIndex = 0;
            var pagingThreshold = 4;

			var viewArgs = e;
            var recentDatasource = CommunityApp.dataAccess.kendoDataSource(currentPage, pageSize, recentServiceUrl, "GET", null, null, null, null, function(){
				viewModel.loadForums(viewArgs);
			});

            recentDatasource.read().then(function () {

                var view = recentDatasource.view();
                view = CommunityApp.common.injectIndex(currentPage, pageSize, view);
                view = CommunityApp.common.injectValue(view, "discussion_type", "recent-thread");

                var forumListTemplate = kendo.template($("#forum-list-tmpl").html());
                var threadDiscussionsResult = kendo.render(forumListTemplate, view);

                $("#recent-discussions-list").find(".container-fluid").empty();
                $("#recent-discussions-list").find(".container-fluid").append(threadDiscussionsResult);

                scroller = e.view.scroller;
                scroller.reset();

                scroller.unbind("scroll");
                scroller.bind("scroll", function (e) {
                    $(".recent-thread").each(function () {
                        if ($(this).visible()) {
                            viewedIndex = $(this).attr("data-index");
                            total = recentDatasource.total();
                            pageSize = recentDatasource.pageSize();
                            currentPage = recentDatasource.page();

                            if (viewedIndex == ((currentPage * pageSize) - pagingThreshold) && (currentPage * pageSize) < total) {
                                currentPage += 1;
                                recentDatasource.page(currentPage);

                                recentDatasource.read().then(function () {
                                    setTimeout(function () {

                                        console.log("rendering page: " + recentDatasource.page());
                                        newView = recentDatasource.view();
                                        newView = CommunityApp.common.injectIndex(currentPage, pageSize, newView);
                                        newView = CommunityApp.common.injectValue(newView, "discussion_type", "recent-thread");
                                        threadDiscussionsResult = kendo.render(forumListTemplate, newView);
                                        $("#recent-discussions-list").find(".container-fluid").append(threadDiscussionsResult);

                                    }, 100);

                                });
                            }
                        }
                    });
                });
            });
        },
        refresh: function (e) {
            
            CommunityApp.common.pullToRefresh(e, function (viewArgs) {
	    	CommunityApp.session.remove(CommunityApp.configuration.postConfig.offlineStore);
                viewModel.processLatestPosts(function () {
                    viewModel.readOffline();
                });

                viewModel.processBanners(function () {
                    viewModel.loadMobileLatestBannersOffline();
                });
            });

            CommunityApp.common.logTitle("The Latest");
            
            viewModel.set("showStatusUpdate", false);
            var showStatusUpdateServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.profileConfig.accountPath + CommunityApp.configuration.profileConfig.showStatusUpdatePath;
            var showStatusUpdateOptions = {
                url: showStatusUpdateServiceUrl,
                dataType: "JSON",
                requestType: "GET",
                callBack: viewModel.fnShowStatusUpdateCallback
            };
            CommunityApp.dataAccess.callService(showStatusUpdateOptions, null, null, true, false, false);
            
            var selectList = $("#latest-select").data("kendoMobileButtonGroup");

            if (selectList && typeof selectList !== 'undefined')
            {
                selectList.destroy();
            } 

            $("#latest-select").kendoMobileButtonGroup({
                index: viewModel.get("selectedTab")
            });

            selectList = $("#latest-select").data("kendoMobileButtonGroup");
            selectList.unbind("select");
            selectList.bind("select", function (selectedTab) {
                viewModel.set("selectedTab", selectedTab.index);
                if (selectedTab.index === 0) {
                    $('#recent-posts-list').show();
                    $('#recent-discussions-list').hide();
                    $('#recent-status-update-list').hide();
                } else if (selectedTab.index === 1) {
                    viewModel.loadForums(e);
                    $('#recent-posts-list').hide();
                    $('#recent-discussions-list').show();
                    $('#recent-status-update-list').hide();
                } else if (selectedTab.index === 2) {
                    viewModel.loadStatusUpdate(e);
                    $('#recent-posts-list').hide();
                    $('#recent-discussions-list').hide();
                    $('#recent-status-update-list').show();
                }
            });

            
            viewModel.readOffline();
            viewModel.loadMobileLatestBannersOffline();
            
            if (viewModel.get("selectedTab") === 0)
                $('#recent-discussions-list').hide();
            else
                $('#recent-posts-list').hide();
            
            //secondary banner
            var secondaryBannerServiceUrl = getSecondaryBannerServiceUrl();
            var secondaryBannerOptions = {
                url: secondaryBannerServiceUrl,
                requestType: "GET",
                dataType: "JSON",
                callBack: viewModel.fnLoadSecondaryBannerCallback
            };
            CommunityApp.dataAccess.callService(secondaryBannerOptions, null, null, null, null, null, function () {
                viewModel.refresh(e);
            });
        },
        fnShowStatusUpdateCallback: function (response) {
            if (response) {
                viewModel.set("showStatusUpdate", response.data);
            }
        },
        likeSuccessCallback: function (operation, likes, sender) {
            //CommunityApp.common.authenticatedUser();
            $(sender).addClass("display-none");
            switch(operation)
            {
                case "like":
                    $(sender).prev().removeClass("display-none");
                    break;
                case "unlike":
                    $(sender).next().removeClass("display-none");
                    break;
            }
        },
        fnLoadSecondaryBannerCallback: function(response) {
            if (response.data && response.data.length > 0)
            {
                var bannerData = response.data[0];
                var longLink = bannerData.Url;
                var secondaryBanner = '<div class="shop-samsung-ribbon"><img src="images/icn_banner_employeeprogram.png"></img></div>';
                secondaryBanner += '<div class="shop-samsung-content text-center">';
                secondaryBanner += '<img src="images/img_ShopSamsung.png"></img>';
                secondaryBanner += '<h1 class="bold margin-0 black fontsize-14">Access special offers on Samsung<br> Products, available to AT&T employees.</h1>';
                secondaryBanner += '<div class="shop-samsung-cta bold">';
                //secondaryBanner += '<a onclick="cordova.InAppBrowser.open(\'' + longLink + '\', \'_system\');">GET THE APP</a>';
                secondaryBanner += '<a onclick="CommunityApp.common.openShopSamsung(\'' + longLink + '\');">GET THE APP</a>';
                secondaryBanner += '</div></div>';
                
                $("#recent-posts-list").find(".shop-samsung-link").empty();
                $("#recent-posts-list").find(".shop-samsung-link").append(secondaryBanner);
            }
        }
    });

    return {
        viewModel: viewModel
    };
})();  