CommunityApp.section = (function () {
    var sectionServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.sectionConfig.sectionPath;
    var subscribeServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.sectionConfig.sectionPath + CommunityApp.configuration.sectionConfig.subscribePath;

    var viewModel = kendo.observable({
        id: 0,
        name: "",
        description: "",
        totalThreads: 0,
        totalPosts: 0,
        applicationTypeName: "",
        dateCreated: new Date(),
        iconUrl: "",
        isFollowed: false,
        page: function (url) {
            return url + viewModel.get("id");
        },
        isPost: function(){
            return viewModel.get("applicationTypeName").toLowerCase() === "weblog";
        },
        goToSectionPostsView: function()
        {
            var view = this.page('ca-section-posts?sectionId=');
            CommunityApp.common.navigateToView(view);
        },
        goToSectionThreadsView: function(){
            var view = this.page('ca-section-threads?sectionId=');
            CommunityApp.common.navigateToView(view);
        },
        load: function (e) {
            //CommunityApp.common.authenticatedUser();
            var sectionId = e.view.params.sectionId;

            if (sectionId !== 'undefined' && typeof sectionId !== 'undefined') {
                var sectionLoadOptions = {
                    url: sectionServiceUrl + sectionId,
                    requestType: "GET",
                    dataType: "JSON",
                    callBack: CommunityApp.section.viewModel.fnLoadCallBack
                };

                var viewArgs = e;
				CommunityApp.dataAccess.callService(sectionLoadOptions, null, null, null, null, null, function(){
					viewModel.load(viewArgs);
				});
            }
        },
        fnLoadCallBack: function (response) {
            if (response.data) {
                viewModel.set("id", response.data.Id);
                viewModel.set("name", response.data.Name);
                viewModel.set("description", response.data.Description);
                viewModel.set("totalThreads", response.data.TotalThreads);
                viewModel.set("totalPosts", response.data.TotalPosts);
                viewModel.set("applicationTypeName", response.data.ApplicationTypeName);
                viewModel.set("dateCreated", response.data.DateCreatedFormatted);
                viewModel.set("iconUrl", response.data.IconUrl);
                viewModel.set("isFollowed", response.data.IsFollowedByCurrentUser);

                CommunityApp.common.logTitle("Section: " + response.data.Name);

                updateBadge("#btnThreads", viewModel.get("totalThreads"));
                updateBadge("#btnPosts", viewModel.get("totalPosts"));
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
        }
    });

    var updateBadge = function (buttonId, number) {
        var button = $(buttonId).getKendoMobileButton();
        button.badge(number);
    };

    return {
        viewModel: viewModel
    };
})();