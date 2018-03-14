CommunityApp.changePassword = (function () {

    var getChangePasswordServiceUrl = function (userId) {
        var changePasswordServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.profileConfig.accountPath +
            CommunityApp.configuration.profileConfig.changePasswordPath;
        changePasswordServiceUrl = CommunityApp.utilities.stringFormat(changePasswordServiceUrl, userId);
        return changePasswordServiceUrl;
    };

    var setChangePasswordSubmitForm = function () {
        if ($("#change-password-form")) {
            $("button[type='submit']", "#change-password-form").html("Save Changes").removeAttr("disabled");
            $("#change-password-form").unbind("submit");
            $("#change-password-form").one("submit", function () {
                $("button[type='submit']", this).html("Processing...<div class='loading pos-22 pull-right'></div>").attr('disabled', 'disabled');
                viewModel.changePassword();
                return true;
            });
        }
    };
	
    var viewModel = kendo.observable({
        newPasswd: "",
        confirmPasswd: "",
        sender: "",
        load: function (e) {
            viewModel.set("sender", "");
            viewModel.set("newPasswd", "");
            viewModel.set("confirmPasswd", "");
            var sender = "";
            if (e.view.params.sender && e.view.params.sender !== "undefined" && typeof e.view.params.sender !== "undefined")
                sender = e.view.params.sender;
            viewModel.set("sender", sender);
            if (sender === "login") {
                $('header').hide();
                $('footer').hide();
            }
            setChangePasswordSubmitForm();
        },
        changePassword: function () {
            var userId = CommunityApp.base.baseData.currentUser().id;
            var newPasswd = viewModel.get("newPasswd");
            var confirmPasswd = viewModel.get("confirmPasswd");
            
            if (newPasswd != confirmPasswd) {
                CommunityApp.common.showErrorNotification("New Password", "Passwords do not match!");
                setChangePasswordSubmitForm();
                return;
            } else if (newPasswd.match(/^[a-zA-Z0-9]{6,}$/)) {
                var serviceUrl = getChangePasswordServiceUrl(userId);
                var changePasswordOptions = {
                    url: serviceUrl,
                    requestType: "POST",
                    dataType: "JSON",
                    data: "=" + newPasswd,
                    callBack: viewModel.fnChangePasswordCallback
                };

                CommunityApp.dataAccess.callService(changePasswordOptions, null, null, true, false, "application/x-www-form-urlencoded"); 
            } else {
                CommunityApp.common.showErrorNotification("New Password", "Invalid Password!");
                setChangePasswordSubmitForm();
                return;
            }
        },
        fnChangePasswordCallback: function (response) {
            if(response.data)
            {
                if(response.data.HttpStatus == 200 && response.data.HttpMessage == "Success")
                {
                    CommunityApp.common.showSuccessNotification("Your password has been changed successfully!");
                    if (viewModel.get("sender") === "login") {
                        CommunityApp.common.navigateToView("#ca-login-second");
                        $('header').show();
                        $('footer').show();
                    }
                }
                else
                {
                    CommunityApp.common.showErrorNotification("Update Error", "Unexpected error!");
                }
            } else {
                CommunityApp.common.showErrorNotification("Update Error", "Unexpected error!");
            }
            viewModel.set("newPasswd", "");
            viewModel.set("confirmPasswd", "");
            setChangePasswordSubmitForm();
        }
    });


    return {
        viewModel: viewModel
    };
})();