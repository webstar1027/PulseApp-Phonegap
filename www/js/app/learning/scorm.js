CommunityApp.scorm = (function () {
    
    var getScormServiceUrl = function (scorm, lessonId, type) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.learningConfig.learningPath +
            CommunityApp.configuration.learningConfig.scormPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, scorm, lessonId, type);
    };

    var viewModel = kendo.observable({
        scormUrl: "",
        scormAbsoluteUrl: function(){
            var scormUrl = viewModel.get("scormUrl");
            return "http://" + CommunityApp.configuration.appConfig.domain + scormUrl;
        },
        load: function(e) {
            //CommunityApp.common.authenticatedUser();

            var scorm = e.view.params.scorm;
            var lessonId = e.view.params.lessonId;
            var type = e.view.params.type;

            var scormServiceUrl = getScormServiceUrl(scorm, lessonId, type);

            var scormOptions = {
                url: scormServiceUrl,
                requestType: "GET",
                dataType: "JSON",
                callBack: viewModel.fnLoadScormCallback
            };

            var viewArgs = e;
            CommunityApp.dataAccess.callService(scormOptions, null, null, null, null, null, function () {
                viewModel.load(viewArgs);
            });
			$("#ca-scorm-lesson:last-child").addClass("display-none");
			$("#ca-scorm-lesson").eq(0).removeClass("display-none");
        },
        fnLoadScormCallback: function (response) {
            if (response.data) {
                viewModel.set("scormUrl", response.data);
            }
        }
    });

    return {
        viewModel: viewModel 
    };
})();