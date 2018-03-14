CommunityApp.learningCategories = (function () {

    var getearningCategoriesServiceUrl = function (sortType, type) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.learningConfig.learningPath +
            CommunityApp.configuration.learningConfig.categoriesPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, sortType, type);
    };

    var viewModel = kendo.observable({
        categories: [],
        channel: "required",
        sortType: 1,
        dataBound: false,
        buttonText: function(){
            return (viewModel.get("channel") == "required" ? "Switch to Optional Categories" : "Switch to Required Categories");
        },
        load: function (e) {
            //CommunityApp.common.authenticatedUser();

            viewModel.set("dataBound", false);

            var sortType = 1;
            viewModel.set("channel", e.view.params.type);

            $("#sort-form").kendoMobileButtonGroup({
                select: function (e) {
                    sortType = $(e.sender.element).find(".km-state-active").data("val");
                    viewModel.set("sortType", sortType);
                    loadCategories(sortType, viewModel.get("channel"));
                },
                index: 0
            });
            
            var scroller = $('#learning-categories-scroller').data("kendoMobileScroller");
            scroller.reset();

            loadCategories(sortType, viewModel.get("channel"));
			$("#ca-learning-categories:last-child").addClass("display-none");
			$("#ca-learning-categories").eq(0).removeClass("display-none");
        },
        fnLoadCategoriesCallBack: function (response, sender) {
            var result = CommunityApp.common.injectValue(response.data, "Type", sender.type);
            viewModel.set("categories", result);
            viewModel.set("dataBound", true);
        },
        switchCategories: function () {
            var channel = viewModel.get("channel");
            channel = (channel == "required" ? "optional" : "required");
            CommunityApp.common.navigateToView("views/learning/categories.html?type=" + channel);
        }
    });

    var loadCategories = function (sortType, type) {
        var serviceUrl = getearningCategoriesServiceUrl(sortType, type);

        var loadCategoriesOptions = {
            url: serviceUrl,
            requestType: "GET",
            dataType: "JSON",
            callBack: viewModel.fnLoadCategoriesCallBack,
            sender: {type: type}
        };

        var thatSortType = sortType;
        var thatType = type;
        CommunityApp.dataAccess.callService(loadCategoriesOptions, "categories-list", "<h2 class='centerAlign padding-1'>No categories are found!</h2>", null, null, null, function () {
            loadCategories(thatSortType, thatType);
        });
    };

    return {
        viewModel: viewModel
    };
})();