CommunityApp.postShare = (function () {
    
    var getSharePostServiceUrl = function (postId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.postConfig.postsPath + CommunityApp.configuration.postConfig.sharePath;
        return CommunityApp.utilities.stringFormat(serviceUrl, postId);
    };

    var getPostServiceUrl = function (postId, userId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.postConfig.postsPath + CommunityApp.configuration.postConfig.postPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, postId, userId);
    };

    var viewModel = kendo.observable({
        title: "",
        body: "",
        emails: "",
        postId: 0,
        slug: "",
        load: function(e)
        {
            //CommunityApp.common.authenticatedUser();

            var postId = e.view.params.postId;
            var userId = CommunityApp.base.baseData.currentUser().id;

            viewModel.set("emails", "");

            var postServiceUrl = getPostServiceUrl(postId, userId);

            var postOptions = {  
                url: postServiceUrl,
                dataType: "JSON",
                requestType: "GET",
                callBack: viewModel.fnLoadPostCallback
            };

            var viewArgs = e;
			CommunityApp.dataAccess.callService(postOptions, null, null, null, null, null, function(){
				viewModel.load(viewArgs);
			});

            $("#shareForm").one("submit", function () {
                viewModel.share();
                return true;
            });
        },
        fnLoadPostCallback: function (response) {
            if (response.data) {
                CommunityApp.common.logTitle("Post Share: " + response.data.Subject);
                viewModel.set("title", response.data.Subject);
                viewModel.set("body", response.data.Body);
                viewModel.set("postId", response.data.Id);
                viewModel.set("slug", response.data.Slug);
            }

            var kendoApp = CommunityApp.main.getKendoApplication();
            var view = kendoApp.view();

            var navbar = view.header.find(".km-navbar").data("kendoMobileNavBar");
            if (navbar !== null)
            {
                var rightElement = navbar.rightElement;

                $(rightElement[0].children[1]).one("click", function () {
                    console.log("top right share click");
                    viewModel.share();
                });
            }            
        },
        fnSharePostCallback: function(response)
        {
            if (response.data && response.data.HttpStatus == 200) {
                CommunityApp.common.navigateToView("#:back");
            }
        },
        share: function () {
            if (viewModel.get("emails") !== "") {

                var userId = CommunityApp.base.baseData.currentUser().id;

                var input = {
                    UserId: userId,
                    Title: viewModel.get("title"),
                    Body: viewModel.get("body"),
                    Emails: viewModel.get("emails"),
                    PostId: viewModel.get("postId"),
                    Slug: viewModel.get("slug")
                };

                var serviceUrl = getSharePostServiceUrl(viewModel.get("postId"));

                var sharePostOptions = {
                    url: serviceUrl,
                    requestType: "POST",
                    dataType: "JSON",
                    data: input,
                    callBack: viewModel.fnSharePostCallback
                };

                CommunityApp.dataAccess.callService(sharePostOptions);
            }
        }
    });

    return {
        viewModel: viewModel
    };
        
})();