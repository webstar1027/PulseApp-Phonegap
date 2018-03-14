CommunityApp.groupMembers = (function () {

    var getGroupServiceUrl = function (groupId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.chatConfig.basePath + CommunityApp.configuration.chatConfig.groupPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, groupId);
    };

    var getGroupMembersServiceUrl = function (groupId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.chatConfig.basePath + CommunityApp.configuration.chatConfig.groupJoinedMembersPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, groupId);
    };

    var viewModel = kendo.observable({
        groupId: 0,
        pages_read: [],
        dataBound: false,
        load: function (e) {
            var groupId = e.view.params.groupId;
            viewModel.set("groupId", groupId);

            var groupServiceUrl = getGroupServiceUrl(groupId);

            var groupOptions = {
                url: groupServiceUrl,
                requestType: "GET",
                callBack: viewModel.fnLoadGroupCallback,
                sender: {
                    view: e.view
                }
            };

            CommunityApp.dataAccess.callService(groupOptions, null, null, null, null, null, function () {
                viewModel.load(e);
            });

            viewModel.readUsers(1, groupId, e.view);
        },
        fnLoadGroupCallback: function (response, sender) {
            if (response && response.data) {
                var view = sender.view;
                var navbar = view.header.find(".km-navbar").data("kendoMobileNavBar");
                navbar.title(response.data.Name + " Members");
            }
        },
        readUsers: function (page, groupId, view) {
            var pageSize = 25;
            var serviceUrl = getGroupMembersServiceUrl(groupId) + "?page=" + page + "&pageSize=" + pageSize;

            var usersOptions = {
                url: serviceUrl,
                requestType: "GET",
                dataType: "JSON",
                callBack: viewModel.fnLoadUsersCallback,
                sender: {
                    page: page,
                    pageSize: pageSize,
                    view: view,
                    groupId: groupId
                }
            };

            CommunityApp.dataAccess.callService(usersOptions, null, null, null, null, null, function () {
                viewModel.readUsers(page, groupId, view);
            });
        },
        fnLoadUsersCallback: function (response, sender) {
            if (response && response.data) {
                var currentPage = sender.page;
                var pageSize = sender.pageSize;
                var data = response.data.Items;
                var pagingThreshold = 4;
                var viewedIndex;
                var total;
                var pages_read = viewModel.get("pages_read");
                var scroller = sender.view.scroller;

                if (data.length > 0) {
                    data = CommunityApp.common.injectIndex(currentPage, pageSize, data);

                    if (currentPage == 1) {
                        $("#chat-joinedgroupmembers-container").empty();
                        scroller.reset();
                        pages_read = [];
                    }

                    var membersTemplate = kendo.template($('#joined-members-tmpl').html());
                    var membersResult = kendo.render(membersTemplate, data);
                    $("#chat-joinedgroupmembers-container").append(membersResult);
                    viewModel.set("dataBound", true);

                    pages_read.push(currentPage);
                    viewModel.set("pages_read", pages_read);

                    scroller.unbind("scroll");
                    scroller.bind("scroll", function (e) {
                        $("#chat-joinedgroupmembers-container").children().each(function () {
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

                                        viewModel.readUsers(currentPage, sender.groupId, sender.view);
                                    }
                                }
                            }
                        });
                    });
                }
                else {
                    if (currentPage == 1) {
                        $("#chat-joinedgroupmembers-container").empty();
                        $("#chat-joinedgroupmembers-container").append("<center><h2>No members joined the group yet!</h2></center>");
                        scroller.reset();
                        pages_read = [];
                        viewModel.set("pages_read", pages_read);
                        viewModel.set("dataBound", true);
                    }
                }
            }
        }
    });

    return {
        viewModel: viewModel
    };
})();