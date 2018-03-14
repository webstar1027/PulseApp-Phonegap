CommunityApp.chatGroups = (function () {

    var getGroupsServiceUrl = function () {
        return CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.chatConfig.basePath + CommunityApp.configuration.chatConfig.groupsPath;
    };


    var viewModel = kendo.observable({
        pages_read: [],
        setTopRightIcon: function(e){
            var view = e.view;
            var navbar = view.header.find(".km-navbar").data("kendoMobileNavBar");
            if (navbar !== null) {
                var rightElement = navbar.rightElement;

                if (rightElement !== null) {
                    $(rightElement[0].children[6]).addClass("display-none");
                    $(rightElement[0].children[8]).attr("href", "#views/chat/add-group.html");
                }
            }
        },
        hide: function(e){
            var view = e.view;
            var navbar = view.header.find(".km-navbar").data("kendoMobileNavBar");
            if (navbar !== null) {
                var rightElement = navbar.rightElement;

                if (rightElement !== null) {
                    $(rightElement[0].children[6]).removeClass("display-none");
                    $(rightElement[0].children[8]).removeAttr("href", "#views/chat/add-group.html");
                }
            }
        },
        load: function(e)
        {
            viewModel.setTopRightIcon(e);
            CommunityApp.common.logTitle("Chat Groups Home");
            viewModel.read(1, e.view);
        },
        read: function(page, view)
        {
            var pageSize = 20;  
            var serviceUrl = getGroupsServiceUrl();
            serviceUrl += "?page=" + page + "&pageSize=" + pageSize;


            var loadGroupsOptions = {
                url: serviceUrl,
                dataType: 'JSON',
                requestType: "GET",
                callBack: viewModel.fnLoadGroupsCallback,
                sender: {
                    page: page,
                    pageSize: pageSize,
                    view: view
                }
            };

            CommunityApp.dataAccess.callService(loadGroupsOptions, null, null, null, null, null, function () {
                viewModel.read(page, view);
            });
        },
        fnLoadGroupsCallback: function (response, sender) {
            if(response && response.data)
            {
                var currentPage = sender.page;
                var pageSize = sender.pageSize;
                var data = response.data.Items;
                var pagingThreshold = 4;
                var viewedIndex;
                var total;

                if (data.length > 0)
                {
                    data = CommunityApp.common.injectIndex(currentPage, pageSize, data);
                    var groupsTemplate = kendo.template($('#groups-chat-tmpl').html());
                    var groupsResult = kendo.render(groupsTemplate, data);

                    var pages_read = viewModel.get("pages_read");
                    scroller = sender.view.scroller;

                    if (currentPage == 1) {
                        $("#chat-groups-container").empty();
                        scroller.reset();
                        pages_read = [];
                    }

                    $("#chat-groups-container").append(groupsResult);
                    pages_read.push(currentPage);
                    viewModel.set("pages_read", pages_read);

                    scroller.unbind("scroll");
                    scroller.bind("scroll", function (e) {
                        $("#chat-groups-container").children().each(function () {
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

                                        viewModel.read(currentPage, sender.view);
                                    }
                                }
                            }
                        });
                    });
                }
                else
                {
                    $("#chat-groups-container").empty();
                    $("#chat-groups-container").append("<div class='padding-20'><center><h2>You are not a member of any group yet!</h2></center></div>");
                }
               
            }
        }
    });

    return {
        viewModel: viewModel
    };
})();