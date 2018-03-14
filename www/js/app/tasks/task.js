CommunityApp.task = (function () {

    var getTaskServiceUrl = function (taskId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.tasksConfig.basePath + CommunityApp.configuration.tasksConfig.taskPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, taskId);
    };

    var viewModel = kendo.observable({
        taskId: 0,
        dataBound: false,
        name: "",
        description: "",
        priority: "",
        validFrom: "",
        validFromText: "",
        validTo: "",
        validToText: "",
        taskImageUrl: "",
        showImage: false,
        activities: [],
        showActivities: false,
        load: function(e)
        {
            e.view.scroller.reset();

            viewModel.set("dataBound", false);
            viewModel.set("taskId", e.view.params.taskId);
            var taskId = e.view.params.taskId;

            var taskServiceUrl = getTaskServiceUrl(taskId);

            var taskOptions = {
                url: taskServiceUrl,
                requestType: "GET",
                dataType: "JSON",
                callBack: viewModel.fnLoadTaskCallback
            };

            CommunityApp.dataAccess.callService(taskOptions, null, null, null, null, null, function () {
                viewModel.load(e);
            });
        },
        fnLoadTaskCallback: function(response)
        {
            if(response && response.data)  
            {  
                viewModel.set("name", response.data.Name);
                viewModel.set("description", response.data.Description);
                viewModel.set("priority", "Priority: " + response.data.PriorityName);
                viewModel.set("validFrom", response.data.ValidFromDateFormatted);
                viewModel.set("validFromText", "Start Date: " + response.data.ValidFromDateFormatted);
                viewModel.set("validToText", "Due Date: " + response.data.ValidToDateFormatted);
                viewModel.set("validTo", response.data.ValidToDateFormatted);
                viewModel.set("taskImageUrl", response.data.imagepath);
                viewModel.set("showImage", !(response.data.imagepath === null || response.data.imagepath === ""));
                viewModel.set("activities", response.data.Details);
                viewModel.set("showActivities", response.data.Details.length > 0);

                var taskDetailsTemplate = kendo.template($('#task-details-list-tmpl').html());
                var taskDetailsResult = kendo.render(taskDetailsTemplate, response.data.Details);
                $("#task-details-container").empty();
                $("#task-details-container").append(taskDetailsResult);

                viewModel.set("dataBound", true);
            }
        }
    });

    return {
        viewModel: viewModel
    };
})();