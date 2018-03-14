CommunityApp.myPhotos = (function () {
    var getServiceUrl = function (friendId) {
        var currentUser = CommunityApp.session.currentUser.load();
        var userId = (friendId !== 'undefined' && typeof friendId !== 'undefined') ? friendId : currentUser.id;
        var statusServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.profileConfig.accountPath +
                   CommunityApp.utilities.stringFormat(CommunityApp.configuration.profileConfig.myPhotosPath, userId, CommunityApp.configuration.appConfig.myPhotosFolderId);
        return statusServiceUrl;
    };

    var getFolderFilesServiceUrl = function (userId, libraryId, folderId, resizeFactor) {
        var serviceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.librariesConfig.librariesPath + CommunityApp.configuration.librariesConfig.filesPath;
        return CommunityApp.utilities.stringFormat(serviceUrl, userId, libraryId, folderId) + "?resizeFactor=" + resizeFactor;
    };

    var viewModel = kendo.observable({
        title: "",
        description: "",
        inprogress: false,
        fileUrl: "",
        photos: [],
        hasPhotos: false,
        showIcon: function(){
            var iconUrl = viewModel.get("fileUrl");
            return iconUrl !== "";
        },
        load: function (e) {
            //CommunityApp.common.authenticatedUser();
            CommunityApp.common.logTitle(e.view.title);

            CommunityApp.common.setAddFolderPath(e.view, "#ca-upload-profile-photos");
            $("#photos-scrollview").find(".swiper-wrapper").empty();

            var friendId = e.view.params.userId;

            var serviceUrl = getServiceUrl(friendId);

            var loadPhotosOptions = {
                url: serviceUrl,
                requestType: "GET",
                dataType: "JSON",
                callBack: viewModel.fnLoadPhotosCallback
            };

            var viewArgs = e;
			CommunityApp.dataAccess.callService(loadPhotosOptions, "library-files-scrollview", "<h2 class='centerAlign padding-1'>No photos are found!</h2>", null, null, null, function(){
				viewModel.load(viewArgs);
			});
        },
        fnLoadPhotosCallback: function(response)
        {
            if(response.data)
            {
                viewModel.set("photos", response.data);
                viewModel.set("hasPhotos", response.data.length > 0);

                var photosTemplate = kendo.template($('#user-myphotos-tmpl').html());
                var photosResult = kendo.render(photosTemplate, viewModel.get("photos"));
                $("#photos-scrollview").find(".swiper-wrapper").empty();
                $("#photos-scrollview").find(".swiper-wrapper").attr("style", "");
                $("#photos-scrollview").find(".swiper-wrapper").append(photosResult);
                var swiper = new Swiper('#photos-scrollview');
            }
        },
        loadUploadPhoto: function(e){
            CommunityApp.common.logTitle(e.view.title);
        },
        closeScroller: function(){
            CommunityApp.common.navigateToView("#:back");
        },
        triggerUpload: function () {
            $("#photoUpload").click();
            $("#photoUpload").change(function () {
                CommunityApp.common.readUrl(this, function (response) {
                    viewModel.set("fileUrl", response);
                    var canvas = document.getElementById("photo-icon-canvas");
                    var ctx = canvas.getContext('2d');
                    var img = new Image();
                    img.onload = function () {
                        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
                    };
                    img.src = response;
                });
            });
        },
        addPhoto: function () {
            //CommunityApp.common.authenticatedUser();

            viewModel.set("inprogress", true);

            console.log("start file upload request");

            var libraryId = 0;
            var userId = CommunityApp.base.baseData.currentUser().id;
            var folderId = 0;

            var fileData = new FormData();
            fileData.append("file", $("#photoUpload")[0].files[0]);
            fileData.append("data", JSON.stringify({
                Title: viewModel.get("title"),
                Description: viewModel.get("description"),
                FileUrl: viewModel.get("fileUrl"),
                ParentFolderId: CommunityApp.configuration.appConfig.myPhotosFolderId
            }));

            var serviceUrl = getFolderFilesServiceUrl(userId, libraryId, folderId, 0.2);

            console.log(serviceUrl);

            var addFileOptions = {
                url: serviceUrl,
                dataType: "JSON",
                requestType: "POST",
                data: fileData,
                callBack: viewModel.fnAddPhotoCallback
            };

            CommunityApp.dataAccess.callService(addFileOptions, null, null, true, false, false);
        },
        fnAddPhotoCallback: function(response)
        {
            viewModel.set("inprogress", false);

            console.log("end upload file request: " + response.data.HttpStatus);

            if (response.data) {
                var userId = CommunityApp.base.baseData.currentUser().id;
                if (response.data.HttpStatus == 200) {
                    CommunityApp.common.navigateToView("#ca-user-myphotos?userId=" + userId);
                }
                else
                {
                    CommunityApp.common.showErrorNotification("Upload Error", "Error uploading the photo");
                }
            }
            else {
                CommunityApp.common.showErrorNotification("Upload Error", "Error uploading the photo");
            }
        }
    });

    return {
        viewModel: viewModel
    };

})();