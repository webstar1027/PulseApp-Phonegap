CommunityApp.badges = (function () {

    var getServiceUrl = function (userId) {
        var badgesServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.profileConfig.accountPath +
                   CommunityApp.utilities.stringFormat(CommunityApp.configuration.profileConfig.badgesPath, userId);
        return badgesServiceUrl;
    };

    var viewModel = kendo.observable({
        badges: [],
        load: function(e) {
            //CommunityApp.common.authenticatedUser();
            CommunityApp.common.logTitle(e.view.title);

            var currentUser = CommunityApp.session.currentUser.load();
            var friendId = (e.view.params.userId !== 'undefined' && typeof e.view.params.userId !== 'undefined') ? e.view.params.userId : currentUser.id;
            var userId = (currentUser.id != friendId) ? friendId : currentUser.id;

            if (userId && userId > 0) {

                var badgesServiceUrl = getServiceUrl(userId);

                var badgesLoadOptions = {
                    url: badgesServiceUrl,
                    requestType: "GET",
                    dataType: "JSON",
                    callBack: CommunityApp.badges.viewModel.fnLoadCallBack
                };

                var viewArgs = e;
				CommunityApp.dataAccess.callService(badgesLoadOptions, "badges-list-view", "<h2 class='centerAlign padding-1'>No badges are found yet!</li>", null, null, null, function(){
					viewModel.load(viewArgs);
				});
            }
        },
        fnLoadCallBack: function(response) {
            viewModel.set("badges", response.data);
        }
    });

    return {
        viewModel: viewModel
    };
})();