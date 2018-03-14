CommunityApp.post = (function () {

    var getPostServiceUrl = function (postId, userId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.postConfig.postsPath + CommunityApp.utilities.stringFormat(CommunityApp.configuration.postConfig.postPath, postId, userId);
        return serviceUrl;
    };

    var getDeleteCommentServiceUrl = function (postId, commentId, userId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.postConfig.postsPath +
            CommunityApp.configuration.postConfig.deleteCommentPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, postId, commentId, userId);
    };

    var getPostViewsServiceUrl = function (postId, userId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.postConfig.postsPath +
            CommunityApp.configuration.postConfig.postViewsPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, postId, userId);
    };

    var getAddCommentServiceUrl = function (postId, userId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.postConfig.postsPath +
            CommunityApp.configuration.postConfig.addCommentPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, postId, userId);
    };    

    var getDeletePostServiceUrl = function (postId) {
        return CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.postConfig.postsPath + postId;
    };

    var deletePostAttachmentServiceUrl = function (attachmentId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.forumConfig.forumsPath + CommunityApp.configuration.forumConfig.deleteAttachment;
        return CommunityApp.utilities.stringFormat(serviceUrl, attachmentId);
    };

    var setCommentButton = function () {
        $("#commentForm").unbind('submit');
        $("#commentForm").one('submit', function () {
            $("button[type='submit']", this).html("Processing...").attr('disabled', 'disabled');
            CommunityApp.post.operations({ addCommentSuccessCallback: CommunityApp.post.viewModel.fnAddCommentCallback }).addComment($('#txtComment').val());
            return true;
        });
    };


    var viewModel = kendo.observable({
        id: 0,
        subject: "",
        shortBody: "",
        longBody: "",
        readMore: true,
        isShortText: false,
        postDateFormatted: new Date(),
        totalViews: 0,
        author: {},
        attachments: [],
        comments: [],
        commentsFound: false,
        emptyCommentsMessage: "",
        social: {},
        isStatus: false,
        likesText: "",
        commentsText: "",
        mode: "",
        rate: 0,
        totalRates: 0,
        rateText: "",
        isThreadFollowed: false,
        sectionPage: "",
        sectionTitle: "",
        authorFullName: "",
        authorTitle: "",
        dataBound: false,
        isComment: false,
        loadingAttachment: false,
        editAllowed: false,
        postLevel: 0,
        parentId: 0,
        parentPostUrl: function () {
            return "#ca-post?postId=" + viewModel.get("parentId");
        },
        isCommentPost: function () {
            var postLevel = viewModel.get("postLevel");
            return postLevel > 1;
        },
        isCommentPostReady: function () {
            var isCommentPost = viewModel.isCommentPost();
            var dataBound = viewModel.get("dataBound");
            return isCommentPost && dataBound;
        },
        isCommentAndFound: function () {
            var isCommentPost = viewModel.isCommentPost();
            var commentsFound = viewModel.get("commentsFound");
            return isCommentPost && commentsFound;
        },
        shortInfo: function () {
            var info = viewModel.get("postDateFormatted") + "  .  " + viewModel.get("totalViews") + " Views";
            var likes = viewModel.get("likesText");
            var comments = viewModel.get("commentsText");
            if (likes !== "") {
                info += "  .  " + likes;
            }

            if (comments !== "") {
                info += "  .  " + comments;
            }

            return info;
        },
        attachmentImageUrl: function () {
            var attachments = viewModel.get("attachments");
            var attachmentUrl = attachments.length > 0 ? attachments[0].FileUrl + "?width=500&height=350" : "";
            attachmentUrl = attachmentUrl.replace("samsung.pulsellc.com", "localhost:7777");
            return attachmentUrl;
        },
        authorProfileUrl: function () {
            var author = viewModel.get("author");
            return "#ca-user-profile?userId=" + author.Id;
        },
        page: function (url) {
            return url + viewModel.get("id") + "&mode=" + viewModel.get("mode");
        },
        isAllowedToDeleteComment: function (authorId) {
            var parentPostAuthor = viewModel.get("author");
            var allowed = CommunityApp.base.baseData.currentUser().id == authorId || CommunityApp.base.baseData.currentUser().id == parentPostAuthor.Id;
            return allowed;
        },
        readMoreClass: function () {
            return viewModel.get("isStatus") === true ? "pull-left read-more-2 no-text-decoration" : "pull-left read-more no-text-decoration";
        },
        load: function (e) {
            //CommunityApp.common.authenticatedUser();

            viewModel.set("attachments", []);
            viewModel.set("dataBound", false);
            viewModel.set("longBody", "");
            viewModel.set("loadingAttachment", true);

            var topAttachment = document.getElementById("topPostAttachment");
            topAttachment.addEventListener('load', function () { viewModel.set("loadingAttachment", false); }, false);

            if (e.view.id == "#ca-comment-add") {
                viewModel.set("isComment", true);

                setCommentButton();
            }

            var mainScroller = $("#mainScroller").data("kendoMobileScroller");
            if (mainScroller !== null && typeof mainScroller !== "undefined") {
                mainScroller.reset();
            }

            var txtComment = $("#txtComment");
            var currentView = e.view;

            if (txtComment) {
                $('#commentForm .clearfix').css("height", 0);
                var clearFixHeight = $(window).height() - $('#commentForm').height() - $('#ca-comment-add header').height() - $('#ca-comment-add footer').height();
                $('#commentForm .clearfix').css("height", clearFixHeight);
                txtComment.val("");
                txtComment.click(function () {
                    if (mainScroller !== null && typeof mainScroller !== "undefined") {
                        mainScroller.reset();
                    }
                    if (typeof currentView.scroller !== 'undefined') {
                        currentView.scroller.reset();
                    }
                    var offset = $('#commentForm').offset().top;
                    offset -= $('#ca-comment-add header').height() + 10;
                    if (offset === 0)
                        offset = 100;
                    if (typeof currentView.scroller !== 'undefined') {
                        currentView.scroller.scrollTo(0, -offset);
                    }

                    //viewModel.set("dataBound", false);
                });
                txtComment.focus(function () {
                    if (mainScroller !== null && typeof mainScroller !== "undefined") {
                        mainScroller.reset();
                    }
                    if (typeof currentView.scroller !== 'undefined') {
                        currentView.scroller.reset();
                    }
                    var offset = $('#commentForm').offset().top;
                    offset -= $('#ca-comment-add header').height() + 10;
                    if (offset === 0)
                        offset = 100;
                    if (typeof currentView.scroller !== 'undefined') {
                        currentView.scroller.scrollTo(0, -offset);
                    }

                    //viewModel.set("dataBound", false);
                });
                /*txtComment.blur(function () {
                    if (mainScroller !== null && typeof mainScroller !== "undefined") {
                        mainScroller.reset();
                    }  

                    if (typeof currentView.scroller !== 'undefined')
                    {
                        currentView.scroller.reset();
                    }  
                    
                    viewModel.set("dataBound", true);
                });*/
            }

            $("#ratePost, #ratePost-bottom").raty({
                cancelOff: "images/cancel-off.png",
                cancelOn: "images/cancel-on.png",
                starHalf: "images/star-half.png",
                starOff: "images/star-off.png",
                starOn: "images/star-on.png",
                click: function (score, evt) {
                    CommunityApp.sounds.post();

                    var rate = score;
                    var postId = viewModel.get("id");
                    var userId = CommunityApp.base.baseData.currentUser().id;

                    operations({ rateCompleteCallback: viewModel.rateCallback }).ratePost(postId, userId, rate);
                }
            });

            var currentUserId = CommunityApp.base.baseData.currentUser().id;
            var postId = e.view.params.postId;
            var mode = e.view.params.mode;
            var operation = e.view.params.oper;

            viewModel.set("mode", mode);

            var data = {
                mode: mode,
                operation: operation
            };

            var postServiceUrl = getPostServiceUrl(postId, currentUserId);
            var postViewsServiceUrl = getPostViewsServiceUrl(postId, currentUserId);

            if (postId !== 'undefined' && typeof postId !== 'undefined') {
                var postLoadOptions = {
                    url: postServiceUrl,
                    requestType: "GET",
                    dataType: "JSON",
                    callBack: viewModel.fnLoadCallBack,
                    sender: JSON.stringify(data)
                };

                var viewArgs = e;

                CommunityApp.dataAccess.callService(postLoadOptions, null, null, null, null, null, function () {
                    viewModel.load(viewArgs);
                });

                var postViewsOptions = {
                    url: postViewsServiceUrl,
                    requestType: "POST",
                    dataType: "JSON"
                };

                CommunityApp.dataAccess.callService(postViewsOptions);

                var postCommentsList = $("#post-comments").data("kendoMobileListView");

                if (postCommentsList && postCommentsList !== null) {
                    postCommentsList.bind("dataBound", function (e) {
                        $("a[name='deleteComment']").each(function () {
                            var authorId = $(this).attr("data-authorid");
                            if (viewModel.isAllowedToDeleteComment(authorId))
                                $(this).removeClass("display-none");
                        });
                    });
                }
            }

        },
        switchBody: function () {
            var isReadMore = viewModel.get("readMore");
            viewModel.set("readMore", !isReadMore);
        },
        fnLoadCallBack: function (response, data) {
            if (response.data) {
                CommunityApp.common.logTitle("Post: " + response.data.Subject);

                data = JSON.parse(data);
                var mode = data.mode;
                var operation = data.operation;

                response.data.PostAuthor.UserProfile.AvatarUrl += "?width=100";

                viewModel.set("id", response.data.Id);
                viewModel.set("subject", response.data.Subject);
                viewModel.set("shortBody", CommunityApp.utilities.getChars(response.data.Body, 50));
                var isLong = CommunityApp.utilities.isLongerThanChars(response.data.Body, 50);
                viewModel.set("readMore", isLong);
                viewModel.set("isShortText", !isLong);
                viewModel.set("longBody", response.data.Body);
                viewModel.set("postDateFormatted", response.data.PostDateText);
                viewModel.set("totalViews", response.data.TotalViews);
                viewModel.set("author", response.data.PostAuthor);
                viewModel.set("authorTitle", response.data.PostAuthor.UserProfile.Title);
                viewModel.set("attachments", response.data.PostAttachments);
                viewModel.set("authorFullName", response.data.PostAuthor.UserProfile.FirstName + " " + response.data.PostAuthor.UserProfile.LastName);
                viewModel.set("comments", response.data.PostComments);
                viewModel.set("commentsFound", response.data.PostComments.length > 0);
                viewModel.set("emptyCommentsMessage", "Be the first to comment to " + response.data.PostAuthor.UserProfile.FirstName);
                viewModel.set("social", response.data.SocialInfo);
                viewModel.set("isStatus", mode === "status");
                viewModel.set("rate", response.data.Rate);
                viewModel.set("totalRates", response.data.TotalRatings);
                viewModel.set("isThreadFollowed", response.data.IsThreadFollowed);
                viewModel.set("mode", mode ? mode : "post");
                viewModel.set("sectionPage", "#ca-section-posts?sectionId=" + response.data.PostThread.ThreadSection.Id);
                viewModel.set("sectionTitle", "More " + response.data.PostThread.ThreadSection.Name);
                var allowed = CommunityApp.base.baseData.currentUser().id == response.data.PostAuthor.Id;
                console.log("Author Id : " + response.data.PostAuthor.Id);
                console.log("Current User Id : " + CommunityApp.base.baseData.currentUser().id);
                console.log("Allow To Delete Attachment : " + allowed);
                viewModel.set('editAllowed', allowed);
                viewModel.set("postLevel", response.data.PostLevel);
                viewModel.set("parentId", response.data.ParentId);
                if (response.data.SocialInfo) {
                    if (response.data.SocialInfo.LikesCount > 1) {
                        viewModel.set("likesText", response.data.SocialInfo.LikesCount + " likes");
                    }
                    else if (response.data.SocialInfo.LikesCount == 1) {
                        viewModel.set("likesText", "1 like");
                    }
                    else {
                        viewModel.set("likesText", "");
                    }

                    if (response.data.SocialInfo.CommentsCount > 1) {
                        viewModel.set("commentsText", response.data.SocialInfo.CommentsCount + " comments");
                    }
                    else if (response.data.SocialInfo.CommentsCount == 1) {
                        viewModel.set("commentsText", "1 comment");
                    }
                    else {
                        viewModel.set("commentsText", "");
                    }
                }

                if (viewModel.get("totalRates") > 0) {
                    viewModel.set("rateText", "(" + viewModel.get("totalRates") + ")");
                }
                else {
                    viewModel.set("rateText", "");
                }

                $("#listBottomScroller").removeClass("height-4");
                $("#listBottomScroller").removeClass("height-5");
                $("#listBottomScroller").addClass(mode === "status" ? "height-4" : "height-5");

                $('#ratePost, #ratePost-bottom').raty('score', viewModel.get("rate"));
                $("#ratePost, #ratePost-bottom").prev().html(viewModel.get("rateText"));

                if (operation && operation !== null) {
                    //scroll to last comment posted
                }

                viewModel.set("dataBound", true);

                if (viewModel.get("isComment") === true) {
                    $('#txtComment').focus();
                }
            }
        },
        fnDeleteCommentCallback: function (response, sender) {
            $(sender).closest('li').remove();
            CommunityApp.common.showSuccessNotification("Comment has been deleted successfully!");
        },
        fnAddCommentCallback: function (httpStatus, parentPostId, mode) {
            if (httpStatus === 200) {
                CommunityApp.common.navigateToView("ca-post?postId=" + parentPostId + "&mode=" + mode + "&oper=comment");
            }
            else {
                CommunityApp.common.showErrorNotification("Error!", "Unexpected error, please try again later!");
            }

            $("button[type='submit']", "#commentForm").html("<span class='glyphicon glyphicon-plus margin-2'></span>&nbsp;Comment").removeAttr("disabled");
            setCommentButton();
        },
        resetAddComment: function (e) {
            $("#txtComment").val("");
        },
        deletePostAttachment: function (e) {
            var attachmentId = parseInt(e.getAttribute("data-param"));
            console.log("Attachment Id is : " + attachmentId);
            if (attachmentId === 0) {
                var attachments = viewModel.get("attachments");
                if (attachments && typeof attachments !== "undefined" && attachments !== null && attachments.length > 0) {
                    attachmentId = attachments[0].AttachmentId;
                    console.log("New Attachment Id is : " + attachmentId);
                    var deleteAttachmentServiceUrl = deletePostAttachmentServiceUrl(attachmentId);
                    console.log("deleteAttachmentServiceUrl " + deleteAttachmentServiceUrl);
                    var deleteAttachmentServiceOptions = {
                        url: deleteAttachmentServiceUrl,
                        requestType: "POST",
                        dataType: "JSON",
                        callBack: viewModel.DeleteAttachmentCallBack
                    };
                    CommunityApp.dataAccess.callService(deleteAttachmentServiceOptions);
                }
            }
        },
        DeleteAttachmentCallBack: function (response) {
            console.log("Delete Attachment Callback " + response.data);
            $("#attachmentContainer_" + response.data).hide();
            $("#attachmentSpace").hide();
            $("#attachmentuserinfo").hide();
        },
        topAttachmentId: function () {
            var attachments = viewModel.get("attachments");
            if (attachments && typeof attachments !== "undefined" && attachments !== null && attachments.length > 0) {
                return "attachmentContainer_" + attachments[0].AttachmentId;
            } else {
                return "attachmentContainer_0";
            }
        },
        likePost: function (e) {
            operations({ likeSuccessCallback: viewModel.likeSuccessCallback }).like(viewModel.get("id"), true);
        },
        unlikePost: function () {
            operations({ likeSuccessCallback: viewModel.likeSuccessCallback }).like(viewModel.get("id"), false);
        },
        likeSuccessCallback: function (operation) {
            updateSocialInfo(viewModel.get("social"), operation === "like");
        },
        onActionsPopoverOpen: function (e) {
            var followSwitch = $("#swtFollowPost").data("kendoMobileSwitch");
            followSwitch.check(viewModel.get("isThreadFollowed"));
        },
        rateCallback: function (status, newRate) {
            switch (status) {
                case 406:
                case 200:
                    CommunityApp.common.showSuccessNotification("Thank you for rating!");
                    break;
                case 404:
                case 412:
                case 500:
                    CommunityApp.common.showErrorNotification("Error!", "Unexpected error, please try again later!");
                    break;
            }
        },
        follow: function (e) {
            var postId = viewModel.get("id");
            operations({ followCompleteCallback: viewModel.followCallback }).follow(postId, e.checked);
        },
        followCallback: function (status, subscribe) {
            switch (status) {
                case 200:
                    if (subscribe)
                        CommunityApp.common.showSuccessNotification("Followed Successfully!");
                    else
                        CommunityApp.common.showSuccessNotification("Unfollowed Successfully!");
                    break;
                case 406:
                    CommunityApp.common.showErrorNotification("Followed Before!", "You have already followed this post!");
                    break;
                case 404:
                case 412:
                case 500:
                    CommunityApp.common.showErrorNotification("Error!", "Unexpected error, please try again later!");
                    break;
            }
        },
        openFile: function (fileUrl) {
            var fileName = fileUrl.substr(fileUrl.lastIndexOf('/') + 1);
            var type = fileName.substr((fileName.lastIndexOf('.') + 1));
            if (fileUrl !== null) {
                switch (type.toLowerCase()) {
                    case "gif":
                    case "png":
                    case "jpg":
                    case "jpeg":
                    case "pdf":
                    case "doc":
                    case "docx":
                    case "xls":
                    case "xlsx":
                        console.log("fileUrl: " + fileUrl);
                        var folderName = "Download";

                        if (CommunityApp.common.deviceType() === "android") {
                            folderName = "Download";
                        } else if (CommunityApp.common.deviceType() === "iphone" || CommunityApp.common.deviceType() === "ipad") {
                            folderName = "Download";
                        }
                        console.log("FileName: " + fileName);

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

                            $('#ca-post #mainScroller').hide();
                            $('<div class="k-loading-mask" style="width: 100%; height: 100%; top: 0px; left: 0px;"><span class="k-loading-text">Downloading...</span><div class="k-loading-image"></div><div class="k-loading-color"></div></div>').appendTo('#ca-post .km-content');

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
									          downloadFile(fileUrl, fp);
									      }
									  },
									  errorCallback);
                                }
                                else {
                                    downloadFile(fileUrl, fp);
                                }
                            }, null);
                        };

                        var fileSystemFail = function (evt) {
                            //Unable to access file system
                            CommunityApp.common.showErrorNotification("Error!", "Unexpected error, please try again later!");
                        };

                        if (fileUrl === null || fileUrl === "") {
                            CommunityApp.common.showErrorNotification("Error!", "Unexpected error, please try again later!");
                            return;
                        } else {
                            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileSystemSuccess, fileSystemFail);
                        }


                        var downloadFile = function (fileUrl, fp) {
                            var fileTransfer = new FileTransfer();
                            fileUrl = fileUrl.replace(/ /g, "%20");
                            console.log("replaced fileUrl: " + fileUrl);
                            fileTransfer.download(fileUrl, fp,
								function (entry) {
								    $('#ca-post .k-loading-mask').remove();
								    $('#ca-post #mainScroller').show();

								    var localFileUrl = entry.toURL();
								    localFileUrl = localFileUrl.replace(/%20/g, " ");

								    cordova.InAppBrowser.open(encodeURI(localFileUrl), "_system");
								},
								function (error) {
								    //Download abort errors or download failed errors
								    $('#ca-post .k-loading-mask').remove();
								    $('#ca-post #mainScroller').show();
								    CommunityApp.common.showErrorNotification("Error!", "Unexpected error, please try again later!");
								    alert("Please check the application permission.");
								}
							);
                        };



                        break;
                    default:
                        cordova.InAppBrowser.open(encodeURI(fileUrl), "_system");
                        break;
                }
            }
        },
        likeCommentSuccessCallback: function (operation, likes, sender) {
            if (operation == "like") {
                $(sender).addClass("display-none");
                $(sender).prev().removeClass("display-none");
                $(sender).next().html("(" + likes + ")");
                $(sender).next().removeClass("display-none");
            }
            else {
                $(sender).addClass("display-none");
                $(sender).next().removeClass("display-none");
                $(sender).next().next().html("(" + likes + ")");
                if (likes > 0) {
                    $(sender).next().next().removeClass("display-none");
                }
                else {
                    $(sender).next().next().addClass("display-none");
                }
            }
        }
    });

    var updateSocialInfo = function (social, like) {
        var newSocial;
        if (like) {
            newSocial = {
                UserLiked: true,
                LikesCount: social.LikesCount + 1,
                UserId: social.UserId,
                PosyId: social.PostId,
                CommentsCount: social.CommentsCount
            };
        }
        else {
            newSocial = {
                UserLiked: false,
                LikesCount: social.LikesCount - 1,
                UserId: social.UserId,
                PosyId: social.PostId,
                CommentsCount: social.CommentsCount
            };
        }

        if (newSocial.LikesCount > 1) {
            viewModel.set("likesText", newSocial.LikesCount + " likes");
        }
        else if (newSocial.LikesCount == 1) {
            viewModel.set("likesText", "1 like");
        } else {
            viewModel.set("likesText", "");
        }

        if (newSocial.CommentsCount > 1) {
            viewModel.set("commentsText", newSocial.CommentsCount + " comments");
        }
        else if (newSocial.CommentsCount == 1) {
            viewModel.set("commentsText", "1 comment");
        } else {
            viewModel.set("commentsText", "");
        }

        viewModel.set("social", newSocial);
    };

    var operations = function (options) {

        var getLikeServiceUrl = function (postId, userId, like) {
            var likeServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.postConfig.postsPath +
                       CommunityApp.utilities.stringFormat(like ? CommunityApp.configuration.postConfig.likePostPath : CommunityApp.configuration.postConfig.unlikePostPath, postId, userId);
            return likeServiceUrl;
        };

        var getRatePostServiceUrl = function (postId, userId) {
            var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.postConfig.postsPath +
                CommunityApp.configuration.postConfig.ratePostPath;

            return CommunityApp.utilities.stringFormat(serviceUrl, postId, userId);
        };

        var getSubscribeServiceUrl = function (postId, userId) {
            var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.postConfig.postsPath +
                CommunityApp.configuration.postConfig.subscribePath;
            return CommunityApp.utilities.stringFormat(serviceUrl, postId, userId);
        };

        return {
            like: function (postId, like, sender) {
                //CommunityApp.common.authenticatedUser();
                var likerId = CommunityApp.base.baseData.currentUser().id;

                if (likerId && likerId !== 0) {
                    var likeServiceUrl = getLikeServiceUrl(postId, likerId, like);

                    if (like)
                        CommunityApp.sounds.like();
                    else
                        CommunityApp.sounds.unlike();

                    var likeServiceOptions = {
                        url: likeServiceUrl,
                        requestType: "POST",
                        dataType: "JSON",
                        callBack: this.fnLikeCallBack,
                        sender: sender
                    };

                    var thatPostId = postId;
                    var thatLike = like;
                    var thatSender = sender;
                    CommunityApp.dataAccess.callService(likeServiceOptions);
                }
            },
            fnLikeCallBack: function (response, sender) {
                if (response.data.HttpStatus === 200) {

                    var operation = response.data.AdditionalData.toString().toLowerCase().split(',')[0];
                    var likes = response.data.AdditionalData.toString().toLowerCase().split(',')[1];

                    if (options && options.likeSuccessCallback)
                        options.likeSuccessCallback(operation, likes, sender);

                }
            },
            deleteComment: function (postId, commentId, sender) {
                //CommunityApp.common.authenticatedUser();
                CommunityApp.sounds.del();

                var currentUserId = CommunityApp.base.baseData.currentUser().id;
                var serviceUrl = getDeleteCommentServiceUrl(postId, commentId, currentUserId);

                var deleteCommentServiceOptions = {
                    url: serviceUrl,
                    requestType: "DELETE",
                    dataType: "JSON",
                    callBack: this.fnDeleteCommentCallback,
                    sender: sender
                };

                CommunityApp.dataAccess.callService(deleteCommentServiceOptions);
            },
            fnDeleteCommentCallback: function (response, sender) {
                options.commentSuccessCallback(response, sender);
            },
            addComment: function (commentBody) {
                //CommunityApp.common.authenticatedUser();

                var validator = $("textarea", "#add-comment-form").kendoValidator().data("kendoValidator");

                if (validator.validate()) {
                    CommunityApp.sounds.post();

                    var currentUserId = CommunityApp.base.baseData.currentUser().id;
                    var addCommentView = $("#ca-comment-add").data("kendoMobileView");
                    var parentPostId = addCommentView.params.postId;
                    var mode = addCommentView.params.mode;
                    var subject = "posted a comment through the mobile app";

                    var serviceUrl = getAddCommentServiceUrl(parentPostId, currentUserId);

                    var commentsPostOptions = {
                        url: serviceUrl,
                        requestType: "POST",
                        dataType: "JSON",
                        data: {
                            Subject: subject,
                            Body: commentBody,
                            ExpirationDate: (new Date().getMonth() + 1) + "/" + new Date().getDate() + "/" + new Date().getFullYear()
                        },
                        callBack: this.fnPostCommentCallBack,
                        sender: parentPostId + "," + mode
                    };

                    CommunityApp.dataAccess.callService(commentsPostOptions);
                }

            },
            fnPostCommentCallBack: function (response, sender) {

                var parentPostId = sender.split(',')[0];
                var mode = sender.split(',')[1];
                options.addCommentSuccessCallback(response.data.HttpStatus, parentPostId, mode);
            },
            deletePost: function (postId, sender) {
                //CommunityApp.common.authenticatedUser();
                CommunityApp.sounds.del();

                var serviceUrl = getDeletePostServiceUrl(postId);

                var deletePostOptions = {
                    url: serviceUrl,
                    requestType: "DELETE",
                    dataType: "JSON",
                    callBack: this.fnDeleteCallback,
                    sender: sender
                };

                CommunityApp.dataAccess.callService(deletePostOptions);
            },
            fnDeleteCallback: function (response, sender) {
                options.deletePostSuccessCallback(response.data.HttpStatus, sender);
            },
            ratePost: function (postId, userId, rate) {
                //CommunityApp.common.authenticatedUser();

                var serviceUrl = getRatePostServiceUrl(postId, userId);

                console.log(rate);

                var ratePostOptions = {
                    url: serviceUrl,
                    requestType: "POST",
                    dataType: "JSON",
                    data: "=" + rate,
                    callBack: this.fnRateCallback
                };

                CommunityApp.dataAccess.callService(ratePostOptions);
            },
            fnRateCallback: function (response) {
                options.rateCompleteCallback(response.data.HttpStatus, response.data.AdditionalData);
            },
            follow: function (postId, subscribe) {
                //CommunityApp.common.authenticatedUser();

                var userId = CommunityApp.base.baseData.currentUser().id;
                var serviceUrl = getSubscribeServiceUrl(postId, userId);

                var followOptions = {
                    url: serviceUrl,
                    requestType: "POST",
                    dataType: "JSON",
                    callBack: this.fnFollowCallback,
                    data: "=" + subscribe,
                    sender: subscribe
                };

                CommunityApp.dataAccess.callService(followOptions);
            },
            fnFollowCallback: function (response, sender) {
                options.followCompleteCallback(response.data.HttpStatus, sender);
            }
        };
    };

    return {
        operations: operations,
        viewModel: viewModel
    };

})();