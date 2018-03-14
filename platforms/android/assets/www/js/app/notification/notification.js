CommunityApp.notifications = (function () {
    var getUserNotificationsServiceUrl = function (userId, width, height) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.notificationsConfig.notificationsPath +
            CommunityApp.configuration.notificationsConfig.userNotificationsPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, width, height);
    };

    var getUserUnreadNotificationsServiceUrl = function (userId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.notificationsConfig.notificationsPath +
            CommunityApp.configuration.notificationsConfig.unreadsCountPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId);
    };

    var getMarkAsReadServiceUrl = function (userId, notificationId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.notificationsConfig.notificationsPath +
            CommunityApp.configuration.notificationsConfig.markAsReadPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, notificationId);
    };

    var getDeleteNotificationServiceUrl = function (userId, notificationId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.notificationsConfig.notificationsPath +
            CommunityApp.configuration.notificationsConfig.deletePath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, notificationId);
    };

    var registerDeviceServiceUrl = function (userId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.notificationsConfig.notificationsPath +
            CommunityApp.configuration.notificationsConfig.pushNotificationsDevicePath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId);
    };
    
    var deleteDeviceServiceUrl = function (userId, deviceId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.notificationsConfig.notificationsPath +
            CommunityApp.configuration.notificationsConfig.deletePushNotificationsDevicePath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, deviceId);
    };

    var viewModel = kendo.observable({
        drags: [],
        pages_read: [],
        read: function (page, view) {
            var userId = CommunityApp.base.baseData.currentUser().id;
            var serviceUrl = getUserNotificationsServiceUrl(userId, 50, 50);
            var pageSize = 25;
            serviceUrl += "&page=" + page + "&pageSize=" + pageSize;

            var notificationsOptions = {
                url: serviceUrl,
                dataType: 'JSON',
                requestType: 'GET',
                callBack: viewModel.fnReadPageNotificationsCallback,
                sender: {
                    page: page,
                    pageSize: pageSize,
                    view: view
                }
            };

            var thatPage = page;
            var thatView = view;
            CommunityApp.dataAccess.callService(notificationsOptions, "notifications-listview", "<h2 class='centerAlign padding-1'>No current notifications!</h2>", null, null, function () {
                viewModel.read(thatPage, thatView);
            });
        },
        fnReadPageNotificationsCallback: function (response, sender) {
            if (response.data) {
                var currentPage = sender.page;
                var pageSize = sender.pageSize;
                var data = response.data.Items;
                var pagingThreshold = 4;

                data = CommunityApp.common.injectIndex(currentPage, pageSize, data);
                var notificationsTemplate = kendo.template($('#notifications-list-tmpl').html());
                var result = kendo.render(notificationsTemplate, data);
                var pages_read = viewModel.get("pages_read");
                scroller = sender.view.scroller;

                if (currentPage == 1) {
                    $("#notifications-listview").empty();
                    scroller.reset();
                }

                $("#notifications-listview").append(result);

                pages_read.push(currentPage);
                viewModel.set("pages_read", pages_read);

                viewModel.enableSwipe();

                scroller.bind("scroll", function (e) {
                    $(".noti-container").each(function () {
                        if ($(this).visible()) {
                            viewedIndex = $(this).attr("data-index");
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
        },
        load: function (e) {
            CommunityApp.common.logTitle("Notifications");
            viewModel.read(1, e.view);
            CommunityApp.common.pullToRefresh(e, function (viewArgs) {
                viewModel.load(viewArgs);
            });
        },
        updateBadge: function () {
            //CommunityApp.common.authenticatedUser();

            var userId = CommunityApp.base.baseData.currentUser().id;

            if (userId > 0)
            {
                var serviceUrl = getUserUnreadNotificationsServiceUrl(userId);

                var notificationsOptions = {
                    url: serviceUrl,
                    dataType: 'JSON',
                    requestType: 'GET',
                    callBack: viewModel.fnUpdateBadgeCallback
                };

                CommunityApp.dataAccess.callService(notificationsOptions, null, null, true, null, null, function () {
                    viewModel.updateBadge();
                });
            }
        },
        fnUpdateBadgeCallback: function (response) {
            if (response.data) {
                $("a[name='noti-badge']").each(function () {
                    var badgeButton = $(this).data("kendoMobileButton");
                    if (badgeButton && badgeButton !== null && typeof badgeButton !== "undefined") {
                        if (response.data == "0") {
                            badgeButton.badge(false);
                        }
                        else {
                            badgeButton.badge(response.data);
                        }
                    }
                    else {
                        if (response.data == "0") {
                            $(this).find(".km-badge").html("");
                        }
                        else {
                            $(this).find(".km-badge").html(response.data);
                        }
                    }
                });
            }
        },
        enableSwipe: function () {
            $("#notifications-listview").find(".noti-container .item").each(function () {
                $(this).kendoTouch({
                    enableSwipe: true,
                    swipe: function (e) {
                        viewModel.swipe(e);
                    }
                });
            });
        },
        swipe: function (e) {
            var item = e.sender.element;
            var notiId = item.attr("data-id");
            var isDraggedLeft = _.contains(viewModel.drags, notiId);

            if (e.direction === "left" && item.position().left === 0) {
                item.animate({ right: '+=120' });
                viewModel.drags.push(notiId);
            }
            else if (e.direction === "right" && item.position().left < 0 && isDraggedLeft) {
                item.css('padding-left', '15px');
                item.animate({ right: '-=120' });
                viewModel.drags = _.filter(viewModel.drags, function (nId) { return nId != notiId; });
            }
        },
        deleteNotification: function (id, sender) {
            //CommunityApp.common.authenticatedUser();

            var userId = CommunityApp.base.baseData.currentUser().id;
            var serviceUrl = getDeleteNotificationServiceUrl(userId, id);

            var deleteOptions = {
                url: serviceUrl,
                dataType: "JSON",
                requestType: "DELETE",
                callBack: viewModel.fnDeleteCallback,
                sender: sender
            };

            var thatId = id;
            var thatSender = sender;
            CommunityApp.dataAccess.callService(deleteOptions, null, null, null, null, null, function () {
                viewModel.deleteNotification(thatId, thatSender);
            });
        },
        fnDeleteCallback: function (response, sender) {
            if (response.data.HttpStatus === 200) {
                $(sender).closest(".noti-container").remove();
                CommunityApp.notifications.viewModel.updateBadge();

            } else {
                CommunityApp.common.showErrorNotification("Error!", "Unexpected error occurred!");
            }
        },
        open: function (sender) {
            var itemTouch = $(sender);
            var attributes = JSON.parse(itemTouch.attr("data-attributes"));
            var type = itemTouch.attr("data-type");
            var notiId = itemTouch.attr("data-id");
            var view = "";
            var attribute;

            switch (type.toLowerCase()) {
                case "friendrequest":
                    view = "views/friends/requests.html";
                    break;
                case "badgeawarded":
                    view = "ca-user-badges";
                    break;
                case "conversationstart":
                case "conversationreply":
                    attribute = _.find(attributes, function (attr) { return attr.Name == "Conversation"; });
                    view = "views/conversations/convolist.html?convid=" + attribute.Value;
                    break;
                case "likepost":
                case "usertag":
                case "postcomment":
                    attribute = _.find(attributes, function (attr) { return attr.Name == "Post"; });
                    view = "ca-post?postId=" + attribute.Value;
                    break;
                case "forumreply":
                case "forumthreadcreate":   
                    var threadAttribute = _.find(attributes, function (attr) { return attr.Name == "Thread"; });
                    var typeAttribute = _.find(attributes, function (attr) { return attr.Name == "ThreadType"; });
                    if (threadAttribute && typeAttribute) {
                        view = (typeAttribute.Value.toLowerCase() == "discussion") ? "ca-thread-discussion" : "ca-thread-qa";
                        view = view + "?threadId=" + threadAttribute.Value;
                    }
                    break;
            }

            $(sender).closest("li.noti-container").find(".item").removeClass("bg-lightblue");
            $(sender).closest("li.noti-container").find(".item").addClass("bg-white");

            var userId = CommunityApp.base.baseData.currentUser().id;
            var markAsReadServiceUrl = getMarkAsReadServiceUrl(userId, notiId);
            var markAsReadOptions = {
                url: markAsReadServiceUrl,
                dataType: "JSON",
                requestType: "PUT",
                callBack: viewModel.fnMarkAsReadCallback
            };

            var thatSender = sender;
            CommunityApp.dataAccess.callService(markAsReadOptions, null, null, null, null, null, function () {
                viewModel.open(thatSender);
            });

            if (view !== "" && view !== null) {
                CommunityApp.common.navigateToView(view);
            }
        },
        fnMarkAsReadCallback: function (response) {
            CommunityApp.notifications.viewModel.updateBadge();
        },
        registerDevice: function () {
            var userId = CommunityApp.base.baseData.currentUser().id;
            var device = CommunityApp.session.load("push_device");

            if (device !== null && typeof device !== "undefined" && userId > 0) {
                if (typeof cordova.getAppVersion === 'function') {
                    cordova.getAppVersion(function (version) {
                        callService(device, version, userId);
                    });
                }
                else
                {
                    callService(device, "", userId);
                }
            }

            function callService(device, version, userId) {
                var serviceUrl = registerDeviceServiceUrl(userId);

                var registerDeviceOptions = {
                    url: serviceUrl,
                    dataType: "JSON",
                    requestType: "POST",
                    data: {
                        DeviceId: device.deviceId,
                        Model: device.model,
                        Platform: device.platform,
                        RegistrationId: device.regId,
                        Version: device.version,
                        Manufacturer: device.manufacturer,
                        Serial: device.serial,
                        AppVersion: version
                    }
                };

                CommunityApp.dataAccess.callService(registerDeviceOptions);
            }
        },
        deleteDevice: function () {
            var userId = CommunityApp.base.baseData.currentUser().id;
            var device = CommunityApp.session.load("push_device");
            
            console.log("deleteDevice call");
            console.log(device);

            if (device !== null && typeof device !== "undefined" && userId > 0) {
                    callService(device, userId);
            }

            function callService(device, userId) {
                var serviceUrl = deleteDeviceServiceUrl(userId, device.deviceId);
                console.log("delete device serviceurl: " + serviceUrl);

                var deleteDeviceOptions = {
                    url: serviceUrl,
                    dataType: "JSON",
                    requestType: "DELETE"
                };

                CommunityApp.dataAccess.callService(deleteDeviceOptions);
            }
        },
        clear: function () {
            var userId = CommunityApp.base.baseData.currentUser().id;
            var serviceUrl = getUserNotificationsServiceUrl(userId, 50, 50);

            var clearNotificationsOptions = {
                url: serviceUrl,
                dataType: "JSON",
                requestType: "DELETE",
                callBack: viewModel.fnClearNotificationsCallback
            };

            CommunityApp.dataAccess.callService(clearNotificationsOptions, null, null, null, null, null, function () {
                viewModel.clear();
            });
        },
        fnClearNotificationsCallback: function (response) {  
            if (response.data) {
                if (response.data.HttpStatus == 200) {
                    viewModel.destroyBadge();
                    $("#notifications-listview").empty();
                    $("#notifications-listview").html("<h2 class='centerAlign padding-1'>No notifications are found!</h2>");
                }
            }
        },
        destroyBadge: function () {
            $("a[name='noti-badge']").each(function () {
                var badgeButton = $(this).data("kendoMobileButton");
                if (badgeButton && badgeButton !== null && typeof badgeButton !== "undefined") {
                    badgeButton.badge(false);
                }
            });
        }
    });

    return {
        viewModel: viewModel
    };
})();