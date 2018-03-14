CommunityApp.about = (function () {
    var viewModel = kendo.observable({
        version: "",
        appName: "",
        website: "",
        load: function () {
            CommunityApp.common.logTitle("About");

            cordova.getAppVersion(function (version) {
                viewModel.set("version", version);
            });

            viewModel.set("appName", CommunityApp.configuration.appConfig.appTitle);
            viewModel.set("website", "http://" + CommunityApp.configuration.appConfig.domain);
        },
        gotoWebsite: function () {
            cordova.InAppBrowser.open(encodeURI(viewModel.get("website")), "_blank", "location=no");
        }
    });  

    return {
        viewModel: viewModel
    };
})();