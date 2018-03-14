CommunityApp.group = (function () {

    var getUsersServiceUrl = function (groupId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.chatConfig.basePath + CommunityApp.configuration.chatConfig.groupMembersPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, groupId);
    };

    var getAddMembersServiceUrl = function (groupId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.chatConfig.basePath +
            CommunityApp.configuration.chatConfig.groupMembersPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, groupId);
    };
    
    var getGroupServiceUrl = function () {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.chatConfig.basePath +
            CommunityApp.configuration.chatConfig.groupsPath;
        return serviceUrl;
    };

    var viewModel = kendo.observable({  
        groupId: 0,
        pages_read: [],
        name: "",
        description: "",
        selectedRoles: [],
        selectedRoleNames: '',
        allUsersInRoles: true,
        dataBound: false,
        loadUsers: function(e)
        {
            viewModel.set("dataBound", false);
            viewModel.set("groupId", e.view.params.groupId);
            viewModel.readUsers(1,  e.view.params.groupId, e.view);
        },
        readUsers: function(page, groupId, view)
        {
            var pageSize = 25;
            var serviceUrl = getUsersServiceUrl(groupId) + "?page=" + page + "&pageSize=" + pageSize;

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
        fnLoadUsersCallback: function(response, sender)
        {
            if(response && response.data)
            {
                var currentPage = sender.page;
                var pageSize = sender.pageSize;
                var data = response.data.Items;
                var pagingThreshold = 4;
                var viewedIndex;
                var total;
                var pages_read = viewModel.get("pages_read");

                if (data.length > 0)
                {
                    data = CommunityApp.common.injectIndex(currentPage, pageSize, data);
                    
                    scroller = $("#internal-scroller").data("kendoMobileScroller");

                    if (currentPage == 1)
                    {
                        $("#chat-groupmembers-container").empty();
                        scroller.reset();
                        pages_read = [];
                    }

                    var membersTemplate = kendo.template($('#members-tmpl').html());
                    var membersResult = kendo.render(membersTemplate, data);
                    $("#chat-groupmembers-container").append(membersResult);
                    viewModel.set("dataBound", true);

                    pages_read.push(currentPage);
                    viewModel.set("pages_read", pages_read);

                    scroller.unbind("scroll");
                    scroller.bind("scroll", function (e) {
                        $("#chat-groupmembers-container").children().each(function () {
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
                else
                {
                    if(currentPage == 1)
                    {
                        $("#chat-groupmembers-container").empty();
                        $("#chat-groupmembers-container").append("<center><h2>All available members are already added to the group!</h2></center>");
                        scroller.reset();
                        pages_read = [];
                        viewModel.set("pages_read", pages_read);
                        viewModel.set("dataBound", true);
                    }
                }
            }
        },
        addMembers: function () {
            var groupId = viewModel.get("groupId");
            var serviceUrl = getAddMembersServiceUrl(groupId);

            var memberIds = "";

            $.each($("input[name='member-selector']:checked"), function () {
                var userId = $(this).data("userid");
                if (userId) {
                    memberIds += userId + "-";
                }
            });

            var membersOptions = {
                url: serviceUrl,
                requestType: "POST",
                dataType: "JSON",
                data: "=" + memberIds,
                callBack: viewModel.fnAddMembersCallback,
                sender: {
                    groupId: groupId
                }
            };

            CommunityApp.dataAccess.callService(membersOptions);
        },
        fnAddMembersCallback: function(response, sender)
        {
            if(response && response.data == "200 OK")
            {
                CommunityApp.common.navigateToView("#views/chat/group.html?groupId=" + sender.groupId);
            }
        },
        setAddIcon: function(e){
            var view = e.view;
            var navbar = view.header.find(".km-navbar").data("kendoMobileNavBar");
            if (navbar !== null) {
                var rightElement = navbar.rightElement;
                if (rightElement !== null) {
                    $(rightElement[0].children[6]).hide();
                    $("a[name='noti-badge']").hide();
                    $(rightElement[0].children[9]).attr("onclick", "CommunityApp.group.viewModel.addGroup();");
                }
            }
        },
        hideAddGroup: function(e){
            var view = e.view;
            var navbar = view.header.find(".km-navbar").data("kendoMobileNavBar");
            if (navbar !== null) {
                var rightElement = navbar.rightElement;
                if (rightElement !== null) {
                    $(rightElement[0].children[6]).show();
                    $("a[name='noti-badge']").show();
                    $(rightElement[0].children[9]).removeAttr("onclick");
                }
            }
        },
        loadAddGroup: function (e) {
            viewModel.setAddIcon(e);
            viewModel.bindRoles();
           
        },
        bindRoles: function(){
            var savedRoles = CommunityApp.session.load("selected-roles", true);
            viewModel.set("selectedRoles", savedRoles);

            if(savedRoles && savedRoles.length > 0)
            {
                var names = '';
                $.each(savedRoles, function (index, item) {
                    names += item.name + "<br/>";
                });
                viewModel.set("selectedRoleNames", names);
            }
            else
            {
                viewModel.set("selectedRoleNames", "Public");
            }
        },
        getSelectedRolesInput: function(){
            var selectedRoles = viewModel.get("selectedRoles");
            var input = "";

            if (selectedRoles && selectedRoles.length > 0)
            {
                $.each(selectedRoles, function (index, item) {
                    input += item.id + "|";
                });
            }

            return input;
        },
        addGroup: function () {
            var serviceUrl = getGroupServiceUrl();

            var selectedRoles = viewModel.getSelectedRolesInput();
            var allUsersInRoles = viewModel.get("allUsersInRoles");
            var name = viewModel.get("name");
            var desc = viewModel.get("description");

            var addGroupOptions = {
                url: serviceUrl,
                requestType: "POST",
                dataType: "JSON",
                data: {
                    Name: name,
                    Description: desc,
                    AddRoleUsers: allUsersInRoles,
                    RoleIds: selectedRoles
                },
                callBack: viewModel.fnAddGroupCallback
            };

            CommunityApp.dataAccess.callService(addGroupOptions);
        },
        fnAddGroupCallback: function(response)
        {
            if(response && response.data)
            {
                viewModel.reset();
                CommunityApp.common.navigateToView("#views/chat/groups.html");
            }
        },
        reset: function () {
            CommunityApp.session.remove("selected-roles", true);
            viewModel.set("selectedRoleNames", "");
            viewModel.set("name", "");
            viewModel.set("description", "");
        }
    });

    return {
        viewModel: viewModel
    };
})();