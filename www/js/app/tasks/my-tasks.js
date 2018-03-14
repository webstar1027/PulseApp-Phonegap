CommunityApp.myTasks = (function () {

    var getMyTasksServiceUrl = function () {
        return CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.tasksConfig.basePath + CommunityApp.configuration.tasksConfig.myTasksPath;
    };

    var getMyTasksCategoriesServiceUrl = function () {
        return CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.tasksConfig.basePath + CommunityApp.configuration.tasksConfig.userTasksCategoriesPath;
    };

    var viewModel = kendo.observable({
        dataBound: false,
        pages_read: [],
        categories: [],
        selectedCategoryId: 0,
        selectedSortBy: 0,
        selectedSortByDirection: 0,
        isCompleted: null,
        noTasks: false,
        load: function(e)
        {
            viewModel.set("isCompleted", null);
            viewModel.set("dataBound", false);
            viewModel.read(1, e.view);

            var categoriesServiceUrl = getMyTasksCategoriesServiceUrl();

            var categoriesOptions = {
                url: categoriesServiceUrl,
                requestType: "GET",
                dataType: "JSON",
                callBack: viewModel.fnLoadCategoriesCallback
            };

            CommunityApp.dataAccess.callService(categoriesOptions);
        },
        fnLoadCategoriesCallback: function(response)
        {
            if(response && response.data)
            {
                var categories = response.data;
                categories.splice(0, 0, { Id: 0, Name: '- Category -' });
                viewModel.set("categories", categories); 
            }
        },
        categoryChange: function()
        {
            var view = $("#ca-mytasks").data("kendoMobileView");
            var categoryId = viewModel.get("selectedCategoryId");
            var sortBy = viewModel.get("selectedSortBy");
            var sortByDirection = viewModel.get("selectedSortByDirection");
            var isCompleted = viewModel.get("isCompleted");

            if (categoryId > 0)
            {
                viewModel.read(1, view, { CategoryId: categoryId, SortBy: sortBy, SortByDirection: sortByDirection, IsCompleted: isCompleted });
            }            
        },
        sortByChange: function(){
            viewModel.handleSort();
        },
        sortByDirectionChange: function(){
            viewModel.handleSort();
        },
        handleSort: function(){
            var view = $("#ca-mytasks").data("kendoMobileView");
            var categoryId = viewModel.get("selectedCategoryId");
            var sortBy = viewModel.get("selectedSortBy");
            var sortByDirection = viewModel.get("selectedSortByDirection");
            var isCompleted = viewModel.get("isCompleted");

            if (sortBy > 0 && sortByDirection > 0) {
                viewModel.read(1, view, { CategoryId: categoryId, SortBy: sortBy, SortByDirection: sortByDirection, IsCompleted: isCompleted });
            }
        },
        filterCompleted: function(e)
        {
            var view = $("#ca-mytasks").data("kendoMobileView");
            var completed = e.checked;
            viewModel.set("isCompleted", completed);
            var categoryId = viewModel.get("selectedCategoryId");
            var sortBy = viewModel.get("selectedSortBy");
            var sortByDirection = viewModel.get("selectedSortByDirection");

            viewModel.read(1, view, { CategoryId: categoryId, SortBy: sortBy, SortByDirection: sortByDirection, IsCompleted: completed });
        },
        read: function(page, view, filter)
        {
            var myTasksServiceUrl = getMyTasksServiceUrl();
            var pageSize = 20;
            myTasksServiceUrl += "?page=" + page + "&pageSize=" + pageSize;

            var myTasksOptions = {
                url: myTasksServiceUrl,
                requestType: "POST",
                dataType: "JSON",
                callBack: viewModel.fnMyTasksLoadCallback,
                data: filter,
                sender: {
                    page: page,
                    pageSize: pageSize,
                    view: view,
                    filter: filter
                }
            };

            CommunityApp.dataAccess.callService(myTasksOptions);
        },
        fnMyTasksLoadCallback: function(response, sender)  
        {
            if(response && response.data)
            {
                var currentPage = sender.page;
                var pageSize = sender.pageSize;
                var data = response.data.Items;
                var pagingThreshold = 4;

                data = CommunityApp.common.injectIndex(currentPage, pageSize, data);
                var myTasksTemplate = kendo.template($('#mytasks-list-tmpl').html());
                var myTasksResult = kendo.render(myTasksTemplate, data);

                var pages_read = viewModel.get("pages_read");
                var scroller = $("#listscroller").data("kendoMobileScroller");

                if (currentPage == 1) {
                    $("#mytasks-container").empty();
                    scroller.reset();
                    pages_read = [];
                    viewModel.set("dataBound", true);
                }

                $("#mytasks-container").append(myTasksResult);
                pages_read.push(currentPage);
                viewModel.set("pages_read", pages_read);
                  
                scroller.unbind("scroll");
                scroller.bind("scroll", function (e) {
                    $("#mytasks-container").find(".task-item").each(function () {
                        if ($(this).visible(true)) {
                            viewedIndex = $(this).data("index");
                            total = response.data.Total;
                            pageSize = sender.pageSize;
                            currentPage = sender.page;

                            if (viewedIndex == ((currentPage * pageSize) - pagingThreshold) && (currentPage * pageSize) < total) {

                                currentPage = currentPage + 1;

                                if (pages_read.indexOf(currentPage) < 0) {

                                    pages_read.push(currentPage);
                                    viewModel.set("pages_read", pages_read);

                                    viewModel.read(currentPage, sender.view, sender.filter);
                                }
                            }
                        }
                    });
                });
            }

            viewModel.set("noTasks", response.data.Items.length <= 0);

        }
    });

    return {
        viewModel: viewModel
    };
})();
