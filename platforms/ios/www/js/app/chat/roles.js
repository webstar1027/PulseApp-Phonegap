CommunityApp.groupRoles = (function () {

    var getRolesServiceUrl = function (userId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.profileConfig.accountPath +
            CommunityApp.configuration.profileConfig.roles;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId);
    };

    var viewModel = kendo.observable({
        selectedRoles: [],
        load: function (e) {
            e.view.scroller.reset();

            var savedRoles = CommunityApp.session.load("selected-roles", true);

            if (savedRoles && savedRoles.length > 0)
            {
                viewModel.set("selectedRoles", savedRoles);
            }

            var userId = CommunityApp.base.baseData.currentUser().id;
            var serviceUrl = getRolesServiceUrl(userId);

            var rolesOptions = {
                url: serviceUrl,
                requestType: "GET",
                dataType: "JSON",
                callBack: viewModel.fnLoadRolesCallback
            };

            CommunityApp.dataAccess.callService(rolesOptions, null, null, null, null, null, function () {
                viewModel.load(e);
            });
        },
        fnLoadRolesCallback: function(response)
        {
            if(response && response.data)
            {
                var selectedRoles = viewModel.get("selectedRoles");
                var data = response.data;
                $.each(data, function (index, item) {
                    var rolesFound = _.find(selectedRoles, function (role) { return role.id == item.Id; });
                    if(rolesFound)
                    {
                        item.Checked = "checked";
                    }
                    else
                    {
                        item.Checked = "";
                    }
                });

                var rolesTemplate = kendo.template($('#roles-tmpl').html());
                var rolesResult = kendo.render(rolesTemplate, data);
                $("#roles-container").empty();
                $("#roles-container").append(rolesResult);
            }
        },
        updateSelectedRoles: function(checkbox)
        {
            var selectedRoles = viewModel.get("selectedRoles");
            var roleId = $(checkbox).data("roleid");
            var roleName = $(checkbox).data("rolename");

            if($(checkbox).is(":checked"))
            {
                var rolesFound = _.find(selectedRoles, function (role) { return role.id == roleId; });

                if(!rolesFound || rolesFound.length <= 0)
                {
                    var newRole = {
                        id: roleId,
                        name: roleName
                    };

                    selectedRoles.push(newRole);
                }
            }
            else
            {
                selectedRoles = _.reject(selectedRoles, { id: roleId });
            }
            
            viewModel.set("selectedRoles", selectedRoles);
        },
        selectRoles: function () {
            var selectedRoles = viewModel.get("selectedRoles");

            if(selectedRoles === "")
            {
                alert("Please select at least one role");
            }
            else
            {
                CommunityApp.session.save("selected-roles", selectedRoles, true);
                CommunityApp.common.navigateToView("#views/chat/add-group.html");
            }
        }
    });

    return {
        viewModel: viewModel
    };
})();