CommunityApp.folder = (function () {
    var getLibraryFoldersPath = function (userId, libraryId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.librariesConfig.librariesPath + CommunityApp.configuration.librariesConfig.libraryFoldersPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, libraryId);
    };

    var getFolderServiceUrl = function (userId, libraryId, folderId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.librariesConfig.librariesPath + CommunityApp.configuration.librariesConfig.folderPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, libraryId, folderId);
    };

    var getLibraryServiceUrl = function (libraryId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.librariesConfig.librariesPath + CommunityApp.configuration.librariesConfig.galleryPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, libraryId);
    };

    var getFolderFilesServiceUrl = function (userId, libraryId, folderId, resizeFactor) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.librariesConfig.librariesPath + CommunityApp.configuration.librariesConfig.filesPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, libraryId, folderId) + "?resizeFactor=" + resizeFactor;
    };
    
    var getFileUploadedCloudinaryServiceUrl = function (userId, libraryId, folderId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.librariesConfig.librariesPath + CommunityApp.configuration.librariesConfig.cloudinaryPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, libraryId, folderId);
    };
    
    var uploadCloudinaryDirectlyServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.librariesConfig.librariesPath + CommunityApp.configuration.librariesConfig.uploadCloudinaryDirectly;


    var setAddFolderSubmitForm = function () {
        if ($("#add-folder-form")) {
            $("button[type='submit']", "#add-folder-form").html("<span class='km-icon km-add'></span>Add Folder").removeAttr("disabled");
            $("#add-folder-form").unbind("submit");
            $("#add-folder-form").one("submit", function () {
                $("button[type='submit']", this).html("Processing...<div class='loading pos-22 pull-right'></div>").attr('disabled', 'disabled');
                viewModel.addFolder();
                return true;
            });
        }
    };

    var setAddFileSubmitForm = function () {
        if ($("#add-file-form")) {
            $("button[type='submit']", "#add-file-form").html("<span class='km-icon km-upload'></span>Upload File").removeAttr("disabled");
            $("#add-file-form").unbind("submit");
            $("#add-file-form").one("submit", function () {
                $("button[type='submit']", this).html("Processing...<div class='loading pos-22 pull-right'></div>").attr('disabled', 'disabled');
                viewModel.addFile();
                return true;
            });
        }
    };

    var viewModel = kendo.observable({
        title: "",
        description: "",
        iconUrl: "",
        contestRelated: false,
        allowedFileTypes: "",
        parentFolderId: 0,
        libraryId: 0,
        hasSubfolders: false,
        hasFiles: false,
        isLibrary: false,
        fileUrl: "",     
        fileEmbed: "",
        tags: "",
        inprogress: false,
		isImage: true,
        orientation: "",
		previewSelectedFile: "",
        fileType: "",
        uploadCloudinaryDirectly: false,
        hideIcon: function() {
            var url = viewModel.get("iconUrl");
            return url === "" || url === null || !url || typeof url === 'undefined';
        },
        hideFile: function(){
            var url = viewModel.get("fileUrl");
			var isImage = viewModel.get("isImage");
            return url === "" || url === null || !url || typeof url === 'undefined' || !isImage;
        },
        load: function(e)
        {
            //CommunityApp.common.authenticatedUser();

            var userId = CommunityApp.base.baseData.currentUser().id;
            var folderId = e.view.params.folderId;
            var libraryId = e.view.params.libraryId;

			var viewArgs = e;

            viewModel.set("libraryId", libraryId);
            viewModel.set("parentFolderId", folderId);
            viewModel.set("iconUrl", "");
            viewModel.set("fileUrl", "");
            viewModel.set("tags", "");
            viewModel.set("fileEmbed", "");
            viewModel.set("title", "");
            viewModel.set("description", "");
			viewModel.set("orientation", "");
			viewModel.set("previewSelectedFile", "");
			$("#fileUpload").val("");

            var listviews = this.element.find("ul.container-listview");

            $("#select-form").kendoMobileButtonGroup({
                select: function (e) {
                    listviews.hide().eq(e.index).show();
                },
                index: 0
            });

            /*var uploadcontrols = this.element.find(".upload-control");

            $("#select-upload").kendoMobileButtonGroup({
                select: function (e) {
                    uploadcontrols.hide().eq(e.index).show();
                },
                index: 0  
            });*/

            if (libraryId && folderId)
            {
                viewModel.set("isLibrary", false);

                var folderServiceUrl = getFolderServiceUrl(userId, libraryId, folderId);

                var folderOptions = {
                    url: folderServiceUrl,
                    requestType: "GET",
                    dataType: "JSON",
                    callBack: viewModel.fnLoadFolderCallback
                };

				CommunityApp.dataAccess.callService(folderOptions, null, null, null, null, null, function(){
					viewModel.load(viewArgs);
				});
            }
            else if(libraryId)
            {
                viewModel.set("isLibrary", true);

                var libraryServiceUrl = getLibraryServiceUrl(libraryId);

                var libraryOptions = {
                    url: libraryServiceUrl,
                    requestType: "GET",
                    dataType: "JSON",
                    callBack: viewModel.fnLoadLibraryCallback
                };

				CommunityApp.dataAccess.callService(libraryOptions, null, null, null, null, null, function(){
					viewModel.load(viewArgs);
				});
            }

            setAddFolderSubmitForm();
            setAddFileSubmitForm();
        },
        fnLoadFolderCallback: function(response){
            if (response.data) {
                //viewModel.set("description", response.data.Description);
                viewModel.set("hasSubfolders", response.data.HasSubfolders);
                viewModel.set("hasFiles", response.data.TotalFiles > 0);
            }
        },
        fnLoadLibraryCallback: function(response){
            if (response.data) {
                //viewModel.set("title", response.data.Name);
                //viewModel.set("description", response.data.Description);
                viewModel.set("hasSubfolders", response.data.TotalFolders > 0);
            }
        },
        addFolder: function()
        {
            //CommunityApp.common.authenticatedUser();

            viewModel.set("inprogress", true);
            var libraryId = viewModel.get("libraryId");
            var userId = CommunityApp.base.baseData.currentUser().id;

            var fileData = new FormData();
            fileData.append("file", CommunityApp.common.dataURItoBlob(viewModel.get("fileUrl")));
            fileData.append("data", JSON.stringify({ Title: viewModel.get("title"), Description: viewModel.get("description"), AllowedFileTypes: viewModel.get("allowedFileTypes"), ParentFolderId: viewModel.get("parentFolderId") }));

            var serviceUrl = getLibraryFoldersPath(userId, libraryId);

            var addFolderOptions = {
                url: serviceUrl,
                dataType: "JSON",
                requestType: "POST",
                data: fileData,
                callBack: viewModel.fnAddFolderCallback,
                sender: libraryId
            };

            CommunityApp.dataAccess.callService(addFolderOptions, null, null, true, false, false);
        },
        getUploadCloudinaryDirectlyValue: function () {
            var uploadCloudinaryDirectlyOptions = {
                url: uploadCloudinaryDirectlyServiceUrl,
                dataType: "JSON",
                requestType: "GET",
                callBack: viewModel.fnUploadCloudinaryDirectlyCallback
            };

            CommunityApp.dataAccess.callService(uploadCloudinaryDirectlyOptions, null, null, true, false, false);
        },
        addFile: function () {
            //CommunityApp.common.authenticatedUser();
            var uploadCloudinaryDirectly = CommunityApp.session.load("uploadCloudinaryDirectly", true);
            viewModel.set("uploadCloudinaryDirectly", uploadCloudinaryDirectly);
            viewModel.uploadFile();
        },
        fnUploadCloudinaryDirectlyCallback: function(response) {
            var uploadCloudinaryDirectly = false;
            if (response.data !== null) {
                uploadCloudinaryDirectly = response.data;
            } else {
                uploadCloudinaryDirectly = false;
            }
            CommunityApp.session.save("uploadCloudinaryDirectly", uploadCloudinaryDirectly, true);
        },
        uploadFile: function() {
            var uploadCloudinaryDirectly = viewModel.get("uploadCloudinaryDirectly");
            var libraryId = viewModel.get("libraryId");
            var userId = CommunityApp.base.baseData.currentUser().id;
            var folderId = viewModel.get("parentFolderId");

            var cloudUploadUrl = 'https://api.cloudinary.com/v1_1/pulseltd/image/upload';
            var fileData = new FormData();
			var Pic;
			var isImage = viewModel.get("isImage");
            if (uploadCloudinaryDirectly === true) {
                if (!isImage) {
                    if (viewModel.get('fileType') === "video") {
                        cloudUploadUrl = CommunityApp.utilities.stringFormat(CommunityApp.configuration.cloudinaryConfig.cloudinaryUploadUrl, 'video');
                    }
                    fileData.append("file", $("#fileUpload")[0].files[0]);
                    /*fileData.append("data", JSON.stringify({
                        Title: viewModel.get("title"),
                        Description: viewModel.get("description"),
                        ParentFolderId: viewModel.get("parentFolderId"),
                        VideoEmbed: viewModel.get("fileEmbed"),
                        FileUrl: viewModel.get("fileUrl"),
                        Tags: viewModel.get("tags")
                    }));*/
                } else if (viewModel.get("orientation") === "") {
                    cloudUploadUrl = CommunityApp.utilities.stringFormat(CommunityApp.configuration.cloudinaryConfig.cloudinaryUploadUrl, 'image');
                    if ($("#fileUpload")[0].files[0] !== 'undefined' && typeof $("#fileUpload")[0].files[0] !== 'undefined'){
                        if ($("#fileUpload")[0].files[0].size > 1048576) {
                            Pic = document.getElementById("file-canvas-upload").toDataURL("image/jpeg");
                            fileData.append("file", CommunityApp.common.dataURItoBlob(Pic));
                            /*fileData.append("data", JSON.stringify({
                                Title: viewModel.get("title"),
                                Description: viewModel.get("description"),
                                ParentFolderId: viewModel.get("parentFolderId"),
                                VideoEmbed: viewModel.get("fileEmbed"),
                                FileUrl: Pic,
                                Tags: viewModel.get("tags")
                            }));*/
                        } else { 
                            fileData.append("file", $("#fileUpload")[0].files[0]);
                            /*fileData.append("data", JSON.stringify({
                                Title: viewModel.get("title"),
                                Description: viewModel.get("description"),
                                ParentFolderId: viewModel.get("parentFolderId"),
                                VideoEmbed: viewModel.get("fileEmbed"),
                                FileUrl: viewModel.get("fileUrl"),
                                Tags: viewModel.get("tags")
                            }));*/
                        }
                    }
                } else {
                    cloudUploadUrl = CommunityApp.utilities.stringFormat(CommunityApp.configuration.cloudinaryConfig.cloudinaryUploadUrl, 'image');
                    Pic = document.getElementById("file-canvas-upload").toDataURL("image/jpeg");
                    fileData.append("file", CommunityApp.common.dataURItoBlob(Pic));
                    
                    /*fileData.append("data", JSON.stringify({
                        Title: viewModel.get("title"),
                        Description: viewModel.get("description"),
                        ParentFolderId: viewModel.get("parentFolderId"),
                        VideoEmbed: viewModel.get("fileEmbed"),
                        FileUrl: Pic,
                        Tags: viewModel.get("tags")
                    }));*/
                }
                fileData.append("api_key", CommunityApp.configuration.cloudinaryConfig.api_key);
                fileData.append("upload_preset", CommunityApp.configuration.cloudinaryConfig.upload_preset);
                
                var addFileOptions = {
                    url: cloudUploadUrl,
                    dataType: "JSON",
                    requestType: "POST",
                    data: fileData,
                    callBack: viewModel.fnUploadCloudinaryCallback
                };

                CommunityApp.dataAccess.callService(addFileOptions, null, null, true, false, false);
            } else {
                if (!isImage) {
                    fileData.append("file", $("#fileUpload")[0].files[0]);
                    fileData.append("data", JSON.stringify({
                        Title: viewModel.get("title"),
                        Description: viewModel.get("description"),
                        ParentFolderId: viewModel.get("parentFolderId"),
                        VideoEmbed: viewModel.get("fileEmbed"),
                        FileUrl: viewModel.get("fileUrl"),
                        Tags: viewModel.get("tags")
                    }));
                } else if (viewModel.get("orientation") === "") {
                    if ($("#fileUpload")[0].files[0] !== 'undefined' && typeof $("#fileUpload")[0].files[0] !== 'undefined'){
                        if ($("#fileUpload")[0].files[0].size > 1048576) {
                            Pic = document.getElementById("file-canvas-upload").toDataURL("image/jpeg");
                            fileData.append("file", CommunityApp.common.dataURItoBlob(Pic));
                            fileData.append("data", JSON.stringify({
                                Title: viewModel.get("title"),
                                Description: viewModel.get("description"),
                                ParentFolderId: viewModel.get("parentFolderId"),
                                VideoEmbed: viewModel.get("fileEmbed"),
                                FileUrl: Pic,
                                Tags: viewModel.get("tags")
                            }));
                        } else {
                            fileData.append("file", $("#fileUpload")[0].files[0]);
                            fileData.append("data", JSON.stringify({
                                Title: viewModel.get("title"),
                                Description: viewModel.get("description"),
                                ParentFolderId: viewModel.get("parentFolderId"),
                                VideoEmbed: viewModel.get("fileEmbed"),
                                FileUrl: viewModel.get("fileUrl"),
                                Tags: viewModel.get("tags")
                            }));
                        }
                    }
                } else {
                    Pic = document.getElementById("file-canvas-upload").toDataURL("image/jpeg");
                    fileData.append("file", CommunityApp.common.dataURItoBlob(Pic));
                    fileData.append("data", JSON.stringify({
                        Title: viewModel.get("title"),
                        Description: viewModel.get("description"),
                        ParentFolderId: viewModel.get("parentFolderId"),
                        VideoEmbed: viewModel.get("fileEmbed"),
                        FileUrl: Pic,
                        Tags: viewModel.get("tags")
                    }));
                }

                var serviceUrl = getFolderFilesServiceUrl(userId, libraryId, folderId, 0.2);

                console.log(serviceUrl);

                var addFileToServerOptions = {
                    url: serviceUrl,
                    dataType: "JSON",
                    requestType: "POST",
                    data: fileData,
                    callBack: viewModel.fnAddFileCallback
                };

                CommunityApp.dataAccess.callService(addFileToServerOptions, null, null, true, false, false);
            }

            /*var serviceUrl = getFolderFilesServiceUrl(userId, libraryId, folderId, 0.2);

            console.log(serviceUrl);

            var addFileOptions = {
                url: serviceUrl,
                dataType: "JSON",
                requestType: "POST",
                data: fileData,
                callBack: viewModel.fnAddFileCallback
            };

            CommunityApp.dataAccess.callService(addFileOptions, null, null, true, false, false);*/
        },
        fnAddFolderCallback: function (response, sender) {

            if (response.data) {
                if (response.data.HttpStatus == 200) {
                    var libraryId = sender;
                    var folderId = response.data.AdditionalData;
                    CommunityApp.common.navigateToView("#ca-library-subfolders?libraryId=" + libraryId + "&folderId=" + folderId);
                }
                else
                {
                    CommunityApp.common.showErrorNotification("Missing Data", "Required data are missing!");
                }
            }
            else
            {
                CommunityApp.common.showErrorNotification("Missing Data", "Required data are missing!");
            }

            viewModel.set("inprogress", false);
        },
        fnUploadCloudinaryCallback: function (response) {
            console.log("end upload file request: "+response.data.HttpStatus);
            console.log(response);
            var libraryId = viewModel.get("libraryId");
            var userId = CommunityApp.base.baseData.currentUser().id;
            var folderId = viewModel.get("parentFolderId");
            if (response.data) {
                var fileUploadUrl = getFileUploadedCloudinaryServiceUrl(userId, libraryId, folderId);
                console.log(fileUploadUrl);
                
                var uploadData = {
                    FileName: response.data.original_filename,
                    Format: response.data.format,
                    MediaType: response.data.resource_type,
                    PublicId: response.data.public_id,
                    Url: response.data.url,
                    Version: response.data.version,
                    Angle: 0,
                    Value: {
                        Title: viewModel.get("title"),
                        Description: viewModel.get("description"),
                        ParentFolderId: viewModel.get("parentFolderId"),
                        VideoEmbed: viewModel.get("fileEmbed"),
                        FileUrl: '',
                        Tags: viewModel.get("tags")
                    }
                };
                console.log(JSON.stringify(uploadData));
                var addFileOptions = {
                    url: fileUploadUrl,
                    requestType: "POST",
                    dataType: "JSON",
                    data: JSON.stringify(uploadData),
                    callBack: viewModel.fnAddFileCallback
                };

                CommunityApp.dataAccess.callService(addFileOptions, null, null, true, false, 'application/json');
            } else {
                CommunityApp.common.showErrorNotification("Unexpected Error!", "Unexpected Error! Try again later.");
                setAddFileSubmitForm();
            }
        },
        fnAddFileCallback: function (response) {
            console.log("end upload file request: "+response.data.HttpStatus);
            console.log(response);

            if(response.data)
            {
                if(response.data.HttpStatus == 200)
                {
                    var libraryId = viewModel.get("libraryId");
                    var folderId = viewModel.get("parentFolderId");
                    CommunityApp.common.navigateToView("#ca-library-subfolders?libraryId=" + libraryId + "&folderId=" + folderId);
                }
            }
        },
        triggerUpload: function () {
            $("#iconUpload").click();
            $("#iconUpload").unbind("change");
            $("#iconUpload").change(function () {
                CommunityApp.common.readUrl(this, function (response) {
                    viewModel.set("iconUrl", response);
                    var canvas = document.getElementById("folder-icon-canvas");
                    var ctx = canvas.getContext('2d');
                    var img = new Image();
                    img.onload = function () {
                        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
                    };
                    img.src = response;
                });
            });  
        },
        triggerUploadFile: function () {
            $("#fileUpload").click();
            $("#fileUpload").unbind("change");
            $("#fileUpload").change(function () {
                CommunityApp.common.readUrl(this, function (response, file) {
					var fileType = file.type.substr(0,5);
					console.log("file type: " + file.type);
                    viewModel.set('fileType', fileType);
					if (fileType === "image") {
						viewModel.set("isImage", true);
						loadImage.parseMetaData(file, function (data) {
							var canvas = document.getElementById("file-canvas");
							var ctx = canvas.getContext('2d');
							ctx.clearRect(0, 0, canvas.width, canvas.height);
							var canvasUpload = document.getElementById("file-canvas-upload");
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
											viewModel.set("fileUrl", img.toDataURL());
											imgCanvas.src = img.toDataURL();
										}
										else
										{
											viewModel.set("fileUrl", response);
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
									viewModel.set("fileUrl", response);
									imgCanvas.onload = function () {
										canvasUpload.width = "900";
										canvasUpload.height = imgCanvas.height / imgCanvas.width * 900;
										ctxUpload.drawImage(imgCanvas, 0, 0, imgCanvas.width, imgCanvas.height, 0, 0, canvasUpload.width, canvasUpload.height);
										ctx.drawImage(imgCanvas, 0, 0, imgCanvas.width, imgCanvas.height, 0, 0, canvas.width, canvas.height);
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
					} else {
						viewModel.set("isImage", false);
						viewModel.set("fileUrl", response);
						if (fileType === "video")
							viewModel.set("previewSelectedFile", "Video Selected");
						else
							viewModel.set(file.type + " Selected");
						return;
					}
                });
            });
        }
    });

    return {
        viewModel: viewModel
    };
})();