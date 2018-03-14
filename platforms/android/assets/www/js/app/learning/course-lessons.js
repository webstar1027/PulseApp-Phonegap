CommunityApp.courseLessons = (function () {

    var getCourseLessonsServiceUrl = function (sortType, type, categoryId, hideCompleted, curriculumId, courseId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.learningConfig.learningPath +
            CommunityApp.configuration.learningConfig.lessonsPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, sortType, type, categoryId, hideCompleted, curriculumId, courseId);
    };

    var assignLessonServiceUrl = function (sortType, type, categoryId, hideCompleted, curriculumId, courseId, lessonId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.learningConfig.learningPath +
           CommunityApp.configuration.learningConfig.assignTestPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, sortType, type, categoryId, hideCompleted, curriculumId, courseId, lessonId);
    };

    var finishLessonServiceUrl = function (sortType, type, categoryId, hideCompleted, curriculumId, courseId, lessonId, userTestId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.learningConfig.learningPath +
           CommunityApp.configuration.learningConfig.finishTestPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, sortType, type, categoryId, hideCompleted, curriculumId, courseId, lessonId, userTestId);
    };

    var getScormServiceUrl = function (scorm, lessonId, type) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.learningConfig.learningPath +
            CommunityApp.configuration.learningConfig.scormPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, scorm, lessonId, type);
    };

    var finishPdfLessonServiceUrl = function (lessonId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.learningConfig.learningPath +
            CommunityApp.configuration.learningConfig.finishPdfLessonPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, lessonId);
    };

    var viewModel = kendo.observable({
        courseLessons: [],
        categoryId: 0,
        curriculumId: 0,
        courseId: 0,
        channel: "required",
        sortType: 1,
        hideCompleted: false,
        dataBound: false,
        buttonText: function () {
            return (viewModel.get("channel") == "required" ? "Switch to Optional Lessons" : "Switch to Required Lessons");
        },
        load: function (e) {
            //CommunityApp.common.authenticatedUser();

            var categoryId = e.view.params.categoryId;
            var curriculumId = e.view.params.curriculumId;
            var courseId = e.view.params.courseId;

            if (!categoryId)
                categoryId = 0;
              
            if (!curriculumId)
                curriculumId = 0;

            viewModel.set("categoryId", categoryId);
            viewModel.set("curriculumId", curriculumId);
            viewModel.set("courseId", courseId);

            var sortType = viewModel.get("sortType");
            var type = viewModel.get("channel");
            var hideCompleted = viewModel.get("hideCompleted");

            $("#sort-form-lessons").kendoMobileButtonGroup({
                select: function (e) {
                    sortType = $(e.sender.element).find(".km-state-active").data("val");
                    viewModel.set("sortType", sortType);
                    loadLessons(sortType, viewModel.get("channel"), viewModel.get("categoryId"), viewModel.get("hideCompleted"), viewModel.get("curriculumId"), viewModel.get("courseId"));
                },
                index: 0
            });
            
            var scroller = e.view.scroller;
            scroller.reset();

			if (sortType !== "undefined" && typeof sortType !== "undefined" && type !== "undefined" && typeof type !== "undefined" && categoryId !== "undefined" && typeof categoryId !== "undefined" && hideCompleted !== "undefined" && typeof hideCompleted !== "undefined" && curriculumId !== "undefined" && typeof curriculumId !== "undefined" && courseId !== "undefined" && typeof courseId !== "undefined") {
                loadLessons(sortType, type, categoryId, hideCompleted, curriculumId, courseId);
			}

            $("#ca-course-lessons:last-child").addClass("display-none");
            $("#ca-course-lessons").eq(0).removeClass("display-none");
        },
        fnLoadLessonsCallBack: function (response) {
            if (response.data) {
                viewModel.set("dataBound", true);
                response.data = CommunityApp.common.injectValue(response.data, "Type", viewModel.get("channel"));
                viewModel.set("courseLessons", response.data);

                $("input[name='player']").each(function () {
                    var lessonId = $(this).val();
                    var playerId = "#vplayer" + lessonId;
                    var iframe = $(playerId)[0];
                    var assignment = $(this).next();

                    var player = $f(iframe);

                    player.addEvent('ready', function () {
                        player.addEvent('finish', onFinish);
                        player.addEvent('play', onPlay);
                    });

                    function onFinish(e) {
                        finishLesson(assignment, viewModel.get("sortType"), viewModel.get("channel"), viewModel.get("categoryId"), viewModel.get("hideCompleted"), viewModel.get("curriculumId"), viewModel.get("courseId"), lessonId);
                    }

                    function onPlay(e) {
                        assignLesson(assignment, viewModel.get("sortType"), viewModel.get("channel"), viewModel.get("categoryId"), viewModel.get("hideCompleted"), viewModel.get("curriculumId"), viewModel.get("courseId"), lessonId);
                    }
                });
            }
        },
        switchLessons: function () {
            var channel = viewModel.get("channel");
            channel = (channel == "required" ? "optional" : "required");
            viewModel.set("channel", channel);
            loadLessons(viewModel.get("sortType"), viewModel.get("channel"), viewModel.get("categoryId"), viewModel.get("hideCompleted"), viewModel.get("curriculumId"), viewModel.get("courseId"));
        },
        page: function (Id) {
            var courseId = viewModel.get("courseId");
            var url = "\#views/learning/assessment.html";
            CommunityApp.common.navigateToView(url + "?courseId=" + courseId + "&testId=" + Id + "&userTest=0&question=0");
        },
        viewscorm: function (e) {
            //CommunityApp.common.authenticatedUser();

            var lessonId = $(e.target).data("lessonid");
            var scorm = $(e.target).data("scorm");
            var type = $(e.target).data("type");

            //CommunityApp.common.navigateToView("#views/learning/scorm.html?scorm=" + scorm + "&lessonId=" + lessonId + "&type=" + type);

            var scormServiceUrl = getScormServiceUrl(scorm, lessonId, type);

            console.log("SCORM Service URL: " + scormServiceUrl);
            var scormOptions = {
                url: scormServiceUrl,
                requestType: "GET",
                dataType: "JSON",
                callBack: viewModel.viewScormCallback
            };

            var viewArgs = e;
            CommunityApp.dataAccess.callService(scormOptions, null, null, null, null, null, function () {
                viewModel.viewscorm(viewArgs);
            });
        },
        viewScormCallback: function (response) {
            if (response.data) {
                var scormUrl = response.data;
                var scormViewUrl = "http://" + CommunityApp.configuration.appConfig.domain + scormUrl;

                console.log("SCORM URL: " + scormViewUrl);
                cordova.InAppBrowser.open(encodeURI(scormViewUrl), "_blank", 'location=no');
            }
        },
        pdfLoaded: function (lessonId) {
            console.log("pdf lesson id = " + lessonId);
            var serviceUrl = finishPdfLessonServiceUrl(lessonId);

            var finishLessonOptions = {
                url: serviceUrl,
                requestType: "POST",
                dataType: "JSON"
            };
            CommunityApp.dataAccess.callService(finishLessonOptions);
        },
        openPDF: function (e) {
            var pdfUrl = $(e.target).data("pdfurl");
            var lessonId = $(e.target).data("lessonid");
            CommunityApp.common.openFile(pdfUrl, function () {
                viewModel.pdfLoaded(lessonId);
            });
        },
        hideCompletedLessons: function (e) {
            var hide = e.checked;
            viewModel.set("hideCompleted", hide);
            loadLessons(viewModel.get("sortType"), viewModel.get("channel"), viewModel.get("categoryId"), viewModel.get("hideCompleted"), viewModel.get("curriculumId"), viewModel.get("courseId"));
        },
        fnAssignLessonCallBack: function (response, sender) {
            if (response.data) {
                $(sender).val(response.data);
            }
        },
        fnFinishLessonCallBack: function (response, sender) {
            if (response.data) {
                $(sender).val("");
            }
        }
    });

    var getUrlVars = function (sUrl) {
        var vars = [], hash;
        var hashes = sUrl.slice(sUrl.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    };

    var loadLessons = function (sortType, type, categoryId, hideCompleted, curriculumId, courseId) {
        viewModel.set("dataBound", false);

        var serviceUrl = getCourseLessonsServiceUrl(sortType, type, categoryId, hideCompleted, curriculumId, courseId);

        var loadCourseLessonsOptions = {
            url: serviceUrl,
            requestType: "GET",
            dataType: "JSON",
            callBack: viewModel.fnLoadLessonsCallBack
        };

        var thatSortType = sortType;
        var thatType = type;
        var thatCategoryId = categoryId;
        var thatHideCompleted = hideCompleted;
        var thatCurriculumId = curriculumId;
        var thatCourseId = courseId;
        CommunityApp.dataAccess.callService(loadCourseLessonsOptions, "lessons-list", "<h2 class='centerAlign padding-1'>No course materials are found!</h2>", null, null, null, function () {
            loadLessons(thatSortType, thatType, thatCategoryId, thatHideCompleted, thatCurriculumId, thatCourseId);
        });
    };  

    var assignLesson = function (assignmentControl, sortType, type, categoryId, hideCompleted, curriculumId, courseId, lessonId) {
        var serviceUrl = assignLessonServiceUrl(sortType, type, categoryId, hideCompleted, curriculumId, courseId, lessonId);

        var assignLessonOptions = {
            url: serviceUrl,
            requestType: "POST",
            dataType: "JSON",
            callBack: viewModel.fnAssignLessonCallBack,
            sender: assignmentControl
        };

        var thatAssignmentControl = assignmentControl;
        var thatSortType = sortType;
        var thatType = type;
        var thatCategoryId = categoryId;
        var thatHideCompleted = hideCompleted;
        var thatCurriculumId = curriculumId;
        var thatCourseId = courseId;
        var thatLessonId = lessonId;
        CommunityApp.dataAccess.callService(assignLessonOptions);
    };

    var finishLesson = function (assignmentControl, sortType, type, categoryId, hideCompleted, curriculumId, courseId, lessonId) {
        var userTestId = $(assignmentControl).val();
        var serviceUrl = finishLessonServiceUrl(sortType, type, categoryId, hideCompleted, curriculumId, courseId, lessonId, userTestId);

        var finishLessonOptions = {
            url: serviceUrl,
            requestType: "PUT",
            dataType: "JSON",
            callBack: viewModel.fnFinishLessonCallBack,
            sender: assignmentControl
        };

        var thatAssignmentControl = assignmentControl;
        var thatSortType = sortType;
        var thatType = type;
        var thatCategoryId = categoryId;
        var thatHideCompleted = hideCompleted;
        var thatCurriculumId = curriculumId;
        var thatCourseId = courseId;
        var thatLessonId = lessonId;
        CommunityApp.dataAccess.callService(finishLessonOptions, null, null, null, null, null, function () {
            finishLesson(thatAssignmentControl, thatSortType, thatType, thatCategoryId, thatHideCompleted, thatCurriculumId, thatCourseId, thatLessonId);
        });
    };

    return {
        viewModel: viewModel
    };
})();