CommunityApp.storyBoard = (function () {

    var getServiceUrl = function (friendId) {
        var currentUser = CommunityApp.session.currentUser.load();
        var userId = (friendId != currentUser.id) ? friendId : currentUser.id;

        var storyBoardServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.profileConfig.accountPath +
                   CommunityApp.configuration.profileConfig.storyBoardPath;
        storyBoardServiceUrl = CommunityApp.utilities.stringFormat(storyBoardServiceUrl, userId);
        return storyBoardServiceUrl;
    };

    var operation = function (type) {
        switch (type.toLowerCase()) {
            case "like":
                return "liked a post on ";
            case "weblog":
                return "wrote a blog post on ";
            case "comment":
                return "commented on a post on ";
            case "forum":
                return "started a forum on ";
            case "profilepost":
                return "wrote a status on ";
        }

        return "";
    };

    var load = function (e) {
        //CommunityApp.common.authenticatedUser();
        CommunityApp.common.logTitle(e.view.title);

        var friendId = e.view.params.userId;
        if (!friendId || typeof friendId === "undefined" || friendId === null)
        {
            friendId = CommunityApp.base.baseData.currentUser().id;
        }

        var scroller;
        var total = 0;
        var pageSize = 20;
        var currentPage = 1;
        var newView;
        var topLevelResult;
        var viewedIndex = 0;
        var pagingThreshold = 4;
        var serviceUrl = getServiceUrl(friendId);

        var viewArgs = e;
		var dataSource = CommunityApp.dataAccess.kendoDataSource(currentPage, pageSize, serviceUrl, "GET", null, "story-board-list", "<h2 class='centerAlign padding-1'>No stories are found yet!</h2>", null, function(){
			viewModel.load(viewArgs);
		});

        dataSource.read().then(function () {
            var view = dataSource.view();
            view = CommunityApp.common.injectIndex(currentPage, pageSize, view);

            var storyBoardTemplate = kendo.template($('#story-board-tmpl').html());
            var storyBoardResult = kendo.render(storyBoardTemplate, view);


            $("#story-board-list").find(".container-fluid").empty();
            $("#story-board-list").find(".container-fluid").append(storyBoardResult);

            scroller = e.view.scroller;
            scroller.reset();

            scroller.bind("scroll", function (e) {
                $(".storyboard-item").each(function () {
                    if ($(this).visible()) {
                        viewedIndex = $(this).attr("data-index");
                        total = dataSource.total();
                        pageSize = dataSource.pageSize();
                        currentPage = dataSource.page();

                        if (viewedIndex == ((currentPage * pageSize) - pagingThreshold) && (currentPage * pageSize) < total) {
                            currentPage += 1;
                            dataSource.page(currentPage);

                            dataSource.read().then(function () {
                                setTimeout(function () {
                                    console.log("rendering page: " + dataSource.page());
                                    newView = dataSource.view();
                                    newView = CommunityApp.common.injectIndex(currentPage, pageSize, newView);
                                    storyBoardResult = kendo.render(storyBoardTemplate, newView);
                                    $("#story-board-list").find(".container-fluid").append(storyBoardResult);
                                }, 100);

                            });
                        }
                    }
                });
            });
        });
    };

    return {
        operation: operation,
        load: load
    };
})();
