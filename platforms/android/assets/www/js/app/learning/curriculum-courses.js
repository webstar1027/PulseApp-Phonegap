/// <reference path="curriculum-courses.js" />
CommunityApp.curriculumCourses = (function () {

    var getCurriculumCoursesServiceUrl = function (sortType, type, categoryId, hideCompleted, curriculumId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.learningConfig.learningPath +
            CommunityApp.configuration.learningConfig.coursesPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, sortType, type, categoryId, hideCompleted, curriculumId);
    };

    var viewModel = kendo.observable({
        courses: [],
        channel: "required",
        sortType: 1,
        hideCompleted: false,
        categoryId: 0,
        curriculumId: 0,
        dataBound: false,
        buttonText: function () {
            return (viewModel.get("channel") == "required" ? "Switch to Optional Courses" : "Switch to Required Courses");
        },
        load: function (e) {
            //CommunityApp.common.authenticatedUser();
            viewModel.set("dataBound", false);

            var lType = e.view.params.type;
            if (!lType)
                lType = 'required';

            viewModel.set("channel", lType);

            var categoryId = e.view.params.categoryId;

            if (!categoryId)
                categoryId = 0;

            var curriculumId = e.view.params.curriculumId;
            viewModel.set("categoryId", categoryId);
            viewModel.set("curriculumId", curriculumId);
            var sortType = 1;
            var type = viewModel.get("channel");
            var hideCompleted = viewModel.get("hideCompleted");

            $("#sort-form-courses").kendoMobileButtonGroup({
                select: function (e) {
                    sortType = $(e.sender.element).find(".km-state-active").data("val");
                    viewModel.set("sortType", sortType);
                    loadCourses(sortType, viewModel.get("channel"), viewModel.get("categoryId"), viewModel.get("hideCompleted"), viewModel.get("curriculumId"));
                },
                index: 0
            });
            
            var scroller = $('#courses-scroller').data("kendoMobileScroller");
            scroller.reset();

            loadCourses(sortType, type, categoryId, hideCompleted, curriculumId);
			$("#ca-curriculum-courses:last-child").addClass("display-none");
			$("#ca-curriculum-courses").eq(0).removeClass("display-none");
        },
        fnLoadCoursesCallBack: function (response, sender) {
            response.data = CommunityApp.common.injectValue(response.data, "CategoryId", sender);
            viewModel.set("courses", response.data);
            viewModel.set("dataBound", true);
        },
        switchCourses: function () {
            var channel = viewModel.get("channel");
            channel = (channel == "required" ? "optional" : "required");
            CommunityApp.common.navigateToView("views/learning/courses.html?curriculumId=" + viewModel.get("curriculumId") + "&categoryId=" + viewModel.get("categoryId") + "&type=" + channel);
        },
        hideCompletedCourses: function (e) {
            var hide = e.checked;
            viewModel.set("hideCompleted", hide);
            loadCourses(viewModel.get("sortType"), viewModel.get("channel"), viewModel.get("categoryId"), viewModel.get("hideCompleted"), viewModel.get("curriculumId"));
        }
    });

    var loadCourses = function (sortType, type, categoryId, hideCompleted, curriculumId) {
        var serviceUrl = getCurriculumCoursesServiceUrl(sortType, type, categoryId, hideCompleted, curriculumId);

        var loadCurriculumCoursesOptions = {
            url: serviceUrl,
            requestType: "GET",
            dataType: "JSON",
            callBack: viewModel.fnLoadCoursesCallBack,
            sender: viewModel.get("categoryId")
        };

        var thatSortType = sortType;
        var thatType = type;
        var thatCategoryId = categoryId;
        var thatHideCompleted = hideCompleted;
        var thatCurriculumId = curriculumId;
        CommunityApp.dataAccess.callService(loadCurriculumCoursesOptions, "courses-list", "<h2 class='centerAlign padding-1'>No courses are found!</h2>", null, null, null, function () {
            loadCourses(thatSortType, thatType, thatCategoryId, thatHideCompleted, thatCurriculumId);
        });
    };

    return {
        viewModel: viewModel
    };
})();