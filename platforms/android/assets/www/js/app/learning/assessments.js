CommunityApp.assessmentQuestions = (function () {

    var getassessmentQuestionsServiceUrl = function (courseId, testId, userTestId, questionId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.learningConfig.learningPath +
            CommunityApp.configuration.learningConfig.assessmentsPath;
        console.log("assessment service url:" + serviceUrl);
        return CommunityApp.utilities.stringFormat(serviceUrl, courseId, testId, userTestId, questionId);
    };

    var getSaveQuestionServiceUrl = function () {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.learningConfig.learningPath +
            CommunityApp.configuration.learningConfig.saveAssessmentsPath;
        console.log("save question service url:" + serviceUrl);
        return CommunityApp.utilities.stringFormat(serviceUrl);
    };

    var viewModel = kendo.observable({
        question: null,
        courseId: 0,
        testId: 0,
        userTestId: 0,
        dataBound: false,
        load: function (e) {
            var courseId = e.view.params.courseId;
            var testId = e.view.params.testId;
            var userTestId = e.view.params.userTest;
            var questionId = e.view.params.question;
            viewModel.set("courseId", courseId);
            viewModel.set("testId", testId);
            viewModel.set("userTestId", userTestId);
            loadAssessmentQuestion(courseId, testId, userTestId, questionId, e.view);
            if (userTestId > 0)
            {
                $("#ca-course-assessments").addClass("no-backbutton");
                CommunityApp.common.disableBackButton();
            }
        },
        onHide: function (e) {
            console.log("data hide event");
            CommunityApp.common.enableBackButton();
        },
        fnLoadAssessmentQuestionsCallBack: function (response, sender) {
            if (response.data) {
                viewModel.set("dataBound", true);
                viewModel.set("question", response.data);
                sender.scroller.reset();
            }
        },
        fnFillView: function () {
            var question = viewModel.get("question");
            if (question !== null) {
                var html = "<li class='question-li'><span class='question-label'>" + question.Name + "</span></li>";
                html += "<div class='question-answers'>";
                if (question.Kind == 1) {
                    html += "<input id='textAnswer' type='text'><div id='textAnswer_error'><label style='color:red;' style='display:none;'>Please enter an answer.</label></div>";
                } else if (question.Kind == 2) {
                    for (var ir = 0; ir < question.Answers.length; ir++) {
                        html += "<input id='rdbtn_" + question.Answers[ir].Id + "' type='radio' class='radio-question-btn' onclick='CommunityApp.assessmentQuestions.viewModel.onRadioButtonClick(\"" +
                            question.Answers[ir].InCorrect + "\");' name='radioAnswer' value='" + question.Answers[ir].Id + "' /><label for='rdbtn_" +
                            question.Answers[ir].Id + "' class='radio-question-label'>" + question.Answers[ir].Answer + "</label>";

                    }
                    html += "<div id='rdbtn_error' style='display:none;'><label style='color:red;'>Please select answer.</label></div>";
                    html += "<div id='rdbtn_incorrect_container' style='display:none;'><label style='color:red;' id='rdbtn_incorrect'></label></div>";
                } else {
                    for (var ic = 0; ic < question.Answers.length; ic++) {
                        html += "<input id='chkbtn_" + question.Answers[ic].Id + "' type='checkbox' class='check-question-btn' onclick='CommunityApp.assessmentQuestions.viewModel.onCheckButtonClick(\"" +
                            question.Answers[ic].InCorrect + "\", this);' name='chkAnswer' value='" + question.Answers[ic].Id + "' /><label for='chkbtn_" +
                            question.Answers[ic].Id + "' class='check-question-label'>" + question.Answers[ic].Answer + "</label>";
                    }
                    html += "<div id='chkbtn_error' style='display:none;'><label style='color:red;'>Please select At least One answer.</label></div>";
                    html += "<div id='chkbtn_incorrect_container' style='display:none;'><label style='color:red;' id='chkbtn_incorrect'></label></div>";
                }
                html += "<div>";
                if (question.NextQuestionId) {
                    html += "<button id='btnNext' class='question-button btn btn-primary bg-black pull-right' data-role='button' onclick='CommunityApp.assessmentQuestions.viewModel.onNextQuestionClick();'>Next</button>";
                } else {
                    console.log("creating finish quiz buttton");
                    html += "<button  id='btnNext' class='question-button btn btn-primary bg-black pull-right' data-role='button' onclick='CommunityApp.assessmentQuestions.viewModel.onNextQuestionClick();'>Finish</button>";
                }
                html += "<button id='btnExit' class='question-button btn btn-primary bg-black pull-left' data-role='button' onclick='CommunityApp.assessmentQuestions.viewModel.onExitClick();'>Exit</button>";
                html += "</div><div class='clearfix'></div>";
                return html;
            } else {
                return "";
            }
        },
        onNextQuestionClick: function (e) {
            console.log("Next Question Button Clicked");
            $('#btnNext').attr('disabled', 'disabled');
            var answer = '';
            var valid = false;
            var question = viewModel.get("question");
            console.log("question kind = " + question.Kind);
            if (question.Kind == 1) {
                if ($("#textAnswer").val() && $("#textAnswer").val().length > 0) {
                    $("#textAnswer_error").hide();
                    valid = true;
                    console.log("Is valid to save answer : " + valid);
                    answer = $("#textAnswer").val();
                } else {
                    $("#textAnswer_error").show();
                    valid = false;
                    console.log("Is valid to save answer : " + valid);
                }
            } else if (question.Kind == 2) {
                if ($("input[name='radioAnswer']:checked").length == '0') {
                    $("#rdbtn_error").show();
                    valid = false;
                    console.log("Is valid to save answer : " + valid);
                } else {
                    $("#rdbtn_error").hide();
                    valid = true;
                    console.log("Is valid to save answer : " + valid);
                    answer = $("input[name='radioAnswer']:checked").val();
                    console.log("Question answer : " + answer);
                }
            } else {
                if ($("input[name='chkAnswer']:checked").length == '0') {
                    $("#chkbtn_error").show();
                    valid = false;
                    console.log("Is valid to save answer : " + valid);
                } else {
                    $("#chkbtn_error").hide();
                    valid = true;
                    console.log("Is valid to save answer : " + valid);
                    $('input[name="chkAnswer"]:checked').each(function () {
                        answer += this.value + ",";
                    });
                    answer = answer.slice(0, -1);
                }
            }
            if (valid) {
                var saveQuestionServiceUrl = getSaveQuestionServiceUrl();
                var saveQuestionOptions = {
                    url: saveQuestionServiceUrl,
                    requestType: "POST",
                    dataType: "JSON",
                    callBack: viewModel.saveQuestionAnswerCallback,
                    data: {
                        CourseId: viewModel.get("courseId"),
                        TestId: viewModel.get("testId"),
                        UserTestId: viewModel.get("userTestId"),
                        QuestionId: question.Id,
                        NextQuestionId: question.NextQuestionId,
                        Kind: question.Kind,
                        Answers: answer
                    }
                };

                var args = e;
                CommunityApp.dataAccess.callService(saveQuestionOptions);
            } else {
                $('#btnNext').removeAttr('disabled');
            }
        },
        onExitClick: function (e) {
            var url = "#views/learning/categories.html?type=required";
            CommunityApp.common.navigateToView(url);
        },
        saveQuestionAnswerCallback: function (response) {
            if (response.data.Saved) {
                var question = viewModel.get("question");
                var url = "";
                if (question.NextQuestionId) {
                    url = "\#views/learning/assessment.html";
                    CommunityApp.common.navigateToView(url + "?courseId=" + question.CourseId + "&testId=" + question.TestId + "&userTest=" + response.data.UserTestId + "&question=" + question.NextQuestionId);
                } else {
                    console.log("Assessment Finished");
                    url = "\#views/learning/assessmentresult.html";
                    CommunityApp.common.navigateToView(url + "?courseId=" + question.CourseId + "&testId=" + question.TestId + "&userTestId=" + question.UserTestId + "&userId=" + response.data.UserId);
                }
            } else {
                console.log("failed to save answer");
            }
        },
        onRadioButtonClick: function (incorrect) {
            if (incorrect) {
                $("#rdbtn_incorrect").html(incorrect);
                $("#rdbtn_incorrect_container").show();
            } else {
                $("#rdbtn_incorrect_container").hide();
            }
        },
        onCheckButtonClick: function (incorrect, element) {
            //var checked = element.checked;
            console.log("incorrect MSG status " + incorrect);
            //if (incorrect && checked) {
            //    $("#chkbtn_incorrect").html(incorrect);
            //    $("#chkbtn_incorrect_container").show();
            //} else {
            //    $("#chkbtn_incorrect_container").hide();
            //}
        }
    });
    var loadAssessmentQuestion = function (courseId, testId, userTestId, questionId, view) {
        viewModel.set("dataBound", false);
        var serviceUrl = getassessmentQuestionsServiceUrl(courseId, testId, userTestId, questionId);
        var loadAssessmentQuestionsOptions = {
            url: serviceUrl,
            requestType: "POST",
            dataType: "JSON",
            callBack: viewModel.fnLoadAssessmentQuestionsCallBack,
            sender: view
        };

        var thatCourseId = courseId;
        var thatTestId = testId;
        var thatUserTestId = userTestId;
        var thatQuestionId = questionId;
        var thatView = view;

        CommunityApp.dataAccess.callService(loadAssessmentQuestionsOptions, "question", "<h2 class='centerAlign padding-1'>No questions are found!</h2>");
    };

    return {
        viewModel: viewModel
    };
})();