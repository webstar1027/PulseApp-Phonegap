/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var phonegapApp = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        phonegapApp.receivedEvent('deviceready');
    },
    receivedEvent: function (id) {
        console.log('Received Event: ' + id);
        console.log("device ID: " + device.uuid);
        console.log(device);
        var dv = device;

        if (window && window.ga && typeof window.ga.startTrackerWithId === 'function')
        {
            window.ga.startTrackerWithId('UA-35856262-14');
        }

        if (typeof cordova.getAppVersion === 'function')
        {
            cordova.getAppVersion(function (version) {

                if (window && window.ga && typeof window.ga.setAppVersion === 'function') {
                    window.ga.setAppVersion(version);
                }

            });
        }
        
        try {

            if (CommunityApp.common.deviceType() === "android") {
                AndroidFullScreen.immersiveMode(function () { }, function () { });
            } else {
                StatusBar.hide();
            }

            var push = PushNotification.init({
                android: {
                    senderID: "776738770185"
                },
                browser: {
                    pushServiceURL: 'http://push.api.phonegap.com/v1/push'
                },
                ios: {
                    alert: "true",
                    badge: "true",
                    sound: "true"
                },
                windows: {}
            });

            push.on('registration', function (data) {
                console.log("push.onregistration start");
                var device = {
                    deviceId: dv.uuid,
                    model: dv.model,
                    platform: dv.platform,
                    regId: data.registrationId,
                    version: dv.version,
                    manufacturer: dv.manufacturer,
                    serial: dv.serial
                };

                CommunityApp.session.save("push_device", device);
                console.log("Registration ID: " + data.registrationId);
                console.log(device);
            });


            push.on('notification', function (data) {
                if (data.additionalData.foreground) {
                    var onchat = CommunityApp.session.load("on-chat", true);
                    if (onchat != "true")
                    {
                        if (data.additionData.dismiss === true) {
                            navigator.notification.alert(
                                data.message,
                                function(butId){
                                    if (butId === 1)
                                        CommunityApp.common.navigateToView(data.additionalData.url);
                                }, 
                                data.additionalData.title
                            );
                        } else {
                            navigator.notification.confirm(
                                data.message,
                                function(butId){
                                    if (butId === 1)
                                        CommunityApp.common.navigateToView(data.additionalData.url);
                                }, 
                                data.additionalData.title,
                                'Ok,Dismiss');
                        }
                    }
                }
                else {
                    if (data.additionalData.coldstart)
                    {
                        CommunityApp.session.save("push_url", data.additionalData.url);
                    }
                    else
                    {
                        CommunityApp.common.navigateToView(data.additionalData.url);
                    }
                }
            }); 


            push.on('error', function (e) {
                console.log("Error: " + e.message);
            });

            var onResume = function () {
                if (CommunityApp.userAccount.viewModel.isUserLoggedIn) {
                    CommunityApp.notifications.viewModel.registerDevice();
                    CommunityApp.common.forceUpdate();
                    CommunityApp.notifications.viewModel.updateBadge();
                    CommunityApp.folder.viewModel.getUploadCloudinaryDirectlyValue();
                }
            };

            var onPause = function () {
                if (CommunityApp.userAccount.viewModel.isUserLoggedIn) {
                    CommunityApp.session.remove(CommunityApp.configuration.postConfig.offlineStore);
                    CommunityApp.recentPosts.viewModel.processLatestPosts(function () {
                        CommunityApp.recentPosts.viewModel.readOffline();
                    });

                    CommunityApp.recentPosts.viewModel.processBanners(function () {
                        CommunityApp.recentPosts.viewModel.loadMobileLatestBannersOffline();
                    });
		    
		    CommunityApp.sectionPosts.viewModel.readSectionAllPosts(CommunityApp.configuration.appConfig.mainDiscussionsSectionId, 120, 120, function (response) {
                        if(response.data)
                        { 
                            CommunityApp.session.save("offline_main_discussion_cache", response.data);
                        }
                    });
                    
                    CommunityApp.library.viewModel.read(1, null, function (response) {
                        if (response.data) {
                            CommunityApp.session.save("offline_resourcesTopLevel_cache", response.data);
                        }
                    });
                }
            };

            document.addEventListener("resume", onResume, false);

            document.addEventListener("pause", onPause, false);

        }
        catch (ex)
        {
            console.log("Exception: " + JSON.stringify(ex.message));
        }

        deviceReadyCallBack();
    }
};
