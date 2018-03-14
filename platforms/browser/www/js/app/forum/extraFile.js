CommunityApp.extraFile = (function () {

    var getExtraFileServiceUrl = function (userId, sectionId, threadId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.forumConfig.forumsPath + CommunityApp.configuration.forumConfig.extraFilePath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, sectionId, threadId);
    };

    var setExtraFileSubmitForm = function () {
        if ($("#extra-file-form")) {
            $("button[type='submit']", "#extra-file-form").html("<span class='km-icon km-upload'></span>Attach").removeAttr("disabled");
            $("#extra-file-form").unbind("submit");
            $("#extra-file-form").bind("submit", function () {
                $("button[type='submit']", this).html("Processing...<div class='loading'></div>").attr('disabled', 'disabled');
                viewModel.attach();
                return true;
            });
        }
    };

    var viewModel = kendo.observable({
        hideIcon: true,
        attachmentUrl: "",
        orientation: "",
        threadId: 0,
        postId: 0,
        sectionId: 0,
        load: function (e) {
            viewModel.set("hideIcon", true);
            setExtraFileSubmitForm();
            viewModel.set("threadId", e.view.params.threadId);
            viewModel.set("postId", e.view.params.postId);
            viewModel.set("sectionId", e.view.params.sectionId);
        },
        attach: function(){
            var threadId = viewModel.get("threadId");
            var sectionId = viewModel.get("sectionId");
            var userId = CommunityApp.base.baseData.currentUser().id;
            var postId = viewModel.get("postId");

            var extraFileServiceUrl = getExtraFileServiceUrl(userId, sectionId, threadId);

            var fileData = new FormData();
            var Pic;

            if ($("#attchExtraUpload")[0].files.length > 0)
            {
                if (viewModel.get("orientation") === "") {
                    if ($("#attchExtraUpload")[0].files[0] !== 'undefined' && typeof $("#attchExtraUpload")[0].files[0] !== 'undefined') {
                        if ($("#attchExtraUpload")[0].files[0].size > 1048576) {
                            Pic = document.getElementById("discussion-extra-attachment-canvas-new-upload").toDataURL("image/jpeg");
                            fileData.append("file", CommunityApp.common.dataURItoBlob(Pic));
                        } else {
                            fileData.append("file", $("#attchExtraUpload")[0].files[0]);
                        }
                    }
                } else {
                    Pic = document.getElementById("discussion-extra-attachment-canvas-new-upload").toDataURL("image/jpeg");
                    fileData.append("file", CommunityApp.common.dataURItoBlob(Pic));
                }

                fileData.append("data", JSON.stringify({ ParentPostId: postId }));

                var extraFileOptions = {
                    url: extraFileServiceUrl,
                    requestType: "PUT",
                    dataType: "JSON",
                    data: fileData,
                    callBack: viewModel.fnExtraFileCallback,
                    sender: {
                        threadId: threadId
                    }
                };

                CommunityApp.dataAccess.callService(extraFileOptions, null, null, true, false, false);
            }
            else
            {
                navigator.notification.alert("Please select a file to attach!", function () { }, "Acosta");
                $("button[type='submit']", "#extra-file-form").html("<span class='km-icon km-upload'></span>Attach").removeAttr("disabled");
            }

        },
        fnExtraFileCallback: function(response, sender)
        {
            if(response && response.data)
            {
                if (response.data.HttpStatus == "200") {
                    CommunityApp.common.navigateToView("#ca-thread-discussion?threadId=" + sender.threadId);
                }
            }
        },
        triggerUpload: function () {
            $("#attchExtraUpload").click();
            $("#attchExtraUpload").change(function () {
                CommunityApp.common.readUrl(this, function (response, file) {
                    loadImage.parseMetaData(file, function (data) {
                        var canvas = document.getElementById("discussion-extra-attachment-canvas-newthread");
                        var ctx = canvas.getContext('2d');
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        var canvasUpload = document.getElementById("discussion-extra-attachment-canvas-new-upload");
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
                                    viewModel.set("attachmentUrl", img.toDataURL());
                                    imgCanvas.src = img.toDataURL();
                                }
                                else {
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

                        viewModel.set("hideIcon", false);
                    });
                });
            });
        }
    });

    return {
        viewModel: viewModel
    };
})();