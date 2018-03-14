CommunityApp.libraryFolderFiles = (function () {

    var getFolderFilesServiceUrl = function (userId, libraryId, folderId, resizeFactor) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.librariesConfig.librariesPath + CommunityApp.configuration.librariesConfig.filesPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, libraryId, folderId) + "?resizeFactor="+resizeFactor;
    };

    var getFolderServiceUrl = function (userId, libraryId, folderId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.librariesConfig.librariesPath + CommunityApp.configuration.librariesConfig.folderPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, libraryId, folderId);
    };

    var viewModel = kendo.observable({
        title: "",
        description: "",
        inprogress: false,
        load: function(e)
        {
            //CommunityApp.common.authenticatedUser();
            viewModel.set("inprogress", true);

            var folderId = e.view.params.folderId;
            var libraryId = e.view.params.libraryId;
            var userId = CommunityApp.base.baseData.currentUser().id;

            var addFolderUrl = "#ca-library-folder-add?folderId=" + folderId + "&libraryId=" + libraryId;
            CommunityApp.common.setAddFolderPath(e.view, addFolderUrl);

            var folderServiceUrl = getFolderServiceUrl(userId, libraryId, folderId);

            var folderOptions = {
                url: folderServiceUrl,
                requestType: "GET",
                dataType: "JSON",
                callBack: viewModel.fnLoadFolderCallback
            };

            var viewArgs = e;
			CommunityApp.dataAccess.callService(folderOptions, null, null, null, null, null, function(){
				viewModel.load(viewArgs);
			});

            var serviceUrl = getFolderFilesServiceUrl(userId, libraryId, folderId, 0.25);

            var pageSize = 50;
            var currentPage = 1;
            var scroller;
            var total = 0;
            var newView;
            var topLevelResult;
            var viewedIndex = 0;
            var pagingThreshold = 4;

			var dataSource = CommunityApp.dataAccess.kendoDataSource(currentPage, pageSize, serviceUrl, "GET", null, "library-folder-files", "<h2 class='centerAlign padding-1'>No files are found!</h2>", null, function(){
				viewModel.load(viewArgs);
			});

            dataSource.fetch(function () {
                var view = dataSource.view();
                view = CommunityApp.common.injectIndex(currentPage, pageSize, view);
  
                var topLevelTemplate = kendo.template($('#library-folder-files-tmpl').html());
                var topLevelResult = kendo.render(topLevelTemplate, view);
                console.log(topLevelResult);
                $("#library-folder-files").find(".container-fluid").empty();
                $("#library-folder-files").find(".container-fluid").append(topLevelResult);

                scroller = e.view.scroller;
                scroller.reset();

                scroller.bind("scroll", function (e) {
                    $(".image-item").each(function () {
                        if ($(this).visible()) {
                            viewedIndex = $(this).attr("data-index");
                            total = dataSource.total();
                            pageSize = dataSource.pageSize();
                            currentPage = dataSource.page();

                            if (viewedIndex == ((currentPage * pageSize) - pagingThreshold) && (currentPage * pageSize) < total) {
                                currentPage += 1;
                                dataSource.page(currentPage);

                                dataSource.fetch(function () {
                                    newView = dataSource.view();
                                    var equalViews = CommunityApp.utilities.areEqual(view, newView);

                                    if (!equalViews)
                                    {
                                        setTimeout(function () {
                                            console.log("rendering page: " + dataSource.page());
                                            newView = CommunityApp.common.injectIndex(currentPage, pageSize, newView);
                                            topLevelResult = kendo.render(topLevelTemplate, newView);
                                            $("#library-folder-files").find(".container-fluid").append(topLevelResult);
                                        }, 100);
                                    }
                                });
                            }
                        }
                    });
                });
            });
        },  
        fnLoadFolderCallback: function (response) { 
            if(response.data)
            {
                CommunityApp.common.logTitle("Folder: " + response.data.Title);
                viewModel.set("title", response.data.Title);
                viewModel.set("description", response.data.Description);
            }

            viewModel.set("inprogress", false);
        },
        filesRedirect: function(folderId, libraryId, index, type, fileUrl, postId)
        {
            console.log(type.toLowerCase());
            if (fileUrl !== null)
            {
                switch (type.toLowerCase()) {
                    case "image":
                        var path = "#ca-library-files-scroller?folderId=" + folderId + "&libraryId=" + libraryId + "&index=" + index;
                        CommunityApp.common.navigateToView(path);
                        break;
					case "pdf":
					case "word":
					case "excel":
                    case "video":
                        if (CommunityApp.common.deviceType() === "android") {
                            console.log("fileUrl: "+fileUrl);
                            var fileName = fileUrl.substr(fileUrl.lastIndexOf('/')+1);
                            var folderName = "Download";
                            
                            if (CommunityApp.common.deviceType() === "android") {
                                folderName = "Download";
                            } else if (CommunityApp.common.deviceType() === "iphone" || CommunityApp.common.deviceType() === "ipad"){
                                folderName = "Download";
                            }
                            console.log("FileName: " + fileName);
                            
                            var onDirectorySuccess = function(parent) {
                                // Directory created successfuly
                                console.log("Directory Created Successfully!");
                            };

                            var onDirectoryFail = function(error) {
                                //Error while creating directory
                                CommunityApp.common.showErrorNotification("Error!", "Unable to create new directory: " + error.code);
                            };
                            
                            var fileSystemSuccess = function (fileSystem) {
                                var fp = fileSystem.root.toURL() + folderName + "/" + fileName; // Returns Fulpath of local directory
                                
                                $('#library-subfolder-files-container').hide();
                                $('<div class="k-loading-mask" style="width: 100%; height: 100%; top: 0px; left: 0px;"><span class="k-loading-text">Downloading...</span><div class="k-loading-image"></div><div class="k-loading-color"></div></div>').appendTo('#ca-library-subfolders .km-content');
                                
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
                            
                            var fileSystemFail = function(evt) {
                                //Unable to access file system
                                CommunityApp.common.showErrorNotification("Error!", "Unexpected error, please try again later!");
                            };
                            
                            if (fileUrl === null || fileUrl === "") {
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
                            

                            var downloadFile = function (fileUrl, fp) {
                                var fileTransfer = new FileTransfer();
                                fileUrl = fileUrl.replace(/ /g,"%20");
                                console.log("replaced fileUrl: "+fileUrl);
                                fileTransfer.download(fileUrl, fp,
                                    function (entry) {
                                        $('#ca-library-subfolders .k-loading-mask').remove();
                                        $('#library-subfolder-files-container').show();
                                        //CommunityApp.common.showSuccessNotification("Successfully Downloaded!");
                                        //CommunityApp.common.showSuccessNotification(fp);
                                        
                                        var localFileUrl = entry.toURL();
                                        localFileUrl = localFileUrl.replace(/%20/g, " ");
                                        
                                        cordova.InAppBrowser.open(encodeURI(localFileUrl), "_system");
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
                        } else {
                            cordova.InAppBrowser.open(encodeURI(fileUrl), "_system");
                        }
					
					
						
						break;
                    default:
                        cordova.InAppBrowser.open(encodeURI(fileUrl), "_system");
                        break;
                }
            } else {
                var postPath = "#ca-post?postId=" + postId + "&mode=post";
                CommunityApp.common.navigateToView(postPath);
            }
            
        }  
    });


    return {
        viewModel: viewModel
    };
})();