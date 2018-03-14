CommunityApp.groupMessages = (function () {

    var getGroupMessagesServiceUrl = function (groupId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.chatConfig.basePath + CommunityApp.configuration.chatConfig.groupMessagesPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, groupId);
    };

    var getGroupServiceUrl = function (groupId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.chatConfig.basePath + CommunityApp.configuration.chatConfig.groupPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, groupId);
    };

    var getVoteServiceUrl = function (groupId, messageId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.chatConfig.basePath + CommunityApp.configuration.chatConfig.groupMessageVotePath;
        return CommunityApp.utilities.stringFormat(serviceUrl, groupId, messageId);
    };

    var getLeaveGroupServiceUrl = function (groupId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.chatConfig.basePath + CommunityApp.configuration.chatConfig.leaveGroupPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, groupId);
    };  

    var getGroupMembersServiceUrl = function (groupId) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.chatConfig.basePath + CommunityApp.configuration.chatConfig.groupJoinedMembersPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, groupId);
    };

    var setMessageSubmitForm = function () {
        if ($("#message-form")) {
            $("#message-form").unbind("submit");
            $("#message-form").one("submit", function () {
                viewModel.postMessage();
                return true;
            });
        }
    };

    var viewModel = kendo.observable({
        dataBound: false,
        message: "",
        lastMessageId: 0,
        firstMessageId: 0,
        total: 0,
        hasMoreMessages: false,
        groupId: 0,
        creatorId: 0,
        timer: {},
        timerNoScroll: {},
        hideAttachment: true,
        orientation: "",
        attachmentUrl: "",
        source: "",
        screenLoad: false,
        zoomedIn: false,
        uploadSelection: "",
        uploadSource: "",
        giphyData: {},
        lookupHandle: {},
        groupName: "",
        groupMembers: [],
        setTopRightIcon: function(){
            $("a[name='noti-badge']").hide();
            $("#btn-more").removeClass("display-none");
            $("#btn-more").show();  
        },
        resetTopRightIcon: function(){
            $("a[name='noti-badge']").show();
            $("#btn-more").addClass("display-none");
        },
        isCreator: function(){
            var currentUserId = CommunityApp.base.baseData.currentUser().id;
            var creatorId = viewModel.get("creatorId");
            return currentUserId == creatorId;
        },
        load: function (e) {
            CommunityApp.session.save("on-chat", "true", true);

            viewModel.setTopRightIcon();
            viewModel.set("dataBound", false);
            viewModel.set("hideAttachment", true);
            viewModel.set("source", CommunityApp.common.guid());
            viewModel.set("screenLoad", true);
            viewModel.set("uploadSource", e.view.params.from);

            viewModel.loadGiphy();

            var groupId = e.view.params.groupId;

            viewModel.set("groupId", groupId);

            var groupServiceUrl = getGroupServiceUrl(groupId);

            var groupOptions = {
                url: groupServiceUrl,
                requestType: "GET",
                dataType: "JSON",
                callBack: viewModel.fnGetGroupCallBack,
                sender: {
                    groupId: groupId,
                    view: e.view
                }
            };
            
            CommunityApp.dataAccess.callService(groupOptions, null, null, null, null, null, function () {
                viewModel.load(e);
            });
        },
        loadGiphy: function () {
            var giphyData = CommunityApp.session.load(CommunityApp.configuration.giphyConfig.offlineStore);
             
            if (typeof giphyData !== 'undefined' && giphyData !== null && typeof giphyData.selectedFixedWidthGiphy !== 'undefined' && giphyData.selectedFixedWidthGiphy !== null && giphyData.selectedFixedWidthGiphy.length > 0) {

                viewModel.set("giphyData", giphyData);
                
                viewModel.set("attachmentUrl", giphyData.selectedFixedWidthGiphy);
                viewModel.set("hideAttachment", false);
                $("#message-group").addClass("width-55");
                $("#btn-submit-message").removeClass("display-none");

            }
        },
        inputFocus: function () {
            $("#container-scroller").removeClass("height-22");
            $("#container-scroller").addClass("height-28");
            $("#btn-submit-message").addClass("display-none");
            $("#btn-down").removeClass("display-none");
            viewModel.scrollBottom();
        },
        inputBlur: function () {
            $("#container-scroller").removeClass("height-28");
            $("#container-scroller").addClass("height-22");
            $("#btn-down").addClass("display-none");
            $("#btn-submit-message").removeClass("display-none");
            viewModel.scrollBottom();             
        },
        inputKeyUp: function(e)
        {
            var key = e.key;
            var keyCode = e.keyCode;

            if (key === "@")
            {
                var previousHandle = viewModel.get("lookupHandle");
                clearTimeout(previousHandle);
                var handle = setTimeout(function () {
                    viewModel.lookupMembers(viewModel.get("groupId"), $("#message-group").val());
                }, 1000);

                viewModel.set("lookupHandle", handle);
            }           
        },
        lookupMembers: function(groupId, term){
            if (CommunityApp.utilities.stringContains(term, "@"))
            {
                viewModel.loadMembersList(groupId, term, function (response) {
                    viewModel.set("groupMembers", response.data);
                    if (response.data && response.data.length > 0)
                    {
                        var membersListModal = $("#modalview-memberslist").data("kendoMobileModalView");
                        membersListModal.open();
                    }
                });
            }
        },
        loadMembersList: function(groupId, term, callBack)
        {
            var membersListServiceUrl = getGroupMembersServiceUrl(groupId);
            var membersListOptions = {
                url: membersListServiceUrl,
                requestType: "POST",
                dataType: "JSON",
                data: "=" + term,
                callBack: callBack
            };

            CommunityApp.dataAccess.callService(membersListOptions);
        },
        selectMember: function (element, username) {
            if (CommunityApp.utilities.stringContains(username, "@"))
            {
                username = username.replace("@", "(at)");
            }
            var message = viewModel.get("message");
            message = CommunityApp.utilities.removeLastMention(message);
            viewModel.set("message", message + " @" + username);
            viewModel.closeMemberSelection();
        },
        closeMemberSelection: function(){
            $("#modalview-memberslist").kendoMobileModalView("close");
            CommunityApp.utilities.setCaretAtEnd(document.getElementById("message-group"));
        },
        fnGetGroupCallBack: function(response, sender)
        {
            if(response && response.data)
            {
                var view = sender.view;
                var navbar = view.header.find(".km-navbar").data("kendoMobileNavBar");
                navbar.title(response.data.Name);
                viewModel.set("groupName", response.data.Name);
                viewModel.set("creatorId", response.data.CreatorId);
                viewModel.readMessages(sender.groupId, 0, 0, view, true, true);
            }
        },
        loadAllMessages: function () {
            viewModel.set("hasMoreMessages", false);
            $("#message-loading").removeClass("display-none");
            var view = $("#ca-group-messages").data("kendoMobileView");
            viewModel.readMessages(viewModel.get("groupId"), 0, viewModel.get("firstMessageId"), view, false, false);
        },
        readMessages: function(groupId, afterId, beforeId, view, showLoading, scrollToBottom)
        {
            setMessageSubmitForm();

            var serviceUrl = getGroupMessagesServiceUrl(groupId);

            if(afterId > 0)
            {
                serviceUrl += "?afterId=" + afterId;
            }
            else if (beforeId > 0)
            {
                serviceUrl += "?beforeId=" + beforeId;
            }

            var messagesOptions = {
                url: serviceUrl,
                requestType: "GET",
                dataType: "JSON",
                callBack: viewModel.fnReadMessagesCallback,
                sender: {
                    groupId: groupId,
                    afterId: afterId,
                    beforeId: beforeId,
                    view: view,
                    scrollToBottom: scrollToBottom
                }
            };

            var application = CommunityApp.main.getKendoApplication();

            $(document).ajaxStart(function () {
                if (application && application !== null && application.pane) {
                    application.hideLoading();
                }
            });

            $(document).ajaxStop(function () {
                if (application && application !== null && application.pane) {
                    application.hideLoading();
                }
            });

            if (showLoading)
            {
                application.showLoading();
            }
            else
            {
                application.hideLoading();
            }

            CommunityApp.dataAccess.callService(messagesOptions, null, null, null, null, null, function () {
                viewModel.readMessages(groupId, afterId, beforeId, view, true, scrollToBottom);
            });
        },
        fnReadMessagesCallback: function(response, sender)
        {
            var view = sender.view;

            if(sender.afterId > 0 || sender.beforeId > 0 || (response && response.data && response.data.Messages && response.data.Messages.length > 0))
            {
                var data = response && response.data ? response.data.Messages : [];
                var groupMessagesTemplate = kendo.template($('#groups-messages-tmpl').html());
                var groupMessagesResult = kendo.render(groupMessagesTemplate, data);
                
                if (sender.beforeId > 0) {
                    $("#group-messages-container").prepend(groupMessagesResult);
                }
                else {
                    if(sender.afterId === 0)
                    {
                        var total = response && response.data ? response.data.Total : 0;
                        $("#group-messages-container").empty();
                        viewModel.set("dataBound", true);
                        viewModel.set("total", total);
                        viewModel.set("hasMoreMessages", total > data.length);
                    }

                    var lastMessage = _.last(data);

                    if (lastMessage && lastMessage.Id > 0)
                        viewModel.set("lastMessageId", lastMessage.Id);

                    var firstMessage = _.first(data);

                    if (firstMessage && firstMessage.Id > 0)
                        viewModel.set("firstMessageId", firstMessage.Id);

                    $("#group-messages-container").append(groupMessagesResult);
                }
               

                $('#ca-group-messages').unbind('click');
                $('#ca-group-messages').bind('click', function () {
                    var zoomedIn_status = viewModel.get("zoomedIn");
                    if (zoomedIn_status) {
                        $(this).removeClass("zoomed-in");
                        $(this).css('background-image', "");
                        viewModel.set("zoomedIn", false);
                    }
                });

                $("img[name='img-message-attachment']").each(function () {
                    var img = this;
                    $(img).unbind("click");
                    $(img).bind("click", function (e) {
                        var imageUrl = $(img).attr("src");
                        var zoomedIn = viewModel.get("zoomedIn");

                        if (!zoomedIn) {
                            $('#ca-group-messages').addClass("zoomed-in");
                            $('#ca-group-messages').css('background-image', 'url("' + imageUrl + '")');
                            viewModel.set("zoomedIn", true);
                        }
                        else {
                            $('#ca-group-messages').removeClass("zoomed-in");
                            $('#ca-group-messages').css('background-image', '');
                            viewModel.set("zoomedIn", false);
                        }
                        e.stopPropagation();
                    });
                });
            }
            else
            {
                $("#group-messages-container").empty();
                $("#group-messages-container").append("<div class='padding-20'><center><h2>Be the first one to message to this group!</h2></center></div>");
                viewModel.set("dataBound", true);
            }


            viewModel.scrollBottom();


            viewModel.set("screenLoad", false);
            $("#message-loading").addClass("display-none");
        },
        scrollBottom: function () {
            var scroller = $("#container-scroller").data("kendoMobileScroller");
            var scrollY = scroller.scrollHeight() - $("#container-scroller").height();
            scroller.animatedScrollTo(0, -1 * scrollY);
           
            scroller.unbind("scroll");
            scroller.bind("scroll", function (e) {
                var screenLoad = viewModel.get("screenLoad");
                if (!screenLoad)
                {
                    if (e.scrollTop + $("#container-scroller").height() == scroller.scrollHeight()) {
                        var timerNoScroll = viewModel.get("timerNoScroll");
                        clearInterval(timerNoScroll);

                        var scrollInterval = setInterval(function () {
                            viewModel.refreshMessages(true);
                        }, 10000);

                        viewModel.set("timer", scrollInterval);
                    }
                    else {
                        var savedTimer = viewModel.get("timer");
                        clearInterval(savedTimer);
                    }
                }
            });
        },
        like: function(control, groupId, messageId, isLiked)
        {
            $(control).addClass('display-none');
            $(control).next().removeClass('display-none');
            $(control).parent().next().children().eq(0).html(Number($(control).parent().next().children().eq(0).html()) + 1);

            var voteServiceUrl = getVoteServiceUrl(groupId, messageId);

            var likeOptions = {
                url: voteServiceUrl,
                requestType: "POST",
                dataType: "JSON",
                data: "=true"
            };

            CommunityApp.dataAccess.callService(likeOptions);
        },
        unlike: function(control, groupId, messageId, isLiked)
        {
            $(control).addClass('display-none');
            $(control).prev().removeClass('display-none');
            $(control).parent().next().children().eq(0).html(Number($(control).parent().next().children().eq(0).html()) - 1);

            var voteServiceUrl = getVoteServiceUrl(groupId, messageId);

            var unlikeOptions = {
                url: voteServiceUrl,
                requestType: "POST",
                dataType: "JSON",
                data: "=false"
            };

            CommunityApp.dataAccess.callService(unlikeOptions);
        },
        postMessage: function () {
            CommunityApp.sounds.post();

            var view = $("#ca-group-messages").data("kendoMobileView");
            
            var groupId = view.params.groupId;
            var text = viewModel.get("message");

            var serviceUrl = getGroupMessagesServiceUrl(groupId);

            var fileData = new FormData();
            var uploadSource = viewModel.get("uploadSource");
            var fileUrl = "";

            if (uploadSource != "selectGiphy") {
                var Pic;
                if (viewModel.get("orientation") === "") {
                    if ($("#file-message-attachment")[0].files[0] !== 'undefined' && typeof $("#file-message-attachment")[0].files[0] !== 'undefined') {
                        if ($("#file-message-attachment")[0].files[0].size > 1048576) {
                            Pic = document.getElementById("message-attachment-thumb-new-upload").toDataURL("image/jpeg");
                            fileData.append("file", CommunityApp.common.dataURItoBlob(Pic));
                        } else {
                            fileData.append("file", $("#file-message-attachment")[0].files[0]);
                        }
                    }
                } else {
                    Pic = document.getElementById("message-attachment-thumb-new-upload").toDataURL("image/jpeg");
                    fileData.append("file", CommunityApp.common.dataURItoBlob(Pic));
                }
            }
            else
            {
                var giphyData = viewModel.get("giphyData");

                if (typeof giphyData !== 'undefined' && giphyData !== null && typeof giphyData.selectedOriginalGiphy !== 'undefined' && giphyData.selectedOriginalGiphy !== null && giphyData.selectedOriginalGiphy.length > 0) {
                    fileUrl = giphyData.selectedOriginalGiphy;
                }
            }

            var source = viewModel.get("source");

            if (source === "")
            {
                source = CommunityApp.common.guid();
                viewModel.set("source", source);
            }

            fileData.append("data", JSON.stringify({ Title: text, SectionKey: source, FileUrl: fileUrl }));


            var messageOptions = {
                url: serviceUrl,
                requestType: "POST",
                dataType: "JSON",
                data: fileData,
                callBack: viewModel.fnMessageCallback,
                sender: {
                    groupId: groupId,
                    view: view,
                    afterId: viewModel.get("lastMessageId")
                }
            };


            viewModel.set("message", "");
            $("#message-group").attr("disabled", "disabled");

            CommunityApp.dataAccess.callService(messageOptions, null, null, true, false, false);
        },
        fnMessageCallback: function (response, sender) {

            viewModel.set("message", "");
            viewModel.set("hideAttachment", true);
            viewModel.set("attachmentUrl", "");
            $("#message-group").removeClass("width-55");
            viewModel.set("orientation", "");
            $("#file-message-attachment").replaceWith($("#file-message-attachment").val('').clone(true));
            viewModel.set("source", "");
            var ctx = document.getElementById("message-attachment-thumb-new-upload").getContext("2d");
            ctx.clearRect(0, 0, 0, 0);
            $("#message-group").removeAttr("disabled");
            CommunityApp.session.remove(CommunityApp.configuration.giphyConfig.offlineStore);
            viewModel.set("giphyData", {});
            viewModel.set("uploadSource", "");
            viewModel.set("uploadSelection", "");

            if(response && response.data && response.data !== null)
            {
                var createdMessages = [];
                createdMessages.push(response.data);
                var groupMessagesTemplate = kendo.template($('#groups-messages-tmpl').html());
                var groupMessagesResult = kendo.render(groupMessagesTemplate, createdMessages);
                $("#group-messages-container").append(groupMessagesResult);
                viewModel.set("lastMessageId", response.data.Id);

                var scroller = $("#container-scroller").data("kendoMobileScroller");
                var scrollY = scroller.scrollHeight() - $("#container-scroller").height();
                scroller.animatedScrollTo(0, -1 * scrollY);
            }

            setMessageSubmitForm();
            $("#btn-submit-message").addClass("display-none");
        },
        refreshMessages: function(scrollToBottom)  
        {
            var view = $("#ca-group-messages").data("kendoMobileView");
            var groupId = view.params.groupId;
            var afterId = viewModel.get("lastMessageId");

            viewModel.readMessages(groupId, afterId, view, false, scrollToBottom);
        },
        hide: function(e)
        {
            var savedTimer = viewModel.get("timer");
            clearInterval(savedTimer);
            viewModel.resetTopRightIcon();
            CommunityApp.session.remove("on-chat", true);
            $('#ca-group-messages').removeClass("zoomed-in");
            $('#ca-group-messages').css('background-image', '');
            viewModel.set("zoomedIn", false);
        },
        closeOptionsPopover: function () {
            var popover = $("#popover-options").data('kendoMobilePopOver');
            popover.close();
        },
        gotoAddMembers: function()
        {
            viewModel.closeOptionsPopover();
            CommunityApp.common.navigateToView("#views/chat/add-group-members.html?groupId=" + viewModel.get("groupId"));
        },
        attach: function () {
            CommunityApp.session.remove(CommunityApp.configuration.giphyConfig.offlineStore);
            viewModel.set("giphyData", {});
            viewModel.set("uploadSource", "");
            viewModel.set("uploadSelection", "");

            var deviceType = CommunityApp.common.deviceType();

            if (deviceType == "null") {
                gallerySelection();
            }
            else {
                var entries = [];

                entries.push({
                    title: 'Phone Gallery',
                    id: 'gallery'
                });

                entries.push({
                    title: 'Giphy',
                    id: 'giphy'
                });

                var context = {
                    title: 'Attach from',
                    items: entries,
                    x: 0,
                    y: 0
                };

                ContextMenu.open(context, function (selection) {
                    viewModel.set("uploadSelection", selection);
                    switch (selection) {
                        case "gallery":
                            gallerySelection();
                            break;
                        case "giphy":
                            giphySelection();
                            break;
                    }
                });
            }

            function giphySelection() {
                var chatData = {};
                chatData.senderView = "#views/chat/group.html?groupId=" + viewModel.get("groupId");
                chatData.subject = "test subject";
                chatData.body = "test body";
                chatData.senderObject = "sender object";
                CommunityApp.session.save(CommunityApp.configuration.giphyConfig.offlineStore, chatData);
                CommunityApp.common.navigateToView("#ca-select-giphy");
            }

            function gallerySelection() {
                $("#file-message-attachment").click();

                $("#file-message-attachment").change(function () {
                    CommunityApp.common.readUrl(this, function (response, file) {
                        loadImage.parseMetaData(file, function (data) {

                            var canvasUpload = document.getElementById("message-attachment-thumb-new-upload");
                            var ctxUpload = canvasUpload.getContext('2d');
                            ctxUpload.clearRect(0, 0, canvasUpload.width, canvasUpload.height);

                            var imgCanvas = new Image();

                            if (data.exif) {
                                imgCanvas.onload = function () {
                                    canvasUpload.width = "500";
                                    canvasUpload.height = imgCanvas.height / imgCanvas.width * 500;
                                    ctxUpload.drawImage(imgCanvas, 0, 0, imgCanvas.width, imgCanvas.height, 0, 0, canvasUpload.width, canvasUpload.height);
                                };
                                viewModel.set("orientation", data.exif.get('Orientation'));
                                var loadingImage = loadImage(file,
                                function (img) {
                                    if (typeof img.toDataURL === 'function') {
                                        viewModel.set("attachmentUrl", img.toDataURL());
                                        imgCanvas.src = img.toDataURL();
                                    }
                                    else {
                                        viewModel.set("attachmentUrl", response);
                                        imgCanvas.src = response;
                                    }

                                }, { orientation: viewModel.get("orientation"), maxWidth: 900, maxHeight: 1200 });

                                if (!loadingImage) {
                                    alert("not load image");
                                }
                            } else {
                                viewModel.set("orientation", "");
                                console.log("not orientation");
                                console.log(file.size);
                                if (file.size > 1048576) {
                                    viewModel.set("attachmentUrl", response);
                                    imgCanvas.onload = function () {
                                        canvasUpload.width = "900";
                                        canvasUpload.height = imgCanvas.height / imgCanvas.width * 900;
                                        ctxUpload.drawImage(imgCanvas, 0, 0, imgCanvas.width, imgCanvas.height, 0, 0, canvasUpload.width, canvasUpload.height);
                                    };
                                    imgCanvas.src = response;
                                } else {
                                    viewModel.set("attachmentUrl", response);
                                    imgCanvas.src = response;
                                }
                            }

                            viewModel.set("hideAttachment", false);
                            $("#message-group").addClass("width-55");
                            $("#btn-submit-message").removeClass("display-none");
                        });
                    });
                });
            }
        },
        leave: function()
        {
            var groupId = viewModel.get("groupId");
            var serviceUrl = getLeaveGroupServiceUrl(groupId);

            var leaveOptions = {
                url: serviceUrl,
                requestType: "POST",
                dataType: "JSON",
                callBack: viewModel.fnLeaveGroupCallback
            };

            CommunityApp.dataAccess.callService(leaveOptions);
        },
        fnLeaveGroupCallback: function(response)
        {
            if(response && response.data && response.data == "200 OK")
            {
                viewModel.closeOptionsPopover();
                CommunityApp.common.navigateToView("#views/chat/groups.html");
            }
        },
        viewMembers: function () {
            var groupId = viewModel.get("groupId");
            CommunityApp.common.navigateToView("#views/chat/members.html?groupId=" + groupId);
        },
        viewSettings: function () {
            var groupId = viewModel.get("groupId");
            CommunityApp.common.navigateToView("#views/chat/group-settings.html?groupId=" + groupId);
        }
    });

    return {
        viewModel: viewModel
    };
})();