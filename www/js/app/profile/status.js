CommunityApp.status = (function () {

    var getServiceUrl = function (userId) {
        var statusServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.profileConfig.accountPath +
                   CommunityApp.utilities.stringFormat(CommunityApp.configuration.profileConfig.statusPath, userId);
        return statusServiceUrl;
    };

    var getUpdateServiceUrl = function (userId, statusId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.profileConfig.accountPath +
            CommunityApp.configuration.profileConfig.updateStatusPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, statusId);
    };

    var viewModel = kendo.observable({
        statuses: [],
        body: "",
        id: 0,
        userId: 0,
        orientation: "",
        forGiphy: false,
        selectedGiphy: "",
        selectedFixedWidthGiphy: "",
        isCurrentUser: function(){
            var currentUserId = CommunityApp.base.baseData.currentUser().id;
            var result = currentUserId == viewModel.get("userId");
            return result;
        },
        scrollerClass: function () {
            var resultClass = (viewModel.isCurrentUser()) ? "height-1" : "height-3";
            return resultClass;
        },
        load: function (e) {
            CommunityApp.common.logTitle("Status List");

            var friendId = (e.view.params !== 'undefined' && typeof e.view.params !== 'undefined') ? e.view.params.userId : e.params.userId;
            viewModel.set("userId", friendId);

            setScrollerClass(viewModel.scrollerClass());

            //CommunityApp.common.authenticatedUser();

            var currentUser = CommunityApp.session.currentUser.load();
            var inputUserId = (friendId !== 'undefined' && typeof friendId !== 'undefined') ? friendId : currentUser.id;

            if (inputUserId > 0) {
                read(inputUserId);
            }

            var statusList = $("#user-status-list").data("kendoMobileListView");
            statusList.bind("dataBound", function (e) {
                $('.km-popup-overlay').each(function(){
                    $(this).find('.km-popup-arrow').addClass("popover-arrow");
                }); 
            });
        },
        loadAddStatus: function(e){
            CommunityApp.common.logTitle(e.view.title);
            viewModel.set("body", "");
            viewModel.set("forGiphy", false);
			viewModel.set("selectedGiphy", "");
			viewModel.set("selectedFixedWidthGiphy", "");
			var fromView = (e.view.params !== 'undefined' && typeof e.view.params !== 'undefined') ? e.view.params.from : e.params.from;
			if (fromView !== 'undefined' && typeof fromView !== 'undefined' && fromView === 'selectGiphy') {
				viewModel.set("forGiphy", true);
				var threadData = CommunityApp.session.load(CommunityApp.configuration.giphyConfig.offlineStore);
				CommunityApp.session.remove(CommunityApp.configuration.giphyConfig.offlineStore);
				viewModel.set("body", threadData.body);
				viewModel.set("selectedGiphy", threadData.selectedGiphy);
				viewModel.set("selectedFixedWidthGiphy", threadData.selectedFixedWidthGiphy);
				console.log("selectedGiphy: " + threadData.selectedGiphy);
			}
        },
        selectResource: function() {
            var statusData = {};
            statusData.senderView = "#ca-user-status-add?status=add";
            statusData.body = viewModel.get("body");
            statusData.senderObject = "newStatus";
            CommunityApp.session.save(CommunityApp.configuration.giphyConfig.offlineStore, statusData);
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
			if (selection === "giphyResource") {
				viewModel.set("forGiphy", true);
				CommunityApp.common.navigateToView("#ca-select-giphy");
			} else {
                $("#attchUploadStatus").click();
                $("#attchUploadStatus").change(function () {
                    viewModel.set("forGiphy", false);
                    CommunityApp.common.readUrl(this, function (response, file) {
                        loadImage.parseMetaData(file, function (data) {
                            var canvas = document.getElementById("status-attachment-canvas-new");
                            var ctx = canvas.getContext('2d');
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            var canvasUpload = document.getElementById("status-attachment-canvas-new-upload");
                            var ctxUpload = canvasUpload.getContext('2d');
                            ctxUpload.clearRect(0, 0, canvasUpload.width, canvasUpload.height);
                            var imgCanvas = new Image();
                            if (data.exif) {
                                imgCanvas.onload = function () {
                                    canvasUpload.width = "900";
                                    canvasUpload.height = imgCanvas.height / imgCanvas.width * 900;
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
        },
        fnLoadCallBack: function (response) {
            viewModel.set("statuses", response.data);
            var statusList = $("#user-status-list").data("kendoMobileListView");
            statusList.refresh();
        },
        add: function () {

            //CommunityApp.common.authenticatedUser();

            var validator = $("textarea", "#add-status-form").kendoValidator().data("kendoValidator");

            if (validator.validate()) {
                CommunityApp.sounds.post();
                var currentUser = CommunityApp.session.currentUser.load();

                if (currentUser.id && currentUser.id !== 0) {
                    var selectedFixedWidthGiphy = viewModel.get('selectedFixedWidthGiphy');

                    var statusServiceUrl = getServiceUrl(currentUser.id);
                    
                    var postaData = {};
                    var uploadToCloudOptions = {};
                    var statusPostOptions = {};
                    if (selectedFixedWidthGiphy === "") {
                        var cloudUploadUrl = 'https://api.cloudinary.com/v1_1/pulseltd/image/upload';
                        cloudUploadUrl = CommunityApp.utilities.stringFormat(CommunityApp.configuration.cloudinaryConfig.cloudinaryUploadUrl, 'image');
                        var fileData = new FormData();
                        if (viewModel.get("orientation") === "") {
                            cloudUploadUrl = CommunityApp.utilities.stringFormat(CommunityApp.configuration.cloudinaryConfig.cloudinaryUploadUrl, 'image');
                            if ($("#attchUploadStatus")[0].files[0] !== 'undefined' && typeof $("#attchUploadStatus")[0].files[0] !== 'undefined'){
                                if ($("#attchUploadStatus")[0].files[0].size > 1048576) {
                                    Pic = document.getElementById("status-attachment-canvas-new-upload").toDataURL("image/jpeg");
                                    fileData.append("file", CommunityApp.common.dataURItoBlob(Pic));
                                } else { 
                                    fileData.append("file", $("#attchUploadStatus")[0].files[0]);
                                }
                                fileData.append("api_key", CommunityApp.configuration.cloudinaryConfig.api_key);
                                fileData.append("upload_preset", CommunityApp.configuration.cloudinaryConfig.upload_preset);
                                
                                uploadToCloudOptions = {
                                    url: cloudUploadUrl,
                                    dataType: "JSON",
                                    requestType: "POST",
                                    data: fileData,
                                    callBack: viewModel.fnUploadCloudinaryCallback
                                };

                                CommunityApp.dataAccess.callService(uploadToCloudOptions, null, null, true, false, false);
                            } else {
                                postData = {
                                    Subject: "Profile post - Mobile App",
                                    Body: viewModel.get("body"),
                                    ExpirationDate: (new Date().getMonth() + 1) + "/" + new Date().getDate() + "/" + new Date().getFullYear(),
                                    AuthorId: currentUser.id
                                };
                                
                                statusPostOptions = {
                                    url: statusServiceUrl,
                                    requestType: "POST",
                                    dataType: "JSON",
                                    data: postData,
                                    callBack: CommunityApp.status.viewModel.fnPostCallBack
                                };

                                CommunityApp.dataAccess.callService(statusPostOptions);
                            }
                        } else {
                            cloudUploadUrl = CommunityApp.utilities.stringFormat(CommunityApp.configuration.cloudinaryConfig.cloudinaryUploadUrl, 'image');
                            Pic = document.getElementById("status-attachment-canvas-new-upload").toDataURL("image/jpeg");
                            fileData.append("file", CommunityApp.common.dataURItoBlob(Pic));
                            fileData.append("api_key", CommunityApp.configuration.cloudinaryConfig.api_key);
                            fileData.append("upload_preset", CommunityApp.configuration.cloudinaryConfig.upload_preset);
                            
                            uploadToCloudOptions = {
                                url: cloudUploadUrl,
                                dataType: "JSON",
                                requestType: "POST",
                                data: fileData,
                                callBack: viewModel.fnUploadCloudinaryCallback
                            };

                            CommunityApp.dataAccess.callService(uploadToCloudOptions, null, null, true, false, false);
                        }
            
                        
                    } else {
                        postData = {
                            Subject: "Profile post - Mobile App",
                            Body: viewModel.get("body"),
                            ExpirationDate: (new Date().getMonth() + 1) + "/" + new Date().getDate() + "/" + new Date().getFullYear(),
                            AuthorId: currentUser.id,
                            AttachmentExternalUrl: selectedFixedWidthGiphy
                        };
                        
                        statusPostOptions = {
                            url: statusServiceUrl,
                            requestType: "POST",
                            dataType: "JSON",
                            data: postData,
                            callBack: CommunityApp.status.viewModel.fnPostCallBack
                        };

                        CommunityApp.dataAccess.callService(statusPostOptions);
                    }
                }
            }
        },
        fnUploadCloudinaryCallback: function (response) {
            if (response.data) {
                var currentUser = CommunityApp.session.currentUser.load();
                var statusServiceUrl = getServiceUrl(currentUser.id);
                var postData = {
                    Subject: "Profile post - Mobile App",
                    Body: viewModel.get("body"),
                    ExpirationDate: (new Date().getMonth() + 1) + "/" + new Date().getDate() + "/" + new Date().getFullYear(),
                    AuthorId: currentUser.id,
                    AttachmentExternalUrl: response.data.secure_url
                };
                
                var statusPostOptions = {
                    url: statusServiceUrl,
                    requestType: "POST",
                    dataType: "JSON",
                    data: postData,
                    callBack: CommunityApp.status.viewModel.fnPostCallBack
                };

                CommunityApp.dataAccess.callService(statusPostOptions);
            }
        },
        fnPostCallBack: function (response) {
            var currentUserId = CommunityApp.base.baseData.currentUser().id;
            CommunityApp.common.navigateToView("ca-user-profile?userId=" + currentUserId + "&tab=1");
            viewModel.set("body", "");
            viewModel.set("orientation", "");
        },
        likeSuccessCallback: function(operation, likes, sender)
        {
            $(sender).closest(".btn-group").prev().find(".social-info").eq(0).html(likesText(likes));
            toggleButtons(sender, operation);
        },
        goToStatusUpdate: function (statusId, body, attachmentUrl, sender) {
            CommunityApp.session.save("statusToUpdate", { id: statusId, body: body, attachmentUrl: attachmentUrl });

            var relatedPopOver = $(sender).closest("div[id^='actionsPopOver_']").data("kendoMobilePopOver");
            relatedPopOver.close();

            $("div[id^='actionsPopOver_']").each(function () {
                $(this).data("kendoMobilePopOver").destroy();
            });

            CommunityApp.common.navigateToView("ca-user-status-update");
        },
        loadStatusToUpdate: function (e) {
            var statusToUpdate = CommunityApp.session.load("statusToUpdate");

            if (statusToUpdate !== null && typeof statusToUpdate !== 'undefined')
            {
                viewModel.set("id", statusToUpdate.id);
                viewModel.set("body", statusToUpdate.body);
                var canvas = document.getElementById("status-attachment-canvas-update");
                var ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                var img = new Image();
                img.onload = function () {
                    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
                };
                img.src = statusToUpdate.attachmentUrl;
                CommunityApp.common.logTitle("Update Status: " + statusToUpdate.body);
            }
            viewModel.set("forGiphy", false);
            viewModel.set("selectedGiphy", "");
			viewModel.set("selectedFixedWidthGiphy", "");
			var fromView = (e.view.params !== 'undefined' && typeof e.view.params !== 'undefined') ? e.view.params.from : e.params.from;
			if (fromView !== 'undefined' && typeof fromView !== 'undefined' && fromView === 'selectGiphy') {
				viewModel.set("forGiphy", true);
				var threadData = CommunityApp.session.load(CommunityApp.configuration.giphyConfig.offlineStore);
				CommunityApp.session.remove(CommunityApp.configuration.giphyConfig.offlineStore);
				viewModel.set("body", threadData.body);
				viewModel.set("selectedGiphy", threadData.selectedGiphy);
				viewModel.set("selectedFixedWidthGiphy", threadData.selectedFixedWidthGiphy);
				console.log("selectedGiphy: " + threadData.selectedGiphy);
			}
        },
        selectResourceForUpdate: function() {
            var statusData = {};
            statusData.senderView = "#ca-user-status-update?status=update";
            statusData.body = viewModel.get("body");
            statusData.senderObject = "updateStatus";
            CommunityApp.session.save(CommunityApp.configuration.giphyConfig.offlineStore, statusData);
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
        triggerUploadForUpdate: function (selection) {
			if (selection === "giphyResource") {
				viewModel.set("forGiphy", true);
				CommunityApp.common.navigateToView("#ca-select-giphy");
			} else {
                $("#attchUploadStatusUpdate").click();
                $("#attchUploadStatusUpdate").change(function () {
                    viewModel.set("forGiphy", false);
                    CommunityApp.common.readUrl(this, function (response, file) {
                        loadImage.parseMetaData(file, function (data) {
                            var canvas = document.getElementById("status-attachment-canvas-update");
                            var ctx = canvas.getContext('2d');
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            var canvasUpload = document.getElementById("status-attachment-canvas-update-upload");
                            var ctxUpload = canvasUpload.getContext('2d');
                            ctxUpload.clearRect(0, 0, canvasUpload.width, canvasUpload.height);
                            var imgCanvas = new Image();
                            if (data.exif) {
                                imgCanvas.onload = function () {
                                    canvasUpload.width = "900";
                                    canvasUpload.height = imgCanvas.height / imgCanvas.width * 900;
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
        },
        update: function () {

            //CommunityApp.common.authenticatedUser();

            var validator = $("textarea", "#update-status-form").kendoValidator().data("kendoValidator");

            if (validator.validate()) {
                CommunityApp.sounds.post();
                var currentUser = CommunityApp.session.currentUser.load();

                if (currentUser.id && currentUser.id !== 0) {
                    var selectedFixedWidthGiphy = viewModel.get('selectedFixedWidthGiphy');
                    var statusId = viewModel.get("id");
                    var updateServiceUrl = getUpdateServiceUrl(currentUser.id, statusId);
                    var postaData = {};
                    var uploadToCloudOptions = {};
                    var statusPostOptions = {};
                    if (selectedFixedWidthGiphy === "") {
                        var cloudUploadUrl = 'https://api.cloudinary.com/v1_1/pulseltd/image/upload';
                        cloudUploadUrl = CommunityApp.utilities.stringFormat(CommunityApp.configuration.cloudinaryConfig.cloudinaryUploadUrl, 'image');
                        var fileData = new FormData();
                        if (viewModel.get("orientation") === "") {
                            cloudUploadUrl = CommunityApp.utilities.stringFormat(CommunityApp.configuration.cloudinaryConfig.cloudinaryUploadUrl, 'image');
                            if ($("#attchUploadStatusUpdate")[0].files[0] !== 'undefined' && typeof $("#attchUploadStatusUpdate")[0].files[0] !== 'undefined'){
                                if ($("#attchUploadStatusUpdate")[0].files[0].size > 1048576) {
                                    Pic = document.getElementById("status-attachment-canvas-update-upload").toDataURL("image/jpeg");
                                    fileData.append("file", CommunityApp.common.dataURItoBlob(Pic));
                                } else { 
                                    fileData.append("file", $("#attchUploadStatusUpdate")[0].files[0]);
                                }
                                fileData.append("api_key", CommunityApp.configuration.cloudinaryConfig.api_key);
                                fileData.append("upload_preset", CommunityApp.configuration.cloudinaryConfig.upload_preset);
                                
                                uploadToCloudOptions = {
                                    url: cloudUploadUrl,
                                    dataType: "JSON",
                                    requestType: "POST",
                                    data: fileData,
                                    callBack: viewModel.fnUploadCloudinaryCallbackForUpdate
                                };

                                CommunityApp.dataAccess.callService(uploadToCloudOptions, null, null, true, false, false);
                            } else {
                                postData = {
                                    Body: viewModel.get("body")
                                };
                                
                                statusPostOptions = {
                                    url: updateServiceUrl,
                                    requestType: "POST",
                                    dataType: "JSON",
                                    data: postData,
                                    callBack: CommunityApp.status.viewModel.fnPostCallBack
                                };

                                CommunityApp.dataAccess.callService(statusPostOptions);
                            }
                        } else {
                            cloudUploadUrl = CommunityApp.utilities.stringFormat(CommunityApp.configuration.cloudinaryConfig.cloudinaryUploadUrl, 'image');
                            Pic = document.getElementById("status-attachment-canvas-new-upload").toDataURL("image/jpeg");
                            fileData.append("file", CommunityApp.common.dataURItoBlob(Pic));
                            fileData.append("api_key", CommunityApp.configuration.cloudinaryConfig.api_key);
                            fileData.append("upload_preset", CommunityApp.configuration.cloudinaryConfig.upload_preset);
                            
                            uploadToCloudOptions = {
                                url: cloudUploadUrl,
                                dataType: "JSON",
                                requestType: "POST",
                                data: fileData,
                                callBack: viewModel.fnUploadCloudinaryCallbackForUpdate
                            };

                            CommunityApp.dataAccess.callService(uploadToCloudOptions, null, null, true, false, false);
                        }
            
                        
                    } else {
                        postData = {
                            Body: viewModel.get("body"),
                            AttachmentExternalUrl: selectedFixedWidthGiphy
                        };
                        
                        statusPostOptions = {
                            url: updateServiceUrl,
                            requestType: "POST",
                            dataType: "JSON",
                            data: postData,
                            callBack: CommunityApp.status.viewModel.fnPutCallBack
                        };

                        CommunityApp.dataAccess.callService(statusPostOptions);
                    }
                }
            }
        },
        fnUploadCloudinaryCallbackForUpdate: function (response) {
            if (response.data) {
                var currentUser = CommunityApp.session.currentUser.load();
                var statusId = viewModel.get("id");
                var updateServiceUrl = getUpdateServiceUrl(currentUser.id, statusId);
                var postData = {
                    Body: viewModel.get("body"),
                    AttachmentExternalUrl: response.data.secure_url
                };
                
                var statusPostOptions = {
                    url: updateServiceUrl,
                    requestType: "POST",
                    dataType: "JSON",
                    data: postData,
                    callBack: CommunityApp.status.viewModel.fnPutCallBack
                };

                CommunityApp.dataAccess.callService(statusPostOptions);
            }
        },
        fnPutCallBack: function (response) {
            if (response.data) {
                if (response.data.HttpStatus === 200){
                    var userId = CommunityApp.base.baseData.currentUser().id;
                    CommunityApp.common.navigateToView("ca-user-profile?userId=" + userId + "&tab=1");
                } else {
                    CommunityApp.common.showErrorNotification("Unexpected Error!", "Unexpected error occurred. Try again later!");
                }                
            }

            CommunityApp.session.remove("statusToUpdate");
        },
        fnDeleteStatusCallback: function (httpStatus, sender) {
            if (httpStatus === 200) {
                CommunityApp.common.showSuccessNotification("Status is deleted successfully!");
                var relatedPopOver = $(sender).closest("div[id^='actionsPopOver_']").data("kendoMobilePopOver");
                relatedPopOver.close();
                read(CommunityApp.base.baseData.currentUser().id);
            }
            else {
                CommunityApp.common.showErrorNotification("Unexpected Error!", "Unexpected error occurred. Try again later!");
            }
        }
    });

    var read = function (userId) {
        var statusServiceUrl = getServiceUrl(userId);

        var statusLoadOptions = {
            url: statusServiceUrl,
            requestType: "GET",
            dataType: "JSON",
            callBack: CommunityApp.status.viewModel.fnLoadCallBack
        };

        var thatUserId = userId;
		CommunityApp.dataAccess.callService(statusLoadOptions, "user-status-list", "<h2 class='centerAlign padding-1'>No status posts are found!</h2>", null, null, null, function(){
			read(thatUserId);
		});
    };

    var setScrollerClass = function (inputClass) {
        $("#listScroller").removeClass("height-1");
        $("#listScroller").removeClass("height-3");
        $("#listScroller").addClass(inputClass);
    };

    var toggleButtons = function (sender, operation) {
        var postId = $(sender).attr("data-id");
        $(sender).hide();
        if (operation == "like")
            $(sender).parent().append('<a onclick="CommunityApp.post.operations({ likeSuccessCallback: CommunityApp.status.viewModel.likeSuccessCallback }).like(' + postId + ', false, this)" data-id=' + postId + ' class="no-text-decoration light-blue"><span class="km-icon km-heart-empty margin-5"></span>Unlike</a>');
        else
            $(sender).parent().append('<a onclick="CommunityApp.post.operations({ likeSuccessCallback: CommunityApp.status.viewModel.likeSuccessCallback }).like(' + postId + ', true, this)" data-id=' + postId + ' class="no-text-decoration light-blue"><span class="km-icon km-heart margin-5"></span>Like</a>');
        $(sender).remove();
    };

    var likesText = function (likes) {
        var likesText;
        if (likes > 1) {
            likesText = likes + " Likes";
        }
        else if (likes == 1) {
            likesText = "1 Like";
        }
        else {
            likesText = "";
        }
        return likesText;
    };

    return {
        viewModel: viewModel
    };
})();