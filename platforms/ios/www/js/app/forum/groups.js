CommunityApp.groups = (function () {
    var getGroupsServiceUrl = function () {
        return CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.forumConfig.groupsPath;
    };

    var viewModel = kendo.observable({
        load: function(e)
        {
            //CommunityApp.common.authenticatedUser();
            CommunityApp.common.logTitle("Group List");

            var serviceUrl = getGroupsServiceUrl();

            var viewArgs = e;
			var dataSource = CommunityApp.dataAccess.kendoDataSource(1, 20, serviceUrl, "GET", null, "groups-listview", "<h2 class='centerAlign padding-1'>No groups are available!</h2>", null, function(){
				viewModel.load(viewArgs);
			});
            var groupsListView = $('#groups-listview').data("kendoMobileListView");
            groupsListView.setDataSource(dataSource);
            groupsListView.dataSource.read();
            groupsListView.refresh();
            groupsListView.scroller().reset();
            $(".km-load-more").remove();
        }
    });

    return {
        viewModel: viewModel
    };
})();