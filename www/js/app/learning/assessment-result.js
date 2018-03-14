CommunityApp.assessmentResult = (function () {

    var getassessmentResultServiceUrl = function (courseId, testId, userTestId, userId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.learningConfig.learningPath +
            CommunityApp.configuration.learningConfig.assessmentResultPath;
        console.log("assessment result service url:" + serviceUrl);
        return CommunityApp.utilities.stringFormat(serviceUrl, courseId, testId, userTestId, userId);
    };

    var viewModel = kendo.observable({
        result: null,
        dataBound: false,
        load: function (e) {
            var courseId = e.view.params.courseId;
            var testId = e.view.params.testId;
            var userTestId = e.view.params.userTestId;
            var userId = e.view.params.userId;
            loadAssessmentResult(courseId, testId, userTestId, userId);
            CommunityApp.common.disableBackButton();
        },
        onHide: function (e) {
            console.log("data hide event");
            CommunityApp.common.enableBackButton();
        },
        fnLoadAssessmentResultCallBack: function (response, sender) {
            console.log("assessment result callback");
            if (response.data) {
                viewModel.set("dataBound", true);
                viewModel.set("result", response.data);
            }
        },
        fnFillView: function () {
            var result = viewModel.get("result");
            if (result !== null) {
                var html = "";
                if (result.ContainsFillInAnswer) {
                    html += '<div class="assessment-result-margin assessment-result-success">You have successfully completed ' + result.AssessmentName + '. we will review it and update your result soon.<br><br> <a href="#views/learning/categories.html?type=required">Return to Learning</a></div>';
                } else {
                    if (result.Passed) { 
                        html += '<div class="assessment-result-margin assessment-result-success">Congratulations you have successfully passed ' + result.AssessmentName + '.<br><br> <a href="#views/learning/categories.html?type=required">Return to Learning</a></div>';
                    } else {
                        html += "<div class='assessment-result-margin'>Sorry you didn't pass " + result.AssessmentName + " successfully.</div>";
                        html += "<div class='assessment-result-margin'>You currently have " + result.Correct + " out of " + result.Total + " questions correct!</div>";
                        html += "<div class='assessment-result-margin'>Please take a closer look at these questions:</div>";
                        html += "<div class='assessment-result-margin'>";
                        for (var i = 0; i < result.WrongAnswers.length; i++) {
                            html += "<div class='assessment-result-questions'>" + result.WrongAnswers[i] + "</div>";
                        }
                        html += '</div><div class="assessment-result-margin"><a onclick="CommunityApp.assessmentResult.viewModel.assessmentPage();"><span class="assessment-result-retake">Click here</span></a> to retake ' + result.AssessmentName + ' again.</div>';
                    }
                }
                return html;
            } else {
                return "";
            }
        },
        coursePage: function (Id) {
            var result = viewModel.get("result");
            var url = "\#views/learning/assessment.html";
            CommunityApp.common.navigateToView(url + "?courseId=" + courseId + "&testId=" + Id + "&userTest=0&question=0");
        },
        assessmentPage: function (Id) {
            var result = viewModel.get("result");
            var url = "\#views/learning/assessment.html";
            CommunityApp.common.navigateToView(url + "?courseId=" + result.CourseId + "&testId=" + result.AssessmentId + "&userTest=0&question=0");
        }
    });
    var loadAssessmentResult = function (courseId, testId, userTestId, userId) {
        viewModel.set("dataBound", false);
        var serviceUrl = getassessmentResultServiceUrl(courseId, testId, userTestId, userId);
        var loadAssessmentResultOptions = {
            url: serviceUrl,
            requestType: "GET",
            dataType: "JSON",
            callBack: viewModel.fnLoadAssessmentResultCallBack
        };

        var thatCourseId = courseId;
        var thatTestId = testId;
        var thatUserTestId = userTestId;
        var thatUserId = userId;

        CommunityApp.dataAccess.callService(loadAssessmentResultOptions, "result", "<h2 class='centerAlign padding-1'>No result has been found!</h2>", null, null, null, function () {
            loadAssessmentResult(thatCourseId, thatTestId, thatUserTestId, thatUserId);
        });
    };

    return {
        viewModel: viewModel
    };
})();