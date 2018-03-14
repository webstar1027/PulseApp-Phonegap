CommunityApp.editThread = (function () {

    var getThreadPostsServiceUrl = function (userId, threadId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.forumConfig.forumsPath + CommunityApp.configuration.forumConfig.threadPostsPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, threadId, 0);
    };


    var getEditThreadServiceUrl = function (userId, threadId, postId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.forumConfig.forumsPath +
            CommunityApp.configuration.forumConfig.threadEditPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, threadId, postId);
    };

    var setEditThreadSubmitForm = function () {
        if ($("#edit-thread-form")) {
            $("button[type='submit']", "#edit-thread-form").html("<i class='km-icon km-add'></i>&nbsp;Post Thread").removeAttr("disabled");
            $("#edit-thread-form").unbind("submit");
            $("#edit-thread-form").one("submit", function () {
                $("button[type='submit']", this).html("Processing...<div class='loading pos-22 pull-right'></div>").attr('disabled', 'disabled');
                viewModel.edit();
                return true;
            });
        }
    };

    var viewModel = kendo.observable({
        subject: "",
        body: "",
        postId: 0,
        sectionId: 0,
        threadId: 0,
        sectionName: "",
        attachmentUrl: "",
		orientation: "",
        dataBound: false,
        notReply: false,
        processing: false,
		forGiphy: false,
		selectedGiphy: "",
		selectedFixedWidthGiphy: "",
        load: function(e)
        {
            //CommunityApp.common.authenticatedUser();
            viewModel.reset();

            viewModel.set("dataBound", false);

            var postId = e.view.params.postId;
            var threadId = e.view.params.threadId;
            var sectionId = e.view.params.sectionId;
            viewModel.set("postId", postId);
            viewModel.set("threadId", threadId);
            viewModel.set("sectionId", sectionId);
            
            var isReply = e.view.params.reply;
			viewModel.set("notReply", false);
            if (isReply === "0") viewModel.set("notReply", true);

            var canvas = document.getElementById("discussion-attachment-canvas-editThread");
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            $('#attchUploadEdit').val("");
			
			viewModel.set("forGiphy", false);
			viewModel.set("selectedGiphy", "");
			viewModel.set("selectedFixedWidthGiphy", "");
			var fromView = e.view.params.from;
			if (fromView !== 'undefined' && typeof fromView !== 'undefined' && fromView === 'selectGiphy') {
				viewModel.set("forGiphy", true);
				var threadData = CommunityApp.session.load(CommunityApp.configuration.giphyConfig.offlineStore);
				CommunityApp.session.remove(CommunityApp.configuration.giphyConfig.offlineStore);
				viewModel.set("subject", threadData.subject);
				viewModel.set("body", threadData.body);
				viewModel.set("sectionName", threadData.sectionName);
				viewModel.set("selectedGiphy", threadData.selectedGiphy);
				viewModel.set("selectedFixedWidthGiphy", threadData.selectedFixedWidthGiphy);
				console.log("selectedGiphy: " + threadData.selectedGiphy);
				viewModel.set("dataBound", true);
			} else {

            if (threadId !== 'undefined' && typeof threadId !== 'undefined') {
                var userId = CommunityApp.base.baseData.currentUser().id;
                var serviceUrl = getThreadPostsServiceUrl(userId, threadId);
                console.log("service url: "+ serviceUrl);
                var threadLoadOptions = {
                    url: serviceUrl,
                    requestType: "GET",
                    dataType: "JSON",
                    callBack: viewModel.fnThreadLoadCallBack
                };

                var viewArgs = e;
				CommunityApp.dataAccess.callService(threadLoadOptions, null, null, null, null, null, function(){
					viewModel.load(viewArgs);
				});
            }
			}

            setEditThreadSubmitForm();
        },
        fnThreadLoadCallBack: function(response){
            if (response.data) {
                var postId = viewModel.get("postId");
                var i = 0;
                console.log(response.data.Items.length);
                var canvas = document.getElementById("discussion-attachment-canvas-editThread");
                var ctx = canvas.getContext('2d');
                var img = new Image();
                img.onload = function () {
                    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
                };
                for (i=0; i<response.data.Items.length; i++) {
                    if (response.data.Items[i].Id == postId) {
                        viewModel.set("subject", response.data.Items[i].Subject);
                        viewModel.set("body", response.data.Items[i].Body);
                        viewModel.set("sectionName", response.data.Items[i].PostThread.ThreadSection.Name);
                        if (response.data.Items[i].PostAttachments.length > 0) {
                            viewModel.set("attachmentUrl", response.data.Items[i].PostAttachments[0].FileUrl);
                            img.src = response.data.Items[i].PostAttachments[0].FileUrl;
                        }
                        viewModel.set("dataBound", true);

                        CommunityApp.common.logTitle("Edit Thread: " + viewModel.get("subject"));
                    }
                }
            }
        },
        edit: function()
        {
            viewModel.set("processing", true);
            var userId = CommunityApp.base.baseData.currentUser().id;
            var threadId = viewModel.get("threadId");
            var postId = viewModel.get("postId");

            var serviceUrl = getEditThreadServiceUrl(userId, threadId, postId);

            console.log("EditUrl: "+serviceUrl);

            var fileData = new FormData();
            var selectedFixedWidthGiphy = viewModel.get("selectedFixedWidthGiphy");
            if (selectedFixedWidthGiphy === ""){
                var Pic;
                if (viewModel.get("orientation") === "") {
                    if ($("#attchUploadEdit")[0].files[0] !== 'undefined' && typeof $("#attchUploadEdit")[0].files[0] !== 'undefined'){
                        if ($("#attchUploadEdit")[0].files[0].size > 1048576) {
                            Pic = document.getElementById("discussion-attachment-canvas-edit-upload").toDataURL("image/jpeg");
                            fileData.append("file", CommunityApp.common.dataURItoBlob(Pic));
                        } else {
                            fileData.append("file", $("#attchUploadEdit")[0].files[0]);
                        }
                    }
                } else {
                    Pic = document.getElementById("discussion-attachment-canvas-edit-upload").toDataURL("image/jpeg");
                    fileData.append("file", CommunityApp.common.dataURItoBlob(Pic));
                }
                fileData.append("data", JSON.stringify({Id:viewModel.get("postId"), Title: viewModel.get("subject"), Description: viewModel.get("body"), SectionId: viewModel.get("sectionId") }));
            } else {
                fileData.append("data", JSON.stringify({Id:viewModel.get("postId"), Title: viewModel.get("subject"), Description: viewModel.get("body"), SectionId: viewModel.get("sectionId"), FileUrl: selectedFixedWidthGiphy }));
            }


            var editThreadOptions = {
                url: serviceUrl,
                requestType: "PUT",
                dataType: "JSON",
                data: fileData,
                callBack: viewModel.fnEditThreadCallback
            };

            CommunityApp.dataAccess.callService(editThreadOptions, null, null, true, false, false);
        },
        fnEditThreadCallback: function(response)
        {
            if(response.data)
            {
				console.log("edit response: "+response.data.HttpStatus);
                if(response.data.HttpStatus == "200")
                {
                    var threadId = response.data.AdditionalData;
                    CommunityApp.common.navigateToView("#ca-thread-discussion?threadId=" + threadId);
                }
                else
                {
                    CommunityApp.common.showErrorNotification("Unexpected Error", "Unexpected error has occurred!");
                }
            }

            viewModel.set("processing", false);
        },
		selectResource: function() {
			var threadData = {};
			var reply = 0;
			if (viewModel.get("isReply"))
				reply = 1;
			threadData.senderView = "#ca-thread-edit?postId="+viewModel.get("postId")+"&threadId="+viewModel.get("threadId")+"&sectionId="+viewModel.get("sectionId")+"&reply="+reply;
			threadData.sectionId = viewModel.get("sectionId");
			threadData.postId = viewModel.get("postId");
			threadData.threadId = viewModel.get("threadId");
			threadData.subject = viewModel.get("subject");
			threadData.body = viewModel.get("body");
			threadData.sectionName = viewModel.get("sectionName");
			threadData.senderObject = "editThread";
			CommunityApp.session.save(CommunityApp.configuration.giphyConfig.offlineStore, threadData);
			var selectResourcePopup = $('#select-resource-dialog').kendoWindow({
				modal: true,
				width: 300,
				resizable: false,
				title: "Resource Selection",
				visible: false,
				// remove the Window from the DOM after closing animation is finished
				deactivate: function(e){ /*e.sender.destroy();*/ }
			}).data("kendoWindow")
			.center().open();
		},
        triggerUpload: function (selection) {  
			console.log("edit triggerUpload: "+selection);
			viewModel.set("forGiphy", false);
			if (selection === "giphyResource") {
				viewModel.set("forGiphy", true);
				CommunityApp.common.navigateToView("#ca-select-giphy");
			} else {
            $("#attchUploadEdit").click();
            $("#attchUploadEdit").change(function () {
			
				CommunityApp.common.readUrl(this, function (response, file) {
                    loadImage.parseMetaData(file, function (data) {
						var canvas = document.getElementById("discussion-attachment-canvas-editThread");
						var ctx = canvas.getContext('2d');
						ctx.clearRect(0, 0, canvas.width, canvas.height);
						var canvasUpload = document.getElementById("discussion-attachment-canvas-edit-upload");
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
                                if (typeof img.toDataURL === 'function') 
                                {
                                    viewModel.set("attachmentUrl", img.toDataURL());
									imgCanvas.src = img.toDataURL();
                                }
                                else
                                {
                                    viewModel.set("attachmentUrl", response);
									imgCanvas.src = response;
                                }

                            }, { orientation: viewModel.get("orientation"), maxWidth: 900, maxHeight: 1200 });

							if (!loadingImage) {
								alert("not load image");
							}
                        } else {
							viewModel.set("orientation", "");
							console.log("not orientation");
							console.log(file.size);
							if (file.size > 1048576) {
								viewModel.set("attachmentUrl", response);
								imgCanvas.onload = function () {
									canvasUpload.width = "900";
									canvasUpload.height = imgCanvas.height / imgCanvas.width * 900;
									ctx.drawImage(imgCanvas, 0, 0, imgCanvas.width, imgCanvas.height, 0, 0, canvas.width, canvas.height);
									ctxUpload.drawImage(imgCanvas, 0, 0, imgCanvas.width, imgCanvas.height, 0, 0, canvasUpload.width, canvasUpload.height);
								};
								imgCanvas.src = response;
							} else {
								viewModel.set("attachmentUrl", response);
								imgCanvas.onload = function () {
									ctx.drawImage(imgCanvas, 0, 0, imgCanvas.width, imgCanvas.height, 0, 0, canvas.width, canvas.height);
								};
								imgCanvas.src = response;
							}
						}
                    });
                });
            });
			}
        },
        reset: function () {
            viewModel.set("subject", "");
            viewModel.set("body", "");
            viewModel.set("sectionId", 0);
            viewModel.set("sectionName", "");
            viewModel.set("attachmentUrl", "");
			viewModel.set("orientation", "");
        }
    });

    return {
        viewModel: viewModel
    };
})();