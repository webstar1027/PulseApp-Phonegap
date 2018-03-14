CommunityApp.profile = (function () {

    var accountServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.profileConfig.accountPath;

    var getStoryBoardServiceUrl = function (friendId) {
        var currentUser = CommunityApp.base.baseData.currentUser();
        var userId = (friendId != currentUser.id) ? friendId : currentUser.id;

        var storyBoardServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.profileConfig.accountPath +
                   CommunityApp.configuration.profileConfig.storyBoardPath;
        storyBoardServiceUrl = CommunityApp.utilities.stringFormat(storyBoardServiceUrl, userId);
        return storyBoardServiceUrl;
    };
	
	var getStatusServiceUrl = function (userId) {
        var statusServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.profileConfig.accountPath +
                   CommunityApp.utilities.stringFormat(CommunityApp.configuration.profileConfig.statusPath, userId);
        return statusServiceUrl;
    };
	
	var getBadgesServiceUrl = function (userId) {
        var badgesServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.profileConfig.accountPath +
                   CommunityApp.utilities.stringFormat(CommunityApp.configuration.profileConfig.badgesPath, userId);
        return badgesServiceUrl;
    };
    
    var getAvailableBadgesServiceUrl = function (userId) {
        var badgesServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.profileConfig.accountPath +
                   CommunityApp.utilities.stringFormat(CommunityApp.configuration.profileConfig.availableBadgesPath, userId);
        return badgesServiceUrl;
    };

    var getFavoritesServiceUrl = function (userId) {
        var favoritesServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.profileConfig.accountPath +
                   CommunityApp.configuration.profileConfig.favoritesPath;
        favoritesServiceUrl = CommunityApp.utilities.stringFormat(favoritesServiceUrl, userId);
        return favoritesServiceUrl;
    };

    var getAccessRightsServiceUrl = function (userId) {
        var accessRightsServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.profileConfig.accountPath +
            CommunityApp.configuration.profileConfig.accessRightsPath;
        accessRightsServiceUrl = CommunityApp.utilities.stringFormat(accessRightsServiceUrl, userId);
        return accessRightsServiceUrl;
    };

    var setEditProfileSubmitForm = function () {
        if ($("#edit-profile-form")) {
            $("button[type='submit']", "#edit-profile-form").html("Save Changes").removeAttr("disabled");
            $("#edit-profile-form").unbind("submit");
            $("#edit-profile-form").one("submit", function () {
                $("button[type='submit']", this).html("Processing...<div class='loading pos-22 pull-right'></div>").attr('disabled', 'disabled');
                viewModel.edit();
                return true;
            });
        }
    };
	
	var readStatus = function(userId) {
		var statusServiceUrl = getStatusServiceUrl(userId);

		var statusLoadOptions = {
			url: statusServiceUrl,
			requestType: "GET",
			dataType: "JSON",
			callBack: CommunityApp.profile.viewModel.fnStatusLoadCallBack
		};

		var thatUserId = userId;
		CommunityApp.dataAccess.callService(statusLoadOptions, "profile-status-list", "<h2 class='centerAlign padding-1'>No status posts are found!</h2>", null, null, null, function(){
			readStatus(thatUserId);
		});
	};
	
	var swiper;

    var viewModel = kendo.observable({
        name: "", 
        group: "",
        avatar: "",
        bio: "",
        email: "",
        totalPosts: 0,
        memberSince: "",
        points: 0,
        id: 0,
        title: "",
        firstName: "",
        lastName: "",
        dataBound: false,
		inProgress: true,
        orientation: "",
        avatarFile: "",
		tabIndex: 0,
        tabIndexBadges: 0,
		statuses: [],
		badges: [],
        availableBadges: [],
		noBio: true,
		showPoints: false,
		showBadges: false,
        shortBio: function(){
            var bio = viewModel.get("bio");
            return CommunityApp.utilities.getChars(bio, 200);
        },
        page: function (url) {
            return url + viewModel.get("id");
        },
        isCurrentUser: function () {
			console.log("current user: "+CommunityApp.base.baseData.currentUser().id+" user id: "+viewModel.get("id"));
            return CommunityApp.base.baseData.currentUser().id == viewModel.get("id");
        },
        load: function (e) {
            //CommunityApp.common.authenticatedUser();
            viewModel.set("showPoints", CommunityApp.configuration.appConfig.showPoints);

            if (!CommunityApp.configuration.appConfig.showBadges) {
                $("#select-badges").remove();
            }

            viewModel.set("dataBound", false);
			viewModel.set("inProgress", true);
			viewModel.set("noBio", true);
			swiper = null;
			var mainScroller = e.view.scroller;
			var listviews = this.element.find("div.km-listview");
            $("#select-profile-view").kendoMobileButtonGroup({
                select: function (e) {
                    listviews.hide()
                             .eq(e.index)
                             .show();
					mainScroller.reset();
                },
                index: viewModel.get("tabIndex")
            });
            
            var listbadges = this.element.find("#profile-badges div.km-listview-badges");
            $("#select-badges-view").kendoMobileButtonGroup({
                select: function (e) {
                    listbadges.hide()
                             .eq(e.index)
                             .show();
					mainScroller.reset();
                },
                index: viewModel.get("tabIndexBadges")
            });

            var currentUser = CommunityApp.session.currentUser.load();
            var friendId = (e.view.params.userId != 'undefined' && typeof e.view.params.userId != 'undefined') ? e.view.params.userId : currentUser.id;
            var userId = (friendId != currentUser.id) ? friendId : currentUser.id;

			var viewArgs = e;

            if (userId !== currentUser.id)
            {
                $("#ca-user-profile").removeClass("no-backbutton");
            }
            else
            {
                $("#ca-user-profile").addClass("no-backbutton");
            }

            if (userId !== 'undefined' && typeof userId !== 'undefined') {
                var profileLoadOptions = {
                    url: accountServiceUrl + userId,
                    requestType: "GET",
                    dataType: "JSON",
                    callBack: CommunityApp.profile.viewModel.fnLoadCallBack
                };

				CommunityApp.dataAccess.callService(profileLoadOptions, null, null, null, null, null, function(){
					viewModel.load(viewArgs);
				});
            }

            //story board
			
			var scroller;
            var total = 0;
            var pageSize = 24;
            var currentPage = 1;
            var newView;
            var topLevelResult;
            var viewedIndex = 0;
            var pagingThreshold = 4;
			viewModel.set("pages_read", []);

			var dataSource = CommunityApp.dataAccess.kendoDataSource(currentPage, pageSize, getStoryBoardServiceUrl(userId), "GET", null, "profile-storyboard", "<h2 class='centerAlign padding-1'>No stories are found yet!</h2>", null, function(){
				viewModel.load(viewArgs);
			});
			
			dataSource.read().then(function () {
                var view = dataSource.view();
                view = CommunityApp.common.injectIndex(currentPage, pageSize, view);
				var sotryboardTemplate = kendo.template($('#story-board-tmpl').html());
                var sotryboardResult = kendo.render(sotryboardTemplate, view);
				$("#profile-storyboard").find(".container-fluid").empty();
                $("#profile-storyboard").find(".container-fluid").append(sotryboardResult);
				viewModel.set("inProgress", false);
				scroller = e.view.scroller;
                scroller.reset();
                scroller.bind("scroll", function (e) {
                    $(".storyboard-item").each(function () {
                        if ($(this).visible()) {
                            viewedIndex = $(this).attr("data-index");
                            total = dataSource.total();
                            pageSize = dataSource.pageSize();
                            currentPage = dataSource.page();

                            if (viewedIndex == ((currentPage * pageSize) - pagingThreshold) && (currentPage * pageSize) < total) {
                                currentPage += 1;
                                dataSource.page(currentPage);

                                dataSource.read().then(function () {
                                    setTimeout(function () {

                                        console.log("rendering page: " + dataSource.page());
                                        newView = dataSource.view();
                                        newView = CommunityApp.common.injectIndex(currentPage, pageSize, newView);
                                        var newStoryboardResult = kendo.render(sotryboardTemplate, newView);
                                        $("#profile-storyboard").find(".container-fluid").append(newStoryboardResult);

                                    }, 0);

                                });
                            }
                        }
                    });
                });
			});
			
			//status
			
			if (userId !== 'undefined' && typeof userId !== 'undefined') {
                readStatus(userId);
            }
			var statusList = $("#profile-status-list").data("kendoMobileListView");
            statusList.bind("dataBound", function (e) {
                $('.km-popup-overlay').each(function(){
                    $(this).find('.km-popup-arrow').addClass("popover-arrow");
                }); 
            });
			$('#profile-badges').show();
			$('#profile-badges').css("visibility", "hidden");
			
			//badges
			if (userId && userId > 0) {

                var badgesServiceUrl = getBadgesServiceUrl(userId);

                var badgesLoadOptions = {
                    url: badgesServiceUrl,
                    requestType: "GET",
                    dataType: "JSON",
					sender: e,
                    callBack: CommunityApp.profile.viewModel.fnBadgesLoadCallBack
                };

                CommunityApp.dataAccess.callService(badgesLoadOptions, "profile-badges-list-view", "<h2 class='centerAlign padding-1 width-full'>No badges are found yet!</h2>", null, null, null, function(){
					viewModel.load(viewArgs);
				});
                
                var availableBadgesServiceUrl = getAvailableBadgesServiceUrl(userId);
                console.log(availableBadgesServiceUrl);
                var availableBadgesLoadOptions = {
                    url: availableBadgesServiceUrl,
                    requestType: "GET",
                    dataType: "JSON",
                    sender: e,
                    callBack: CommunityApp.profile.viewModel.fnAvailableBadgesLoadCallBack
                };
                CommunityApp.dataAccess.callService(availableBadgesLoadOptions, "profile-available-badges-list-view", "<h2 class='centerAlign padding-1 width-full'>No badges are found!</h2>", null, null, null, function(){
					viewModel.load(viewArgs);
				});
            }
			
            //favorites
            var favoritesListView = $("#user-favorites-list").data("kendoMobileListView");

            if (favoritesListView !== null && typeof favoritesListView !== 'undefined')
            {
                var favoritesDataSource = CommunityApp.dataAccess.kendoDataSource(1, 10, getFavoritesServiceUrl(userId), "GET", null, "user-favorites-list", "<h2 class='centerAlign padding-1'>No favorites are found yet!</h2>", null, function(){
					viewModel.load(viewArgs);
				});
                favoritesListView.remove(favoritesListView.dataSource.data());
                favoritesListView.setDataSource(favoritesDataSource);
                favoritesListView.dataSource.read();
                favoritesListView.scroller().reset();
                favoritesListView.refresh();
            }
			
			$('#profile-storyboard').show();
			$('#profile-status').hide();
			$('#profile-badges').show();
			var tabs = $("#select-profile-view").data("kendoMobileButtonGroup");
			if (e.view.params.tab != 'undefined' && typeof e.view.params.tab != 'undefined' && e.view.params.tab === '1'){
				$('#profile-storyboard').hide();
				$('#profile-status').show();
				$('#profile-badges').hide();
				tabs.select(1);
            }
            $(".km-load-more").remove();

            setEditProfileSubmitForm();
            
            if (CommunityApp.common.deviceType() === "android") {
                setTimeout(
                    function(){
                        var scroller = $("#ca-user-edit-profile .km-content").data("kendoMobileScroller");
                        if (scroller !== null) {
                            scroller.reset();
                            var offset = $("#edit-profile-form #txt-firstName").offset().top;
                            console.log("offset: "+offset);
                            offset -= $('#ca-user-edit-profile header').height()+10;
                            scroller.scrollTo(0, -offset);
                            $("#txt-firstName").focus();
                            $("#txt-firstName").focus(function(){
                                scroller.reset();
                                $("#edit-profile-form .clearspace").css("height", 0);
                                var clearFixHeight = $(window).height() - $('#profile-image-section').height() - $('#ca-user-edit-profile header').height() - $('#ca-user-edit-profile footer').height();
                                $("#edit-profile-form .clearspace").css("height", clearFixHeight);
                                scroller.reset();
                                var offset = $("#edit-profile-form #txt-firstName").offset().top;
                                console.log("offset: "+offset);
                                offset -= $('#ca-user-edit-profile header').height()+10;
                                scroller.scrollTo(0, -offset);
                            });
                            
                            $("#txt-firstName").click(function(){
                                scroller.reset();
                                $("#edit-profile-form .clearspace").css("height", 0);
                                var clearFixHeight = $(window).height() - $('#profile-image-section').height() - $('#ca-thread-post-reply header').height() - $('#ca-thread-post-reply footer').height();
                                $("#edit-profile-form .clearspace").css("height", clearFixHeight);
                                scroller.reset();
                                var offset = $("#edit-profile-form #txt-firstName").offset().top;
                                console.log("offset: "+offset);
                                offset -= $('#ca-user-edit-profile header').height()+10;
                                scroller.scrollTo(0, -offset);
                            });
                            $("#txt-lastName").focus(function(){
                                scroller.reset();
                                $("#edit-profile-form .clearspace").css("height", 0);
                                var clearFixHeight = $(window).height() - $('#profile-image-section').height() - $('#ca-user-edit-profile header').height() - $('#ca-user-edit-profile footer').height();
                                $("#edit-profile-form .clearspace").css("height", clearFixHeight);
                                scroller.reset();
                                var offset = $("#edit-profile-form #txt-firstName").offset().top;
                                console.log("offset: "+offset);
                                offset -= $('#ca-user-edit-profile header').height()+10;
                                scroller.scrollTo(0, -offset);
                            });
                            
                            $("#txt-lastName").click(function(){
                                scroller.reset();
                                $("#edit-profile-form .clearspace").css("height", 0);
                                var clearFixHeight = $(window).height() - $('#profile-image-section').height() - $('#ca-thread-post-reply header').height() - $('#ca-thread-post-reply footer').height();
                                $("#edit-profile-form .clearspace").css("height", clearFixHeight);
                                scroller.reset();
                                var offset = $("#edit-profile-form #txt-firstName").offset().top;
                                console.log("offset: "+offset);
                                offset -= $('#ca-user-edit-profile header').height()+10;
                                scroller.scrollTo(0, -offset);
                            });
                            $("#txt-bio").focus(function(){
                                scroller.reset();
                                $("#edit-profile-form .clearspace").css("height", 0);
                                var clearFixHeight = $(window).height() - $('#profile-image-section').height() - $('#ca-user-edit-profile header').height() - $('#ca-user-edit-profile footer').height();
                                $("#edit-profile-form .clearspace").css("height", clearFixHeight);
                                scroller.reset();
                                var offset = $("#edit-profile-form #txt-firstName").offset().top;
                                console.log("offset: "+offset);
                                offset -= $('#ca-user-edit-profile header').height()+10;
                                scroller.scrollTo(0, -offset);
                            });
                            
                            $("#txt-bio").click(function(){
                                scroller.reset();
                                $("#edit-profile-form .clearspace").css("height", 0);
                                var clearFixHeight = $(window).height() - $('#profile-image-section').height() - $('#ca-thread-post-reply header').height() - $('#ca-thread-post-reply footer').height();
                                $("#edit-profile-form .clearspace").css("height", clearFixHeight);
                                scroller.reset();
                                var offset = $("#edit-profile-form #txt-firstName").offset().top;
                                console.log("offset: "+offset);
                                offset -= $('#ca-user-edit-profile header').height()+10;
                                scroller.scrollTo(0, -offset);
                            });
                        }
                    }, 500);
            }
        },
		fnBadgesLoadCallBack: function(response, sender) {
			viewModel.set("badges", response.data);
			var badgesList = $("#profile-badges-list").data("kendoMobileListView");
            badgesList.refresh();
            
			$('#profile-badges').css("visibility", "visible");
			$('#profile-storyboard').show();
			$('#profile-status').hide();
			$('#profile-badges').hide();
			var tabs = $("#select-profile-view").data("kendoMobileButtonGroup");
			if (sender.view.params.tab != 'undefined' && typeof sender.view.params.tab != 'undefined' && sender.view.params.tab === '1'){
				$('#profile-storyboard').hide();
				$('#profile-status').show();
				$('#profile-badges').hide();
				tabs.select(1);
            }
		},
        fnAvailableBadgesLoadCallBack: function(response, sender) {
            viewModel.set("availableBadges", response.data);
			var badgesList = $("#profile-available-badges-list").data("kendoMobileListView");
            badgesList.refresh();
            
            $('#badges-earned').show();
            $('#badges-available').hide();
            
            var tabs = $("#select-badges-view").data("kendoMobileButtonGroup");
            tabs.select(viewModel.get('tabIndexBadges'));
        },
        fnDeleteStatusCallback: function (httpStatus, sender) {
            if (httpStatus === 200) {
                CommunityApp.common.showSuccessNotification("Status is deleted successfully!");
                var relatedPopOver = $(sender).closest("div[id^='actionsPopOver_']").data("kendoMobilePopOver");
                relatedPopOver.close();
                readStatus(CommunityApp.base.baseData.currentUser().id);
            }
            else {
                CommunityApp.common.showErrorNotification("Unexpected Error!", "Unexpected error occurred. Try again later!");
            }
        },
		fnStatusLoadCallBack: function (response) {
			viewModel.set("statuses", response.data);
            var statusList = $("#profile-status-list").data("kendoMobileListView");
            statusList.refresh();
		},
        fnLoadCallBack: function (response) {
            if (response.data)
            {
                viewModel.set("avatar", response.data.UserProfile.AvatarUrl);
                viewModel.set("avatarFile", response.data.UserProfile.AvatarUrl);
                viewModel.set("name", response.data.UserProfile.FirstName + " " + response.data.UserProfile.LastName);
                viewModel.set("email", response.data.Email);
                viewModel.set("totalPosts", response.data.UserProfile.TotalPosts);
                viewModel.set("memberSince", response.data.MemberSince);
                viewModel.set("points", response.data.UserPoints);
                viewModel.set("id", response.data.Id);
                viewModel.set("title", response.data.Title);
                viewModel.set("firstName", response.data.UserProfile.FirstName);
                viewModel.set("lastName", response.data.UserProfile.LastName);
				if (response.data.UserProfileExtension && response.data.UserProfileExtension !== null) {
					var shortBio = response.data.UserProfileExtension.Bio;
					if (shortBio === null || shortBio.length === 0){
						viewModel.set("noBio", true);
						viewModel.set("shortBio", "");
					} else {
						shortBio = shortBio.replace(/(<([^>]+)>)/ig,"");
						if (shortBio.length > 60)
							shortBio = shortBio.substr(0, 60) + " ... Read More";
						viewModel.set("shortBio", shortBio);
						viewModel.set("noBio", false);
					}
				} else {
					viewModel.set("noBio", true);
					viewModel.set("shortBio", "");
				}

                CommunityApp.common.logTitle("Profile: " + viewModel.get("name"));

                if (response.data.UserProfileExtension && response.data.UserProfileExtension !== null) {
                    viewModel.set("bio", response.data.UserProfileExtension.Bio);
                }

                //if($("#upload-avatar"))
                //{
                //    var canvas = document.getElementById("upload-avatar");
                //    var ctx = canvas.getContext('2d');
                //    var img = new Image();
                //    img.onload = function () {
                //        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
                //    };
                //    img.src = response.data.UserProfile.AvatarUrl;
                //}

                viewModel.set("dataBound", true);
            }
        },
        isAllowed: function (permission, sectionId, successCallback) {
            var userId = CommunityApp.base.baseData.currentUser().id;
            var serviceUrl = getAccessRightsServiceUrl(userId);

            var accessRightsOptions = {
                url: serviceUrl,
                requestType: "POST",
                dataType: "JSON",
                data: {
                    Permission: permission,
                    SectionId: sectionId
                },
                callBack: CommunityApp.profile.viewModel.fnAccessRightsCallback,
                sender: successCallback
            };

            CommunityApp.dataAccess.callService(accessRightsOptions);
        },
        fnAccessRightsCallback: function (response, callback) {
            if (response.data) {
                callback(response.data);
            }
            else {
                callback(response);
            }
        },
        edit: function () {
            var userId = CommunityApp.base.baseData.currentUser().id;
            var serviceUrl = accountServiceUrl + userId;

            var fileData = new FormData();
            fileData.append("file", CommunityApp.common.dataURItoBlob(viewModel.get("avatarFile")));
            fileData.append("data", JSON.stringify({ FirstName: viewModel.get("firstName"), LastName: viewModel.get("lastName"), Bio: viewModel.get("bio") }));

            var editProfileOptions = {
                url: serviceUrl,
                requestType: "PUT",
                dataType: "JSON",
                data: fileData,
                callBack: viewModel.fnEditProfileCallback
            };

            CommunityApp.dataAccess.callService(editProfileOptions, null, null, true, false, false); 
        },
        fnEditProfileCallback: function (response) {
            if(response.data)
            {
                if(response.data.HttpStatus == 200)
                {
                    CommunityApp.common.navigateToView("#ca-user-profile?userId=" + response.data.AdditionalData);
                }
                else
                {
                    CommunityApp.common.showErrorNotification("Update Error", "Unexpected error!");
                }
            }
        },
        triggerUpload: function () {
            $("#uploadAvatar").click();
            $("#uploadAvatar").change(function () {
                CommunityApp.common.readUrl(this, function (response, file) {
                    viewModel.set("avatar", response);

                    loadImage.parseMetaData(file, function (data) {
                        if (data.exif) {
                            viewModel.set("orientation", data.exif.get('Orientation'));
                        }

                        var loadingImage = loadImage(file,
                            function (img) {

                                if (typeof img.toDataURL == 'function')
                                {
                                    viewModel.set("avatarFile", img.toDataURL());
                                }
                                else
                                {
                                    viewModel.set("avatarFile", response);
                                }

                            }, { orientation: viewModel.get("orientation"), maxWidth: 300, maxHeight: 300 });

                        if (!loadingImage) {

                        }

                    });
                });
            });
        }
    });


    return {
        viewModel: viewModel
    };
})();