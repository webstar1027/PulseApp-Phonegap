CommunityApp.sync = (function () {

    var getChanges = function (syncURL, modifiedSince, callback) {
        $.ajax({
            url: syncURL,
            data: { modifiedSince: modifiedSince },
            dataType: "json",
            success: function (changes) {
                callback(changes);
            },
            error: function (model, response) {
                console.log(response.responseText);
            }
        });
    };

    var recentPosts = {
        applyChanges: function (recentPosts, callback) {
            window.dao.initialize();
        }  
    };

    var getRecentPostsServiceUrl = function () {
        var currentUser = CommunityApp.session.currentUser.load();
        var recentPostsServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.postConfig.postsPath +
                   CommunityApp.configuration.postConfig.recentPostsPath;
        recentPostsServiceUrl = CommunityApp.utilities.stringFormat(recentPostsServiceUrl, currentUser.id, false, 600, 600);
        return recentPostsServiceUrl;
    };

    var getRecentSectionPostsUpdates = function () {
        var recentPostsServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.sectionConfig.sectionPath +
                   CommunityApp.configuration.sectionConfig.sectionAllPostsPath;
        recentPostsServiceUrl = CommunityApp.utilities.stringFormat(recentPostsServiceUrl, CommunityApp.configuration.appConfig.latestNewsSectionId, 360, 215);
        return recentPostsServiceUrl;
    };

    var process = function () {
        $(".km-loader").addClass("display-none");

        CommunityApp.common.forceUpdate(function () {
            var modifiedSince = null;
            var recentPostsUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.postConfig.postsPath + CommunityApp.configuration.postConfig.sync;
            var recentSectionPostsUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.sectionConfig.sectionPath + CommunityApp.configuration.sectionConfig.sync;
            recentSectionPostsUrl = CommunityApp.utilities.stringFormat(recentSectionPostsUrl, CommunityApp.configuration.appConfig.latestNewsSectionId, 360, 215);

            //getChanges(recentPostsUrl, modifiedSince, function (recentPostsChanges) {

               


            //    //if (recentPostsChanges && recentPostsChanges.length > 0) {
            //    //    var serviceUrl = getRecentPostsServiceUrl();
            //    //    console.log("before calling offline recentPostsDS");
            //    //    var recentPostsDS = CommunityApp.dataAccess.kendoNonpagedDataSource(serviceUrl, "GET", null, CommunityApp.configuration.postConfig.offlineStore);
            //    //    recentPostsDS.read().then(function () {
            //    //        console.log("fetching recentPostsDS");
            //    //        recentPostsDS.online(false);
            //    //    });
            //    //}
            //});

            getChanges(recentSectionPostsUrl, modifiedSince, function (recentSectionPostsChanges) {

                //other syncs go here

                if (recentSectionPostsChanges && recentSectionPostsChanges.length > 0) {
                    var serviceUrl = getRecentSectionPostsUpdates();
                    console.log("before calling offline sectionRecentPostsDS");

                    //serviceUrl should provide non-paged data server side...
                    var sectionRecentPostsDS = CommunityApp.dataAccess.kendoNonpagedDataSource(serviceUrl, "GET", null, CommunityApp.configuration.sectionConfig.offlineStore);
                    sectionRecentPostsDS.read().then(function () {
                        console.log("fetching sectionRecentPostsDS");
                        sectionRecentPostsDS.online(false);
                    });
                }

                onSyncComplete();
            });
        });
    };

    var processComplete = function () {
        $(".km-loader").removeClass("display-none");
    };

    var refreshRecentPosts = function (callback) {
        var recentPostsUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.postConfig.postsPath + CommunityApp.configuration.postConfig.sync;
        getChanges(recentPostsUrl, null, function (recentPostsChanges) {
            if (recentPostsChanges && recentPostsChanges.length > 0) {
                var serviceUrl = getRecentPostsServiceUrl();
                console.log("before calling offline recentPostsDS");
                var recentPostsDS = CommunityApp.dataAccess.kendoNonpagedDataSource(serviceUrl, "GET", null, CommunityApp.configuration.postConfig.offlineStore);
                recentPostsDS.read().then(function () {
                    console.log("fetching recentPostsDS");
                    recentPostsDS.online(false);
                    callback();  
                });
            }
        });  
    };

    function onSyncComplete()
    {
        if (CommunityApp.userAccount.viewModel.isUserLoggedIn)
        {
            setTimeout(function () {
                var pushUrl = CommunityApp.session.load("push_url");

                if (pushUrl && typeof pushUrl !== 'undefined' && pushUrl !== null && pushUrl !== "") {
                    CommunityApp.session.remove("push_url");
                    CommunityApp.common.navigateToView(pushUrl);
                }
                else {
                    CommunityApp.common.enableBackButton();
                    CommunityApp.common.navigateToView(CommunityApp.configuration.appConfig.homeScreen);
                }

            }, 2000);
        }
        
       
		//setTimeout(function() {
		//	var latestUnansweredPollUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.pollConfig.pollPath + CommunityApp.configuration.pollConfig.latestUnansweredPollPath;
		//	latestUnansweredPollUrl = CommunityApp.utilities.stringFormat(latestUnansweredPollUrl, CommunityApp.base.baseData.currentUser().id, "Homepage");
		//	var latestUnansweredPollOptions = {
        //        url: latestUnansweredPollUrl,
        //        requestType: "GET",
        //        dataType: "JSON",
        //        callBack: loadLatestUnansweredPollCallback
        //    };
        //    //CommunityApp.dataAccess.callService(latestUnansweredPollOptions);
		//}, 5000);
    }
	
	//function loadLatestUnansweredPollCallback(response) {
	//	if (response.data) {
	//		var data = response.data;
	//		$('#poll-dialog-question').text(data.Description);
	//		var pollItemTemplate = kendo.template($('#poll-item-tmpl').html());
	//		var pollItemResult = kendo.render(pollItemTemplate, data.PollItems);
    //        $("#poll-dialog").find(".poll-item-fieldlist").empty();
    //        $("#poll-dialog").find(".poll-item-fieldlist").attr("style", "");
    //        $("#poll-dialog").find(".poll-item-fieldlist").append(pollItemResult);
			
	//		$('#poll-dialog').kendoWindow({
	//			modal: true,
	//			width: 300,
	//			resizable: false,
	//			title: "Quick Poll",
	//			// ensure opening animation
	//			visible: false,
	//			// remove the Window from the DOM after closing animation is finished
	//			deactivate: function(e){ /*e.sender.destroy();*/ }
	//		}).data("kendoWindow")
	//		.center().open();
			
	//	}
	//}

    return {
        process: process,
        recentPosts: recentPosts,
        refreshRecentPosts: refreshRecentPosts,
        processComplete: processComplete
    };
})();