CommunityApp.newThread = (function () {

    var sectionServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.sectionConfig.sectionPath;

    var getAddThreadServiceUrl = function (userId, sectionId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.forumConfig.forumsPath +
            CommunityApp.configuration.forumConfig.threadAddPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, sectionId);
    };

    var setNewThreadSubmitForm = function () {
        if ($("#add-thread-form")) {

            $("button[name='btn-post']", "#add-thread-form").html("<i class='km-icon km-add'></i>&nbsp;Post Thread").removeAttr("disabled").show();
            $("button[name='btn-extra']", "#add-thread-form").html("<i class='km-icon km-upload'></i>&nbsp;Upload Extra File").removeAttr("disabled");

            $("#add-thread-form").unbind("submit");
            $("#add-thread-form").one("submit", function () {
                var name = $("button[type=submit][clicked=true]").attr("name");
                if(name == "btn-post")
                {
                    $("button[name='btn-post']", this).html("&nbsp;<div class='loading display-inline-block'></div>").attr('disabled', 'disabled');
                    $("button[name='btn-extra']", this).hide();
                }
                else if(name == "btn-extra")
                {
                    $("button[name='btn-extra']", this).html("&nbsp;<div class='loading display-inline-block'></div>").attr('disabled', 'disabled');
                    $("button[name='btn-post']", this).hide();
                }

                viewModel.add(name);
                return true;
            });


            $("#add-thread-form button[type=submit]").click(function () {
                $("button[type=submit]", $(this).parents("form")).removeAttr("clicked");
                $(this).attr("clicked", "true");
            });
        }
    };

    var viewModel = kendo.observable({
        subject: "",
        body: "",
        sectionId: 0,
        sectionName: "",
        attachmentUrl: "",
        dataBound: false,
        processing: false,
		orientation: "",
        uploadExtraFileActive: false,
        forGiphy: false,
        selectedGiphy: "",
        selectedFixedWidthGiphy: "",
        load: function(e)
        {
            viewModel.set("uploadExtraFileActive", false);

            //CommunityApp.common.authenticatedUser();
            viewModel.reset();

            viewModel.set("dataBound", false);
            viewModel.set("sectionId", e.view.params.sectionId);

            var sectionId = e.view.params.sectionId;

            var canvas = document.getElementById("discussion-attachment-canvas-newthread");
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            $("#attchUploadNew").val("");
			
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
				viewModel.set("selectedGiphy", threadData.selectedGiphy);
				viewModel.set("selectedFixedWidthGiphy", threadData.selectedFixedWidthGiphy);
				console.log("selectedGiphy: " + threadData.selectedGiphy);
			}

            if (sectionId !== 'undefined' && typeof sectionId !== 'undefined') {
                var sectionLoadOptions = {
                    url: sectionServiceUrl + sectionId,
                    requestType: "GET",
                    dataType: "JSON",
                    callBack: viewModel.fnLoadSectionCallBack
                };

                var viewArgs = e;
                CommunityApp.dataAccess.callService(sectionLoadOptions, null, null, null, null, null, function () {
                    viewModel.load(viewArgs);
                });
            }

            setNewThreadSubmitForm();
        },
        fnLoadSectionCallBack: function(response)
        {
            if(response.data)
            {
                CommunityApp.common.logTitle("Add Thread: " + response.data.Name);
                viewModel.set("sectionName", response.data.Name);
                viewModel.set("dataBound", true);
				setTimeout(function(){$("#txt-subject").focus();}, 500);
            }
        },
        add: function(source)
        {
            viewModel.set("processing", true);
            var userId = CommunityApp.base.baseData.currentUser().id;
            var sectionId = viewModel.get("sectionId");
            
            if (viewModel.get("subject") === "") {
                navigator.notification.alert("Subject is required", function(){}, "O&B");
                setNewThreadSubmitForm();
            } else if (viewModel.get("body") === "") {
                navigator.notification.alert("Body is required", function(){}, "O&B");
                setNewThreadSubmitForm();
            } else {
                var serviceUrl = getAddThreadServiceUrl(userId, sectionId);

                var fileData = new FormData();
                
                var selectedFixedWidthGiphy = viewModel.get("selectedFixedWidthGiphy");
                
                if (selectedFixedWidthGiphy === ""){
                    var Pic;
                    if (viewModel.get("orientation") === "") {
                        if ($("#attchUploadNew")[0].files[0] !== 'undefined' && typeof $("#attchUploadNew")[0].files[0] !== 'undefined'){
                            if ($("#attchUploadNew")[0].files[0].size > 1048576) {
                                Pic = document.getElementById("discussion-attachment-canvas-new-upload").toDataURL("image/jpeg");
                                fileData.append("file", CommunityApp.common.dataURItoBlob(Pic));
                            } else {
                                fileData.append("file", $("#attchUploadNew")[0].files[0]);
                            }
                        }
                    } else {
                        Pic = document.getElementById("discussion-attachment-canvas-new-upload").toDataURL("image/jpeg");
                        fileData.append("file", CommunityApp.common.dataURItoBlob(Pic));
                        //fileData.append("file", CommunityApp.common.dataURItoBlob(viewModel.get("attachmentUrl")));
                    }
                    fileData.append("data", JSON.stringify({ Title: viewModel.get("subject"), Description: viewModel.get("body"), SectionId: viewModel.get("sectionId") }));
                } else {
                    fileData.append("data", JSON.stringify({ Title: viewModel.get("subject"), Description: viewModel.get("body"), SectionId: viewModel.get("sectionId"), FileUrl: selectedFixedWidthGiphy }));
                }

                var addThreadOptions = {
                    url: serviceUrl,
                    requestType: "POST",
                    dataType: "JSON",
                    data: fileData,
                    callBack: viewModel.fnAddThreadCallback,
                    sender: {
                        source: source,
                        sectionId: sectionId
                    }
                };

                CommunityApp.dataAccess.callService(addThreadOptions, null, null, true, false, false);
            }
        },
        fnAddThreadCallback: function(response, sender)
        {
            if(response.data)
            {
                if(response.data.HttpStatus == "200")
                {
                    var threadId = response.data.AdditionalData;
                    var postId = response.data.RelatedData;

                    if (threadId > 0)
                    {
                        if (sender.source == "btn-post")
                        {
                            CommunityApp.common.navigateToView("#ca-thread-discussion?threadId=" + threadId);
                        }
                        else if(sender.source == "btn-extra")
                        {
                            CommunityApp.common.navigateToView("#ca-thread-post-extra?threadId=" + threadId + "&sectionId=" + sender.sectionId + "&postId=" + postId);
                        }
                    }
                    else
                    {
                        CommunityApp.common.showErrorNotification("Error", "Post already exists!");
                        setNewThreadSubmitForm();
                    }
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
            threadData.senderView = "#ca-thread-add?sectionId="+viewModel.get("sectionId");
            threadData.sectionId = viewModel.get("sectionId");
            threadData.subject = viewModel.get("subject");
            threadData.body = viewModel.get("body");
            threadData.senderObject = "newThread";
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
			viewModel.set("forGiphy", false);
			if (selection === "giphyResource") {
				viewModel.set("forGiphy", true);
				CommunityApp.common.navigateToView("#ca-select-giphy");
			} else {
            $("#attchUploadNew").click();
            $("#attchUploadNew").change(function () {
				CommunityApp.common.readUrl(this, function (response, file) {
                    loadImage.parseMetaData(file, function (data) {
						var canvas = document.getElementById("discussion-attachment-canvas-newthread");
						var ctx = canvas.getContext('2d');
						ctx.clearRect(0, 0, canvas.width, canvas.height);
						var canvasUpload = document.getElementById("discussion-attachment-canvas-new-upload");
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

                            }, { orientation: viewModel.get("orientation"), maxWidth: 500, maxHeight: 600 });

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
									canvasUpload.width = "500";
									canvasUpload.height = imgCanvas.height / imgCanvas.width * 500;
									ctxUpload.drawImage(imgCanvas, 0, 0, imgCanvas.width, imgCanvas.height, 0, 0, canvasUpload.width, canvasUpload.height);
									ctx.drawImage(imgCanvas, 0, 0, imgCanvas.width, imgCanvas.height, 0, 0, canvas.width, canvas.height);
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
            viewModel.set("uploadExtraFileActive", true);
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