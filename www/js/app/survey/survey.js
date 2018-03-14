CommunityApp.survey = (function () {

    var getLatestActiveSurveyUrl = function (userId) {
		var latestActiveSurveyUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.surveyConfig.surveyPath + CommunityApp.configuration.surveyConfig.latestActiveSurveyPath;
		latestActiveSurveyUrl = CommunityApp.utilities.stringFormat(latestActiveSurveyUrl, userId);
        return latestActiveSurveyUrl;
	};
	
	var getSurveyUrl = function (userId, surveyId, questionId) {
        var surveyUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.surveyConfig.surveyPath + CommunityApp.configuration.surveyConfig.getSurveyPath;
		surveyUrl = CommunityApp.utilities.stringFormat(surveyUrl, userId, surveyId, questionId);
        return surveyUrl;
    };
    
    var getSurveyByIdUrl = function (userId, surveyId) {
        var surveyUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.surveyConfig.surveyPath + CommunityApp.configuration.surveyConfig.getSurveyByIdPath;
		surveyUrl = CommunityApp.utilities.stringFormat(surveyUrl, userId, surveyId);
        return surveyUrl;
    };
	
	var getSaveSurveyQuestionAnswerUrl = function () {
        var saveSurveyQuestionAnswerUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.surveyConfig.surveyPath + CommunityApp.configuration.surveyConfig.saveSurveyQuestionAnswerPath;
        return saveSurveyQuestionAnswerUrl;
    };
	
    var viewModel = kendo.observable({
		surveyId: 0,
		surveyName: "",
		surveyDescription: "",
        questionId: 0,
		questionType: 0,
		nextQuestionId: 0,
		lastQuestionId: 0,
        dataBound: false,
		visibleList: false,
		noSurvey: true,
		isSuccessScreen: false,
		question: "",
		nextBtnLabel: "Next",
		isLastQuestion: false,
		answers: [],
		isFinished: false,
        load: function (e) {
            viewModel.set("dataBound", false);
			viewModel.set("visibleList", false);
			viewModel.set("noSurvey", true);
			viewModel.set("isSuccessScreen", false);
			viewModel.set("surveyId", 0);
			viewModel.set("questionId", 0);
			viewModel.set("nextQuestionId", 0);
			viewModel.set("lastQuestionId", 0);
			viewModel.set("nextBtnLabel", "Next");
			viewModel.set("isLastQuestion", false);
			viewModel.set("answers", []);
			viewModel.set("isFinished", false);
			
			viewModel.set("surveyId", 0);
			viewModel.set("questionId", 0);
			viewModel.set("surveyName", "");
			viewModel.set("surveyDescription", "");
			viewModel.set("question", "");
			
			var currentUser = CommunityApp.base.baseData.currentUser();
            var viewArgs = e;
            
            if (e.view.params.surveyId != 'undefined' && typeof e.view.params.surveyId != 'undefined') {
                var surveyId = e.view.params.surveyId;
                var surveyByIdUrl = getSurveyByIdUrl(currentUser.id, surveyId);
                var surveyByIdOptions = {
                    url: surveyByIdUrl,
                    requestType: "GET",
                    dataType: "JSON",
                    callBack: viewModel.loadSurveyQuestionCallback
                };
                console.log(surveyByIdUrl);
                CommunityApp.dataAccess.callService(surveyByIdOptions, null, null, null, null, null, function(){
                    viewModel.load(viewArgs);
                });
            } else {
                var latestActiveSurveyUrl = getLatestActiveSurveyUrl(currentUser.id);
                var latestActiveSurveyOptions = {
                    url: latestActiveSurveyUrl,
                    requestType: "GET",
                    dataType: "JSON",
                    callBack: viewModel.loadSurveyQuestionCallback
                };
                console.log(latestActiveSurveyUrl);
                CommunityApp.dataAccess.callService(latestActiveSurveyOptions, null, null, null, null, null, function(){
                    viewModel.load(viewArgs);
                });
            }
        },
		showQuestion: function () {
            viewModel.set("dataBound", false);
			viewModel.set("visibleList", false);
			viewModel.set("isSuccessScreen", false);
			var isFinished = viewModel.get("isFinished");
			if (isFinished) {
				viewModel.set("surveyName", "Continue another survey?");
				viewModel.set("dataBound", true);
				viewModel.set("nextBtnLabel", "Yes");
				return;
			}
			var surveyId = viewModel.get("surveyId");
			var questionId = viewModel.get("questionId");
			
			var currentUser = CommunityApp.base.baseData.currentUser();
			
			var surveyUrl = getSurveyUrl(currentUser.id, surveyId, questionId);
			var surveyOptions = {
				url: surveyUrl,
				requestType: "GET",
				dataType: "JSON",
				callBack: viewModel.loadSurveyQuestionCallback
			};
			CommunityApp.dataAccess.callService(surveyOptions, null, null, null, null, null, function(){
				viewModel.showQuestion();
			});
		},
		loadSurveyQuestionCallback: function(response) {
			if (response.data) {
				var data = response.data;
				viewModel.set("surveyId", data.Id);
				viewModel.set("surveyName", data.SurveyName);
				viewModel.set("surveyDescription", data.SurveyDescription);
				viewModel.set("questionId", data.Question.QuestionModel.Id);
				viewModel.set("nextQuestionId", data.Question.NextQuestionId);
				console.log("questionId: " + data.Question.QuestionModel.Id + ", nextQuestionId: " + data.Question.NextQuestionId);
				if (data.Question.QuestionModel.Id === data.Question.LastQuestionId) {
					viewModel.set("nextBtnLabel", "Finish");
					viewModel.set("isLastQuestion", true);
				} else {
					viewModel.set("nextBtnLabel", "Next");
					viewModel.set("isLastQuestion", false);
				}
				
				if (data.UserSurveyStatus.status === true) {
					viewModel.set("question", data.UserSurveyStatus.Message);
					viewModel.set("dataBound", true);
					viewModel.set("visibleList", false);
					viewModel.set("isSuccessScreen", false);
				} else {
					viewModel.set("question", data.Question.QuestionModel.Question);
					viewModel.set("questionType", data.Question.QuestionModel.IsMultipleAnswer);
					var surveyItemTemplate = "";
					var surveyResult = "";
					if (data.Question.QuestionModel.IsMultipleAnswer === 0) {
						surveyItemTemplate = kendo.template($('#survey-type0-item-tmpl').html());
						surveyItemResult = kendo.render(surveyItemTemplate, data.Question.AnswerModel);
						$("#survey-items-list").find(".survey-item-fieldlist").empty();
						$("#survey-items-list").find(".survey-item-fieldlist").attr("style", "");
						$("#survey-items-list").find(".survey-item-fieldlist").append(surveyItemResult);
					} else if (data.Question.QuestionModel.IsMultipleAnswer === 1) {
						surveyItemTemplate = kendo.template($('#survey-type1-item-tmpl').html());
						surveyItemResult = kendo.render(surveyItemTemplate, data.Question.AnswerModel);
						$("#survey-items-list").find(".survey-item-fieldlist").empty();
						$("#survey-items-list").find(".survey-item-fieldlist").attr("style", "");
						$("#survey-items-list").find(".survey-item-fieldlist").append(surveyItemResult);
					} else if (data.Question.QuestionModel.IsMultipleAnswer === 2) {
						surveyItemTemplate = kendo.template($('#survey-type0-item-tmpl').html());
						surveyItemResult = kendo.render(surveyItemTemplate, data.Question.AnswerModel);
						$("#survey-items-list").find(".survey-item-fieldlist").empty();
						$("#survey-items-list").find(".survey-item-fieldlist").attr("style", "");
						$("#survey-items-list").find(".survey-item-fieldlist").append(surveyItemResult);
					} else if (data.Question.QuestionModel.IsMultipleAnswer === 3) {
						surveyItemTemplate = kendo.template($('#survey-type3-item-tmpl').html());
						surveyItemResult = kendo.render(surveyItemTemplate, data.Question.AnswerModel);
						$("#survey-items-list").find(".survey-item-fieldlist").empty();
						$("#survey-items-list").find(".survey-item-fieldlist").attr("style", "");
						$("#survey-items-list").find(".survey-item-fieldlist").append(surveyItemResult);
					} else if (data.Question.QuestionModel.IsMultipleAnswer === 4) {
						surveyItemTemplate = kendo.template($('#survey-type4-item-tmpl').html());
						surveyItemResult = kendo.render(surveyItemTemplate, data.Question.AnswerModel);
						$("#survey-items-list").find(".survey-item-fieldlist").empty();
						$("#survey-items-list").find(".survey-item-fieldlist").attr("style", "");
						$("#survey-items-list").find(".survey-item-fieldlist").append(surveyItemResult);
					} else if (data.Question.QuestionModel.IsMultipleAnswer === 5) {
						surveyItemTemplate = kendo.template($('#survey-type5-item-tmpl').html());
						surveyItemResult = kendo.render(surveyItemTemplate, data.Question.AnswerModel);
						$("#survey-items-list").find(".survey-item-fieldlist").empty();
						$("#survey-items-list").find(".survey-item-fieldlist").attr("style", "");
						$("#survey-items-list").find(".survey-item-fieldlist").append(surveyItemResult);
						var min = data.Question.QuestionModel.Min;
						var max = data.Question.QuestionModel.Max;
						var dropDownData = [];
						for (var i = min; i <= max; i++) {
							dropDownData.push({
								text: i, value: i
							});
						}
						$('#survey-vote-form input[name=surveyItem]').each(function() {
							$(this).kendoComboBox({
								dataTextField: "text",
								dataValueField: "value",
								value: min,
								dataSource: dropDownData
							});
						});
					}
					viewModel.set("dataBound", true);
					viewModel.set("noSurvey", false);
					viewModel.set("visibleList", true);
					viewModel.set("isSuccessScreen", false);
				}
			} else {
				viewModel.set("surveyName", "No Survey Found!");
				viewModel.set("dataBound", true);
				viewModel.set("noSurvey", true);
				viewModel.set("isSuccessScreen", false);
			}
		},
		onNextQuestionClick: function() {
			var isFinished = viewModel.get("isFinished");
			if (isFinished) {
				viewModel.load();
				return;
			}
			var questionType = viewModel.get("questionType");
			var answerString = "";
			if (questionType === 0 || questionType === 1 || questionType === 2) {
				answerString = $('#survey-vote-form input[name=surveyItem]:checked').val();
				if (typeof answerString === "undefined") {
					CommunityApp.common.showErrorNotification("Error!", "Please select one of the answers!");
					return;
				}
			} else if (questionType === 3) {
				answerString = $('#survey-vote-form input[name=surveyItem]').val();
				if (typeof answerString === "undefined" || answerString === "") {
					CommunityApp.common.showErrorNotification("Error!", "Please type answer!");
					return;
				}
			} else if (questionType === 4) {
				answerString = $('#survey-vote-form textarea[name=surveyItem]').val();
				if (typeof answerString === "undefined" || answerString === "") {
					CommunityApp.common.showErrorNotification("Error!", "Please type answer!");
					return;
				}
			}
			
			var currentUser = CommunityApp.base.baseData.currentUser();
			
			var answer = {};
			var answers = viewModel.get("answers");
			
			if (questionType === 0 || questionType === 2){
				answer = {
					QuestionId: viewModel.get("questionId"),
					OptionId: $('#survey-vote-form input[name=surveyItem]:checked').data("id"),
					UserId: currentUser.id,
					OptionText: $('#survey-vote-form input[name=surveyItem]:checked').val()
				};
				answers.push(answer);
			} else if (questionType === 1) {
				$('#survey-vote-form input[name=surveyItem]:checked').each(function() {
					console.log(this.value);
					answer = {
						QuestionId: viewModel.get("questionId"),
						OptionId: $(this).data("id"),
						UserId: currentUser.id,
						OptionText: this.value
					};
					answers.push(answer);
				});
			} else if (questionType === 3) {
				answer = {
					QuestionId: viewModel.get("questionId"),
					OptionId: $('#survey-vote-form input[name=surveyItem]').data("id"),
					UserId: currentUser.id,
					OptionText: $('#survey-vote-form input[name=surveyItem]').val()
				};
				answers.push(answer);
			} else if (questionType === 4) {
				answer = {
					QuestionId: viewModel.get("questionId"),
					OptionId: $('#survey-vote-form textarea[name=surveyItem]').data("id"),
					UserId: currentUser.id,
					OptionText: $('#survey-vote-form textarea[name=surveyItem]').val()
				};
				answers.push(answer);
			} else if (questionType === 5) {
				$('#survey-vote-form input[name=surveyItem]').each(function() {
					console.log(this.value);
					answer = {
						QuestionId: viewModel.get("questionId"),
						OptionId: $(this).data("id"),
						UserId: currentUser.id,
						OptionText: this.value
					};
					answers.push(answer);
				});
			}
			console.log(answers);
			viewModel.set("answers", answers);
			
			var isLastQuestion = viewModel.get("isLastQuestion");
			if (!isLastQuestion) {
				var questionId = viewModel.get("nextQuestionId");
				viewModel.set("questionId", questionId);
				viewModel.showQuestion();
			} else {
				var saveSurveyQuestionAnswerUrl = getSaveSurveyQuestionAnswerUrl();
				console.log(saveSurveyQuestionAnswerUrl);
				var postData = {
					userId: currentUser.id,
					model: JSON.parse(JSON.stringify(answers))
				};
				console.log(postData);
				var saveSurveyQuestionAnswerOptions = {
					url: saveSurveyQuestionAnswerUrl,
					requestType: "POST",
					dataType: "JSON",
					data: postData,
					callBack: viewModel.saveSurveyQuestionAnswerCallback
				};
				CommunityApp.dataAccess.callService(saveSurveyQuestionAnswerOptions);
			}
		},
		saveSurveyQuestionAnswerCallback: function(response) {
			if (response.data) {
				viewModel.set("isFinished", true);
				viewModel.set("dataBound", false);
				viewModel.set("visibleList", false);
				viewModel.set("noSurvey", true);
				viewModel.set("surveyId", 0);
				viewModel.set("questionId", 0);
				viewModel.set("nextQuestionId", 0);
				viewModel.set("lastQuestionId", 0);
				viewModel.set("nextBtnLabel", "Next");
				viewModel.set("isLastQuestion", false);
				viewModel.set("answers", []);
				
				viewModel.set("surveyId", 0);
				viewModel.set("questionId", 0);
				viewModel.set("surveyName", "");
				viewModel.set("surveyDescription", "");
				viewModel.set("question", "");
				viewModel.successSurvey();
				//CommunityApp.common.showSuccessNotification("Successfully Posted!");
			} else {
				viewModel.set("isFinished", true);
				CommunityApp.common.showErrorNotification("Error!", "Unexpected error, please try again later!");
			}
		},
		successSurvey: function() {
			viewModel.set("surveyName", "THANK YOU, YOUR SURVEY HAS BEEN SUBMITTED");
			viewModel.set("dataBound", true);
			viewModel.set("isSuccessScreen", true);
			viewModel.set("visibleList", false);
			viewModel.set("noSurvey", true);
		},
		onExitClick: function() {
			CommunityApp.common.navigateToView("#:back");
		}
    });


    return {
        viewModel: viewModel
    };
})();