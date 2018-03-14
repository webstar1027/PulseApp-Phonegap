CommunityApp.library = (function () {

    var getTopLevelsPath = function (userId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.librariesConfig.librariesPath + CommunityApp.configuration.librariesConfig.topLevelsPath;
		var width = 180, height = 120;
		if ($(window).width() >= 768) {
			width = 375;
			height = 250;
		}
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, width, height);
    };

    var viewModel = kendo.observable({
        inprogress: false,
        pages_read: [],
        load: function (e) {
            //CommunityApp.common.authenticatedUser();
            CommunityApp.common.logTitle("Top Level Media Galleries");

            viewModel.set("inprogress", true);
            var userId = CommunityApp.base.baseData.currentUser().id;
            var serviceUrl = getTopLevelsPath(userId);

            var offlineResourcesTopLevel = CommunityApp.session.load("offline_resourcesTopLevel_cache");
            if(offlineResourcesTopLevel !== null && typeof offlineResourcesTopLevel !== 'undefined' && offlineResourcesTopLevel !== 'undefined') {
                console.log(offlineResourcesTopLevel);
                var libraryToplevelTemplate = kendo.template($('#toplevel-list-tmpl').html());
                var result = kendo.render(libraryToplevelTemplate, offlineResourcesTopLevel.Items);
                $("#toplevels").find(".container-fluid").empty();
                $("#toplevels").find(".container-fluid").append(result);
                viewModel.set("inprogress", false);
                
                var currentPage = 1;
                var scroller = e.view.scroller;
                scroller.reset();
                pages_read = [];
                
                pages_read.push(currentPage);
                viewModel.set("pages_read", pages_read);
                
                var scrollHeight = scroller.scrollHeight();
                var updateThreshold = 650;
                scroller.bind("scroll", function (e) {
                    total = offlineResourcesTopLevel.Total;
                    pageSize = 20;
                    currentPage = 1;
                    scrollHeight = scroller.scrollHeight();
                    
                    if(scrollHeight - e.scrollTop <= updateThreshold)
                    {
                        if (pageSize * currentPage < total) {
                            currentPage = currentPage + 1;
                            if (pages_read.indexOf(currentPage) < 0) {
                                pages_read.push(currentPage);
                                viewModel.set("pages_read", pages_read);
                                viewModel.read(currentPage, e.view, viewModel.fnReadLibraryToplevelCallback);  
                            }
                        }
                    }
                });
                
            } else {
                viewModel.read(1, e.view, viewModel.fnReadLibraryToplevelCallback);
            }
        },
        read: function(page, view, callBack)
        {
            var userId = CommunityApp.base.baseData.currentUser().id;
            var serviceUrl = getTopLevelsPath(userId);
            
            var pageSize = 20;  
            serviceUrl += "?page=" + page + "&pageSize=" + pageSize;
            
	    var topLevelView = $("#ca-library-toplevel").data("kendoMobileView");
            var resourcesTopLevelOptions = {
                url: serviceUrl,
                dataType: 'JSON',
                requestType: 'GET',
                callBack: callBack,
                sender: {
                    page: page,
                    pageSize: pageSize,
                    view: topLevelView
                }
            };

            var thatPage = page;
            var thatView = view;
            CommunityApp.dataAccess.callService(resourcesTopLevelOptions, "toplevel-library-listview", "<h2 class='centerAlign padding-1'>No top level libraries are found!</h2>", null, null, null, function () {
                viewModel.read(thatPage, thatView, callBack);
            });
        },
        fnReadLibraryToplevelCallback: function (response, sender) {
            if(response.data)
            {
                var currentPage = sender.page;
                var pageSize = sender.pageSize;
                var data = response.data.Items;
                var pagingThreshold = 4;
                
                data = CommunityApp.common.injectIndex(currentPage, pageSize, data);
                var libraryToplevelTemplate = kendo.template($('#toplevel-list-tmpl').html());
                var result = kendo.render(libraryToplevelTemplate, data);
                var pages_read = viewModel.get("pages_read");
                scroller = sender.view.scroller;
                
                if (currentPage == 1) {
                    $("#toplevels").find(".container-fluid").empty();
                    scroller.reset();
                    pages_read = [];
                    CommunityApp.session.save("offline_resourcesTopLevel_cache", response.data);
                }
                
                $("#toplevels").find(".container-fluid").append(result);
                viewModel.set("inprogress", false);
                
                pages_read.push(currentPage);
                viewModel.set("pages_read", pages_read);
                
                scrollHeight = scroller.scrollHeight();
                var updateThreshold = 650;
                scroller.bind("scroll", function (e) {
                    total = response.data.Total;
                    pageSize = sender.pageSize;
                    currentPage = sender.page;
                    scrollHeight = scroller.scrollHeight();
                    
                    if(scrollHeight - e.scrollTop <= updateThreshold)
                    {
                        if (pageSize * currentPage < total) {
                            currentPage = currentPage + 1;
                            if (pages_read.indexOf(currentPage) < 0) {
                                pages_read.push(currentPage);
                                viewModel.set("pages_read", pages_read);
                                viewModel.read(currentPage, sender.view, viewModel.fnReadLibraryToplevelCallback);  
                            }
                        }
                    }
                });
            }
        }
    });
      
    return {
        viewModel: viewModel
    };
})();
