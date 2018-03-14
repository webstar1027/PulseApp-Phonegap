CommunityApp.groupSettings = (function () {

    var getGroupSettingsServiceUrl = function (groupId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.chatConfig.basePath + CommunityApp.configuration.chatConfig.groupSettingsPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, groupId);
    };

    var viewModel = kendo.observable({
        groupId: 0,
        muted: false,
        load: function (e) {
            var groupId = e.view.params.groupId;
            viewModel.set("groupId", groupId);

            var serviceUrl = getGroupSettingsServiceUrl(groupId);

            var groupSettingsOptions = {
                url: serviceUrl,
                requestType: "GET",
                dataType: "JSON",
                callBack: viewModel.fnLoadSettingsCallback
            };

            CommunityApp.dataAccess.callService(groupSettingsOptions);
        },
        fnLoadSettingsCallback: function (response) {
            if (response && response.data) {
                viewModel.set("muted", response.data.MuteNotifications);
            }
            else {
                viewModel.set("muted", false);
            }
        },
        mute: function () {
            var wasMuted = viewModel.get("muted");
            var inverted = !wasMuted;
            
            var groupId = viewModel.get("groupId");
            var serviceUrl = getGroupSettingsServiceUrl(groupId);

            var changeGroupSettingsOptions = {
                url: serviceUrl,
                requestType: "POST",
                dataType: "JSON",
                data: "=" + inverted,
                callBack: viewModel.fnChangeSettingsCallback
            };

            CommunityApp.dataAccess.callService(changeGroupSettingsOptions);
        },
        fnChangeSettingsCallback: function (response) {
            if(response && response.data)
            {
                CommunityApp.common.showSuccessNotification("Changed successfully!");
            }
            else
            {
                CommunityApp.common.showSuccessNotification("Unexpected Error!");
            }
        }
    });

    return {
        viewModel: viewModel
    };
})();