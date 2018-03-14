CommunityApp.search = (function () {
    
    var getSerpServiceUrl = function (userId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.searchConfig.searchPath +
            CommunityApp.configuration.searchConfig.serpPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId);
    };

    var getTrendingServiceUrl = function (userId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.searchConfig.searchPath +
            CommunityApp.configuration.searchConfig.trendingPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId);
    };

    var viewModel = kendo.observable({
        serps: [],
        trends: [],
        query: "",
        searchFocus: false,
        selectedTab: 0,
        load: function (e) {

            //CommunityApp.common.authenticatedUser();

            viewModel.set("query", "");
            viewModel.set("searchFocus", false);
            e.view.scroller.reset();
            
            $("#search-select").kendoMobileButtonGroup({
                select: function (selectedTab) {
                    viewModel.set("selectedTab", selectedTab.index);
                    var i = 0;
                    for (i=0; i<5; i++)
                        $('#ca-search-listview'+i).hide();
                    $('#ca-search-listview'+selectedTab.index).show();
                },
                index: viewModel.get("selectedTab")
            });
            
            var selectedTab = viewModel.get("selectedTab");
            
            for (i=0; i<5; i++)
                $('#ca-search-listview'+i).hide();
            $('#ca-search-listview'+selectedTab).show();

            var userId = CommunityApp.base.baseData.currentUser().id;
            var serviceUrl = getTrendingServiceUrl(userId);

            var trendingOptions = {
                url: serviceUrl,
                dataType: "JSON",
                requestType: "GET",
                callBack: viewModel.fnTrendingCallback,
                sender: e.view.params.q
            };

            var viewArgs = e;
			CommunityApp.dataAccess.callService(trendingOptions, null, null, null, null, null, function(){
				viewModel.load(viewArgs);
			});
        },
        fnTrendingCallback: function (response, query) {
            if (response.data) {

                var searchTemplate = kendo.template($('#ca-trending-tmpl').html());
                var searchResults = kendo.render(searchTemplate, response.data);
                $("#ca-trends-listview").find(".container-fluid").empty();
                $("#ca-trends-listview").find(".container-fluid").append(searchResults);

                $("#txtSearch").focus(function () {
                    viewModel.focus();
                });

                $("#txtSearch").blur(function () {
                    viewModel.blur();
                });

                $("#txtSearch").on("change", function () {
                    viewModel.search();
                });

                if (query && query !== "") {
                    $("#txtSearch").val(query);
                    viewModel.set("query", query);
                    CommunityApp.common.logTitle("Search: " + query);
                    viewModel.focus();
                    viewModel.blur();
                    viewModel.search();
                }
                else {
                    viewModel.set("trends", response.data);
                }
            }
        },
        focus: function () {
            //CommunityApp.common.authenticatedUser();
            viewModel.set("searchFocus", true);
        },
        blur: function () {
            //CommunityApp.common.authenticatedUser();
            var query = viewModel.get("query");

            //if(!query || query === null || query === "")
            //    viewModel.set("searchFocus", false);
        },
        search: function () {
            //CommunityApp.common.authenticatedUser();

            var query = $("#txtSearch").val();

            if (query.length > 1) {

                var pageSize = 25; 
                var currentPage = 1;
                var scroller;
                var total = 0;
                var newView;
                var topLevelResult;
                var viewedIndex = 0;
                var pagingThreshold = 4;

                var userId = CommunityApp.base.baseData.currentUser().id;
                var serviceUrl = getSerpServiceUrl(userId);

                var newDataSource = CommunityApp.dataAccess.kendoDataSource(currentPage, pageSize, serviceUrl, "POST", query, "ca-search-listview", "<h2 id='emptyMsg' class='centerAlign padding-1'>No results are found!</h2>", null, function(){
					viewModel.search();
				});
                $("#emptyMsg").hide();
                
                var emptyMsg = "<h2 id='emptyMsg' class='centerAlign padding-1'>No results found!</h2>";

                newDataSource.read().then(function () {
                    $(".km-load-more").remove();

                    var view = newDataSource.view();
                    console.log(view);
                    view = CommunityApp.common.injectIndex(currentPage, pageSize, view);
                    var serpTemplate = kendo.template($('#ca-serps-tmpl').html());
                    var serpResults = kendo.render(serpTemplate, view);
                    $("#ca-search-listview0").find(".container-fluid").empty();
                    if (view.length === 0)
                        $("#ca-search-listview0").find(".container-fluid").append(emptyMsg);
                    $("#ca-search-listview0").find(".container-fluid").append(serpResults);
                    
                    var view1 = [], view2 = [], view3 = [], view4 = [];
                    var i = 0;
                    for (i = 0; i < view.length; i++) {
                        if (view[i].TypeId === 99) {
                            view4[view4.length] = view[i];
                        } else if (view[i].PostThread.ThreadSection.ApplicationType === 0) {
                            view1[view1.length] = view[i];
                        }else if (view[i].PostThread.ThreadSection.ApplicationType === 1) {
                            view2[view2.length] = view[i];
                        } else if (view[i].PostThread.ThreadSection.ApplicationType === 13) {
                            view3[view3.length] = view[i];
                        }
                    }
                        
                    serpResults1 = kendo.render(serpTemplate, view1);
                    $("#ca-search-listview1").find(".container-fluid").empty();
                    if (view1.length === 0)
                        $("#ca-search-listview1").find(".container-fluid").append(emptyMsg);
                    $("#ca-search-listview1").find(".container-fluid").append(serpResults1);
                    
                    serpResults2 = kendo.render(serpTemplate, view2);
                    $("#ca-search-listview2").find(".container-fluid").empty();
                    if (view2.length === 0)
                        $("#ca-search-listview2").find(".container-fluid").append(emptyMsg);
                    $("#ca-search-listview2").find(".container-fluid").append(serpResults2);
                    
                    serpResults3 = kendo.render(serpTemplate, view3);
                    $("#ca-search-listview3").find(".container-fluid").empty();
                    if (view3.length === 0)
                        $("#ca-search-listview3").find(".container-fluid").append(emptyMsg);
                    $("#ca-search-listview3").find(".container-fluid").append(serpResults3);
                    
                    serpResults4 = kendo.render(serpTemplate, view4);
                    $("#ca-search-listview4").find(".container-fluid").empty();
                    if (view4.length === 0)
                        $("#ca-search-listview4").find(".container-fluid").append(emptyMsg);
                    $("#ca-search-listview4").find(".container-fluid").append(serpResults4);

                    var currentView = $("#ca-search").data("kendoMobileView");
                    scroller = currentView.scroller;
                    scroller.reset();

                    scroller.bind("scroll", function (e) {
                        $(".serp-item").each(function () {
                            if ($(this).visible()) {
                                viewedIndex = $(this).attr("data-index");
                                total = newDataSource.total();
                                pageSize = newDataSource.pageSize();
                                currentPage = newDataSource.page();

                                if (viewedIndex == ((currentPage * pageSize) - pagingThreshold) && (currentPage * pageSize) < total) {
                                    currentPage += 1;
                                    newDataSource.page(currentPage);

                                    newDataSource.read().then(function () {
                                        setTimeout(function () {

                                            console.log("rendering page: " + newDataSource.page());
                                            newView = newDataSource.view();
                                            newView = CommunityApp.common.injectIndex(currentPage, pageSize, newView);
                                            serpResults = kendo.render(serpTemplate, newView);
                                            $("#ca-search-listview").find(".container-fluid").append(serpResults);

                                        }, 100);

                                    });
                                }
                            }
                        });
                    });
                });
            }
        },
        serpRedirect: function (typeId, appType, threadType, postId, threadId, fileUrl, categoryId, curriculumId, courseId, assessmentId) {
            var page;
            
            if (typeId === '99') {
                page = "views/learning/lessons.html?curriculumId="+curriculumId+"&categoryId="+categoryId+"&courseId="+courseId;
                CommunityApp.common.navigateToView(page);
            } else if (appType === '13') {
                cordova.InAppBrowser.open(encodeURI(fileUrl), "_system");
            } else {
                switch (appType) {
                    case '0':
                        if (threadType.toLowerCase() === "discussion") {
                            page = "ca-thread-discussion?threadId=" + threadId;
                        } else {
                            page = "ca-thread-qa?threadId=" + threadId;
                        }
                        break;
                    case '1':
                        page = "ca-post?postId=" + postId;
                        break;
                    case '17':
                        page = "ca-post?postId=" + postId + "&mode=status";
                        break;
                    default:
                        page = "ca-post?postId=" + postId;
                        break;
                }

                CommunityApp.common.navigateToView(page);
            }
        }
    });

    return {
        viewModel: viewModel
    };
})();