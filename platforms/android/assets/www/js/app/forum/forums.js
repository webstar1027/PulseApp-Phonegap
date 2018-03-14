CommunityApp.forums = (function () {
    var getRecentForumsServiceUrl = function () {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.forumConfig.forumsPath + CommunityApp.configuration.forumConfig.recentForumsLessPath;
        return serviceUrl;
    };

    var getPopularForumsServiceUrl = function () {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.forumConfig.forumsPath + CommunityApp.configuration.forumConfig.popularForumsLessPath;
        return serviceUrl;
    };

    var getTypeSectionsServiceUrl = function () {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.sectionConfig.sectionPath + CommunityApp.configuration.sectionConfig.sectionTypePath;
        return CommunityApp.utilities.stringFormat(serviceUrl, 0);
    };

    var viewModel = kendo.observable({
        recentDataBound: false,
        popularDataBound: false,
        allTopicsDataBound: false,
        popularPosts: [],
        load: function (e) {
            //CommunityApp.common.authenticatedUser();
            CommunityApp.common.logTitle("Discussions Tabbed View");

            var lists = this.element ? this.element.find(".forums") : null;

            var viewArgs = e;

            var listSelect = $("#select-discussion").kendoMobileButtonGroup({
                select: function (e) {

                    if (lists && lists !== null)
                        lists.hide().eq(e.index).show();

                    switch (e.index) {
                        case 0:
                            viewModel.loadForums(viewArgs);
                            break;
                        case 1:
                            viewModel.loadPopularForums(viewArgs);
                            break;
                        case 2:
                            viewModel.loadTypeSections(viewArgs);
                            break;
                    }
                },
                index: 0
            });
            listSelect.unbind("select");

            viewModel.loadForums(viewArgs);

        },
        loadForums: function (e) {
            viewModel.set("recentDataBound", false);

            var recentServiceUrl = getRecentForumsServiceUrl();

            var pageSize = 50;
            var currentPage = 1;
            var scroller;
            var total = 0;
            var newView;
            var threadDiscussionsResult;
            var viewedIndex = 0;
            var pagingThreshold = 4;

            $("#recent-discussions").show();
            $("#popular-discussions").hide();
            $("#all-topics").hide();

            var viewArgs = e;
            var recentDatasource = CommunityApp.dataAccess.kendoDataSource(currentPage, pageSize, recentServiceUrl, "GET", null, null, null, null, function () {
                viewModel.loadForums(viewArgs);
            });

            recentDatasource.read().then(function () {

                var view = recentDatasource.view();
                view = CommunityApp.common.injectIndex(currentPage, pageSize, view);
                view = CommunityApp.common.injectValue(view, "discussion_type", "recent-thread");

                var forumListTemplate = kendo.template($("#forum-list-less-tmpl").html());
                var threadDiscussionsResult = kendo.render(forumListTemplate, view);

                $("#recent-discussions").find(".container-fluid").empty();
                $("#recent-discussions").find(".container-fluid").append(threadDiscussionsResult);

                viewModel.set("recentDataBound", true);

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
                                        $("#recent-discussions").find(".container-fluid").append(threadDiscussionsResult);

                                    }, 100);

                                });
                            }
                        }
                    });
                });
            });
        },
        loadPopularForums: function (e) {
            //CommunityApp.common.authenticatedUser();
            viewModel.set("popularDataBound", false);

            var popularServiceUrl = getPopularForumsServiceUrl();

            var pageSize = 50;
            var currentPage = 1;
            var scroller;
            var total = 0;
            var newView;
            var threadDiscussionsResult;
            var viewedIndex = 0;
            var pagingThreshold = 4;

            var viewArgs = e;
            var popularDatasource = CommunityApp.dataAccess.kendoDataSource(currentPage, pageSize, popularServiceUrl, "GET", null, null, null, null, function () {
                viewModel.loadPopularForums(viewArgs);
            });

            popularDatasource.read().then(function () {

                var view = popularDatasource.view();
                view = CommunityApp.common.injectIndex(currentPage, pageSize, view);
                view = CommunityApp.common.injectValue(view, "discussion_type", "popular-thread");

                var forumListTemplate = kendo.template($("#forum-list-less-tmpl").html());
                var threadDiscussionsResult = kendo.render(forumListTemplate, view);

                $("#popular-discussions").find(".container-fluid").empty();
                $("#popular-discussions").find(".container-fluid").append(threadDiscussionsResult);

                viewModel.set("popularDataBound", true);

                scroller = e.view.scroller;
                scroller.reset();

                scroller.unbind("scroll");
                scroller.bind("scroll", function (e) {
                    $(".popular-thread").each(function () {
                        if ($(this).visible()) {
                            viewedIndex = $(this).attr("data-index");
                            total = popularDatasource.total();
                            pageSize = popularDatasource.pageSize();
                            currentPage = popularDatasource.page();

                            if (viewedIndex == ((currentPage * pageSize) - pagingThreshold) && (currentPage * pageSize) < total) {
                                currentPage += 1;
                                popularDatasource.page(currentPage);

                                popularDatasource.read().then(function () {
                                    setTimeout(function () {

                                        console.log("rendering page: " + popularDatasource.page());
                                        newView = popularDatasource.view();
                                        newView = CommunityApp.common.injectIndex(currentPage, pageSize, newView);
                                        newView = CommunityApp.common.injectValue(newView, "discussion_type", "popular-thread");
                                        threadDiscussionsResult = kendo.render(forumListTemplate, newView);
                                        $("#popular-discussions").find(".container-fluid").append(threadDiscussionsResult);

                                    }, 100);

                                });
                            }
                        }
                    });
                });
            });
        },
        loadTypeSections: function (e) {
            //CommunityApp.common.authenticatedUser();

            viewModel.set("allTopicsDataBound", false);

            var serviceUrl = getTypeSectionsServiceUrl();

            var pageSize = 50;
            var currentPage = 1;
            var scroller;
            var total = 0;
            var newView;
            var threadDiscussionsResult;
            var viewedIndex = 0;
            var pagingThreshold = 4;

            var viewArgs = e;
            var allTopicsDatasource = CommunityApp.dataAccess.kendoDataSource(currentPage, pageSize, serviceUrl, "GET", null, null, null, null, function () {
                viewModel.loadTypeSections(viewArgs);
            });

            allTopicsDatasource.read().then(function () {

                var view = allTopicsDatasource.view();
                view = CommunityApp.common.injectIndex(currentPage, pageSize, view);

                var typeSectionsListTemplate = kendo.template($("#type-sections-list-tmpl").html());
                var typeSectionsResult = kendo.render(typeSectionsListTemplate, view);

                $("#all-topics").find(".container-fluid").empty();
                $("#all-topics").find(".container-fluid").append(typeSectionsResult);

                viewModel.set("allTopicsDataBound", true);

                scroller = e.view.scroller;
                scroller.reset();

                scroller.bind("scroll", function (e) {

                    $(".all-topics-section").each(function () {
                        if ($(this).visible()) {

                            viewedIndex = $(this).attr("data-index");
                            total = allTopicsDatasource.total();
                            pageSize = allTopicsDatasource.pageSize();
                            currentPage = allTopicsDatasource.page();

                            if (viewedIndex == ((currentPage * pageSize) - pagingThreshold) && (currentPage * pageSize) < total) {
                                currentPage += 1;
                                allTopicsDatasource.page(currentPage);

                                allTopicsDatasource.read().then(function () {
                                    setTimeout(function () {

                                        console.log("rendering page: " + allTopicsDatasource.page());
                                        newView = allTopicsDatasource.view();
                                        newView = CommunityApp.common.injectIndex(currentPage, pageSize, newView);
                                        typeSectionsResult = kendo.render(typeSectionsListTemplate, newView);
                                        $("#all-topics").find(".container-fluid").append(typeSectionsResult);

                                    }, 100);
                                });
                            }

                        }
                    });

                });
            });
        }
    });

    return {
        viewModel: viewModel
    };
})();