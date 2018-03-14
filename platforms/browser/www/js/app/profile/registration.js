CommunityApp.registration = (function () {
    
    var getVerificationServiceUrl = function () {
        return CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.authConfig.authPath + CommunityApp.configuration.authConfig.verifyPath;
    };

    var getRegistrationServiceUrl = function () {
        return CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.authConfig.authPath + CommunityApp.configuration.authConfig.registerPath;
    };

    var getStoreCodesServiceUrl = function (code) {
        return CommunityApp.utilities.stringFormat(CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.authConfig.authPath + CommunityApp.configuration.authConfig.storeCodesPath, code);
    };

    var getStoreNamesServiceUrl = function (code) {
        return CommunityApp.utilities.stringFormat(CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.authConfig.authPath + CommunityApp.configuration.authConfig.storeNamesPath, code);
    };

    var getForgotPasswordServiceUrl = function () {
        return CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.authConfig.authPath + CommunityApp.configuration.authConfig.forgotPasswordPath;
    };

    var setSubmitButton = function () {
        $("#verifyForm").unbind('submit');
        $("#verifyForm").one('submit', function () {
            $("button[type='submit']", this).html("Processing...").attr('disabled', 'disabled');
            viewModel.verify();
            return true;
        });
    };

    var setRegistrationSubmitButton = function () {
        $("#registrationForm").unbind("submit");
        $("#registrationForm").one('submit', function () {
            $("button[type='submit']", this).html("Processing...").attr('disabled', 'disabled');
            viewModel.register();
            return true;
        });
    };

    var setForgetPasswordSubmitButton = function () {
        $("#resetPasswordForm").unbind('submit');
        $("#resetPasswordForm").one('submit', function () {
            $("button[type='submit']", this).html("Processing...").attr('disabled', 'disabled');
            viewModel.forgetPassword();
            return true;
        });
    };

    var viewModel = kendo.observable({
        code: "",
        jobTitle: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        company: "",
        inputStoreCode: "",
        inputStoreName: "",
        employeeId: "",
        storeCodes: [],
        storeNames: [],
        backupStoreNames: [],
        confirmPasswordFocus: false,
        jobTitles: [],
        showPassword: function(obj) {
            if ($('#regPassword').prop('type') == 'password') {
                $('#regPassword').prop('type', 'text');
                $(obj).html('[Hide]');
            } else {
                $('#regPassword').prop('type', 'password');
                $(obj).html('[Show]');
            }
        },
        showConfirmPassword: function(obj) {
            if ($('#regConfirmPassword').prop('type') == 'password') {
                $('#regConfirmPassword').prop('type', 'text');
                $(obj).html('[Hide]');
            } else {
                $('#regConfirmPassword').prop('type', 'password');
                $(obj).html('[Show]');
            }
        },
        storeCodesFound: function () {
            var storeCodes = viewModel.get("storeCodes");
            return storeCodes.length > 0;
        },
        storeNamesFound: function(){
            var storeNames = viewModel.get("storeNames");
            return storeNames.length > 0;
        },
        addressesFound: function(){
            var addresses = viewModel.get("addresses");
            return addresses.length > 0;
        },
        loadVerify: function (e) {

            CommunityApp.common.logTitle(e.view.title);
            setSubmitButton();
        },
        verify: function () {
            var code = viewModel.get("code");
            var serviceUrl = getVerificationServiceUrl();

            var verifyOptions = {
                url: serviceUrl,
                requestType: "POST",
                dataType: "JSON",
                callBack: this.fnVerifyCallback,
                data: "=" + code,
                httpHeader: ['x-clientid'],
                headerValue: [CommunityApp.configuration.authConfig.clientId]
            };

            CommunityApp.dataAccess.callService(verifyOptions);
        },
        fnVerifyCallback: function(response)
        {
            if (response.data) {
                var verification = response.data;
                if (verification.Verified === true) {
                    if (CommunityApp.configuration.appConfig.allowT2Reg) {
                        if (isNaN(verification.Code.charAt(0))) {
                            CommunityApp.common.navigateToView("#ca-employee-registration-t2?group=" + verification.Group + "&code=" + verification.Code);
                        } else {
                            CommunityApp.common.navigateToView("#ca-employee-registration?group=" + verification.Group + "&code=" + verification.Code);
                        }
                    }
                    else {
                        CommunityApp.common.navigateToView("#ca-employee-registration?group=" + verification.Group + "&code=" + verification.Code);
                    }
                }
                else {
                    CommunityApp.common.showErrorNotification("Invalid Code", "Invalid verfification code");
                }
            }

            $("button[type='submit']", "#verifyForm").html("<span class='km-icon km-key display-inline-block'></span>&nbsp;Verify").removeAttr("disabled");
            setSubmitButton();
        },
        loadResetPassword: function () {
            viewModel.set("email", "");
            setForgetPasswordSubmitButton();
        },
        forgetPassword: function()
        {
            var email = viewModel.get("email");
            var serviceUrl = getForgotPasswordServiceUrl();

            var forgotPasswordOptions = {
                url: serviceUrl,
                requestType: "POST",
                dataType: "JSON",
                callBack: this.fnForgotPasswordCallback,
                data: "=" + email,
                httpHeader: ['x-clientid'],
                headerValue: [CommunityApp.configuration.authConfig.clientId]
            };

            CommunityApp.dataAccess.callService(forgotPasswordOptions);
        },
        fnForgotPasswordCallback: function(response)
        {
            if(response && response.data)
            {
                if (response.data.HttpMessage.toLowerCase() == "success")
                {
                    CommunityApp.common.showSuccessNotification("Sent Successfully");
                }
                else
                {
                    CommunityApp.common.showErrorNotification("Error", "No accounts match that information, make sure you’ve entered in the correct e-mail address");
                }
            }

            $("button[type='submit']", "#resetPasswordForm").html("<span class='km-icon km-key display-inline-block'></span>&nbsp;Reset").removeAttr("disabled");
            setForgetPasswordSubmitButton();
        },
        resetVerify: function()
        {
            viewModel.set("code", "");
            CommunityApp.common.navigateToView("#ca-login-view");
        },
        loadRegistration: function (e) {
            CommunityApp.common.logTitle(e.view.title);
            
            $('#registerATTUID').focus(function(){
                $('#errorATT').hide();
            });
            $('#registerFirstName').focus(function(){
                $('#errorFirstName').hide();
            });
            $('#registerLastName').focus(function(){
                $('#errorLastName').hide();
            });
            $('#registerEmail').focus(function(){
                $('#errorEmail').hide();
            });
            $('#regPassword').focus(function(){
                $('#errorPassword').hide();
            });
            $('#regConfirmPassword').focus(function(){
                $('#errorConfirmPassword').hide();
            });
            
            var jobTitles = [
                {"Job": "Retail Sales Consultant"},
                {"Job": "Assistant Sales Manager"},
                {"Job": "Retail Sales Manager"},
                {"Job": "Area Retail Sales Manager"},
                {"Job": "Sales Execution Lead"},
                {"Job": "Sales Execution Manager"},
                {"Job": "Director"},
                {"Job": "Field Sales Manager"},
                {"Job": "Samsung Admin"}
            ];
            viewModel.set("jobTitles", jobTitles);
            
            viewModel.set("company", e.view.params.group);
            viewModel.set("region", e.view.params.group);
            viewModel.set("code", e.view.params.code);
            setRegistrationSubmitButton();
            viewModel.loadStoreData(e.view.params.code);
        },
        register: function () {
            var validForm = true;
            viewModel.set("confirmPasswordFocus", false);

            var employeeId = viewModel.get("employeeId");
            var firstName = viewModel.get("firstName");
            var lastName = viewModel.get("lastName");
            var email = viewModel.get("email");
            var password = viewModel.get("password");
            var confirmPassword = viewModel.get("confirmPassword");
            if (employeeId === null || employeeId === "") {
                validForm = false;
                $('#errorATT').show();
            }
            if (firstName === null || firstName === "") {
                validForm = false;
                $('#errorFirstName').show();
            }
            if (lastName === null || lastName === "") {
                validForm = false;
                $('#errorLastName').show();
            }
            if (email === null || email === "") {
                validForm = false;
                $('#errorEmail').show();
            }
            if (password === null || password === "") {
                validForm = false;
                $('#errorPassword').show();
            }
            if (confirmPassword === null || confirmPassword === "") {
                validForm = false;
                $('#errorConfirmPassword').show();
            }

            if (validForm) {
            var serviceUrl = getRegistrationServiceUrl();
                var registerOptions = {
                    url: serviceUrl,
                    requestType: "POST",
                    dataType: "JSON",
                    callBack: this.fnRegisterCallback,
                    data: {
                        PrimaryJobTitle: viewModel.get("jobTitle"),
                        FirstName: viewModel.get("firstName"),
                        LastName: viewModel.get("lastName"),
                        Email: viewModel.get("email"),
                        EmployeeId: viewModel.get("employeeId"),
                        Password: viewModel.get("password"),
                        Company: viewModel.get("company"),
                        IsCustom: true,
                        Username: viewModel.get("email"),
                        LanguageRole: "English",
                        ConfirmPassword: viewModel.get("confirmPassword"),
                        IsCustomWithStoreCode: true,
                        StoreCode: viewModel.get("inputStoreCode"),
                        StoreName: viewModel.get("inputStoreName"),
                        Region: viewModel.get("company")
                    },
                    httpHeader: ['x-clientId'],
                    headerValue: [CommunityApp.configuration.authConfig.clientId]
                };

                CommunityApp.dataAccess.callService(registerOptions);
            } else {
                $("button[type='submit']", "#registrationForm").html("<span class='km-icon km-person display-inline-block'></span>&nbsp;Register").removeAttr("disabled");
                setRegistrationSubmitButton();
            }
        },
        fnRegisterCallback: function (response) {
            if(response.data && response.data.toLowerCase() == "success")
            {
                CommunityApp.userAccount.viewModel.userLogin(viewModel.get("email"), viewModel.get("password"));
            }
            else
            {
                CommunityApp.common.showErrorNotification("Registration Error", response.data);
            }

            $("button[type='submit']", "#registrationForm").html("<span class='km-icon km-person display-inline-block'></span>&nbsp;Register").removeAttr("disabled");
            setRegistrationSubmitButton();
        },
        loadStoreData: function (code) {
            var storeCodesServiceUrl = getStoreCodesServiceUrl(code);

            var storeCodesOptions = {
                url: storeCodesServiceUrl,
                requestType: "GET",
                dataType: "JSON",
                callBack: this.fnLoadStoreCodesCallback,
                httpHeader: ['x-clientid'],
                headerValue: [CommunityApp.configuration.authConfig.clientId]
            };

            CommunityApp.dataAccess.callService(storeCodesOptions);

            var storeNamesServiceUrl = getStoreNamesServiceUrl(code);

            var storeNamesOptions = {
                url: storeNamesServiceUrl,
                requestType: "GET",
                dataType: "JSON",
                callBack: this.fnStoreNamesCallback,
                httpHeader: ['x-clientid'],
                headerValue: [CommunityApp.configuration.authConfig.clientId]
            };

            CommunityApp.dataAccess.callService(storeNamesOptions);
        },
        fnLoadStoreCodesCallback: function (response) {
            if (response.data) {
                console.log(response.data);
                viewModel.set("storeCodes", response.data);
            }
        },
        fnStoreNamesCallback: function (response) {
            if (response.data) {
                viewModel.set("storeNames", response.data);
                viewModel.set("backupStoreNames", response.data);
            }
        },
        storeCodeInput: function () {
            var selectedStoreCode = viewModel.get("inputStoreCode");
            var allStoreNames = viewModel.get("backupStoreNames");

            if (selectedStoreCode !== "") {
                var filteredStoreNames = _.filter(allStoreNames, function (store) { return store.StoreCode == selectedStoreCode; });
                viewModel.set("storeNames", filteredStoreNames);
            }
            else {
                viewModel.set("storeNames", allStoreNames);
            }
        },
        fieldFocus: function () {
            viewModel.set("confirmPasswordFocus", true);
        },
        fieldBlur: function () {
            viewModel.set("confirmPasswordFocus", false);
        }
    });

    var validate = function () {
        var firstName = viewModel.get("firstName");
        var lastName = viewModel.get("lastName");
        var phone = viewModel.get("phone");
        var email = viewModel.get("email");
        var password = viewModel.get("password");
        var valid = false;
        var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var phoneRegex = /^\(?[0-9]{3}\)?\-?[0-9]{3}-?[0-9]{4}$/;

        if (firstName === "" || lastName === "" || phone === "" || email === "" || password === "" || !phoneRegex.test(phone) || !emailRegex.test(email)) {
            valid = false;
        }
        else {
            valid = true;
        }

        return valid;
    };

    return {
        viewModel: viewModel
    };
})();