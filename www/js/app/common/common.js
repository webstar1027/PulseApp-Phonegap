CommunityApp.common = (function () {
    function navigateToView(view, animation) {
        var application = CommunityApp.main.getKendoApplication();

        console.log("inside common.navigate(): " + application);

        if (application && application !== null)
        {
            if (!animation) {
                application.navigate(view);
            }
            else {
                application.navigate(view, animation);
            }   

            var scroller = application.scroller();
            if (scroller) {
                scroller.reset();
            }
        }
        
    }

    function resetScroller() {  
        var application = CommunityApp.main.getKendoApplication();
        var scroller = application.scroller();
        if (scroller) {
            scroller.reset();
        }
    }

    function showLogOffButton() {
        $(".mt-main-layout-btn-logoff").show();
    }

    function hideLogOffButton() {
        $(".mt-main-layout-btn-logoff").hide();
    }

    function authenticatedUser() {
        if (!CommunityApp.userAccount.viewModel.isUserLoggedIn) {
            console.log("user is not authenticated");
            showLoginWindow();
        }
    }

    var notification = $("#notification").kendoNotification({
        position: {
            pinned: true,
            bottom: 30 
        },
        animation: {
            open: {
                effects: "slideIn:left"
            },
            close: {
                effects: "slideIn:left",
                reverse: true
            }
        },
        autoHideAfter: 1000000000000000000000000000000000000,
        stacking: "down",
        templates: [{
            type: "error",
            template: $("#errorTemplate").html()
        }, {
            type: "upload-success",
            template: $("#successTemplate").html()
        }]
    }).data("kendoNotification");

    function showErrorNotification(title, message) {
        //var notification = $("#popupNotification").data("kendoNotification");
        var notification = $("#popupNotification").kendoNotification({
            width: $(window).width() - 40,
            left: 20,
            right: 20,
            bottom: 20
        }).data("kendoNotification");
        notification.show(message, "error");
    }

    function showSuccessNotification(message) {
        var notification = $("#popupNotification").kendoNotification({
            width: $(window).width() - 40,
            left: 20,
            right: 20,
            bottom: 20
        }).data("kendoNotification");
        notification.show(message, "info");
    }

    var setContent = function (content, template) {
        if (content && content !== null && content !== "") {
            return CommunityApp.utilities.stringFormat(template, content);
        }

        return "";
    };

    function showLoginWindow(application)
    {
        try {

            if (application && application !== null)
            {
                console.log("application is not null");
                application.navigate("#ca-login-view");
            }
            else
            {
                console.log("application is undefined");
                CommunityApp.common.navigateToView("#ca-login-view");
            }
            
            $("#loginForm").removeClass("display-none");

            setTimeout(function () { CommunityApp.userAccount.viewModel.loadLogin(); }, 2000);
        }catch(e)
        {
            console.error(JSON.stringify(e));
        }
    }

    function navigateToAppTypeView(type, postId, threadId) {
        var view;
        switch(type)
        {
            case '0':
                view = 'ca-thread?threadId=' + threadId;
                break;
            case '17':
                view = 'ca-post?postId=' + postId + '&mode=status';
                break;
            default:
                view = 'ca-post?postId=' + postId;
                break;
        }

        navigateToView('#' + view);
    }

    var pager = {
        calculatePage: function(index, pageSize)
        {
            var mod = index % pageSize;
            var page = ((index - mod) / pageSize) + 1;
            return page;
        }
    };

    var setAddFolderPath = function (view, url) {
        var navbar = view.header.find(".km-navbar").data("kendoMobileNavBar");
        if (navbar !== null)
        {
            var rightElement = navbar.rightElement;

            if (rightElement !== null)
            {
                $(rightElement[0].firstChild).attr("href", url);
            }
        }
    };

    var injectIndex = function (page, pageSize, list) {
        for (i = 0; i < list.length; i++) {
            list[i].index = ((page - 1) * pageSize) + i;
        }

        return list;
    };

    var injectValue = function (list, name, value) {
        if (list && list !== null && typeof list !== 'undefined')
        {
            for (i = 0; i < list.length; i++) {
                list[i][name] = value;
            }
        }

        return list;
    };

    var readUrl = function (input, onLoadReader) {
        if (input.files && input.files[0]) {

            var urlReader = new FileReader();

            urlReader.onload = function (e) {

                try{
                    if (typeof onLoadReader === 'function') {
                        onLoadReader(e.target.result, input.files[0]);
                    }
                }
                catch(ex)
                {
                    console.log(ex.message);
                }
            };

            urlReader.onerror = function (ex) {
                console.log(ex.target.error.name);
                console.log(ex.target.error.message);
            };

            if (input.files[0])
            {
                try{
                    urlReader.readAsDataURL(input.files[0]);
                }
                catch (ex)
                {
                    console.log(ex.message);
                }
            }            
        }
    };

    var formatSocialMessage = function (socialInfo) {
        var msg = ""; 

        if (socialInfo) {
            if (socialInfo.LikesCount > 1) {
                msg += socialInfo.LikesCount + " Likes";
            }
            else if (socialInfo.LikesCount == 1) {
                msg += "1 Like"; 
            }

            if (socialInfo.CommentsCount > 1) {
                if (msg !== "") {
                    msg += ", " + socialInfo.CommentsCount + " Comments";
                }
                else {
                    msg += socialInfo.CommentsCount + " Comments";
                }
            }
            else if (socialInfo.CommentsCount == 1) {
                if (msg !== "") {
                    msg += ", 1 Comment";
                }
                else {
                    msg += "1 Comment";
                }
            }
        }

        if (msg === "")
        {
            msg = "Be the first one to like this post";
        }

        return msg;
    };
	
	var formatSocialMessageForDiscussion = function (socialInfo) {
        var msg = ""; 

        if (socialInfo) {
            if (socialInfo.LikesCount > 1) {
                msg += socialInfo.LikesCount + " Likes";
            }
            else if (socialInfo.LikesCount == 1) {
                msg += "1 Like"; 
            }

            if (socialInfo.CommentsCount > 1) {
                if (msg !== "") {
                    msg += ", " + socialInfo.CommentsCount + " Replies";
                }
                else {
                    msg += socialInfo.CommentsCount + " Replies";
                }
            }
            else if (socialInfo.CommentsCount == 1) {
                if (msg !== "") {
                    msg += ", 1 Reply";
                }
                else {
                    msg += "1 Reply";
                }
            }
        }

        if (msg === "")
        {
            msg = "Be the first one to like this post";
        }

        return msg;
    };

    var deviceType = function () {
        var deviceType = (navigator.userAgent.match(/iPad/i)) == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i)) == "iPhone" ? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : (navigator.userAgent.match(/BlackBerry/i)) == "BlackBerry" ? "BlackBerry" : "null";
        return deviceType.toLowerCase();
    };

    function onBackKeyDown(e) {
        e.preventDefault();
    }

    var disableBackButton = function () {
        document.addEventListener("backbutton", onBackKeyDown, false);
    };

    var enableBackButton = function () {
        document.removeEventListener("backbutton", onBackKeyDown, false);
    };

    var pullToRefresh = function (viewArgs, callback) {
        if (viewArgs)
        {
            var scroller = viewArgs.view.scroller;
            if (scroller) {
                scroller.setOptions({
                    pullToRefresh: true,
                    pull: function () {
                        CommunityApp.sounds.refresh();
                        callback(viewArgs);
                        setTimeout(function () { scroller.pullHandled(); }, 100);
                    },
                    pullOffset: 50,
                    messages: {
                        pullTemplate: "",
                        refreshTemplate: "",
                        releaseTemplate: ""
                    }
                });
            }
        }
    };

    function dataURItoBlob(dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], { type: mimeString });
    }

    var logTitle = function (title) {
        if (window && window.ga && typeof window.ga.trackView === 'function')
        {
            window.ga.trackView(title);
        }
    };

    var logUserId = function (username) {
        if (window && window.ga && typeof window.ga.setUserId === 'function')
        {
            window.ga.setUserId(username);
        }
    };

    var hasLatestUpdate = function (successCallback) {

        var versionOptions = {
            url: CommunityApp.configuration.appConfig.apkVersion,
            dataType: "JSON",
            requestType: 'GET',
            callBack: function (response) {

                if (response.data)
                {
                    var device = deviceType();
                    var apkVersion = device == "android" ? response.data.android : response.data.ios;
                    var serverForceUpdateOption = response.data.forceUpdate;
                    console.log("serverForceUpdateOption: " + serverForceUpdateOption);
                    console.log("apkVersion: " + apkVersion);
                    if (serverForceUpdateOption && device && device != "null") {
                        console.log("serverForceUpdateOption is true");
                        if (typeof cordova.getAppVersion === 'function')
                        {
                            cordova.getAppVersion(function (version) {
                                if (apkVersion != version) {
                                    successCallback(false, apkVersion);
                                }
                                else {
                                    successCallback(true, apkVersion);
                                }
                            });
                        }
                        else
                        {
                            successCallback(true, null);
                        }
                    }
                    else {
                        successCallback(true, null);
                    }
                }
                else
                {
                    successCallback(true, null);
                }
            }
        };

        CommunityApp.dataAccess.callService(versionOptions);
    };

    var forceUpdate = function (callBack) {
        if (CommunityApp.configuration.appConfig.forceUpdate)
        {
            hasLatestUpdate(function (isUpdated, newVersion) {
                if (newVersion !== null) {
                    if (!isUpdated) {

                        var dType = CommunityApp.common.deviceType();
                        var appName = CommunityApp.configuration.appConfig.appTitle;
                        var store = dType == 'android' ? CommunityApp.configuration.appConfig.marketUrl : CommunityApp.configuration.appConfig.appStoreUrl;
                        navigator.notification.alert('There is a newer version of the App available. Please update for the best experience.', function(){window.open(store, '_system');}, 'Good News!');
                    }
                    else {
                        if (callBack && callBack !== null) {
                            callBack();
                        }
                    }
                }
                else {
                    if (callBack && callBack !== null) {
                        callBack();
                    }
                }
            });
        }
        else
        {
            if (callBack && callBack !== null) {
                callBack();
            }
        }
    };

    var openFile = function (fileUrl, successCallback) {
        var fileName = fileUrl.substr(fileUrl.lastIndexOf('/') + 1);
        var type = fileName.substr((fileName.lastIndexOf('.') + 1));
        if (fileUrl !== null) {
            switch (type.toLowerCase()) {
                case "gif":
                case "png":
                case "jpg":
                case "jpeg":
                case "pdf":
                case "doc":
                case "docx":
                case "xls":
                case "xlsx":
                    if (CommunityApp.common.deviceType() === "android") {
                        console.log("fileUrl: " + fileUrl);
                        var folderName = "Download";

                        if (CommunityApp.common.deviceType() === "android") {
                            folderName = "Download";
                        } else if (CommunityApp.common.deviceType() === "iphone" || CommunityApp.common.deviceType() === "ipad") {
                            folderName = "Download";
                        }
                        console.log("FileName: " + fileName);

                        var onDirectorySuccess = function (parent) {
                            console.log("Directory Created Successfully!");
                        };

                        var onDirectoryFail = function (error) {
                            CommunityApp.common.showErrorNotification("Error!", "Unable to create new directory: " + error.code);
                        };

                        var fileSystemSuccess = function (fileSystem) {
                            var fp = fileSystem.root.toURL() + folderName + "/" + fileName; // Returns Fulpath of local directory
                                
                            //$('#ca-post #mainScroller').hide();
                            //$('<div class="k-loading-mask" style="width: 100%; height: 100%; top: 0px; left: 0px;"><span class="k-loading-text">Downloading...</span><div class="k-loading-image"></div><div class="k-loading-color"></div></div>').appendTo('#ca-post .km-content');

                            var permissions = cordova.plugins.permissions;

                            permissions.hasPermission(permissions.WRITE_EXTERNAL_STORAGE, function (status) {
                                if (!status.hasPermission) {
                                    var errorCallback = function () {
                                        CommunityApp.common.showErrorNotification("Error!", "Requires storage permission!");
                                    };

                                    permissions.requestPermission(permissions.WRITE_EXTERNAL_STORAGE,
                                      function (status) {
                                          if (!status.hasPermission)
                                              errorCallback();
                                          else {
                                              downloadFile(fileUrl, fp);
                                          }
                                      },
                                      errorCallback);
                                }
                                else {
                                    downloadFile(fileUrl, fp);
                                }
                            }, null);
                        };

                        var fileSystemFail = function (evt) {
                            CommunityApp.common.showErrorNotification("Error!", "Unexpected error, please try again later!");
                        };

                        if (fileUrl === null || fileUrl === "") {
                            CommunityApp.common.showErrorNotification("Error!", "Unexpected error, please try again later!");
                            return;
                        } else {
                            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileSystemSuccess, fileSystemFail);
                        }


                        var downloadFile = function (fileUrl, fp) {
                            var fileTransfer = new FileTransfer();
                            fileUrl = fileUrl.replace(/ /g, "%20");
                            console.log("replaced fileUrl: " + fileUrl);
                            fileTransfer.download(fileUrl, fp,
                                function (entry) {
                                    //$('#ca-post .k-loading-mask').remove();
                                    //$('#ca-post #mainScroller').show();

                                    var localFileUrl = entry.toURL();
                                    localFileUrl = localFileUrl.replace(/%20/g, " ");

                                    cordova.InAppBrowser.open(encodeURI(localFileUrl), "_system");
                                    if (successCallback && successCallback !== null)
                                        successCallback();
                                },
                                function (error) {
                                    //Download abort errors or download failed errors
                                    //$('#ca-thread-discussion .k-loading-mask').remove();
                                    //$('#thread-discussions-main-container').show();
                                    CommunityApp.common.showErrorNotification("Error!", "Unexpected error, please try again later!");
                                    alert("Please check the application permission.");
                                }
                            );
                        };
                    } else {
                        cordova.InAppBrowser.open(encodeURI(fileUrl), "_system");
                        if (successCallback && successCallback !== null)
                            successCallback();  
                    }



                    break;
                default:
                    cordova.InAppBrowser.open(encodeURI(fileUrl), "_system");
                    if (successCallback && successCallback !== null)
                        successCallback(); 
                    break;
            }
        }
    };


    var guid = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
          s4() + '-' + s4() + s4() + s4();
    };
    
    var startActivity = function (intentUrl) {
        window.plugins.webintent.startActivity({
            action: window.plugins.webintent.ACTION_VIEW,
            url: intentUrl},
            function() {},
            function() {alert('Failed to open URL via Android Intent');}
        );
    };
    
    var openShopSamsung = function (url) {
        console.log ("** Opening Shop Samsung from secondary banner ** : " + url);
        cordova.InAppBrowser.open(url, '_system');
    };

    return {
        navigateToView: navigateToView,
        showLogOffButton: showLogOffButton,
        hideLogOffButton: hideLogOffButton,
        authenticatedUser: authenticatedUser,
        showErrorNotification: showErrorNotification,
        showSuccessNotification: showSuccessNotification,
        setContent: setContent,
        showLoginWindow: showLoginWindow,
        navigateToAppTypeView: navigateToAppTypeView,
        resetScroller: resetScroller,
        pager: pager,
        setAddFolderPath: setAddFolderPath, 
        injectIndex: injectIndex,
        injectValue: injectValue,
        readUrl: readUrl,
        formatSocialMessage: formatSocialMessage,
		formatSocialMessageForDiscussion: formatSocialMessageForDiscussion,
        deviceType: deviceType,
        disableBackButton: disableBackButton,
        enableBackButton: enableBackButton,
        pullToRefresh: pullToRefresh,
        dataURItoBlob: dataURItoBlob,
        logTitle: logTitle,
        logUserId: logUserId,
        forceUpdate: forceUpdate,
        openFile: openFile,
        guid: guid,
        startActivity: startActivity,
        openShopSamsung: openShopSamsung
    };
})();