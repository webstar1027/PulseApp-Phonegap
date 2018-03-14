CommunityApp.groupSections = (function () {
    var getGroupSectionsServiceUrl = function (groupId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.forumConfig.groupsPath + CommunityApp.configuration.forumConfig.groupSectionsPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, groupId, 0);
    };

    var viewModel = kendo.observable({
        pages_read: [],
        dataBound: false,
        load: function (e) {
            //CommunityApp.common.authenticatedUser();
            CommunityApp.common.logTitle("Group");

            viewModel.set("dataBound", false);
            var groupId = e.view.params.groupId;
            var serviceUrl = getGroupSectionsServiceUrl(groupId);

            var pageSize = 20;
            var currentPage = 1;
            var scroller;
            var total = 0;
            var newView;
            var groupResult;
            var viewedIndex = 0;
            var pagingThreshold = 4;

            var viewArgs = e;
			var dataSource = CommunityApp.dataAccess.kendoDataSource(currentPage, pageSize, serviceUrl, "GET", null, "group-sections-listview", "<h2 class='centerAlign padding-1'>No sections are available!</h2>", null, function(){
				viewModel.load(viewArgs);
			});

            dataSource.read().then(function () {

                var view = dataSource.view();
                view = CommunityApp.common.injectIndex(currentPage, pageSize, view);
                var groupTemplate = kendo.template($("#group-sections-list-tmpl").html());
                groupResult = kendo.render(groupTemplate, view);

                $("#group-sections-listview").find(".container-fluid").empty();
                $("#group-sections-listview").find(".container-fluid").append(groupResult);

                var pages_read = viewModel.get("pages_read");
                pages_read.push(currentPage);
                console.log("after pushing 1st page: " + JSON.stringify(pages_read));

                scroller = e.view.scroller;
                scroller.reset();

                viewModel.set("dataBound", true);

                scroller.bind("scroll", function (e) {
                    $(".group-item").each(function () {
                        if ($(this).visible()) {
                            viewedIndex = $(this).attr("data-index");
                            total = dataSource.total();
                            pageSize = dataSource.pageSize();
                            currentPage = dataSource.page();

                            if (viewedIndex == ((currentPage * pageSize) - pagingThreshold) && (currentPage * pageSize) < total) {
                                currentPage += 1;
                                dataSource.page(currentPage);

                                dataSource.read().then(function () {

                                    console.log("after fetching: " + JSON.stringify(pages_read));
                                    if (pages_read.indexOf(currentPage) < 0)
                                    {
                                        pages_read.push(currentPage);

                                        newView = dataSource.view();
                                        newView = CommunityApp.common.injectIndex(currentPage, pageSize, newView);
                                        var equalViews = CommunityApp.utilities.areEqual(view, newView);

                                        if (!equalViews) {
                                            setTimeout(function () {
                                                console.log("rendering page: " + dataSource.page());
                                                groupResult = kendo.render(groupTemplate, newView);
                                                $("#group-sections-listview").find(".container-fluid").append(groupResult);
                                            }, 100);
                                        }
                                    }
                                });
                            }
                        }
                    });
                });
            });
        },
        hide: function () {
            viewModel.set("pages_read", []);
            $("#group-sections-listview").find(".container-fluid").empty();
        }
    });

    return {
        viewModel: viewModel
    };
})();