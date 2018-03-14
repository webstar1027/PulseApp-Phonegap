CommunityApp.learning = (function () {
    
    var getFeaturedLearningServiceUrl = function () {
        return CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.postConfig.postsPath +
                   CommunityApp.configuration.postConfig.featuredLearningPath;
    };

    var viewModel = kendo.observable({
        load: function (e) {
            //CommunityApp.common.authenticatedUser();

            console.log("load triggered");

            var serviceUrl = getFeaturedLearningServiceUrl();
            var viewArgs = e;
			var dataSource = CommunityApp.dataAccess.kendoDataSource(1, 10, serviceUrl, "GET", null, "featured-learning-listview", "<h2 class='centerAlign padding-1'>No featured learning videos are found yet!</h2>", null, function(){
				viewModel.load(viewArgs);
			});
            var featuredLearningListView = $("#featured-learning-listview").data("kendoMobileListView");
            featuredLearningListView.setDataSource(dataSource);
            featuredLearningListView.dataSource.read();
            featuredLearningListView.refresh();
            $(".km-load-more").remove();  
        },
        likeSuccessCallback: function (operation, likes, sender) {
            //CommunityApp.common.authenticatedUser();

            var listView = $("#featured-learning-listview").data("kendoMobileListView");
            var posts = listView.dataSource.data();

            var postId = $(sender).data("id");
            var likedPost = _.find(posts, function (item) { return item.Id == postId; });

            var itemIndex = _.indexOf(posts, likedPost);
            var dataItem = listView.dataSource.at(itemIndex);

            if (operation == "like") {
                dataItem.SocialInfo.LikesCount = likes;
                dataItem.SocialInfo.UserLiked = true;
            }
            else {
                dataItem.SocialInfo.LikesCount = likes;
                dataItem.SocialInfo.UserLiked = false;
            }

            listView.setDataItem($(sender).closest("ul").closest("li").find(".feed-article"), dataItem);
        }
    });

    return {
        viewModel : viewModel
    };
})();