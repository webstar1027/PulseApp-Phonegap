CommunityApp.poll = (function () {

    var getLatestUnansweredPollUrl = function (location, userId) {
        var latestUnansweredPollUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.pollConfig.pollPath + CommunityApp.configuration.pollConfig.latestUnansweredPollPath;
		latestUnansweredPollUrl = CommunityApp.utilities.stringFormat(latestUnansweredPollUrl, userId, location);
        return latestUnansweredPollUrl;
    };
	
	var getLastAnsweredPollUrl = function (location, userId) {
        var lastAnsweredPollUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.pollConfig.pollPath + CommunityApp.configuration.pollConfig.lastAnsweredPollPath;
		lastAnsweredPollUrl = CommunityApp.utilities.stringFormat(lastAnsweredPollUrl, userId, location);
        return lastAnsweredPollUrl;
    };
	
	var getPollByIdUrl = function (pollId, userId, location) {
        var pollByIdUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.pollConfig.pollPath + CommunityApp.configuration.pollConfig.pollByIdPath;
		pollByIdUrl = CommunityApp.utilities.stringFormat(pollByIdUrl, pollId, userId, location);
        return pollByIdUrl;
    };
	
	var getPollGraphUrl = function (pollId) {
		var pollGraphUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.pollConfig.pollPath + CommunityApp.configuration.pollConfig.pollGraphPath;
		pollGraphUrl = CommunityApp.utilities.stringFormat(pollGraphUrl, pollId);
		return pollGraphUrl;
	};
	
	var getVoteToPollUrl = function() {
		var voteToPollUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.pollConfig.pollPath + CommunityApp.configuration.pollConfig.voteToPollPath;
		return voteToPollUrl;
	};
	
    var setVoteToPollSubmitForm = function () {
        if ($("#poll-vote-form")) {
            $("button[type='submit']", "#poll-vote-form").html("Vote").removeAttr("disabled");
            $("#poll-vote-form").unbind("submit");
            $("#poll-vote-form").one("submit", function () {
                $("button[type='submit']", this).html("Processing...<div class='loading pos-22 pull-right'></div>").attr('disabled', 'disabled');
                viewModel.vote();
                return true;
            });
        }
    };
	
    var viewModel = kendo.observable({
		id: 0,
        description: "",
		createdDate: "",
		userCountText: "",
        dataBound: false,
		unansweredPoll: false,
		noPoll: false,
		hasPrevPoll: false,
		hasNextPoll: false,
		showChart: false,
		prevPollPage: "#ca-poll-view",
		nextPollPage: "#ca-poll-view",
		pollItems: [],
        load: function (e) {
            viewModel.set("dataBound", false);
			viewModel.set("unansweredPoll", false);
			viewModel.set("noPoll", false);
			viewModel.set("showChart", false);
			viewModel.set("id", 0);
			
			var viewArgs = e;
			var currentUser = CommunityApp.base.baseData.currentUser();
			if (e.view.params.pollId != 'undefined' && typeof e.view.params.pollId != 'undefined') {
				var pollId = e.view.params.pollId;
				var pollByIdUrl = getPollByIdUrl(pollId, currentUser.id, "Homepage");
				console.log(pollByIdUrl);
				var pollByIdOptions = {
					url: pollByIdUrl,
					requestType: "GET",
					dataType: "JSON",
					callBack: viewModel.loadPollByIdCallback
				};
				CommunityApp.dataAccess.callService(pollByIdOptions, null, null, null, null, null, function(){
					viewModel.load(viewArgs);
				});
			} else {
				var latestUnansweredPollUrl = getLatestUnansweredPollUrl("Homepage", currentUser.id);
				var latestUnansweredPollOptions = {
					url: latestUnansweredPollUrl,
					requestType: "GET",
					dataType: "JSON",
					callBack: viewModel.loadLatestUnansweredPollCallback
				};
				CommunityApp.dataAccess.callService(latestUnansweredPollOptions, null, null, null, null, null, function(){
					viewModel.load(viewArgs);
				});
			}

            setVoteToPollSubmitForm();
        },
		loadAfterVote: function() {
			viewModel.set("dataBound", false);
			viewModel.set("unansweredPoll", false);
			viewModel.set("showChart", false);
			
			var currentUser = CommunityApp.base.baseData.currentUser();
			var pollId = viewModel.get("id");
			var pollByIdUrl = getPollByIdUrl(pollId, currentUser.id, "Homepage");
			console.log(pollByIdUrl);
			var pollByIdOptions = {
				url: pollByIdUrl,
				requestType: "GET",
				dataType: "JSON",
				callBack: viewModel.loadPollByIdCallback
			};
			CommunityApp.dataAccess.callService(pollByIdOptions, null, null, null, null, null, function(){
				viewModel.loadAfterVote();
			});
		},
		setPollDatas: function(data) {
			viewModel.set("id", data.Id);
			if (data.Description === null || data.Description === "")
					viewModel.set("description", data.Name);
			else
				viewModel.set("description", data.Description);
			
			var date = new Date(data.DateCreated);
			var dateString = date.toDateString();
			viewModel.set("createdDate", "Posted on " + dateString.substr(0, 3) + ", " + dateString.substr(4, 3) + ". " + dateString.substr(8, dateString.length-8));
			
			if (data.NumberOfAnswers === 0)
				viewModel.set("userCountText", "No one answered this.");
			else if (data.NumberOfAnswers === 1)
				viewModel.set("userCountText", "1 user answered this.");
			else
				viewModel.set("userCountText", data.NumberOfAnswers + " users answered this.");
				
			var pollItemTemplate = kendo.template($('#poll-item-tmpl').html());
			var pollItemResult = kendo.render(pollItemTemplate, data.PollItems);
			$("#poll-items-list").find(".poll-item-fieldlist").empty();
			$("#poll-items-list").find(".poll-item-fieldlist").attr("style", "");
			$("#poll-items-list").find(".poll-item-fieldlist").append(pollItemResult);
			
			if (data.PreviousPollId === null || data.PreviousPollId == data.Id) {
				viewModel.set("hasPrevPoll", false);
			} else {
				viewModel.set("hasPrevPoll", true);
				viewModel.set("prevPollPage", "#ca-poll-view?pollId=" + data.PreviousPollId);
			}
			if (data.NextPollId === null || data.NextPollId == data.Id) {
				viewModel.set("hasNextPoll", false);
			} else {
				viewModel.set("hasNextPoll", true);
				viewModel.set("nextPollPage", "#ca-poll-view?pollId=" + data.NextPollId);
			}
			
			if (data.AlreadyAnswered === true) {
				var pollData = data;
				var pollGraphUrl = getPollGraphUrl(data.Id);
				var pollGraphOptions = {
					url: pollGraphUrl,
					requestType: "GET",
					dataType: "JSON",
					callBack: viewModel.loadPollGraphCallback
				};
				CommunityApp.dataAccess.callService(pollGraphOptions, null, null, null, null, null, function(){
					viewModel.setPollDatas(pollData);
				});
				viewModel.set("unansweredPoll", false);
			} else
				viewModel.set("unansweredPoll", true);
			viewModel.set("dataBound", true);
		},
		loadPollGraphCallback: function(response) {
			if (response.data) {
				var data = response.data;
				var seriesData = [];
				for (var i=0; i<data.length; i++) {
					var temp = {};
					temp.category = data[i].Name;
					temp.value = data[i].Value;
					temp.color = data[i].Color;
					seriesData.push(temp);
				}
				$('#poll-chart').kendoChart({
					title: {
						text: "",
						visible: false
					},
					legend: {
						visible: false
					},
					chartArea: {
						background: "",
						width: 350,
						height:350
					},
					seriesDefaults: {
						labels: {
							visible: false,
							background: "transparent",
							position: "insideEnd",
							template: "#= kendo.format('{0:P}', percentage)#"
						}
					},
					series: [{
						type: "pie",
						startAngle: 0,
						data: seriesData
					}]
				});
				
				var pollLegendItemTemplate = kendo.template($('#poll-legend-item-tmpl').html());
				var pollLegendItemResult = kendo.render(pollLegendItemTemplate, data);
				$("#poll-legend").find(".poll-legend").empty();
				$("#poll-legend").find(".poll-legend").attr("style", "");
				$("#poll-legend").find(".poll-legend").append(pollLegendItemResult);
				
				viewModel.set("showChart", true);
			}
		},
		loadPollByIdCallback: function(response) {
			if (response.data) {
				var data = response.data;
				viewModel.setPollDatas(data);
			} else {
				viewModel.set("noPoll", true);
			}
		},
		loadLatestUnansweredPollCallback: function(response) {
			if (response.data) {
				var data = response.data;
				viewModel.setPollDatas(data);
			} else {
				var currentUser = CommunityApp.base.baseData.currentUser();
				var lastAnsweredPollUrl = getLastAnsweredPollUrl("Homepage", currentUser.id);
				var lastAnsweredPollOptions = {
					url: lastAnsweredPollUrl,
					requestType: "GET",
					dataType: "JSON",
					callBack: viewModel.loadLastAnsweredPollCallback
				};
				var responseData = response;
				CommunityApp.dataAccess.callService(lastAnsweredPollOptions, null, null, null, null, null, function(){
					viewModel.loadLatestUnansweredPollCallback(responseData);
				});
			}
		},
		loadLastAnsweredPollCallback: function(response) {
			if (response.data) {
				var data = response.data;
				viewModel.setPollDatas(data);
			} else {
				viewModel.set("noPoll", true);
			}
		},
		vote: function () {
            var serviceUrl = getVoteToPollUrl();
            var dataUserId = CommunityApp.base.baseData.currentUser().id;
			var dataPollId = viewModel.get("id");
			var voteString = $('#poll-vote-form input[name=pollItem]:checked').val();
			
			if (typeof voteString === "undefined") {
				CommunityApp.common.showErrorNotification("Error!", "Please select one of the answers!");
				$("button[type='submit']", "#poll-vote-form").html("Vote").removeAttr("disabled");
				setVoteToPollSubmitForm();
				return;
			}
			
			console.log(dataPollId);
			console.log($('#poll-vote-form input[name=pollItem]:checked').val());
			
			var postData = {
				userId: dataUserId,
				pollId: dataPollId,
				vote: voteString
			};

            var voteToPollOptions = {
                url: serviceUrl,
                requestType: "POST",
                dataType: "JSON",
                data: postData,
                callBack: viewModel.fnVoteToPollCallback
            };

            CommunityApp.dataAccess.callService(voteToPollOptions); 
        },
		fnVoteToPollCallback: function(response) {
			if (response.data && response.data > 0) {
				CommunityApp.common.showSuccessNotification("Posted your vote successfully!");
				viewModel.loadAfterVote();
			}
			else {
				CommunityApp.common.showErrorNotification("Unexpected Error!", "Unexpected error occurred. Try again later!");
				$("button[type='submit']", "#poll-vote-form").html("Vote").removeAttr("disabled");
				setVoteToPollSubmitForm();
			}
		}
    });


    return {
        viewModel: viewModel
    };
})();