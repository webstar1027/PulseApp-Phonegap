CommunityApp.learningScore = (function () {

    var getLearningScoreServiceUrl = function () {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.learningConfig.learningPath +
            CommunityApp.configuration.learningConfig.scorePath;
        return serviceUrl;
    };

    var viewModel = kendo.observable({
        requiredScore: 0,
        optionalScore: 0,
        requiredPercentage: function(){
            return viewModel.get("requiredScore") + "%";
        },
        optionalPercentage: function(){
            return viewModel.get("optionalScore") + "%";
        },
        load: function (e) {
            //CommunityApp.common.authenticatedUser();
            CommunityApp.common.logTitle("Learning Score");

            var serviceUrl = getLearningScoreServiceUrl();

            var loadScoresOptions = {
                url: serviceUrl,
                requestType: "GET",
                dataType: "JSON",
                callBack: viewModel.fnLoadScoreCallback
            };

            var viewArgs = e;
            CommunityApp.dataAccess.callService(loadScoresOptions, null, null, null, null, null, function () {
                viewModel.load(viewArgs);
            });
        },
        fnLoadScoreCallback: function (response) {
            if(response.data)
            {
                viewModel.set("requiredScore", response.data.RequiredLearning);
                viewModel.set("optionalScore", response.data.OptionalLearning);  
            }
        }
    });

    return {
        viewModel: viewModel
    };
})();