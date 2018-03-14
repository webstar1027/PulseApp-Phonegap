CommunityApp.librarySubfolders = (function () {
    
    var getLibrarySubfoldersPath = function (userId, libraryId, folderId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.librariesConfig.librariesPath + CommunityApp.configuration.librariesConfig.subfoldersPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, libraryId, folderId);
    };

    var getFolderServiceUrl = function (userId, libraryId, folderId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.librariesConfig.librariesPath + CommunityApp.configuration.librariesConfig.folderPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, libraryId, folderId);
    };

    var getFolderFilesServiceUrl = function (userId, libraryId, folderId, resizeFactor) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.librariesConfig.librariesPath + CommunityApp.configuration.librariesConfig.filesPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, libraryId, folderId) + "?resizeFactor=" + resizeFactor;
    };

    var viewModel = kendo.observable({
        title: "",
        description: "",
        tabIndex: 0,
        inprogress: false,
        pages_read: [],
		noSubfolders: false,
		noFiles: false,
        load: function (e) {
            //CommunityApp.common.authenticatedUser();
            viewModel.set("inprogress", true);
			viewModel.set("noSubfolders", false);
			viewModel.set("noFiles", false);

            var listviews = this.element.find("div.km-listview");
            $("#select-view").kendoMobileButtonGroup({
                select: function (e) {
                    listviews.hide()
                             .eq(e.index)
                             .show();
                },
                index: viewModel.get("tabIndex")
            });

            var userId = CommunityApp.base.baseData.currentUser().id;
            var folderId = e.view.params.folderId;
            var libraryId = e.view.params.libraryId;

            if (!libraryId)
                libraryId = 0;

            var addFolderUrl = "ca-library-folder-add?folderId=" + folderId + "&libraryId=" + libraryId;
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
              
            var serviceUrl = getLibrarySubfoldersPath(userId, libraryId, folderId);

            var scroller;
            var total = 0;
            var pageSize = 24;
            var currentPage = 1;
            var newView;
            var topLevelResult;
            var viewedIndex = 0;
            var pagingThreshold = 4;
			viewModel.set("pages_read", []);

			var dataSource = CommunityApp.dataAccess.kendoDataSource(currentPage, pageSize, serviceUrl, "GET", null, "library-subfolders", "<h2 class='centerAlign padding-1'>No folders are found!</h2>", null, function(){
				viewModel.load(viewArgs);
			});

            dataSource.read().then(function () {
                var view = dataSource.view();
                view = CommunityApp.common.injectIndex(currentPage, pageSize, view);

                var tabs = $("#select-view").data("kendoMobileButtonGroup");
                if (view.length > 0)
                {
                    $("#library-subfolders").show();
                    $("#library-files").hide();
                    viewModel.set("tabIndex", 0);
                    tabs.select(0);
                }
                else
                {
                    $("#library-subfolders").hide();
                    $("#library-files").show();
                    viewModel.set("tabIndex", 1);
                    tabs.select(1);
					viewModel.set("noSubfolders", true);
                }

                var subFolderTemplate = kendo.template($('#library-subfolders-tmpl').html());
                var subFolderResult = kendo.render(subFolderTemplate, view);
                

                $("#library-subfolders").find(".container-fluid").empty();
                $("#library-subfolders").find(".container-fluid").append(subFolderResult);

                scroller = e.view.scroller;
                scroller.reset();

                scroller.bind("scroll", function (e) {
                    $(".folder-item").each(function () {
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
                                        var newSubFolderResult = kendo.render(subFolderTemplate, newView);
                                        $("#library-subfolders").find(".container-fluid").append(newSubFolderResult);

                                    }, 0);

                                });
                            }
                        }
                    });
                });
            });

            var folderFilesServiceUrl = getFolderFilesServiceUrl(userId, libraryId, folderId, 0.25);

            var filesPageSize = 50;
            var filesCurrentPage = 1;
            var filesScroller;
            var filesTotal = 0;
            var filesNewView;
            var filesTopLevelResult;
            var filesViewedIndex = 0;
            var filesPagingThreshold = 4;

            var filesDataSource = CommunityApp.dataAccess.kendoDataSource(filesCurrentPage, filesPageSize, folderFilesServiceUrl, "GET", null, "library-files", "<h2 class='centerAlign padding-1'>No files are found!</h2>", null, function(){
				viewModel.load(viewArgs);
			});

            filesDataSource.fetch(function () {
                var view = filesDataSource.view();
                view = CommunityApp.common.injectIndex(filesCurrentPage, filesPageSize, view);
				
				if (view.length > 0)
                {
					viewModel.set("noFiles", false);
					$('#select-folder').attr("style", "");
                }
                else
                {
					viewModel.set("noSubfolders", true);
					console.log("no subfolders: " + viewModel.get("noSubfolders"));
					viewModel.set("noFiles", true);
					$('#select-folder').attr("style", "border-radius: 4px; border-width: 1px");
                }
				
				var i = 0;
				for (i=0; i<view.length; i++) {
					if (view[i].MediaGalleryFilePost.PostAuthor.UserProfile.FullName.length > 16) {
						view[i].MediaGalleryFilePost.PostAuthor.UserProfile.ShortenName = view[i].MediaGalleryFilePost.PostAuthor.UserProfile.FullName.substr(0, 13) + '...';
					} else {
						view[i].MediaGalleryFilePost.PostAuthor.UserProfile.ShortenName = view[i].MediaGalleryFilePost.PostAuthor.UserProfile.FullName;
					}
					
				}

                var filesTemplate = kendo.template($('#library-folder-files-tmpl').html());
                var filesResult = kendo.render(filesTemplate, view);
                $("#library-files").find(".container-fluid").empty();
                $("#library-files").find(".container-fluid").append(filesResult);
                var pages_read = viewModel.get("pages_read");
                pages_read.push(filesCurrentPage);
                console.log("after pushing 1st page: "+ JSON.stringify(pages_read));


                viewModel.set("inprogress", false);

                filesScroller = e.view.scroller;
                filesScroller.reset();

                filesScroller.bind("scroll", function (e) {
                    $(".image-item").each(function () {
                        if ($(this).visible()) {
                            filesViewedIndex = $(this).attr("data-index");
                            filesTotal = filesDataSource.total();
                            filesPageSize = filesDataSource.pageSize();
                            filesCurrentPage = filesDataSource.page();

                            if (filesViewedIndex == ((filesCurrentPage * filesPageSize) - filesPagingThreshold) && (filesCurrentPage * filesPageSize) < filesTotal) {
                                var oldView = filesDataSource.view();
                                oldView = CommunityApp.common.injectIndex(filesCurrentPage, filesPageSize, oldView);

                                filesCurrentPage = filesCurrentPage + 1;
                                filesDataSource.page(filesCurrentPage);

                                filesDataSource.fetch(function () {
                                    console.log("after fetching: " + JSON.stringify(pages_read));
                                    if (pages_read.indexOf(filesCurrentPage) < 0)
                                    {
                                        pages_read.push(filesCurrentPage);
                                        console.log("pushing a new page: " + JSON.stringify(pages_read));
                                        filesNewView = filesDataSource.view();
                                        filesNewView = CommunityApp.common.injectIndex(filesCurrentPage, filesPageSize, filesNewView);
										
										var i = 0;
										for (i=0; i<filesNewView.length; i++) {
											if (filesNewView[i].MediaGalleryFilePost.PostAuthor.UserProfile.FullName.length > 16) {
												filesNewView[i].MediaGalleryFilePost.PostAuthor.UserProfile.ShortenName = filesNewView[i].MediaGalleryFilePost.PostAuthor.UserProfile.FullName.substr(0, 13) + '...';
											} else {
												filesNewView[i].MediaGalleryFilePost.PostAuthor.UserProfile.ShortenName = filesNewView[i].MediaGalleryFilePost.PostAuthor.UserProfile.FullName;
											}
											
										}
                                        var equalViews = CommunityApp.utilities.areEqual(oldView, filesNewView);

                                        if (!equalViews) {
                                            setTimeout(function () {
                                                console.log("rendering page: " + filesDataSource.page());
                                                var filesNewResult = kendo.render(filesTemplate, filesNewView);
                                                $("#library-files").find(".container-fluid").append(filesNewResult);
                                            }, 0);
                                        }
                                    }
                                });
                            }
                        }
                    });
                });
            });
        },
        fnLoadFolderCallback: function(response){
            if(response.data)
            {
                CommunityApp.common.logTitle("Sub folder: " + response.data.Title);
                viewModel.set("title", response.data.Title);
                viewModel.set("description", response.data.Description);
            }
        },
        folderRedirect: function (id, hasSubfolders, libraryId) {
            var path;

            if (hasSubfolders.toLowerCase() === "true") {
                path = "#ca-library-subfolders?folderId=" + id + "&libraryId=" + libraryId;
            }
            else {
                path = "#ca-library-subfolders?folderId=" + id + "&libraryId=" + libraryId;
            }

            CommunityApp.common.navigateToView(path);
        }
    });

    return {
        viewModel: viewModel
    };
})();