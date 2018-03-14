CommunityApp.thread = (function () {

    var getThreadServiceUrl = function (userId, threadId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.forumConfig.forumsPath + CommunityApp.configuration.forumConfig.threadPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, threadId);
    };

    var getSubscribeServiceUrl = function (userId, threadId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.forumConfig.forumsPath + CommunityApp.configuration.forumConfig.subscribePath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, threadId);
    };

    var viewModel = kendo.observable({
        id: 0,
        totalReplies: 0,
        status: "",
        type: "",
        isRead: false,
        subject: "",
        sectionId: 0,
        sectionName: "",
        followers: 0,
        views: 0,
        isFollowed: false,
        sectionPage: function(url){
            return url + viewModel.get('sectionId');
        },
        threadPage: function () {
            var type = viewModel.get("type").toLowerCase();
            var url = type === "discussion" ? '#ca-thread-discussion?threadId=' : '#ca-thread-qa?threadId=';
            return url + viewModel.get('id');
        },
        load: function (e) {
            //CommunityApp.common.authenticatedUser();

            var threadId = e.view.params.threadId;
            var userId = CommunityApp.base.baseData.currentUser().id;
            var serviceUrl = getThreadServiceUrl(userId, threadId);

            var threadOptions = {
                url: serviceUrl,
                requestType: "GET",
                dataType: "JSON",
                callBack: viewModel.fnLoadThreadCallback
            };  

            var viewArgs = e;
            CommunityApp.dataAccess.callService(threadOptions, null, null, null, null, null, function () {
                viewModel.load(viewArgs);
            });
        },
        fnLoadThreadCallback: function (response) {
            if (response.data) {
                viewModel.set("id", response.data.Id);
                viewModel.set("totalReplies", response.data.TotalReplies);
                viewModel.set("status", response.data.Status);
                viewModel.set("type", response.data.Type.toLowerCase() === "discussion"? "Discussion" : "Question and Answers");
                viewModel.set("isRead", response.data.IsReadByCurrentUser);
                viewModel.set("subject", response.data.Subject);
                viewModel.set("sectionId", response.data.ThreadSection.Id);
                viewModel.set("sectionName", response.data.ThreadSection.Name);
                viewModel.set("followers", response.data.Followers);
                viewModel.set("views", response.data.TotalViews);
                viewModel.set("isFollowed", response.data.IsFollowed);

                CommunityApp.common.logTitle("Thread: " + response.data.Subject);
            }
        },
        follow: function (e) {
            //CommunityApp.common.authenticatedUser();

            var threadId = viewModel.get("id");
            var userId = CommunityApp.base.baseData.currentUser().id;
            var subscribe = e.checked;
            var serviceUrl = getSubscribeServiceUrl(userId, threadId);

            var subscribeOptions = {
                url: serviceUrl,
                requestType: "POST",
                dataType: "JSON",
                data: "="+subscribe,
                callBack: viewModel.fnSubscribeCallback
            };

            var checkArgs = e;
            CommunityApp.dataAccess.callService(subscribeOptions);
        },
        fnSubscribeCallback: function (response) {
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
                            CommunityApp.common.showErrorNotification("Unexpected error following this thread!");
                        else
                            CommunityApp.common.showErrorNotification("Unexpected error unfollowing this thread!");
                        break;
                }
            }
        }
    });

    return {
        viewModel: viewModel
    };
})();