CommunityApp.sectionThreads = (function () {
    var getSectionThreadsServiceUrl = function (sectionId, sortType, unread) {
        var sectionThreadsServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.sectionConfig.sectionPath + CommunityApp.configuration.sectionConfig.sectionThreadsPath;
        sectionThreadsServiceUrl = CommunityApp.utilities.stringFormat(sectionThreadsServiceUrl, sectionId, sortType, unread);
        return sectionThreadsServiceUrl;
    };

    var getSubscribeServiceUrl = function (sectionId, userId) {
        var url = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.sectionConfig.sectionPath + CommunityApp.configuration.sectionConfig.subscribePath;
        return CommunityApp.utilities.stringFormat(url, sectionId, userId);
    };



    var viewModel = kendo.observable({
        id: 0,
        name: "",
        isFollowed: false,
        dataBound: false,
        isUnread: false,
        sectionId: 0,
        prevSectionId: 0,
        currentPage: 1,
        pages_read: [],
        sortType: 0,
        heading: function () {
            return viewModel.get("name");
        },
        load: function (e) {
            //CommunityApp.common.authenticatedUser();

            viewModel.set("dataBound", false);
            viewModel.set("isUnread", e.view.params.unread);
            viewModel.set("sectionId", e.view.params.sectionId);

            var filterUnreadSwitch = $("#swtFilterUnread").data("kendoMobileSwitch");

            if (e.view.params.unread == "true") {
                filterUnreadSwitch.check(true);
            }
            else {
                filterUnreadSwitch.check(false);
            }

            var sectionId = e.view.params.sectionId;
            var sortType = viewModel.get("sortType");

            if ($("#thread-select-sortType").data("kendoMobileButtonGroup"))
                $("#thread-select-sortType").data("kendoMobileButtonGroup").destroy();

            $("#thread-select-sortType").kendoMobileButtonGroup({
                select: function (selectedType) {
                    viewModel.set("sortType", selectedType.index);
                    setSectionThreadsDataSource(viewModel.get("sectionId"), selectedType.index, e, viewModel);
                },
                index: viewModel.get("sortType")
            });


            if (sectionId !== 'undefined' && typeof sectionId !== 'undefined') {
                var prevSectionId = viewModel.get("prevSectionId");
                setSectionThreadsDataSource(sectionId, sortType, e, viewModel);

                var sectionServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.sectionConfig.sectionPath;
                var parentSectionOptions = {
                    url: sectionServiceUrl + sectionId,
                    requestType: "GET",
                    dataType: "JSON",
                    callBack: viewModel.fnParentSectionLoadCallBack
                };

                var viewArgs = e;
                CommunityApp.dataAccess.callService(parentSectionOptions, null, null, null, null, null, function () {
                    viewModel.load(viewArgs);
                });
            }
        },
        fnParentSectionLoadCallBack: function (response) {
            if (response.data) {
                viewModel.set("id", response.data.Id);
                viewModel.set("name", response.data.Name);
                viewModel.set("isFollowed", response.data.IsFollowedByCurrentUser);
                CommunityApp.common.logTitle("Section Threads: " + response.data.Name);
            }
        },
        page: function (threadId, type) {
            var url = (type.toLowerCase() === "discussion") ? "ca-thread-discussion" : "ca-thread-qa";
            CommunityApp.common.navigateToView(url + "?threadId=" + threadId);
        },
        follow: function (e) {
            var sectionId = viewModel.get("sectionId");
            var userId = CommunityApp.base.baseData.currentUser().id;
            var subscribeServiceUrl = getSubscribeServiceUrl(sectionId, userId);
            var subscribeOptions = {
                url: subscribeServiceUrl,
                requestType: "POST",
                dataType: "JSON",
                data: "=" + e.checked,
                callBack: CommunityApp.section.viewModel.fnFollowCallback
            };

            CommunityApp.dataAccess.callService(subscribeOptions);
        },
        filterUnread: function (e) {
            CommunityApp.common.navigateToView("#ca-section-threads?sectionId=" + viewModel.get("sectionId") + "&unread=" + e.checked);
        },
        fnFollowCallback: function (response) {
            if (response.data) {
                var subscribe = response.data.AdditionalData;
                switch (response.data.HttpStatus) {
                    case 200:
                        if (subscribe.toLowerCase() === "true")
                            CommunityApp.common.showSuccessNotification("Followed successfully!");
                        else
                            CommunityApp.common.showSuccessNotification("Unfollowed successfully!");
                        break;
                    default:
                        if (subscribe.toLowerCase() === "true")
                            CommunityApp.common.showErrorNotification("Unexpected error following this section!");
                        else
                            CommunityApp.common.showErrorNotification("Unexpected error unfollowing this section!");
                        break;
                }
            }
        }
    });

    var setSectionThreadsDataSource = function (sectionId, sortType, e, viewModel) {

        var scroller;
        var total = 0;
        var pageSize = 20;
        var currentPage = 1;
        var newView;
        var topLevelResult;
        var viewedIndex = 0;
        var pagingThreshold = 4;

        var unread = viewModel.get("isUnread");

        var serviceUrl = getSectionThreadsServiceUrl(sectionId, sortType, unread);
        console.log(serviceUrl);

        viewModel.set("pages_read", []);

        var prevSectionId = viewModel.get("prevSectionId");
        if (prevSectionId === 0 || prevSectionId != e.view.params.sectionId)
            viewModel.set("currentPage", 1);
        else
            currentPage = viewModel.get("currentPage");
        console.log("currentPage: " + currentPage);

        var thatSectionId = sectionId;
        var thatE = e;
        var thatViewModel = viewModel;
        var thatSortType = sortType;

        var dataSource = CommunityApp.dataAccess.kendoDataSource(1, pageSize, serviceUrl, "GET", null, "section-threads-list", "<h2 class='centerAlign padding-1'>Be the first to post!</h2>", null, function () {
            setSectionThreadsDataSource(thatSectionId, thatSortType, thatE, thatViewModel);
        });

        dataSource.read().then(function () {
            var view = dataSource.view();
            view = CommunityApp.common.injectIndex(1, pageSize, view);
            var pages_read = viewModel.get("pages_read");
            pages_read.push(1);

            var i = 0;
            for (i = 0; i < view.length; i++) {
                view[i].ThreadMostRecentPost.PostAuthor.UserProfile.AvatarUrl += "?width=100";
            }

            var threadListTmpl = kendo.template($('#threads-list-tmpl').html());
            var threadListResult = kendo.render(threadListTmpl, view);


            $("#section-threads-list").find(".container-fluid").empty();
            $("#section-threads-list").find(".container-fluid").append(threadListResult);

            if (currentPage > 1) {
                var j;
                for (j = 2; j <= currentPage; j++) {
                    pages_read.push(j);
                }
                showSpecificPage(dataSource, 2, currentPage);
            }

            viewModel.set("pages_read", pages_read);

            scroller = $("#sectionThreadScroller").data("kendoMobileScroller");//= e.view.scroller;

            viewModel.set("dataBound", true);

            if (scroller !== null && typeof scroller !== "undefined") {
                if (prevSectionId === 0 || prevSectionId != e.view.params.sectionId) {
                    scroller.reset();
                    viewModel.set("prevSectionId", e.view.params.sectionId);
                }

                scroller.bind("scroll", function (e) {
                    $(".section-thread-item").each(function () {
                        if ($(this).visible()) {
                            viewedIndex = $(this).attr("data-index");
                            total = dataSource.total();
                            pageSize = dataSource.pageSize();
                            currentPage = dataSource.page();

                            if (viewedIndex == ((currentPage * pageSize) - pagingThreshold) && (currentPage * pageSize) < total) {
                                currentPage += 1;
                                if (pages_read.indexOf(currentPage) < 0) {
                                    pages_read = viewModel.get("pages_read");
                                    pages_read.push(currentPage);
                                    viewModel.set("pages_read", pages_read);
                                    viewModel.set("currentPage", currentPage);
                                    dataSource.page(currentPage);

                                    dataSource.read().then(function () {
                                        setTimeout(function () {
                                            newView = dataSource.view();
                                            newView = CommunityApp.common.injectIndex(currentPage, pageSize, newView);
                                            threadListResult = kendo.render(threadListTmpl, newView);
                                            $("#section-threads-list").find(".container-fluid").append(threadListResult);

                                        }, 0);

                                    });
                                }
                            }
                        }
                    });
                });
            }
        });
    };

    function showSpecificPage(dataSource, pageNumber, currentPage) {
        var pageSize = 20;
        dataSource.page(pageNumber);
        dataSource.read().then(function () {
            setTimeout(function () {

                console.log("rendering page: " + dataSource.page());
                var newView;
                newView = dataSource.view();
                newView = CommunityApp.common.injectIndex(pageNumber, pageSize, newView);
                var threadListTmpl = kendo.template($('#threads-list-tmpl').html());
                var threadListResult = kendo.render(threadListTmpl, newView);
                $("#section-threads-list").find(".container-fluid").append(threadListResult);
                if (pageNumber < currentPage)
                    showSpecificPage(dataSource, pageNumber + 1, currentPage);
            }, 0);

        });
    }

    return {
        viewModel: viewModel
    };
})();