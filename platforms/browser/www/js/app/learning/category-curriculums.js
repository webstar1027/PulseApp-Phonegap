CommunityApp.categoryCurriculums = (function () {

    var getCategoryCurriculumsServiceUrl = function (sortType, type, categoryId, hideCompleted) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.learningConfig.learningPath +
            CommunityApp.configuration.learningConfig.curriculumsPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, sortType, type, categoryId, hideCompleted);
    };

    var viewModel = kendo.observable({
        categoryCurriculums: [],
        channel: "required",
        sortType: 1,
        hideCompleted: false,
        categoryId: 0,
        dataBound: false,
        buttonText: function () {
            return (viewModel.get("channel") == "required" ? "Switch to Optional Curriculums" : "Switch to Required Curriculums");
        },
        load: function (e) {
            //CommunityApp.common.authenticatedUser();
            viewModel.set("dataBound", false);
            viewModel.set("channel", e.view.params.type);

            var categoryId = e.view.params.categoryId;
            viewModel.set("categoryId", categoryId);
            var sortType = 1;
            var type = viewModel.get("channel");
            var hideCompleted = viewModel.get("hideCompleted");
              
            $("#sort-form-curriculums").kendoMobileButtonGroup({
                select: function (e) {
                    sortType = $(e.sender.element).find(".km-state-active").data("val");
                    viewModel.set("sortType", sortType);
                    loadCurriculums(sortType, viewModel.get("channel"), viewModel.get("categoryId"), viewModel.get("hideCompleted"));
                },
                index: 0
            });
            
            var scroller = $('#curriculums-scroller').data("kendoMobileScroller");
            scroller.reset();

            loadCurriculums(sortType, type, categoryId, hideCompleted);
			$("#ca-category-curriculums:last-child").addClass("display-none");
			$("#ca-category-curriculums").eq(0).removeClass("display-none");
        },
        fnLoadCurriculumsCallBack: function (response, sender) {
            response.data = CommunityApp.common.injectValue(response.data, "CategoryId", sender.CategoryId);
            response.data = CommunityApp.common.injectValue(response.data, "Type", sender.Type);
            viewModel.set("categoryCurriculums", response.data);
            viewModel.set("dataBound", true);
        },
        switchCurriculums: function () {
            var channel = viewModel.get("channel");
            channel = (channel == "required" ? "optional" : "required");
            CommunityApp.common.navigateToView("views/learning/curriculums.html?categoryId=" + viewModel.get("categoryId") + "&type=" + channel);
        },
        hideCompletedCurriculums: function (e) {
            var hide = e.checked;
            viewModel.set("hideCompleted", hide);
            loadCurriculums(viewModel.get("sortType"), viewModel.get("channel"), viewModel.get("categoryId"), viewModel.get("hideCompleted"));
        }
    });

    var loadCurriculums = function (sortType, type, categoryId, hideCompleted) {
        var serviceUrl = getCategoryCurriculumsServiceUrl(sortType, type, categoryId, hideCompleted);

        var loadCategoryCurriculumsOptions = {
            url: serviceUrl,
            requestType: "GET",
            dataType: "JSON",
            callBack: viewModel.fnLoadCurriculumsCallBack,
            sender: { CategoryId: viewModel.get("categoryId"), Type: viewModel.get("channel") }
        };

        var thatSortType = sortType;
        var thatType = type;
        var thatCategoryId = categoryId;
        var thatHideCompleted = hideCompleted;
        CommunityApp.dataAccess.callService(loadCategoryCurriculumsOptions, "curriculums-list", "<h2 class='centerAlign padding-1'>No categories are found!</h2>", null, null, null, function () {
            loadCurriculums(thatSortType, thatType, thatCategoryId, thatHideCompleted);
        });
    };

    return {
        viewModel: viewModel
    };
})();