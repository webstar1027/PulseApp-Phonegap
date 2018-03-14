CommunityApp.sectionPosts = (function () {

    var getSectionPostsServiceUrl = function (sectionId) {
        var sectionPostsServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.sectionConfig.sectionPath + CommunityApp.configuration.sectionConfig.sectionPostsPath;
        sectionPostsServiceUrl = CommunityApp.utilities.stringFormat(sectionPostsServiceUrl, sectionId, 380, 215);
        return sectionPostsServiceUrl;
    };

    var subscribeServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.sectionConfig.sectionPath + CommunityApp.configuration.sectionConfig.subscribePath;

    var viewModel = kendo.observable({
        id: 0,
        name: "",
        isFollowed: false,
        heading: function () {
            return viewModel.get("name") + " Posts";
        },
        load: function (e) {
            //CommunityApp.common.authenticatedUser();
            var sectionId = e.view.params.sectionId;
            setSectionPostsDataSource(sectionId, e);
            viewModel.readSection(sectionId, viewModel.fnParentSectionLoadCallBack);
        },
        fnParentSectionLoadCallBack: function (response) {
            if (response.data) {
                viewModel.set("id", response.data.Id);
                viewModel.set("name", response.data.Name);
                viewModel.set("isFollowed", response.data.IsFollowedByCurrentUser);
                CommunityApp.common.logTitle("Section Posts: " + response.data.Name);
            }
        },
        follow: function (e) {
            var sectionId = viewModel.get("id");
            var userId = CommunityApp.base.baseData.currentUser().id;
            subscribeServiceUrl = CommunityApp.utilities.stringFormat(subscribeServiceUrl, sectionId, userId);
            var subscribeOptions = {
                url: subscribeServiceUrl,
                requestType: "POST",
                dataType: "JSON",
                data: "=" + e.checked,
                callBack: CommunityApp.section.viewModel.fnFollowCallback
            };

            CommunityApp.dataAccess.callService(subscribeOptions);
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
        },
        readSection: function (sectionId, callback) {
            if (sectionId !== 'undefined' && typeof sectionId !== 'undefined') {

                var sectionServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.sectionConfig.sectionPath;
                var parentSectionOptions = {
                    url: sectionServiceUrl + sectionId,
                    requestType: "GET",
                    dataType: "JSON",
                    callBack: callback
                };

                var thatSectionId = sectionId;
				var thatCallback = callback;
				CommunityApp.dataAccess.callService(parentSectionOptions, null, null, null, null, null, function(){
					viewModel.readSection(thatSectionId, thatCallback);
				});
            }
        },
        readSectionAllPosts: function (sectionId, width, height, callback) {
            if (sectionId !== 'undefined' && typeof sectionId !== 'undefined') {

                var sectionServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.sectionConfig.sectionPath +
                     CommunityApp.configuration.sectionConfig.sectionAllPostsPath;
                sectionServiceUrl = CommunityApp.utilities.stringFormat(sectionServiceUrl, sectionId, width, height);
                var parentSectionOptions = {
                    url: sectionServiceUrl,
                    requestType: "GET",
                    dataType: "JSON",
                    callBack: callback
                };

                var thatSectionId = sectionId;
				var thatWidth = width;
				var thatHeight = height;
				var thatCallback = callback;
				CommunityApp.dataAccess.callService(parentSectionOptions, null, null, null, null, null, function(){
					viewModel.readSectionAllPosts(thatSectionId, thatWidth, thatHeight, thatCallback);
				});
            }
        },
		refresh: function (e) {
            //CommunityApp.common.authenticatedUser();

            CommunityApp.common.logTitle("Featured Promotions");

            var hotPostsTemplate = kendo.template($('#posts-thumbs-list-no-user-tmpl').html());
            var localData = CommunityApp.session.load(CommunityApp.configuration.sectionConfig.offlineStore);
            if (localData && localData !== null && typeof localData !== "undefined" && localData.length > 0) {
                var hotPostsResult = kendo.render(hotPostsTemplate, localData);
                $("#section-recent-posts-list").find(".container-fluid").empty();
                $("#section-recent-posts-list").find(".container-fluid").append(hotPostsResult);
            }
        },
        likeSuccessCallback: function (operation, likes, sender) {
            //CommunityApp.common.authenticatedUser();

            var posts = CommunityApp.session.load(CommunityApp.configuration.sectionConfig.offlineStore);

            var postId = $(sender).data("id");
            var likedPost = _.find(posts, function (item) { return item.Id == postId; });

            var itemIndex = _.indexOf(posts, likedPost);
            var dataItem = posts[itemIndex];

            if (operation == "like") {
                dataItem.SocialInfo.LikesCount = likes;
                dataItem.SocialInfo.UserLiked = true;
            }
            else {
                dataItem.SocialInfo.LikesCount = likes;
                dataItem.SocialInfo.UserLiked = false;
            }  

            posts[itemIndex] = dataItem;
            CommunityApp.session.save(CommunityApp.configuration.sectionConfig.offlineStore, posts);

            viewModel.refresh();
        }
    });

    var setSectionPostsDataSource = function (sectionId, evt) {
        var pageSize = 10;
        var currentPage = 1;
        var scroller;
        var total = 0;
        var newView;
        var viewedIndex = 0;
        var pagingThreshold = 4;

        var thatSectionId = sectionId;
		var thatEvt = evt;
		var dataSource = CommunityApp.dataAccess.kendoDataSource(currentPage, pageSize, getSectionPostsServiceUrl(sectionId), "GET", null, "section-recent-posts-list", "<h2 class='centerAlign padding-1'>No posts are found!</h2>", null, function(){
			setSectionPostsDataSource(thatSectionId, thatEvt);
		});

        dataSource.read().then(function () {
            var view = dataSource.view();
            view = CommunityApp.common.injectIndex(currentPage, pageSize, view);
            
            CommunityApp.session.save(CommunityApp.configuration.sectionConfig.offlineStore, view);

            var postThumbsListTmpl = kendo.template($('#posts-thumbs-list-no-user-tmpl').html());
            var postThumbsResults = kendo.render(postThumbsListTmpl, view);
            $("#section-recent-posts-list").find(".container-fluid").empty();
            $("#section-recent-posts-list").find(".container-fluid").append(postThumbsResults);

            //scroller = evt.view.scroller;
			scroller = $('#section-posts-scroller').data("kendoMobileScroller");
            if (scroller !== null && typeof scroller !== 'undefined')
            {
                scroller.reset();

                scroller.bind("scroll", function (e) {
                    $(".feed-article").each(function () {
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
                                        postThumbsResults = kendo.render(postThumbsListTmpl, newView);
                                        $("#section-recent-posts-list").find(".container-fluid").append(postThumbsResults);
                                        
                                        var localData = CommunityApp.session.load(CommunityApp.configuration.sectionConfig.offlineStore);
                                        localData.push.apply(localData, newView);
                                        CommunityApp.session.save(CommunityApp.configuration.sectionConfig.offlineStore, localData);
                                    }, 100);

                                });
                            }
                        }
                    });
                });
            }
        });
    };

    return {
        viewModel: viewModel
    };
})();