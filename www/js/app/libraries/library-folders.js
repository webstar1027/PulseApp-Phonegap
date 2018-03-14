CommunityApp.libraryFolders = (function () {

    var getLibraryFoldersPath = function (userId, libraryId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.librariesConfig.librariesPath + CommunityApp.configuration.librariesConfig.libraryFoldersPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, libraryId);
    };

    var sectionServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.sectionConfig.sectionPath;

    var viewModel = kendo.observable({
        name: "",
        description: "",
        inprogress: false,
        pagesRendered: [],
        load: function (e) {
            //CommunityApp.common.authenticatedUser();

            viewModel.set("inprogress", true);

            var viewArgs = e;
            if (e.view.params.libraryId !== 'undefined' && typeof e.view.params.libraryId !== 'undefined') {

                var addFolderUrl = "ca-library-folder-add?libraryId=" + e.view.params.libraryId;
                CommunityApp.common.setAddFolderPath(e.view, addFolderUrl);

                var sectionLoadOptions = {
                    url: sectionServiceUrl + e.view.params.libraryId,
                    requestType: "GET",
                    dataType: "JSON",
                    callBack: viewModel.fnLoadLibrarySectionCallback
                };

				CommunityApp.dataAccess.callService(sectionLoadOptions, null, null, null, null, null, function(){
					viewModel.load(viewArgs);
				});
            }

            var userId = CommunityApp.base.baseData.currentUser().id;
            var serviceUrl = getLibraryFoldersPath(userId, e.view.params.libraryId);

            var scroller;
            var total = 0;
            var pageSize = 10;
            var currentPage = 1;
            var newView;
            var topLevelResult;
            var viewedIndex = 0;
            var pagingThreshold = 4;

			var dataSource = CommunityApp.dataAccess.kendoDataSource(currentPage, pageSize, serviceUrl, "GET", null, "library-folders", "<h2 class='centerAlign padding-1'>No folders are found!</h2>", null, function(){
				viewModel.load(viewArgs);
			});

            dataSource.read().then(function () {
                var view = dataSource.view();

                view = CommunityApp.common.injectIndex(currentPage, pageSize, view);
                var topLevelTemplate = kendo.template($('#library-folders-tmpl').html());
                var topLevelResult = kendo.render(topLevelTemplate, view);

                $("#library-folders").find(".container-fluid").empty();
                $("#library-folders").find(".container-fluid").append(topLevelResult);

                scroller = e.view.scroller;
                scroller.reset();

                scroller.bind("scroll", function (e) {
                    $(".folder-item").each(function () {
                        if($(this).visible())
                        {
                            viewedIndex = $(this).attr("data-index");
                            total = dataSource.total();
                            pageSize = dataSource.pageSize();
                            currentPage = dataSource.page();

                            if(viewedIndex == ((currentPage * pageSize) - pagingThreshold) && (currentPage * pageSize) < total)
                            {
                                currentPage += 1;
                                dataSource.page(currentPage);

                                dataSource.read().then(function () {
                                    setTimeout(function () {

                                        console.log("rendering page: " + dataSource.page());
                                        newView = dataSource.view();
                                        newView = CommunityApp.common.injectIndex(currentPage, pageSize, newView);
                                        topLevelResult = kendo.render(topLevelTemplate, newView);
                                        $("#library-folders").find(".container-fluid").append(topLevelResult);

                                    }, 100);

                                });
                            }
                        }
                    });
                });
            });
        },
        fnLoadLibrarySectionCallback: function(response){
            if(response.data)
            {
                CommunityApp.common.logTitle("Library: " + response.data.Name);
                viewModel.set("name", response.data.Name);
                viewModel.set("description", response.data.Description);
            }

            viewModel.set("inprogress", false);
        },
        folderRedirect: function (id, hasSubfolders, libraryId) {
            var path;

            if (hasSubfolders.toLowerCase() === "true")
            {
                path = "#ca-library-subfolders?folderId=" + id + "&libraryId=" + libraryId;
            }
            else
            {
                path = "#ca-library-subfolders?folderId=" + id + "&libraryId=" + libraryId;
            }

            CommunityApp.common.navigateToView(path);
        }
    });

    return {
        viewModel: viewModel
    };
})();