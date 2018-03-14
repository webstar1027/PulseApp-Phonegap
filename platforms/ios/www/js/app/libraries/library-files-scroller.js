CommunityApp.libraryScroller = (function () {
    var getPostServiceUrl = function (postId, userId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.postConfig.postsPath + CommunityApp.utilities.stringFormat(CommunityApp.configuration.postConfig.postPath, postId, userId);
        return serviceUrl;
    };

    var getPostViewsServiceUrl = function (postId, userId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.postConfig.postsPath +
            CommunityApp.configuration.postConfig.postViewsPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, postId, userId);
    };

    var getDeleteCommentServiceUrl = function (postId, commentId, userId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.postConfig.postsPath +
            CommunityApp.configuration.postConfig.deleteCommentPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, postId, commentId, userId);
    };

    var getAddCommentServiceUrl = function (postId, userId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.postConfig.postsPath +
            CommunityApp.configuration.postConfig.addCommentPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, postId, userId);
    };

    var getFolderFilesServiceUrl = function (userId, libraryId, folderId, resizeFactor) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.librariesConfig.librariesPath + CommunityApp.configuration.librariesConfig.allFilesPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, libraryId, folderId) + "?resizeFactor=" + resizeFactor;
    };

    var getFolderServiceUrl = function (userId, libraryId, folderId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.librariesConfig.librariesPath + CommunityApp.configuration.librariesConfig.folderPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, libraryId, folderId);
    };

    var setCommentButton = function () {
        $("#imageCommentForm").unbind('submit');
        $("#imageCommentForm").one('submit', function () {
            $("button[type='submit']", this).html("Processing...").attr('disabled', 'disabled');
            CommunityApp.libraryScroller.operations({ addCommentSuccessCallback: CommunityApp.libraryScroller.viewModel.fnAddCommentCallback }).addComment($('#txtImageComment').val());
            return true;
        });
    };

    var filesData = [];

    var viewModel = kendo.observable({
        title: "",
        description: "",
        folderId: 0,
        libraryId: 0,
        zoomedIn: false,
        social: {},
        likesText: "",
        commentsText: "",
        showComments: false,
        comments: [],
        commentsFound: false,
        dataBound: false,
        filePostId: 0,
        imageUrl: "",
        activeIndex: 0,
        author: {},
        page: function(url){
            return url + viewModel.get("filePostId") + "&mode=" + viewModel.get("mode");
        },
        download: function() {
			console.log("ImageUrl: "+viewModel.get("imageUrl"));
			var imageUrl = viewModel.get("imageUrl");
			var fileName = imageUrl.substr(imageUrl.lastIndexOf('/')+1);
			var folderName = "Download";
			
			if (CommunityApp.common.deviceType() === "android") {
				folderName = "Download";
			} else if (CommunityApp.common.deviceType() === "iphone" || CommunityApp.common.deviceType() === "ipad"){
				folderName = "Download";
			}

			console.log("ImageName: " + fileName);

			var onDirectoryFail = function(error) {
			    //Error while creating directory
			    CommunityApp.common.showErrorNotification("Error!", "Unable to create new directory: " + error.code);
			};
			
			var fileSystemSuccess = function (fileSystem) {
			    var fp = fileSystem.root.toURL() + folderName + "/" + fileName;
			    $('#mainImagePageScroller').hide();
			    $('<div class="k-loading-mask" style="width: 100%; height: 100%; top: 0px; left: 0px;"><span class="k-loading-text">Downloading...</span><div class="k-loading-image"></div><div class="k-loading-color"></div></div>').appendTo('#ca-library-files-scroller .km-content');
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

			var downloadFile = function (imageUrl, fp) {
			    var fileTransfer = new FileTransfer();
			    fileTransfer.download(imageUrl, fp,
			    	                function (entry) {
			    	                    $('#ca-library-files-scroller .k-loading-mask').remove();
			    	                    $('#mainImagePageScroller').show();
			    	                    if (CommunityApp.common.deviceType() === "iphone" || CommunityApp.common.deviceType() === "ipad") {
											cordova.plugins.imagesaver.saveImageToGallery(entry.toURL(), saveImageSuccessCallback, saveImageErrorCallback);
										} else {
											CommunityApp.common.showSuccessNotification("Downloaded successfully!");
										}
			    	                },
			    	                function (error) {
			    	                    $('#ca-library-files-scroller .k-loading-mask').remove();
			    	                    $('#mainImagePageScroller').show();
			    	                    CommunityApp.common.showErrorNotification("Error!", "Requires storage permission!");
			    	                });
			};
			
			var saveImageSuccessCallback = function () {
				CommunityApp.common.showSuccessNotification("Downloaded successfully!");
			};
			var saveImageErrorCallback = function () {
				CommunityApp.common.showErrorNotification("Error!", "Download Failed!");
			};
			
			var fileSystemFail = function(evt) {
				//Unable to access file system
				CommunityApp.common.showErrorNotification("Error!", "Unexpected error, please try again later!");
			};
			
			if (imageUrl === null || imageUrl === "") {
				CommunityApp.common.showErrorNotification("Error!", "Unexpected error, please try again later!");
				return;
			} else {
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileSystemSuccess, fileSystemFail);
			}
			
		},
        comment: function() {
            if (viewModel.get("showComments") === false){
                viewModel.set("showComments", true);
                //current file post data
                var data={};
                var currentUserId = CommunityApp.base.baseData.currentUser().id;
                var postServiceUrl = getPostServiceUrl(viewModel.get("filePostId"), currentUserId);
                var postViewsServiceUrl = getPostViewsServiceUrl(viewModel.get("filePostId"), currentUserId);
                var postLoadOptions = {
                    url: postServiceUrl,
                    requestType: "GET",
                    dataType: "JSON",
                    callBack: viewModel.fnCommentCallBack,
                    sender: JSON.stringify(data)
                };

                CommunityApp.dataAccess.callService(postLoadOptions, null, null, null, null, null, function () {
                    viewModel.comment();
                });

                var postViewsOptions = {
                    url: postViewsServiceUrl,
                    requestType: "POST",
                    dataType: "JSON"
                };
                console.log("postViewUrl: "+postViewsServiceUrl);
                CommunityApp.dataAccess.callService(postViewsOptions);
            }
        },
        isAllowedToDeleteComment: function (authorId) {
            var parentPostAuthor = viewModel.get("author");
            var allowed = CommunityApp.base.baseData.currentUser().id == authorId || CommunityApp.base.baseData.currentUser().id == parentPostAuthor.Id;
            return allowed;
        },
        load: function (e) {
            //CommunityApp.common.authenticatedUser();
            $("#library-files-scrollview").find(".swiper-wrapper").empty();
            $("#library-files-scrollview").find(".swiper-wrapper").attr("style", "");
            viewModel.set("dataBound", false);
            viewModel.set("showComments", false);

            setCommentButton();

            var txtComment = $("#txtImageComment");
            var currentView = e.view;
            $("#imageCommentForm .clearfix").css("height", 0);
            $('#ca-library-files-scroller').removeClass("zoomed-in");
            $('#ca-library-files-scroller').css('background-image', "");
            if($('#ca-library-files-scroller .full-download'))
                	$('#ca-library-files-scroller .full-download').remove();
            viewModel.set("zoomedIn", false);

            if (txtComment)
            {
                console.log("commentform height: "+$('#add-imageComment-form').height());
                var clearFixHeight = $(window).height() - $('#imageCommentForm').height() - $('#ca-library-files-scroller header').height() - $('#ca-library-files-scroller footer').height() - $('#add-imageComment-form').height();
                txtComment.val("");

                var mainScroller = $("#mainImagePageScroller").data("kendoMobileScroller");

                txtComment.focus(function () {
                 console.log("focus event, offset:" + $(this).offset().top + ", header height:" + $('#ca-library-files-scroller header').height());
                 if (mainScroller !== null && typeof mainScroller !== "undefined") {
                 mainScroller.reset();
                 }

                 if (typeof currentView.scroller !== 'undefined')
                 {
                 currentView.scroller.reset();
                 }

                 if (mainScroller !== null && typeof mainScroller !== "undefined")
                 {
                 var offset = $('#imageCommentForm').offset().top;
                 offset -= $('#ca-library-files-scroller header').height()+10;
                 if (offset === 0)
                 offset = 100;
                 mainScroller.scrollTo(0, -offset);
                 }
                    $("#imageCommentForm .clearfix").css("height", clearFixHeight);
                });
                txtComment.click(function () {
                    console.log("click event, offset:" + $(this).offset().top + ", header height:" + $('#ca-library-files-scroller header').height());
                    if (mainScroller !== null && typeof mainScroller !== "undefined") {
                        mainScroller.reset();
                    }

                    if (typeof currentView.scroller !== 'undefined')
                    {
                        currentView.scroller.reset();
                    }

                    if (mainScroller !== null && typeof mainScroller !== "undefined")
                    {
                        var offset = $('#imageCommentForm').offset().top;
                        offset -= $('#ca-library-files-scroller header').height()+10;
                        if (offset === 0)
                            offset = 100;
                        mainScroller.scrollTo(0, -offset);
                    }

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
                    viewModel.set("commentsFound", true);
                });*/
            }

            var folderId = e.view.params.folderId;
            var libraryId = e.view.params.libraryId;
            viewModel.set("folderId", folderId);
            viewModel.set("libraryId", libraryId);
            var index = e.view.params.index;
            var userId = CommunityApp.base.baseData.currentUser().id;

            viewModel.set("activeIndex", index);

            var pageSize = 5;
            var itemIndex = (index % pageSize);
            var page = ((index - itemIndex) / pageSize) + 1;

            //current folder data
            var folderServiceUrl = getFolderServiceUrl(userId, libraryId, folderId);

            var folderOptions = {
                url: folderServiceUrl,
                requestType: "GET",
                dataType: "JSON",
                callBack: viewModel.fnLoadFolderCallback
            };

            var viewArgs = e;
            CommunityApp.dataAccess.callService(folderOptions, null, null, null, null, null, function () {
                viewModel.load(viewArgs);
            });

            //init data source
            var serviceUrl = getFolderFilesServiceUrl(userId, libraryId, folderId, 0.2);

            var scrollerOptions = {
                url: serviceUrl,
                requestType: "GET",
                dataType: "JSON",
                callBack: viewModel.fnLoadFilesCallback,
                sender: index
            };

            CommunityApp.dataAccess.callService(scrollerOptions, null, null, null, null, null, function () {
                viewModel.load(viewArgs);
            });
        },
        fnLoadFolderCallback: function (response) {
            if (response.data) {
                CommunityApp.common.logTitle("Folder Scroller: " + response.data.Title);
                viewModel.set("title", response.data.Title);
                viewModel.set("description", response.data.Description);
            }
        },
        fnLoadFilesCallback: function(response, sender)
        {
            if(response.data)
            {
                var itemIndex = sender;
                var i;
                viewModel.set("social", response.data[viewModel.get("activeIndex")].MediaGalleryFilePost.SocialInfo);
                for (i=0; i<response.data.length ; i++)
                {
                    response.data[i].socialMessage = "";
                    if (response.data[i].MediaGalleryFilePost.SocialInfo.LikesCount > 1)
                        response.data[i].socialMessage += response.data[i].MediaGalleryFilePost.SocialInfo.LikesCount + " Likes   ";
                    else if (response.data[i].MediaGalleryFilePost.SocialInfo.LikesCount == 1)
                        response.data[i].socialMessage += "1 Like   ";


                    if (response.data[i].MediaGalleryFilePost.SocialInfo.CommentsCount > 1)
                        response.data[i].socialMessage += response.data[i].MediaGalleryFilePost.SocialInfo.CommentsCount + " Comments";
                    else if (response.data[i].MediaGalleryFilePost.SocialInfo.CommentsCount == 1)
                        response.data[i].socialMessage += "1 Comment";

                    response.data[i].socialMessageId = "socialMessage_" + i;
                }
                filesData = response.data;
                var filesScrollerTemplate = kendo.template($('#library-folder-files-scrollview-tmpl').html());
                var filesScrollerResult = kendo.render(filesScrollerTemplate, response.data);
                $("#library-files-scrollview").find(".swiper-wrapper").empty();
                $("#library-files-scrollview").find(".swiper-wrapper").attr("style", "");
                $("#library-files-scrollview").find(".swiper-wrapper").append(filesScrollerResult);

                var swiper = new Swiper('#library-files-scrollview', {
                    initialSlide: itemIndex, onInit: function (swiper) {
                        viewModel.applyLazyImages(swiper);
                        viewModel.applyZoom();
                    },
                    onSlideChangeStart: function (swiper) {
                        viewModel.applyLazyImages(swiper);
                    }
                });

                var scrollerView = $("#ca-library-files-scroller").data("kendoMobileView");
                if (scrollerView && scrollerView !== null)
                {
                    scrollerView.bind("hide", function (e) {
                        if (swiper !== null)
                        {
                            swiper.detachEvents();
                        }
                    });
                }
            }
        },
        fnPageCallback: function(response, sender)
        {
            if (response.data)
            {
                var filesScrollerTemplate = kendo.template($('#library-folder-files-scrollview-tmpl').html());
                var slides = kendo.render(filesScrollerTemplate, response.data.Items);
                var swiper = $('#library-files-scrollview')[0].swiper;

                if (sender == "prepend") {
                    swiper.prependSlide(slides);
                    swiper.slideTo(response.data.PageSize, 0, false);
                }

                if (sender == "append") {
                    swiper.appendSlide(slides);
                }

                viewModel.applyZoom();
            }
        },
        closeScroller: function () {
            var folderId = viewModel.get("folderId");
            var libraryId = viewModel.get("libraryId");

            CommunityApp.common.navigateToView("#ca-library-subfolders?folderId=" + folderId + "&libraryId=" + libraryId, "fade");
        },
        applyZoom: function()
        {
            $('#ca-library-files-scroller').click(function(){
                $(this).removeClass("zoomed-in");
                $(this).css('background-image', "");
                viewModel.set("zoomedIn", false);
                if($('#ca-library-files-scroller .full-download'))
                	$('#ca-library-files-scroller .full-download').remove();
            });
            $(".zoom-target").each(function () {
                $(this).click(function (evt) {
                    var zoomedIn = viewModel.get("zoomedIn");

                    if (!zoomedIn) {
                        $('#ca-library-files-scroller').addClass("zoomed-in");
                        $('#ca-library-files-scroller').css('background-image', 'url("'+$(this).find('img').data("src")+'")');
                        $('<div class="full-download" style="display: block;text-align: right;padding: 25px 10px 0 0;"><a onclick="CommunityApp.libraryScroller.viewModel.download();" class="no-text-decoration fontsize-14"><span class="glyphicon glyphicon-download-alt"></span></a></div>').appendTo('#ca-library-files-scroller');
                        viewModel.set("zoomedIn", true);
                    }
                    else {
                        //$("body").zoomTo();
                        $('#ca-library-files-scroller').removeClass("zoomed-in");
                        $('#ca-library-files-scroller .full-download').remove();
                        viewModel.set("zoomedIn", false);
                    }

                    evt.stopPropagation();
                });
            });
        },
        resetZoom: function () {
            $("body").zoomTo();
        },
        applyLazyImages: function (swiper) {
            console.log("active index: " + swiper.activeIndex);
            var activeSlide = swiper.slides[swiper.activeIndex];
            var url = $(activeSlide).find("img").data("src");
            $(activeSlide).find("img").attr("src", url);
            $(activeSlide).find("img")[0].onload = function () {
                $(activeSlide).find(".loading").hide();
                $(activeSlide).find("img").removeClass("display-none");
                viewModel.set("dataBound", true);
            };
            viewModel.set("author", filesData[swiper.activeIndex].MediaGalleryFilePost.PostAuthor);
            viewModel.set("filePostId", filesData[swiper.activeIndex].MediaGalleryFilePost.Id);
            viewModel.set("activeIndex", swiper.activeIndex);
            viewModel.set("social", filesData[viewModel.get("activeIndex")].MediaGalleryFilePost.SocialInfo);
            viewModel.set("comments", []);
            viewModel.set("showComments", false);
            viewModel.set("imageUrl", filesData[swiper.activeIndex].MediaGalleryFilePost.PostAttachments[0].FileUrl);
            var mainScroller = $("#mainImagePageScroller").data("kendoMobileScroller");
            if (mainScroller !== null && typeof mainScroller !== "undefined")
                mainScroller.reset();

        },
        fnCommentCallBack: function (response, data) {
            if (response.data) {
                data = JSON.parse(data);
                var mode = data.mode;
                viewModel.set("social", response.data.SocialInfo);
                if (response.data.PostComments === null){
                    viewModel.set("comments", []);
                    viewModel.set("commentsFound", false);
                }else{
                    viewModel.set("comments", response.data.PostComments);
                    viewModel.set("commentsFound", response.data.PostComments.length > 0);
                }
                var postCommentsList = $("#image-comments").data("kendoMobileListView");
                if (postCommentsList && postCommentsList !== null) {
                    postCommentsList.bind("dataBound", function (e) {
                        $("a[name='deleteComment']").each(function () {
                            var authorId = $(this).attr("data-authorid");
                            if (viewModel.isAllowedToDeleteComment(authorId))
                                $(this).removeClass("display-none");
                        });
                    });
                }

				$("#imageCommentForm .clearfix").css("height", 0);


                var mainScroller = $("#mainImagePageScroller").data("kendoMobileScroller");
                if (mainScroller !== null && typeof mainScroller !== "undefined")
                {
                    var offset = mainScroller.height();
                    if (offset === 0)
                        offset = 100;
                    mainScroller.scrollTo(0, mainScroller.scrollHeight() * (-1) + offset);
                }
            }
        },
        fnAddCommentCallback: function (httpStatus, folderId, libraryId, index) {
            $("#txtImageComment").val("");
            if (httpStatus === 200) {
                //current file post data
                var data={};
                var currentUserId = CommunityApp.base.baseData.currentUser().id;
                var postServiceUrl = getPostServiceUrl(viewModel.get("filePostId"), currentUserId);
                var postViewsServiceUrl = getPostViewsServiceUrl(viewModel.get("filePostId"), currentUserId);
                var postLoadOptions = {
                    url: postServiceUrl,
                    requestType: "GET",
                    dataType: "JSON",
                    callBack: viewModel.fnCommentCallBack,
                    sender: JSON.stringify(data)
                };


                var thatHttpStatus = httpStatus;
				var thatFolderId = folderId;
				var thatLibraryId = libraryId;
				var thatIndex = index;
				CommunityApp.dataAccess.callService(postLoadOptions, null, null, null, null, null, function () {
					viewModel.fnAddCommentCallback(thatHttpStatus, thatFolderId, thatLibraryId, thatIndex);
				});

                var postViewsOptions = {
                    url: postViewsServiceUrl,
                    requestType: "POST",
                    dataType: "JSON"
                };

                CommunityApp.dataAccess.callService(postViewsOptions);

                updateSocialInfo_addComment(viewModel.get("social"));
            }
            else {
                CommunityApp.common.showErrorNotification("Error!", "Unexpected error, please try again later!");
            }

            $("button[type='submit']", "#imageCommentForm").html("<span class='glyphicon glyphicon-plus margin-2'></span>&nbsp;Add Comment").removeAttr("disabled");
            setCommentButton();
        },
        resetAddComment: function (e) {
            $("#txtImageComment").val("");
        },
        fnDeleteCommentCallback: function(response, sender) {
            $(sender).parent().parent().parent().remove();
            updateSocialInfo_deleteComment(viewModel.get("social"));
            CommunityApp.common.showSuccessNotification("Comment has been deleted successfully!");
        },
        likePost: function () {
            operations({ likeSuccessCallback: viewModel.likeSuccessCallback }).like(viewModel.get("filePostId"), true);
        },
        unlikePost: function () {
            operations({ likeSuccessCallback: viewModel.likeSuccessCallback }).like(viewModel.get("filePostId"), false);
        },
        likeSuccessCallback: function (operation) {
            updateSocialInfo(viewModel.get("social"), operation === "like");
        }
    });

    var updateSocialInfo_addComment = function(social) {
        var newSocial = {
            UserLiked: social.UserLiked,
            LikesCount: social.LikesCount,
            UserId: social.UserId,
            PosyId: social.PostId,
            CommentsCount: social.CommentsCount + 1
        };

        if (newSocial.LikesCount > 1) {
            viewModel.set("likesText", newSocial.LikesCount + " Likes");
        }
        else if (newSocial.LikesCount == 1) {
            viewModel.set("likesText", "1 Like");
        } else {
            viewModel.set("likesText", "");
        }

        if (newSocial.CommentsCount > 1) {
            viewModel.set("commentsText", newSocial.CommentsCount + " Comments");
        }
        else if (newSocial.CommentsCount == 1) {
            viewModel.set("commentsText", "1 Comment");
        } else {
            viewModel.set("commentsText", "");
        }

        viewModel.set("social", newSocial);
        //$('#socialMessage_'+viewModel.get("activeIndex")).text(viewModel.get("likesText")+"  "+viewModel.get("commentsText"));
        $('#socialMessage_'+viewModel.get("activeIndex")).text(viewModel.get("likesText")+"   "+viewModel.get("commentsText"));

        filesData[viewModel.get("activeIndex")].MediaGalleryFilePost.SocialInfo = newSocial;
        filesData[viewModel.get("activeIndex")].socialMessage = viewModel.get("likesText")+"   "+viewModel.get("commentsText");
    };


    var updateSocialInfo_deleteComment = function(social) {
        var newSocial = {
            UserLiked: social.UserLiked,
            LikesCount: social.LikesCount,
            UserId: social.UserId,
            PosyId: social.PostId,
            CommentsCount: social.CommentsCount - 1
        };

        if (newSocial.LikesCount > 1) {
            viewModel.set("likesText", newSocial.LikesCount + " Likes");
        }
        else if (newSocial.LikesCount == 1) {
            viewModel.set("likesText", "1 Like");
        } else {
            viewModel.set("likesText", "");
        }

        if (newSocial.CommentsCount > 1) {
            viewModel.set("commentsText", newSocial.CommentsCount + " Comments");
        }
        else if (newSocial.CommentsCount == 1) {
            viewModel.set("commentsText", "1 Comment");
        } else {
            viewModel.set("commentsText", "");
        }

        viewModel.set("social", newSocial);
        //$('#socialMessage_'+viewModel.get("activeIndex")).text(viewModel.get("likesText")+"  "+viewModel.get("commentsText"));
        $('#socialMessage_'+viewModel.get("activeIndex")).text(viewModel.get("likesText")+"   "+viewModel.get("commentsText"));

        filesData[viewModel.get("activeIndex")].MediaGalleryFilePost.SocialInfo = newSocial;
        filesData[viewModel.get("activeIndex")].socialMessage = viewModel.get("likesText")+"   "+viewModel.get("commentsText");
    };

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
        else
        {
            newSocial = {
                UserLiked: false,
                LikesCount: social.LikesCount - 1,
                UserId: social.UserId,
                PosyId: social.PostId,
                CommentsCount: social.CommentsCount
            };
        }

        if (newSocial.LikesCount > 1) {
            viewModel.set("likesText", newSocial.LikesCount + " Likes");
        }
        else if (newSocial.LikesCount == 1) {
            viewModel.set("likesText", "1 Like");
        } else {
            viewModel.set("likesText", "");
        }

        if (newSocial.CommentsCount > 1) {
            viewModel.set("commentsText", newSocial.CommentsCount + " Comments");
        }
        else if (newSocial.CommentsCount == 1) {
            viewModel.set("commentsText", "1 Comment");
        } else {
            viewModel.set("commentsText", "");
        }

        viewModel.set("social", newSocial);
        $('#socialMessage_'+viewModel.get("activeIndex")).text(viewModel.get("likesText")+"   "+viewModel.get("commentsText"));

        filesData[viewModel.get("activeIndex")].MediaGalleryFilePost.SocialInfo = newSocial;
        filesData[viewModel.get("activeIndex")].socialMessage = viewModel.get("likesText")+"   "+viewModel.get("commentsText");

    };

    var operations = function (options) {
        var getLikeServiceUrl = function (postId, userId, like) {
            var likeServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.postConfig.postsPath +
                CommunityApp.utilities.stringFormat(like ? CommunityApp.configuration.postConfig.likePostPath : CommunityApp.configuration.postConfig.unlikePostPath, postId, userId);
            return likeServiceUrl;
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

                    CommunityApp.dataAccess.callService(likeServiceOptions);
                }
            },
            fnLikeCallBack: function (response, sender) {
                if (response.data.HttpStatus === 200) {

                    var operation = response.data.AdditionalData.toString().toLowerCase().split(',')[0];
                    var likes = response.data.AdditionalData.toString().toLowerCase().split(',')[1];

                    if (options && options.likeSuccessCallback)
                        options.likeSuccessCallback(operation, likes, sender);

                } else {
                    CommunityApp.common.showErrorNotification("Error!", "Unexpected error, please try again later!");
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

                console.log("addComment");

                var validator = $("textarea", "#add-imageComment-form").kendoValidator().data("kendoValidator");

                if (validator.validate()) {
                    CommunityApp.sounds.post();

                    var currentUserId = CommunityApp.base.baseData.currentUser().id;
                    var subject = "posted a comment through the mobile app";

                    var serviceUrl = getAddCommentServiceUrl(viewModel.filePostId, currentUserId);


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
                        sender: viewModel.filePostId + "," + "post"
                    };


                    CommunityApp.dataAccess.callService(commentsPostOptions);
                }

            },
            fnPostCommentCallBack: function (response, sender) {
                var parentPostId = sender.split(',')[0];
                var mode = sender.split(',')[1];
                options.addCommentSuccessCallback(response.data.HttpStatus, viewModel.folderId, viewModel.libraryId, viewModel.activeIndex);
            }
        };
    };

    return {
        operations: operations,
        viewModel: viewModel
    };
})();