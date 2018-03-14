CommunityApp.hotPosts = (function () {

    var viewModel = kendo.observable({
        refresh: function (e) {
            //CommunityApp.common.authenticatedUser();

            CommunityApp.common.logTitle("Featured Promotions");

            var hotPostsTemplate = kendo.template($('#posts-thumbs-list-no-user-tmpl').html());
            var localData = CommunityApp.session.load(CommunityApp.configuration.sectionConfig.offlineStore);
            if (localData && localData !== null && typeof localData !== "undefined" && localData.length > 0) {
                var hotPostsResult = kendo.render(hotPostsTemplate, localData);
                $("#hot-posts-list").find(".container-fluid").empty();
                $("#hot-posts-list").find(".container-fluid").append(hotPostsResult);
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

    return {
        viewModel: viewModel
    };
})();