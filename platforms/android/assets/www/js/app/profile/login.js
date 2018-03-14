CommunityApp.userAccount = (function () {

    var authCodeServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.authConfig.authPath + CommunityApp.configuration.authConfig.authCodePath;

    var accessTokenServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.authConfig.authPath + CommunityApp.configuration.authConfig.accessTokenPath;
    
    var logOffServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.authConfig.authPath + CommunityApp.configuration.authConfig.logOffPath;

    var navServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.navConfig.navPath + CommunityApp.configuration.navConfig.appNav;
    
    var showHelpDeskServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.authConfig.authPath + CommunityApp.configuration.authConfig.showHelpDesk;
    
    var getJoinNowPathServiceUrl = function(platform){
        var joinNowPathServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.authConfig.authPath + CommunityApp.configuration.authConfig.joinNowPath;
        joinNowPathServiceUrl = CommunityApp.utilities.stringFormat(joinNowPathServiceUrl, platform);
        return joinNowPathServiceUrl;
    };

    CommunityApp.common.hideLogOffButton();

    var setLoginSubmitButton = function () {
        $("#loginForm").unbind("submit");
        $("#loginForm").one('submit', function () {
            $("button[type='submit']", this).html("Processing...").attr('disabled', 'disabled');
            viewModel.userLogin();
            return true;
        });
    };

    var viewModel = kendo.observable({
        isUserLoggedIn: false,
        userName: "",
        password: "",
        procedureInterval: null,
        joinNowPath: "",
        showHelpDesk: true,
        loadLogin: function (e) {
            CommunityApp.common.logTitle(e.view.title);

            var username = CommunityApp.session.load("persist-username");
            if (username !== null && username !== "")
            {
                $("#user-acc-username").val(username);
                viewModel.set("userName", username);
            }
            viewModel.set("joinNowPath", "#ca-employee-verify");
            if (typeof cordova.getAppVersion === 'function')
            {
                cordova.getAppVersion(function (version) {
                    var joinNowPathServiceUrl = getJoinNowPathServiceUrl(CommunityApp.common.deviceType());
                    var joinNowPathOption = {
                        url: joinNowPathServiceUrl,
                        requestType: "POST",
                        dataType: "JSON",
                        callBack: viewModel.fnJoinNowPathCallBack,
                        data: "=" + version,
                        httpHeader: ['x-clientid'],
                        headerValue: [CommunityApp.configuration.authConfig.clientId]
                    };
                    console.log(joinNowPathServiceUrl);
                    CommunityApp.dataAccess.callService(joinNowPathOption);
                });
            }
            else
            {
                viewModel.set("joinNowPath", "#ca-employee-verify");
            }
            
            var showHelpDeskOption = {
                url: showHelpDeskServiceUrl,
                requestType: "GET",
                dataType: "JSON",
                callBack: viewModel.fnShowHelpDeskCallBack,
                httpHeader: ['x-clientid'],
                headerValue: [CommunityApp.configuration.authConfig.clientId]
            };
            CommunityApp.dataAccess.callService(showHelpDeskOption);
            setLoginSubmitButton();
        },
        fnJoinNowPathCallBack: function (response) {
            if (response.data) {
                viewModel.set("joinNowPath", response.data);
            } else {
                viewModel.set("joinNowPath", "#ca-employee-verify");
            }
        },
        joinNowRedirect: function () {
            CommunityApp.common.navigateToView(viewModel.get("joinNowPath"));
        },
        fnShowHelpDeskCallBack: function(response) {
            console.log(response);
            console.log(response.data);
            if (response.data !== null) {
                viewModel.set("showHelpDesk", response.data);
            } else {
                viewModel.set("showHelpDesk", true);
            }
            console.log(viewModel.get("showHelpDesk"));
        },
        userLogin: function (username, password) {
            CommunityApp.session.clear(true);
            var authCodeOptions = {};

            if (username !== null && username !== "" && typeof username !== 'undefined' && password !== null && password !== "" && typeof password !== 'undefined')
            {
                console.log("username and password ARE explicitly passed as : username: " + username + " and password: " + password);
                authCodeOptions = {
                    url: authCodeServiceUrl,
                    requestType: "POST",
                    dataType: "JSON",
                    callBack: this.fnAuthCodeCallBack,
                    data: {
                        Username: username,
                        Password: password
                    },
                    httpHeader: ['x-clientid'],
                    headerValue: [CommunityApp.configuration.authConfig.clientId]
                };
            }
            else
            {
                console.log("username and password are not explicitly passed");

                var un = $("#user-acc-username").val();
                var pwd = $("#user-acc-password").val();

                authCodeOptions = {
                    url: authCodeServiceUrl,
                    requestType: "POST",
                    dataType: "JSON",
                    callBack: this.fnAuthCodeCallBack,
                    data: {
                        Username: un,
                        Password: pwd
                    },
                    httpHeader: ['x-clientid'],
                    headerValue: [CommunityApp.configuration.authConfig.clientId]
                };
            }

            CommunityApp.dataAccess.callService(authCodeOptions);
        },
        fnAuthCodeCallBack: function (response) {
            if (response.data) {
                switch (response.data.StatusMessage.toString().toLowerCase()) {
                    case "valid":
                    case "forcepasswordchange":
                        var authCode = response.data.Token;

                        var accessTokenOptions = {
                            url: accessTokenServiceUrl,
                            requestType: "POST",
                            dataType: "JSON",
                            callBack: CommunityApp.userAccount.viewModel.fnAccessTokenCallBack,
                            data: "=" + authCode,
                            httpHeader: ['x-clientid', 'x-client-secret'],
                            headerValue: [CommunityApp.configuration.authConfig.clientId, CommunityApp.configuration.authConfig.clientSecret]
                        };

                        CommunityApp.dataAccess.callService(accessTokenOptions);
                        break;
                    case "invalidusercredentials":
                        CommunityApp.common.showErrorNotification("Invalid Credentials", "Incorrect username or password");
                        $("button[type='submit']", "#loginForm").html("Sign In").removeAttr("disabled");
                        setLoginSubmitButton();
                        break;
                    default:
                        CommunityApp.common.showErrorNotification("Invalid Login Data", "The login data is either incorrect or expired, please try again!");
                        break;
                }
            }
            else {
                CommunityApp.common.showErrorNotification("Unexpected Error", "Incorrect username or password");
                $("button[type='submit']", "#loginForm").html("Sign In").removeAttr("disabled");
                setLoginSubmitButton();
            }
        },
        fnAccessTokenCallBack: function (response) {
            if (response.data) {
                switch (response.data.StatusMessage.toString().toLowerCase()) {
                    case "valid":
                        CommunityApp.userAccount.viewModel.authenticate(response.data.UserId, response.data.Username, response.data.Token);
                        if (CommunityApp.userAccount.viewModel.isUserLoggedIn)
                        {
                            CommunityApp.common.navigateToView("#ca-loading-view");
                            CommunityApp.userAccount.viewModel.onLoginSuccess(response.data.Username);
                            //CommunityApp.recentPosts.viewModel.refresh();
                        }
                        break;
                    case "forcepasswordchange":
                        CommunityApp.userAccount.viewModel.authenticate(response.data.UserId, response.data.Username, response.data.Token);
                        if (CommunityApp.userAccount.viewModel.isUserLoggedIn)
                        {
                            CommunityApp.common.navigateToView("#ca-change-password?sender=login");
                        }
                        break;
                    default:
                        CommunityApp.common.showErrorNotification("Invalid Login Data", "The login data is either incorrect or expired, please try again!");
                        break;
                }
            }
            else {
                CommunityApp.common.showErrorNotification("Unexpected Error", "Unexpected error occurred to the system, please try again later!");
            }

            $("button[type='submit']", "#loginForm").html("Sign In").removeAttr("disabled");
            setLoginSubmitButton();
        },
        authenticate: function (userId, username, accessToken) {
            console.log("inside authenticate");

            viewModel.set("isUserLoggedIn", true);

            CommunityApp.session.currentUser.save(userId, username);
            CommunityApp.session.accessToken.save(accessToken);

            $.ajaxSetup({
                headers: { 'Authorization': "Basic " + accessToken }
            });

            CommunityApp.common.showLogOffButton();
            CommunityApp.common.enableBackButton();

            $("#btnLogOff").click(function () { CommunityApp.userAccount.viewModel.logOff(); });

            console.log("authentication complete");
        },
        logOff: function () {
            CommunityApp.notifications.viewModel.deleteDevice();
            
            $.ajaxSetup({
                headers: {}
            });

            $("#loginForm").removeClass("display-none");

            var accessToken = CommunityApp.session.accessToken.load();
            var logOffOptions = {
                url: logOffServiceUrl,
                requestType: "POST",
                dataType: "JSON",
                callBack: CommunityApp.userAccount.viewModel.fnLogOffCallBack,
                data: "=" + accessToken,
                httpHeader: ['x-clientid', 'x-client-secret'],
                headerValue: [CommunityApp.configuration.authConfig.clientId, CommunityApp.configuration.authConfig.clientSecret]
            };
            CommunityApp.dataAccess.callService(logOffOptions);

        },
        fnLogOffCallBack: function(response) {
            viewModel.set("isUserLoggedIn", false);
            viewModel.set("userName", "");
            viewModel.set("password", "");

            CommunityApp.session.clear(true);
            CommunityApp.common.hideLogOffButton();
            CommunityApp.common.navigateToView("#ca-login-view");
            CommunityApp.common.disableBackButton();

            clearInterval(viewModel.procedureInterval);
        },
        onLoginSuccess: function(username)  
        {
            CommunityApp.sounds.preload();
            CommunityApp.common.logUserId(username);

            CommunityApp.session.save("persist-username", username);

            if (CommunityApp.common.deviceType() === "android") {
			    AndroidFullScreen.immersiveMode(successFunction, errorFunction);
            }
            
            CommunityApp.notifications.viewModel.registerDevice();

            CommunityApp.notifications.viewModel.updateBadge();
            
            CommunityApp.folder.viewModel.getUploadCloudinaryDirectlyValue();

            CommunityApp.recentPosts.viewModel.processLatestPosts(function () {
                CommunityApp.recentPosts.viewModel.readOffline();
            });

            CommunityApp.recentPosts.viewModel.processBanners(function () {
                CommunityApp.recentPosts.viewModel.loadMobileLatestBannersOffline();
            });

            viewModel.procedureInterval = setInterval(repeatProcedure, CommunityApp.configuration.appConfig.repeatProcInterval);
			
			function successFunction()
			{
				console.info("It worked!");
			}
              
			function errorFunction(error)
			{
				console.error(error);
			}
        },
        gotoHelpDesk: function () {
            var helpDeskUrl = "http://" + CommunityApp.configuration.appConfig.domain + "/members/helpdesk";
            cordova.InAppBrowser.open(encodeURI(helpDeskUrl), "_system", "location=no");
        }
    });

    var repeatProcedure = function () {
        if (CommunityApp.configuration.appConfig.instantNotifications)
            CommunityApp.notifications.viewModel.updateBadge();
    };  

    return {
        viewModel: viewModel
    };
})();