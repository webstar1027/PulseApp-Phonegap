CommunityApp.mainForums = (function () {


    var viewModel = kendo.observable({
        dataBound: false,
        load: function (e) {
            CommunityApp.common.logTitle(e.view.title);

            viewModel.set("dataBound", false);
            
            var offlineMainDiscussion = CommunityApp.session.load("offline_main_discussion_cache");
            if(offlineMainDiscussion !== null && typeof offlineMainDiscussion !== 'undefined' && offlineMainDiscussion !== 'undefined') {
                if (offlineMainDiscussion.length > 0) {
                    var mainDiscussionsTemplate = kendo.template($("#main-discussions-tmpl").html());
                    var mainDiscussionsResult = kendo.render(mainDiscussionsTemplate, offlineMainDiscussion);

                    $("#main-discussions-list").find(".container-fluid").empty();  
                    $("#main-discussions-list").find(".container-fluid").append(mainDiscussionsResult);
                }
                viewModel.set("dataBound", true);
            } else {
                CommunityApp.sectionPosts.viewModel.readSectionAllPosts(CommunityApp.configuration.appConfig.mainDiscussionsSectionId, 120, 120, viewModel.fnReadSectionCallback);
            }
        },
        fnReadSectionCallback: function(response)
        {
            if(response.data)
            {  
                var mainDiscussionsTemplate = kendo.template($("#main-discussions-tmpl").html());
                var mainDiscussionsResult = kendo.render(mainDiscussionsTemplate, response.data);

                $("#main-discussions-list").find(".container-fluid").empty();  
                $("#main-discussions-list").find(".container-fluid").append(mainDiscussionsResult);
                
                CommunityApp.session.save("offline_main_discussion_cache", response.data);
            }  

            viewModel.set("dataBound", true);
        }
    });

    return {
        viewModel: viewModel
    };
})();
