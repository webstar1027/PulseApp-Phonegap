CommunityApp.threadPosts = (function () {

    var getThreadPostsServiceUrl = function (userId, threadId, sortType) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.forumConfig.forumsPath + CommunityApp.configuration.forumConfig.threadPostsPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, threadId, sortType);
    };

    var getThreadMuteServiceUrl = function (userId, threadId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.forumConfig.forumsPath + CommunityApp.configuration.forumConfig.threadSettingsPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, threadId);
    };

    var getReplyServiceUrl = function (userId, threadId, postId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.forumConfig.forumsPath + CommunityApp.configuration.forumConfig.replyPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, threadId, postId);
    };

    var getSuggestServiceUrl = function (userId, threadId, postId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.forumConfig.forumsPath + CommunityApp.configuration.forumConfig.suggestPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, threadId, postId);
    };

    var getVerifyServiceUrl = function (userId, threadId, postId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.forumConfig.forumsPath + CommunityApp.configuration.forumConfig.verifyPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, threadId, postId);
    };

    var deleteThreadPostServiceUrl = function (userId, threadId, postId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.forumConfig.forumsPath + CommunityApp.configuration.forumConfig.deleteForumPostPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, threadId, postId);
    };

    var deletePostAttachmentServiceUrl = function (attachmentId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.forumConfig.forumsPath + CommunityApp.configuration.forumConfig.deleteAttachment;
        return CommunityApp.utilities.stringFormat(serviceUrl, attachmentId);
    };

    var getPollGraphUrl = function (pollId) {
        var pollGraphUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.pollConfig.pollPath + CommunityApp.configuration.pollConfig.pollGraphPath;
        pollGraphUrl = CommunityApp.utilities.stringFormat(pollGraphUrl, pollId);
        return pollGraphUrl;
    };

    var getVoteToPollUrl = function () {
        var voteToPollUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.pollConfig.pollPath + CommunityApp.configuration.pollConfig.voteToPollPath;
        return voteToPollUrl;
    };

    var setReplySubmitForm = function () {
        if ($("#reply-form")) {
            $("button[type='submit']", "#reply-form").html("<span class='km-icon km-comment'></span>Reply").removeAttr("disabled");
            $("#reply-form").unbind("submit");
            $("#reply-form").one("submit", function () {
                $("button[type='submit']", this).html("Processing...<div class='loading pos-20 pull-right'></div>").attr('disabled', 'disabled');
                viewModel.reply();
                return true;
            });
        }
    };

    var setVoteToPollSubmitForm = function () {
        if ($("#discussion-poll-vote-form")) {
            $("button[type='submit']", "#discussion-poll-vote-form").html("Vote").removeAttr("disabled");
            $("#discussion-poll-vote-form").unbind("submit");
            $("#discussion-poll-vote-form").one("submit", function () {
                $("button[type='submit']", this).html("Processing...<div class='loading pos-22 pull-right'></div>").attr('disabled', 'disabled');
                viewModel.vote();
                return true;
            });
        }
    };

    var viewModel = kendo.observable({
        body: "",
        threadId: 0,
        postId: 0,
        level: 0,
        sectionId: 0,
        topPost: {},
        subject: "",
        longBody: "",
        relativeDate: "",
        author: {},
        authorTitle: "",
        authorFullName: "",
        likesText: "",
        commentsText: "",
        replySocialMessage: "",
        dataBound: false,
        typing: false,
        hideIcon: true,
        processing: false,
        editAllowed: false,
        zoomedIn: false,
        poll: {},
        hasPoll: false,
        pollDescription: "",
        pollAnsweredUserCountText: "",
        unansweredPoll: false,
        showChart: false,
        fileUrl: "",
        orientation: "",
        forGiphy: false,
        selectedGiphy: "",
        selectedFixedWidthGiphy: "",
        hasImageAttachment: false,
        hasNonImageAttachment: false,
        attachmentUrl: "",
        extraAttachmentUrl: "",
        isExtraImageAttachment: false,
        hasExtraAttachmentUrl: false,
        sortType: 0,
        isMuted: false,
        topAttachmentId: function () {
            var topPost = viewModel.get("topPost");
            if (topPost.PostAttachments && typeof topPost.PostAttachments !== "undefined" && topPost.PostAttachments !== null && topPost.PostAttachments.length > 0) {
                return "attachmentContainer_" + topPost.PostAttachments[0].AttachmentId;
            } else {
                return "attachmentContainer_0";
            }
        },
        topAttachmentDownload: function () {
            var topPost = viewModel.get("topPost");
            if (topPost.PostAttachments && typeof topPost.PostAttachments !== "undefined" && topPost.PostAttachments !== null && topPost.PostAttachments.length > 0) {
                return "attachmentContainer_" + topPost.PostAttachments[0].AttachmentId + "_download";
            } else {
                return "attachmentContainer_0_download";
            }
        },
        deletePostAttachment: function (e) {

		    var param = e.getAttribute("data-param");
		    var attachmentId = parseInt(param.split('_')[0]);
		    var attachmentType = param.split('_')[1];

		    console.log("Attachment Id is : " + attachmentId);

		    if (attachmentId === 0) {

		        var topPost = viewModel.get("topPost");

		        if (attachmentType == "o")
		        {
		            attachmentId = topPost.PostAttachments[0].AttachmentId;
		        }
		        else if (attachmentType == "e")
		        {
		            attachmentId = topPost.PostAttachments[1].AttachmentId;
		        }
                
                console.log("New Attachment Id is : " + attachmentId);
		    }
            
            var deleteAttachmentServiceUrl = deletePostAttachmentServiceUrl(attachmentId);
            console.log("deleteAttachmentServiceUrl " + deleteAttachmentServiceUrl);
            var deleteAttachmentServiceOptions = {
                url: deleteAttachmentServiceUrl,
                requestType: "POST",
                dataType: "JSON",
                callBack: viewModel.DeleteAttachmentCallBack
            };

            var viewArgs = e;
            CommunityApp.dataAccess.callService(deleteAttachmentServiceOptions);
        },
        DeleteAttachmentCallBack: function (response) {
            console.log("Delete Attachment Callback " + response.data);
            $("#attachmentContainer_" + response.data).hide();
            $("#attachmentContainer_" + response.data + "_download").hide();
        },
        deleteTopForumPost: function () {
            var topPost = viewModel.get("topPost");
            viewModel.deleteForumPost(topPost.PostThread.Id, topPost.Id);
        },
        deleteForumPost: function (threadId, postId) {
            console.log("threadId: " + threadId);
            console.log("postId: " + postId);
            var userId = CommunityApp.base.baseData.currentUser().id;
            var serviceUrl = deleteThreadPostServiceUrl(userId, threadId, postId);
            var deleteForumPostServiceOptions = {
                url: serviceUrl,
                requestType: "POST",
                dataType: "JSON",
                callBack: viewModel.DeleteForumPostCallBack,
                sender: postId
            };
            CommunityApp.dataAccess.callService(deleteForumPostServiceOptions);
        },
        DeleteForumPostCallBack: function (response, sender) {
            console.log(sender);
            if (response.data && response.data.HttpStatus === 200) {
                var topPost = viewModel.get("topPost");
                if (response.data.AdditionalData === "False") {
                    console.log("child");
                    $("#replyContainer" + sender).hide();
                    topPost.SocialInfo.CommentsCount -= 1;
                    viewModel.set("topPost", topPost);
                    kendo.bind($(".feed-article"), viewModel);
                } else {
                    CommunityApp.common.navigateToView("ca-section-threads?sectionId=" + topPost.PostThread.ThreadSection.Id);
                }
            } else {
                CommunityApp.common.showErrorNotification("Error!", "Unexpected error, please try again later!");
            }
        },
        redirectNoImageAttachmentOfTopPost: function () {
            var topPost = viewModel.get("topPost");
            if (topPost.PostAttachments && typeof topPost.PostAttachments !== "undefined" && topPost.PostAttachments !== null && topPost.PostAttachments.length > 0)
                cordova.InAppBrowser.open(encodeURI(topPost.PostAttachments[0].FileUrl), "_system");
        },
        redirectNoImageAttachmentOfReply: function (fileUrl) {
            if (fileUrl !== null)
                cordova.InAppBrowser.open(encodeURI(fileUrl), "_system");
        },
        hasReplies: function () {
            var tPost = viewModel.get("topPost");
            if (tPost && tPost.PostThread) {
                return tPost.PostThread.TotalReplies > 0;
            }

            return false;
        },
        sectionTitle: function () {
            var tPost = viewModel.get("topPost");
            if (tPost.PostThread)
                return tPost.PostThread.ThreadSection.Name;
            return "";
        },
        sectionPage: function (url) {
            var tPost = viewModel.get("topPost");
            if (tPost.PostThread)
                return url + tPost.PostThread.ThreadSection.Id;
            return "";
        },
        profilePage: function (url) {
            var tPost = viewModel.get("topPost");
            if (tPost.PostAuthor)
                return url + tPost.PostAuthor.Id;
            return "";
        },
        editThreadPage: function (url) {
            var tPost = viewModel.get("topPost");
            if (tPost)
                return url + tPost.Id + "&threadId=" + tPost.ThreadId + "&sectionId=" + tPost.SectionId + "&reply=0";
            return "";
        },
        socialMessage: function () {
            var tPost = viewModel.get("topPost");
            if (tPost.SocialInfo)
                return CommunityApp.common.formatSocialMessageForDiscussion(tPost.SocialInfo);
            return "";
        },
        replyPage: function (url) {
            var tPost = viewModel.get("topPost");
            if (tPost)
                return url + "?postId=" + tPost.Id + "&threadId=" + tPost.ThreadId + "&level=" + tPost.PostLevel + "&sectionId=" + tPost.SectionId + "&subject=" + tPost.Subject;
            return "";
        },
        likePost: function () {
            var tPost = viewModel.get("topPost");
            if (tPost)
                CommunityApp.post.operations({ likeSuccessCallback: CommunityApp.threadPosts.viewModel.likeTopPostCallback }).like(tPost.Id, true, this);
        },
        unlikePost: function () {
            var tPost = viewModel.get("topPost");
            if (tPost)
                CommunityApp.post.operations({ likeSuccessCallback: CommunityApp.threadPosts.viewModel.likeTopPostCallback }).like(tPost.Id, false, this);
        },
        likeTopPostCallback: function (operation, likes, sender) {
            //CommunityApp.common.authenticatedUser();
            var tPost = viewModel.get("topPost");
            if (tPost) {
                if (operation.toLowerCase() == "like") {
                    tPost.SocialInfo.LikesCount += 1;
                    tPost.SocialInfo.UserLiked = true;
                }
                else {
                    tPost.SocialInfo.LikesCount -= 1;
                    tPost.SocialInfo.UserLiked = false;
                }

                viewModel.set("topPost", tPost);
                kendo.bind($(".feed-article"), viewModel);
            }
        },
        showFullImage: function (e, event) {
            var imageUrl = e.getAttribute("src");
            var zoomedIn = viewModel.get("zoomedIn");

            if (!zoomedIn) {
                $('#ca-thread-discussion').click(function () {
                    var zoomedIn_status = viewModel.get("zoomedIn");
                    if (zoomedIn_status) {
                        $(this).removeClass("zoomed-in");
                        $(this).css('background-image', "");
                        $('#ca-thread-discussion .full-download').remove();
                        viewModel.set("zoomedIn", false);
                    }
                });
                $('#ca-thread-discussion').addClass("zoomed-in");
                $('#ca-thread-discussion').css('background-image', 'url("' + imageUrl + '")');
                viewModel.set("zoomedIn", true);
                $('<div class="full-download" style="display: block;text-align: right;padding: 25px 10px 0 0;"><span class="km-text"><a data-bind="attr: { data-image: attachmentUrl }" class="no-text-decoration btn-comment" onclick="CommunityApp.threadPosts.viewModel.download(this);" data-image="' + imageUrl + '"><span class="glyphicon glyphicon-download-alt display-inline-block"></span></a></span></div>').appendTo('#ca-thread-discussion');
            }
            else {
                //$("body").zoomTo();
                $('#ca-thread-discussion').removeClass("zoomed-in");
                if ($('#ca-thread-discussion .full-download'))
                    $('#ca-thread-discussion .full-download').remove();
                viewModel.set("zoomedIn", false);
            }
            event.stopPropagation();
            return false;
        },
        download: function (e) {
            var imageUrl = e.getAttribute("data-image");
            console.log("ImageUrl: " + imageUrl);
            var fileName = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
            var folderName = "Download";

            if (CommunityApp.common.deviceType() === "android") {
                folderName = "Download";
            } else if (CommunityApp.common.deviceType() === "iphone" || CommunityApp.common.deviceType() === "ipad") {
                folderName = "Download";
            }
            console.log("ImageName: " + fileName);

            var onDirectorySuccess = function (parent) {
                // Directory created successfuly
                console.log("Directory Created Successfully!");
            };

            var onDirectoryFail = function (error) {
                //Error while creating directory
                CommunityApp.common.showErrorNotification("Error!", "Unable to create new directory: " + error.code);
            };

            var fileSystemSuccess = function (fileSystem) {
                var fp = fileSystem.root.toURL() + folderName + "/" + fileName; // Returns Fulpath of local directory

                $('#thread-discussions-main-container').hide();
                $('<div class="k-loading-mask" style="width: 100%; height: 100%; top: 0px; left: 0px;"><span class="k-loading-text">Downloading...</span><div class="k-loading-image"></div><div class="k-loading-color"></div></div>').appendTo('#ca-thread-discussion .km-content');

                if (CommunityApp.common.deviceType() === "android") {
                    var permissions = cordova.plugins.permissions;

                    permissions.hasPermission(permissions.WRITE_EXTERNAL_STORAGE, function (status) {
                        if (!status.hasPermission) {
                            var errorCallback = function () {
                                CommunityApp.common.showErrorNotification("Error!", "Requires storage permission!");
                            };

                            permissions.requestPermission(permissions.WRITE_EXTERNAL_STORAGE,
							  function (status) {
							      if (!status.hasPermission)
							          errorCallback();
							      else {
							          downloadFile(imageUrl, fp);
							      }
							  },
							  errorCallback);
                        }
                        else {
                            downloadFile(imageUrl, fp);
                        }
                    }, null);
                } else if (CommunityApp.common.deviceType() === "iphone" || CommunityApp.common.deviceType() === "ipad") {
                    fp = fileSystem.root.toURL() + fileName;
                    console.log(fp);
                    downloadFile(imageUrl, fp);
                }
            };

            var saveImageSuccessCallback = function () {
                CommunityApp.common.showSuccessNotification("Downloaded successfully!");
            };
            var saveImageErrorCallback = function () {
                CommunityApp.common.showErrorNotification("Error!", "Download Failed!");
            };

            var fileSystemFail = function (evt) {
                //Unable to access file system
                CommunityApp.common.showErrorNotification("Error!", "Unexpected error, please try again later!");
            };

            if (imageUrl === null || imageUrl === "") {
                CommunityApp.common.showErrorNotification("Error!", "Unexpected error, please try again later!");
                return;
            } else {
                //var networkState = navigator.connection.type;
                //if (networkState == Connection.NONE) {
                //	CommunityApp.common.showErrorNotification("Error!", "Unexpected error, please try again later!");
                //	return;
                //} else {
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileSystemSuccess, fileSystemFail);
                //}
            }


            var downloadFile = function (imageUrl, fp) {
                var fileTransfer = new FileTransfer();
                fileTransfer.download(imageUrl, fp,
			    	function (entry) {
			    	    $('#ca-thread-discussion .k-loading-mask').remove();
			    	    $('#thread-discussions-main-container').show();
			    	    if (CommunityApp.common.deviceType() === "iphone" || CommunityApp.common.deviceType() === "ipad") {
			    	        cordova.plugins.imagesaver.saveImageToGallery(entry.toURL(), saveImageSuccessCallback, saveImageErrorCallback);
			    	    } else {
			    	        CommunityApp.common.showSuccessNotification("Downloaded successfully!");
			    	    }
			    	},
			    	function (error) {
			    	    //Download abort errors or download failed errors
			    	    $('#ca-thread-discussion .k-loading-mask').remove();
			    	    $('#thread-discussions-main-container').show();
			    	    CommunityApp.common.showErrorNotification("Error!", "Unexpected error, please try again later!");
			    	    alert("Please check the application permission.");
			    	    //CommunityApp.common.showErrorNotification("Error!", error.target);
			    	    //CommunityApp.common.showErrorNotification("Error!", error.code);
			    	    //alert("download error source " + error.source);
			    	    //alert("download error target " + error.target);
			    	    //alert("upload error code" + error.code);
			    	}
			    );
            };
        },
        load: function (e) {
            //CommunityApp.common.authenticatedUser();

            viewModel.set("dataBound", false);

            $("#select-sortType").kendoMobileButtonGroup({
                select: function (selectedType) {
                    viewModel.set("sortType", selectedType.index);
                    viewModel.showPosts(e);
                },
                index: viewModel.get("sortType")
            });

            //$(".clearspace").css("height", 0);
            $('#ca-thread-discussion').removeClass("zoomed-in");
            $('#ca-thread-discussion').css('background-image', "");
            if ($('#ca-thread-discussion .full-download'))
                $('#ca-thread-discussion .full-download').remove();
            viewModel.set("zoomedIn", false);

            $('#ca-thread-discussion').click(function () {
                var zoomedIn_status = viewModel.get("zoomedIn");
                if (zoomedIn_status) {
                    console.log("ca-thread-discussion: click event");
                    $(this).removeClass("zoomed-in");
                    $(this).css('background-image', "");
                    $('#ca-thread-discussion .full-download').remove();
                    viewModel.set("zoomedIn", false);
                }
            });
            viewModel.showPosts(e);

            viewModel.loadMute(e);
        },
        showPosts: function (e) {
            var sortType = viewModel.get("sortType");
            var threadId = e.view.params.threadId;
            var userId = CommunityApp.base.baseData.currentUser().id;
            var serviceUrl = getThreadPostsServiceUrl(userId, threadId, sortType);

            var pageSize = 10;
            var currentPage = 1;
            var scroller;
            var total = 0;
            var newView;
            var threadDiscussionsResult;
            var viewedIndex = 0;
            var pagingThreshold = 4;

            console.log("forum: " + serviceUrl);
            var viewArgs = e;
            var dataSource = CommunityApp.dataAccess.kendoDataSource(currentPage, pageSize, serviceUrl, "GET", null, null, null, null, function () {
                viewModel.load(viewArgs);
            });

            dataSource.read().then(function () {
                var view = dataSource.view();
                view = CommunityApp.common.injectIndex(currentPage, pageSize, view);

                var topPost = view.shift();

                if (topPost.PostAttachments && typeof topPost.PostAttachments !== "undefined" && topPost.PostAttachments !== null && topPost.PostAttachments.length > 0) {
                    viewModel.set('hasImageAttachment', topPost.PostAttachments[0].IsImage);
                } else {
                    viewModel.set('hasImageAttachment', false);
                }

				var hasExtraAttachment = topPost.PostAttachments && typeof topPost.PostAttachments !== "undefined" && topPost.PostAttachments !== null && topPost.PostAttachments.length > 1;
				viewModel.set("hasExtraAttachmentUrl", hasExtraAttachment);

				if (hasExtraAttachment)
				    viewModel.set("isExtraImageAttachment", topPost.PostAttachments && typeof topPost.PostAttachments !== "undefined" && topPost.PostAttachments !== null && topPost.PostAttachments[1].IsImage);

                var hasImageAttachment = viewModel.get("hasImageAttachment");

                if (topPost.PostAttachments && typeof topPost.PostAttachments !== "undefined" && topPost.PostAttachments !== null && topPost.PostAttachments.length > 0 && !hasImageAttachment) {
                    viewModel.set('hasNonImageAttachment', !topPost.PostAttachments[0].IsImage);
                } else {
                    viewModel.set('hasNonImageAttachment', false);
                }

                var attachmentUrl = topPost.PostAttachments && typeof topPost.PostAttachments !== "undefined" && topPost.PostAttachments !== null && topPost.PostAttachments.length > 0 ? topPost.PostAttachments[0].FileUrl : "";
                viewModel.set("attachmentUrl", attachmentUrl);

				var extraAttachmentUrl = topPost.PostAttachments && typeof topPost.PostAttachments !== "undefined" && topPost.PostAttachments !== null && topPost.PostAttachments.length > 1 ? topPost.PostAttachments[1].FileUrl : "";
				viewModel.set("extraAttachmentUrl", extraAttachmentUrl);

                topPost.PostAuthor.UserProfile.AvatarUrl += "?width=100";
                viewModel.set('topPost', topPost);
                var allowed = CommunityApp.base.baseData.currentUser().id == topPost.PostAuthor.Id;
                viewModel.set('editAllowed', allowed);

                var poll = topPost.PostPoll;
                if (poll) {
                    viewModel.loadPollData(poll);
                    viewModel.set('poll', poll);
                } else {
                    viewModel.set('hasPoll', false);
                }
                setVoteToPollSubmitForm();


                var threadType = topPost.PostThread.Type.toLowerCase();

                CommunityApp.common.logTitle("Thread Posts: " + topPost.Subject);

                var i = 0;
                for (i = 0; i < view.length; i++) {
                    view[i].PostAuthor.UserProfile.AvatarUrl += "?width=100";
                    view[i].allowedEdit = CommunityApp.base.baseData.currentUser().id == view[i].PostAuthor.Id;
                    view[i].editUrl = "#ca-thread-edit?postId=" + view[i].Id + "&threadId=" + view[i].ThreadId + "&sectionId=" + view[i].SectionId + "&reply=1";
                    //url + tPost.Id + "&threadId=" + tPost.ThreadId + "&sectionId=" + tPost.SectionId
                }

                var threadDiscussionsTemplate = threadType == "discussion" ? kendo.template($("#thread-discussions-tmpl").html()) : kendo.template($("#thread-qa-tmpl").html());
                var threadDiscussionsResult = kendo.render(threadDiscussionsTemplate, view);

                if (threadType == "discussion") {
                    $("#thread-discussions").find(".container-fluid").empty();
                    $("#thread-discussions").find(".container-fluid").append(threadDiscussionsResult);
                }
                else {
                    $("#thread-qa").find(".container-fluid").empty();
                    $("#thread-qa").find(".container-fluid").append(threadDiscussionsResult);
                }

                viewModel.set("dataBound", true);

                if (topPost.PostAttachments && typeof topPost.PostAttachments !== "undefined" && topPost.PostAttachments !== null && topPost.PostAttachments.length > 0) {
                    $("#attachmentContainer_" + topPost.PostAttachments[0].AttachmentId).show();
                } else {
                    $("#attachmentContainer_0").show();
                }

                scroller = e.view.scroller;
                scroller.reset();

                $(".img-attachment").each(function () {
                    var element = $(this);
                    $(this).click(function (evt) {
                        console.log("image : click event");
                        var imageUrl = element.attr("src");
                        var zoomedIn = viewModel.get("zoomedIn");
                        if (!zoomedIn) {
                            $('#ca-thread-discussion').addClass("zoomed-in");
                            $('#ca-thread-discussion').css('background-image', 'url("' + imageUrl + '")');
                            viewModel.set("zoomedIn", true);
                            $('<div class="full-download" style="display: block;text-align: right;padding: 10px 10px 0 0;"><span class="km-text"><a data-bind="attr: { data-image: attachmentUrl }" class="no-text-decoration btn-comment" onclick="CommunityApp.threadPosts.viewModel.download(this);" data-image="' + imageUrl + '"><span class="glyphicon glyphicon-download-alt display-inline-block"></span></a></span></div>').appendTo('#ca-thread-discussion');
                        }
                        else {
                            //$("body").zoomTo();
                            $('#ca-thread-discussion').removeClass("zoomed-in");
                            if ($('#ca-thread-discussion .full-download'))
                                $('#ca-thread-discussion .full-download').remove();
                            viewModel.set("zoomedIn", false);
                        }
                        evt.stopPropagation();
                    });
                });

                scroller.unbind("scroll");
                scroller.bind("scroll", function (e) {
                    $(".discussion-item").each(function () {
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
                                        var i = 0;
                                        for (i = 0; i < newView.length; i++) {
                                            newView[i].PostAuthor.UserProfile.AvatarUrl += "?width=100";
                                            newView[i].allowedEdit = CommunityApp.base.baseData.currentUser().id == newView[i].PostAuthor.Id;
                                            newView[i].editUrl = "#ca-thread-edit?postId=" + newView[i].Id + "&threadId=" + newView[i].ThreadId + "&sectionId=" + newView[i].SectionId + "&reply=1";
                                            //url + tPost.Id + "&threadId=" + tPost.ThreadId + "&sectionId=" + tPost.SectionId
                                        }
                                        threadDiscussionsResult = kendo.render(threadDiscussionsTemplate, newView);
                                        if (threadType == "discussion") {
                                            $("#thread-discussions").find(".container-fluid").append(threadDiscussionsResult);
                                        }
                                        else {
                                            $("#thread-qa").find(".container-fluid").append(threadDiscussionsResult);
                                        }

                                    }, 100);

                                });
                            }
                        }
                    });
                });
            });

            setReplySubmitForm();

            CommunityApp.common.pullToRefresh(e, function (viewArgs) {
                viewModel.load(viewArgs);
            });
        },
        likeSuccessCallback: function (operation, likes, sender) {
            //CommunityApp.common.authenticatedUser();
            var container = $(sender).closest(".discussion-item");
            var socialInfoContainer = container.find(".social-info");
            var likesMessage = (likes > 1) ? likes + " Likes" : (likes == 1) ? "1 Like" : "";
            socialInfoContainer.html(likesMessage);
            $(sender).closest(".social").addClass("display-none");
            $(sender).closest(".social").siblings().eq(0).removeClass("display-none");
        },
        loadReply: function (e) {
            viewModel.set("dataBound", false);
            viewModel.set("threadId", e.view.params.threadId);
            viewModel.set("postId", e.view.params.postId);
            viewModel.set("level", e.view.params.level);
            viewModel.set("sectionId", e.view.params.sectionId);
            viewModel.set("subject", e.view.params.subject);
            viewModel.set("body", "");
            viewModel.set("hideIcon", true);
            viewModel.set("fileUrl", "");
            viewModel.set("orientation", "");

            viewModel.set("forGiphy", false);
            viewModel.set("selectedGiphy", "");
            viewModel.set("selectedFixedWidthGiphy", "");
            var fromView = e.view.params.from;
            if (fromView !== 'undefined' && typeof fromView !== 'undefined' && fromView === 'selectGiphy') {
                viewModel.set("forGiphy", true);
                var threadData = CommunityApp.session.load(CommunityApp.configuration.giphyConfig.offlineStore);
                CommunityApp.session.remove(CommunityApp.configuration.giphyConfig.offlineStore);
                viewModel.set("body", threadData.body);
                viewModel.set("selectedGiphy", threadData.selectedGiphy);
                viewModel.set("selectedFixedWidthGiphy", threadData.selectedFixedWidthGiphy);
            }

            $('#attchUpload').val('');

            var getPostServiceUrl = function (postId, userId) {
                var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.postConfig.postsPath + CommunityApp.utilities.stringFormat(CommunityApp.configuration.postConfig.postPath, postId, userId);
                return serviceUrl;
            };

            var currentUserId = CommunityApp.base.baseData.currentUser().id;
            var postId = e.view.params.postId;

            var postServiceUrl = getPostServiceUrl(postId, currentUserId);

            var postLoadOptions = {
                url: postServiceUrl,
                requestType: "GET",
                dataType: "JSON",
                callBack: viewModel.fnLoadPostCallback
            };

            var viewArgs = e;
            CommunityApp.dataAccess.callService(postLoadOptions, null, null, null, null, null, function () {
                viewModel.loadReply(viewArgs);
            });

        },
        fnLoadPostCallback: function (response) {
            if (response.data) {
                response.data.PostAuthor.UserProfile.AvatarUrl += "?width=100";
                console.log(response.data.PostAuthor.UserProfile.AvatarUrl);
                viewModel.set("subject", response.data.Subject);
                viewModel.set("longBody", response.data.Body);
                viewModel.set("relativeDate", response.data.RelativeDate);
                viewModel.set("author", response.data.PostAuthor);
                viewModel.set("authorTitle", response.data.PostAuthor.UserProfile.Title);
                viewModel.set("authorFullName", response.data.PostAuthor.UserProfile.FirstName + " " + response.data.PostAuthor.UserProfile.LastName);
                viewModel.set("replySocialMessage", response.data.SocialInfo ? CommunityApp.common.formatSocialMessage(response.data.SocialInfo) : "");
                CommunityApp.common.logTitle("Thread Post Reply To: " + response.data.Subject);

                if (response.data.PostAttachments && typeof response.data.PostAttachments !== "undefined" && response.data.PostAttachments !== null && response.data.PostAttachments.length > 0) {
                    viewModel.set('hasImageAttachment', response.data.PostAttachments[0].IsImage);
                } else {
                    viewModel.set('hasImageAttachment', false);
                }

				var hasExtraAttachment = response.data.PostAttachments && typeof response.data.PostAttachments !== "undefined" && response.data.PostAttachments !== null && response.data.PostAttachments.length > 1;
				viewModel.set("hasExtraAttachmentUrl", hasExtraAttachment);

				if (hasExtraAttachment)
				    viewModel.set("isExtraImageAttachment", response.data.PostAttachments && typeof response.data.PostAttachments !== "undefined" && response.data.PostAttachments !== null && response.data.PostAttachments[1].IsImage);

                var hasImageAttachment = viewModel.get("hasImageAttachment");

                if (response.data.PostAttachments && typeof response.data.PostAttachments !== "undefined" && response.data.PostAttachments !== null && response.data.PostAttachments.length > 0 && !hasImageAttachment) {
                    viewModel.set('hasNonImageAttachment', !response.data.PostAttachments[0].IsImage);
                } else {
                    viewModel.set('hasNonImageAttachment', false);
                }

                var attachmentUrl = response.data.PostAttachments && typeof response.data.PostAttachments !== "undefined" && response.data.PostAttachments !== null && response.data.PostAttachments.length > 0 ? response.data.PostAttachments[0].FileUrl : "";
                viewModel.set("attachmentUrl", attachmentUrl);

				var extraAttachmentUrl = response.data.PostAttachments && typeof response.data.PostAttachments !== "undefined" && response.data.PostAttachments !== null && response.data.PostAttachments.length > 1 ? response.data.PostAttachments[1].FileUrl : "";
				viewModel.set("extraAttachmentUrl", extraAttachmentUrl);

                viewModel.set("dataBound", true);

                setTimeout(
					function () {
					    var scroller = $("#ca-thread-post-reply .km-content").data("kendoMobileScroller");
					    scroller.reset();
					    var offset = $("#reply-form textarea").offset().top;
					    console.log("offset: " + offset);
					    offset -= $('#ca-thread-post-reply header').height() + 10;
					    scroller.scrollTo(0, -offset);
					    $("#txtPostReply").focus();
					    $("#txtPostReply").focus(function () {
					        //var scroller = $("#ca-thread-post-reply .km-content").data("kendoMobileScroller");
					        scroller.reset();
					        $("#reply-form .clearspace").css("height", 0);
					        var clearFixHeight = $(window).height() - $('#reply-form').height() - $('#ca-thread-post-reply header').height() - $('#ca-thread-post-reply footer').height();
					        $("#reply-form .clearspace").css("height", clearFixHeight);
					        scroller.reset();
					        var offset = $("#reply-form textarea").offset().top;
					        console.log("offset: " + offset);
					        offset -= $('#ca-thread-post-reply header').height() + 10;
					        scroller.scrollTo(0, -offset);
					    });

					    $("#txtPostReply").click(function () {
					        //var scroller = $("#ca-thread-post-reply .km-content").data("kendoMobileScroller");
					        scroller.reset();
					        $("#reply-form .clearspace").css("height", 0);
					        var clearFixHeight = $(window).height() - $('#reply-form').height() - $('#ca-thread-post-reply header').height() - $('#ca-thread-post-reply footer').height();
					        $("#reply-form .clearspace").css("height", clearFixHeight);
					        scroller.reset();
					        var offset = $("#reply-form textarea").offset().top;
					        console.log("offset: " + offset);
					        offset -= $('#ca-thread-post-reply header').height() + 10;
					        scroller.scrollTo(0, -offset);
					    });
					}, 500);
            }

            viewModel.set("dataBound", true);
        },
        selectResource: function () {
            var threadData = {};
            threadData.senderView = "#ca-thread-post-reply?postId=" + viewModel.get("postId") + "&threadId=" + viewModel.get("threadId") + "&level=" + viewModel.get("level") + "&sectionId=" + viewModel.get("sectionId") + "&subject=" + viewModel.get("subject");
            threadData.postId = viewModel.get("postId");
            threadData.threadId = viewModel.get("threadId");
            threadData.level = viewModel.get("level");
            threadData.sectionId = viewModel.get("sectionId");
            threadData.subject = viewModel.get("subject");
            threadData.body = viewModel.get("body");
            threadData.senderObject = "replyThread";
            CommunityApp.session.save(CommunityApp.configuration.giphyConfig.offlineStore, threadData);
            var selectResourcePopup = $('#select-resource-dialog').kendoWindow({
                modal: true,
                width: 300,
                resizable: false,
                title: "Resource Selection",
                visible: false,
                // remove the Window from the DOM after closing animation is finished
                deactivate: function (e) { /*e.sender.destroy();*/ }
            }).data("kendoWindow")
			.center().open();
        },
        triggerUpload: function (e) {
            viewModel.set("forGiphy", false);
            if (e === "giphyResource") {
                viewModel.set("forGiphy", true);
                CommunityApp.common.navigateToView("#ca-select-giphy");
            } else {
                $("#attchUpload").click();
                $("#attchUpload").change(function () {
                    CommunityApp.common.readUrl(this, function (response, file) {
                        loadImage.parseMetaData(file, function (data) {
                            var canvas = document.getElementById("discussion-attachment-canvas");
                            var ctx = canvas.getContext('2d');
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            var canvasUpload = document.getElementById("discussion-attachment-canvas-reply-upload");
                            var ctxUpload = canvasUpload.getContext('2d');
                            ctxUpload.clearRect(0, 0, canvasUpload.width, canvasUpload.height);
                            var imgCanvas = new Image();
                            if (data.exif) {
                                imgCanvas.onload = function () {
                                    canvasUpload.width = "500";
                                    canvasUpload.height = imgCanvas.height / imgCanvas.width * 500;
                                    ctxUpload.drawImage(imgCanvas, 0, 0, imgCanvas.width, imgCanvas.height, 0, 0, canvasUpload.width, canvasUpload.height);
                                    ctx.drawImage(imgCanvas, 0, 0, imgCanvas.width, imgCanvas.height, 0, 0, canvas.width, canvas.height);
                                };
                                viewModel.set("orientation", data.exif.get('Orientation'));
                                var loadingImage = loadImage(file,
                                function (img) {
                                    if (typeof img.toDataURL === 'function') {
                                        viewModel.set("fileUrl", img.toDataURL());
                                        imgCanvas.src = img.toDataURL();
                                    }
                                    else {
                                        viewModel.set("fileUrl", response);
                                        imgCanvas.src = response;
                                    }

                                }, { orientation: viewModel.get("orientation"), maxWidth: 500, maxHeight: 600 });

                                if (!loadingImage) {
                                    alert("not load image");
                                }
                            } else {
                                viewModel.set("orientation", "");
                                console.log("not orientation");
                                console.log(file.size);
                                if (file.size > 1048576) {
                                    viewModel.set("fileUrl", response);
                                    imgCanvas.onload = function () {
                                        canvasUpload.width = "500";
                                        canvasUpload.height = imgCanvas.height / imgCanvas.width * 500;
                                        ctx.drawImage(imgCanvas, 0, 0, imgCanvas.width, imgCanvas.height, 0, 0, canvas.width, canvas.height);
                                        ctxUpload.drawImage(imgCanvas, 0, 0, imgCanvas.width, imgCanvas.height, 0, 0, canvasUpload.width, canvasUpload.height);
                                    };
                                    imgCanvas.src = response;
                                } else {
                                    viewModel.set("fileUrl", response);
                                    imgCanvas.onload = function () {
                                        ctx.drawImage(imgCanvas, 0, 0, imgCanvas.width, imgCanvas.height, 0, 0, canvas.width, canvas.height);
                                    };
                                    imgCanvas.src = response;
                                }
                            }
                        });
                        viewModel.set("hideIcon", false);
                    });
                });
            }
        },
        reply: function () {
            //CommunityApp.common.authenticatedUser();

            viewModel.set("processing", true);

            var body = viewModel.get('body');
            var userId = CommunityApp.base.baseData.currentUser().id;
            var threadId = viewModel.get("threadId");
            var postId = viewModel.get("postId");
            var level = viewModel.get("level");
            var sectionId = viewModel.get("sectionId");
            var subject = viewModel.get("subject");

            if (body === "") {
                navigator.notification.alert("Reply body is required", function () { }, "Please Note:");
                setReplySubmitForm();
            } else {
                var serviceUrl = getReplyServiceUrl(userId, threadId, postId);

                var fileData = new FormData();
                var selectedFixedWidthGiphy = viewModel.get("selectedFixedWidthGiphy");
                if (selectedFixedWidthGiphy === "") {
                    var Pic;
                    if (viewModel.get("orientation") === "") {
                        if ($("#attchUpload")[0].files[0] !== 'undefined' && typeof $("#attchUpload")[0].files[0] !== 'undefined') {
                            if ($("#attchUpload")[0].files[0].size > 1048576) {
                                Pic = document.getElementById("discussion-attachment-canvas-reply-upload").toDataURL("image/jpeg");
                                fileData.append("file", CommunityApp.common.dataURItoBlob(Pic));
                            } else {
                                fileData.append("file", $("#attchUpload")[0].files[0]);
                            }
                        }
                    } else {
                        Pic = document.getElementById("discussion-attachment-canvas-reply-upload").toDataURL("image/jpeg");
                        fileData.append("file", CommunityApp.common.dataURItoBlob(Pic));
                        //fileData.append("file", CommunityApp.common.dataURItoBlob(viewModel.get("fileUrl")));
                    }
                    fileData.append("data", JSON.stringify({
                        ReplySubject: subject,
                        ReplyHtmlBody: body,
                        ReplySectionId: sectionId,
                        ParentPostLevel: level,
                        ReplyParentPostId: postId,
                        ReplyThreadId: threadId
                    }));  
                }
                else
                {
                    fileData.append("data", JSON.stringify({
                        ReplySubject: subject,
                        ReplyHtmlBody: body,
                        ReplySectionId: sectionId,
                        ParentPostLevel: level,
                        ReplyParentPostId: postId,
                        ReplyThreadId: threadId,
                        FileUrl: selectedFixedWidthGiphy
                    }));
                }

                var replyOptions = {
                    url: serviceUrl,
                    requestType: "POST",
                    dataType: "JSON",
                    callBack: viewModel.fnReplyCallback,
                    data: fileData
                };

                CommunityApp.dataAccess.callService(replyOptions, null, null, true, false, false);
            }
        },
        fnReplyCallback: function (response) {
            console.log("REPLY RESPONSE: " + JSON.stringify(response));
            if (response.data) {
                if (response.data.HttpStatus === 200) {
                    var threadId = response.data.AdditionalData;

                    if (threadId > 0) {
                        CommunityApp.common.navigateToView("ca-thread-discussion?threadId=" + threadId);
                    }
                    else {
                        CommunityApp.common.showErrorNotification("Error", "Reply already exists");
                        setReplySubmitForm();
                    }
                }
                else {
                    CommunityApp.common.showErrorNotification("Error!", "Unexpected error occurred!");
                }
            }

            viewModel.set("processing", false);
        },
        suggest: function (postId, mark, sender) {
            //CommunityApp.common.authenticatedUser();

            CommunityApp.sounds.suggest();

            var userId = CommunityApp.base.baseData.currentUser().id;
            var threadId = $("#ca-thread-qa").data("kendoMobileView").params.threadId;
            var serviceUrl = getSuggestServiceUrl(userId, threadId, postId);

            var suggestOptions = {
                url: serviceUrl,
                requestType: "POST",
                dataType: "JSON",
                callBack: viewModel.suggestCallback,
                data: "=" + mark,
                sender: sender
            };

            var thatPostId = postId;
            var thatMark = mark;
            var thatSender = sender;
            CommunityApp.dataAccess.callService(suggestOptions);
        },
        suggestCallback: function (response, sender) {
            if (response.data.HttpStatus === 200) {

                var postId = $(sender).attr("data-id");
                var mark = $(sender).attr("data-suggest");
                var currentUser = CommunityApp.base.baseData.currentUser();
                var userId = currentUser.id;
                var username = currentUser.username;

                if (mark == "true") {
                    $(sender).closest("li").removeClass("display-block");
                    $(sender).closest("li").addClass("display-none");
                    $(sender).closest("li").siblings(".unsuggest").removeClass("display-none");
                    $(sender).closest(".discussion-item").find(".callout-1").addClass("suggested");
                    $(sender).closest(".discussion-item").find(".arrow-up").addClass("suggested");
                }
                else {
                    $(sender).closest("li").removeClass("display-block");
                    $(sender).closest("li").addClass("display-none");
                    $(sender).closest("li").siblings(".suggest").removeClass("display-none");
                    $(sender).closest(".discussion-item").find(".callout-1").removeClass("suggested");
                    $(sender).closest(".discussion-item").find(".arrow-up").removeClass("suggested");
                    $(sender).closest(".discussion-item").find(".suggestedby").addClass("display-none");
                }

            } else {
                CommunityApp.common.showErrorNotification("Error!", "Unexpected error, please try again later!");
            }
        },
        verify: function (postId, mark, sender) {
            //CommunityApp.common.authenticatedUser();

            CommunityApp.sounds.verify();

            var userId = CommunityApp.base.baseData.currentUser().id;
            var threadId = $("#ca-thread-qa").data("kendoMobileView").params.threadId;
            var serviceUrl = getVerifyServiceUrl(userId, threadId, postId);

            var verifyOptions = {
                url: serviceUrl,
                requestType: "POST",
                dataType: "JSON",
                callBack: viewModel.verifyCallback,
                data: "=" + mark,
                sender: sender
            };

            var thatPostId = postId;
            var thatMark = mark;
            var thatSender = sender;
            CommunityApp.dataAccess.callService(verifyOptions);
        },
        verifyCallback: function (response, sender) {
            if (response.data.HttpStatus === 200) {
                var postId = $(sender).attr("data-id");
                var mark = $(sender).attr("data-verify");
                var currentUser = CommunityApp.base.baseData.currentUser();
                var userId = currentUser.id;
                var username = currentUser.username;

                if (mark == "true") {
                    $(sender).closest("li").removeClass("display-block");
                    $(sender).closest("li").addClass("display-none");
                    $(sender).closest("li").siblings('.unverify').removeClass("display-none");
                    $(sender).closest("li").siblings('.unsuggest').addClass("display-none");
                    $(sender).closest("li").siblings('.suggest').addClass("display-none");
                    $(sender).closest(".discussion-item").find(".callout-1").addClass("verified");
                    $(sender).closest(".discussion-item").find(".arrow-up").addClass("verified");
                    $(sender).closest(".discussion-item").find(".suggestedby").addClass("display-none");
                }
                else {
                    $(sender).closest("li").removeClass("display-block");
                    $(sender).closest("li").addClass("display-none");
                    $(sender).closest("li").siblings('.suggest').removeClass("display-none");
                    $(sender).closest("li").siblings('.verify').removeClass("display-none");
                    $(sender).closest("li").siblings('.unsuggest').addClass("display-none");
                    $(sender).closest("li").siblings('.unverify').addClass("display-none");
                    $(sender).closest(".discussion-item").find(".callout-1").removeClass("verified");
                    $(sender).closest(".discussion-item").find(".arrow-up").removeClass("verified");
                    $(sender).closest(".discussion-item").find(".callout-1").removeClass("suggested");
                    $(sender).closest(".discussion-item").find(".arrow-up").removeClass("suggested");
                    $(sender).closest(".discussion-item").find(".verifiedby").addClass("display-none");
                    $(sender).closest(".discussion-item").find(".suggestedby").addClass("display-none");
                }

            } else {
                CommunityApp.common.showErrorNotification("Error!", "Unexpected error, please try again later!");
            }
        },
        onTyping: function () {
            var scroller = $("#ca-thread-post-reply .km-content").data("kendoMobileScroller");
            var clearFixHeight = $(window).height() - ($('#reply-form').height() - $("#reply-form .clearspace").height()) - $('#ca-thread-post-reply header').height() - $('#ca-thread-post-reply footer').height();
            $("#reply-form .clearspace").css("height", clearFixHeight);
            scroller.reset();
            var offset = $("#reply-form textarea").offset().top;
            offset -= $('#ca-thread-post-reply header').height() + 10;
            scroller.scrollTo(0, -offset);
        },
        onFinishedType: function (e) {
            viewModel.set("typing", false);
        },
        loadPollData: function (poll) {
            viewModel.set('hasPoll', true);
            if (poll.Description === null || poll.Description === "")
                viewModel.set("pollDescription", poll.Name);
            else
                viewModel.set("pollDescription", poll.Description);
            if (poll.NumberOfAnswers === 0)
                viewModel.set("pollAnsweredUserCountText", "No one answered this.");
            else if (poll.NumberOfAnswers === 1)
                viewModel.set("pollAnsweredUserCountText", "1 user answered this.");
            else
                viewModel.set("pollAnsweredUserCountText", poll.NumberOfAnswers + " users answered this.");
            var pollItemTemplate = kendo.template($('#poll-item-tmpl').html());
            var pollItemResult = kendo.render(pollItemTemplate, poll.PollItems);
            $("#discussion-poll-items-list").find(".poll-item-fieldlist").empty();
            $("#discussion-poll-items-list").find(".poll-item-fieldlist").attr("style", "");
            $("#discussion-poll-items-list").find(".poll-item-fieldlist").append(pollItemResult);
            if (poll.AlreadyAnswered === true) {
                var pollGraphUrl = getPollGraphUrl(poll.Id);
                var pollGraphOptions = {
                    url: pollGraphUrl,
                    requestType: "GET",
                    dataType: "JSON",
                    callBack: viewModel.loadPollGraphCallback
                };
                var pollData = poll;
                CommunityApp.dataAccess.callService(pollGraphOptions, null, null, null, null, null, function () {
                    viewModel.loadPollData(pollData);
                });
                viewModel.set("unansweredPoll", false);
            } else
                viewModel.set("unansweredPoll", true);
        },
        loadPollGraphCallback: function (response) {
            if (response.data) {
                var data = response.data;
                var seriesData = [];
                for (var i = 0; i < data.length; i++) {
                    var temp = {};
                    temp.category = data[i].Name;
                    temp.value = data[i].Value;
                    temp.color = data[i].Color;
                    seriesData.push(temp);
                }
                $('#discussion-poll-chart').kendoChart({
                    title: {
                        text: "",
                        visible: false
                    },
                    legend: {
                        visible: false
                    },
                    chartArea: {
                        background: "",
                        width: 250,
                        height: 250
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
                $("#discussion-poll-legend").find(".poll-legend").empty();
                $("#discussion-poll-legend").find(".poll-legend").attr("style", "");
                $("#discussion-poll-legend").find(".poll-legend").append(pollLegendItemResult);

                viewModel.set("showChart", true);
            }
        },
        vote: function () {
            var serviceUrl = getVoteToPollUrl();
            var dataUserId = CommunityApp.base.baseData.currentUser().id;
            var dataPollId = viewModel.get("poll").Id;
            var voteString = $('#discussion-poll-vote-form input[name=pollItem]:checked').val();

            if (typeof voteString === "undefined") {
                CommunityApp.common.showErrorNotification("Error!", "Please select one of the answers!");
                setVoteToPollSubmitForm();
                return;
            }

            console.log(dataPollId);
            console.log($('#discussion-poll-vote-form input[name=pollItem]:checked').val());

            var postData = {
                userId: dataUserId,
                pollId: dataPollId,
                vote: voteString
            };

            console.log("vote: " + voteString + " pollId: " + dataPollId + " userId: " + dataUserId);

            var voteToPollOptions = {
                url: serviceUrl,
                requestType: "POST",
                dataType: "JSON",
                data: postData,
                callBack: viewModel.fnVoteToPollCallback
            };

            CommunityApp.dataAccess.callService(voteToPollOptions);
        },
        fnVoteToPollCallback: function (response) {
            console.log("voteCallback: ");
            console.log(response);
            if (response.data && response.data > 0) {
                CommunityApp.common.showSuccessNotification("Posted your vote successfully!");
                var poll = viewModel.get('poll');
                poll.AlreadyAnswered = true;
                poll.HasNoAnswers = false;
                poll.NumberOfAnswers += 1;
                viewModel.loadPollData(poll);
            }
            else {
                CommunityApp.common.showErrorNotification("Unexpected Error!", "Unexpected error occurred. Try again later!");
                setVoteToPollSubmitForm();
            }
        },
        mute: function (e) {
            var mute = e.checked;
            var userId = CommunityApp.base.baseData.currentUser().id;
            var threadId = $("#ca-thread-discussion").data("kendoMobileView").params.threadId;

            var muteServiceUrl = getThreadMuteServiceUrl(userId, threadId);

            var muteOptions = {
                url: muteServiceUrl,
                requestType: "POST",
                dataType: "JSON",
                data: "=" + mute,
                callBack: viewModel.fnMuteCallback,
                sender: {
                    mute: mute
                }
            };

            CommunityApp.dataAccess.callService(muteOptions);
        },
        fnMuteCallback: function (response, sender) {
            if (response && response.data) {
                if (response.data.HttpStatus == 200) {
                    if (sender.mute) {
                        CommunityApp.common.showSuccessNotification("Stopped successfully!");
                    }
                    else {
                        CommunityApp.common.showSuccessNotification("Unmuted successfully!");
                    }
                }
            }
        },
        loadMute: function (e) {
            var threadId = e.view.params.threadId;
            var userId = CommunityApp.base.baseData.currentUser().id;

            var muteServiceUrl = getThreadMuteServiceUrl(userId, threadId);

            var muteOptions = {
                url: muteServiceUrl,
                requestType: "GET",
                dataType: "JSON",
                callBack: viewModel.fnLoadMuteCallback
            };

            CommunityApp.dataAccess.callService(muteOptions);
        },
        fnLoadMuteCallback: function (response) {
            if (response && response.data) {
                viewModel.set("isMuted", response.data.Mute);
            }
        }
    });

    return {
        viewModel: viewModel
    };
})();