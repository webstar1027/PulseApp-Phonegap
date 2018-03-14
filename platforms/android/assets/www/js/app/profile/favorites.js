CommunityApp.favorites = (function () {

    var getServiceUrl = function (userId) {
        var favoritesServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.profileConfig.accountPath +
                   CommunityApp.configuration.profileConfig.favoritesPath;
        favoritesServiceUrl = CommunityApp.utilities.stringFormat(favoritesServiceUrl, userId);
        return favoritesServiceUrl;
    };

    var load = function (e) {
        CommunityApp.common.logTitle(e.view.title);

        var friendId = e.view.params.userId;
        var currentUserId = CommunityApp.base.baseData.currentUser().id;
        var userId = (friendId !== 'undefined' && typeof friendId !== 'undefined') ? friendId : currentUserId;
        var viewArgs = e;
		var dataSource = CommunityApp.dataAccess.kendoDataSource(1, 10, getServiceUrl(userId), "GET", null, "user-favorites-list", "<h2 class='centerAlign padding-1'>No favorites are found yet!</h2>", null, function(){
			viewModel.load(viewArgs);
		});
        var favoritesListView = $("#user-favorites-list").data("kendoMobileListView");

        if (favoritesListView !== null && typeof favoritesListView !== 'undefined')
        {
            favoritesListView.setDataSource(dataSource);
            favoritesListView.dataSource.read();
            favoritesListView.refresh();
        }        
    };

    return {
        load: load
    };
})();