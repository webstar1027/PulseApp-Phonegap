CommunityApp.configuration = (function () {

    var appConfig = {
        domain: "platform.pulsellc.com",
        appTitle: "Pulse Community",
        myPhotosFolderId: 211,
        skin: "nova",
        environment: "android-light",
        serviceUrl: "http://api.platform.pulsellc.com/api/v1/",
        //serviceUrl: "http://api.stage-platform.pulsellc.com/api/v1/",
        //serviceUrl: "http://192.168.1.150:4444/api/v1/",
        instantNotifications: false,
        logo: 'http://platform.pulsellc.com/content/STKSite/images/logo.png',
        repeatProcInterval: 120000,
        latestNewsSectionId: 271, //271 on live           
        homeScreen: "#ca-home-main-view",   
        myPhotosSectionKey: "user-profile-resource-library",     
        allowT2Reg: false,    
        featuredPromotionsSectionId: 291,  
        mainDiscussionsSectionId: 422,   
        apkVersion: 'http://platform.pulsellc.com/apps/pulse/apk/version-production.json',
        marketUrl: 'market://details?id=com.pulsellc.pulse',  
        appStoreUrl: 'itms-apps://itunes.com/apps/<yourappdevelopername>',
        forceUpdate: true,  
        showPoints: true,    
        showBadges: true     
    };
    
    var cloudinaryConfig = {
        api_key: '686593538999824',
        upload_preset: 'cm0j4yxo',
        cloudinaryUploadUrl: 'https://api.cloudinary.com/v1_1/pulseltd/{0}/upload',
    };
	
    var giphyConfig = {
        giphyServiceUrl: 'http://api.giphy.com/v1/gifs/search',
        giphyTrendingUrl: 'http://api.giphy.com/v1/gifs/trending',
        giphyApiKey: 'dc6zaTOxFJmzC',
        offlineStore: 'thread-for-giphy-offline-store'
    };

    var addLibraryFolderViews = ["#ca-library", "#ca-library-subfolders", "#ca-library-files", "#ca-user-myphotos"];
    var sharePostViews = ["<postshare>"];
    var addThreadViews = ["#ca-section-threads"];
    var editProfileViews = ["#ca-user-profile-details", "#ca-user-profile"];
    var clearNotificationsViews = ["#ca-notifications"];
    var chatAddMoreViews = ['views/chat/group.html'];
    var addGroupViews = ['views/chat/groups.html'];
    var addRolesViews = ['views/chat/add-group.html'];

    var authConfig = {
        clientId: "b64297e3-e76b-45cd-b904-36c0f17ef959",
        clientSecret: "GGLzWxY3wzjHafFIoJQVdvuFoaucPh0jFYxVB3f3m70JUdv2l0Cxn8NUO9SCsStLVndUNBzF/wZc1q7mf3RtTw==",
        authPath: "oauth2/",
        authCodePath: "authcode/",
        accessTokenPath: "accesstoken/",
        tokenValidationPath: "accesstokenvalidations/",
        verifyPath: "verify",
        registerPath: "register",
        storeCodesPath: "{0}/storecodes",
        storeNamesPath: "{0}/storenames",
        addressesPath: "{0}/addresses",
        forgotPasswordPath: "resetpassword",
        joinNowPath: "{0}/JoinNowPathWithVersion",
        showHelpDesk: "ShowHelpDesk",
        logOffPath: "revoke"
    };

    var navConfig = {
        navPath: "navigation/",
        appNav: "communitypro",
        appBottomMenu: "communityprobottommenu"
    };

    var profileConfig = {
        accountPath: "account/",
        statusPath: "{0}/statuses/",
        updateStatusPath: "{0}/statuses/{1}",
        badgesPath: "{0}/badges/",
        availableBadgesPath: "{0}/availableBadges/",
        favoritesPath: "{0}/favorites/",
        myPhotosPath: "{0}/folders/{1}/photos",
        storyBoardPath: "{0}/storyboards",
        accessRightsPath: "{0}/accessrights",
        roles: "{0}/roles",
        usersPath: "users",
        changePasswordPath: "{0}/changePassword",
        showStatusUpdatePath: "showStatusUpdate",
        allStatusesPath: "{0}/allStatuses"
    };

    var postConfig = {
        postsPath: "post/",
        recentPostsPath: "{0}/recents/{1}/{2}/{3}",
        recentPostsPagedPath: "{0}/recents?width={1}&height={2}",
        newRecentPostsPagedPath: "{0}/newrecents?width={1}&height={2}",
        likePostPath: "{0}/likes/{1}",
        unlikePostPath: "{0}/unlikes/{1}",
        postPath: "{0}/permissions/{1}",
        deleteCommentPath: "{0}/comments/{1}/users/{2}",
        postViewsPath: "{0}/views/{1}",
        addCommentPath: "{0}/comments/{1}",
        ratePostPath: "{0}/rates/{1}",
        subscribePath: "{0}/subscriptions/{1}",
        sharePath: "{0}/shares",
        featuredLearningPath: "learnings",
        sync: "recents/updates",
        offlineStore: "recent-posts-offline-store",
        recentPostId: "{0}/recents/id?width={1}&height={2}",
        recentPostsMax: 10
    };

    var sectionConfig = {
        sectionPath: "section/",
        sectionTypePath: "types/{0}",
        subscribePath: "{0}/subscriptions/{1}",
        sectionPostsPath: "{0}/recents/{1}/{2}",
        sectionThreadsPath: "{0}/threads/{1}?unread={2}",
        sync: "{0}/recents/{1}/{2}/updates",
        offlineStore: "recent-section-posts-offline-store",
        sectionAllPostsPath: "{0}/recents/{1}/{2}/all"
    };

    var forumConfig = {
        forumsPath: "forum/",
        groupsPath: "groups/",
        groupSectionsPath: "{0}/types/{1}/sections",
        recentForumsPath: "recents",
        recentForumsLessPath: "recents/less",
        popularForumsPath: "populars",
        popularForumsLessPath: "populars/less",
        threadPath: "{0}/threads/{1}",
        threadPostsPath: "{0}/threads/{1}/posts/{2}",
        subscribePath: "{0}/subscriptions/{1}",
        replyPath: "{0}/threads/{1}/posts/{2}/replies",
        suggestPath: "{0}/threads/{1}/posts/{2}/suggestions",
        verifyPath: "{0}/threads/{1}/posts/{2}/verifications",
        threadAddPath: "{0}/sections/{1}",
        threadEditPath: "{0}/threads/{1}/posts/{2}",
        deleteAttachment: "deleteattachment/{0}",
        deleteForumPostPath: "{0}/threads/{1}/posts/{2}/delete",
        threadSettingsPath: "{0}/threads/{1}/settings",
        extraFilePath: "{0}/sections/{1}/threads/{2}"
    };

    var searchConfig = {
        searchPath: "search/",
        serpPath: "{0}",
        trendingPath: "{0}/trendings"
    };

    var notificationsConfig = {
        notificationsPath: "notifications/",
        userNotificationsPath: "{0}?width={1}&height={2}",
        markAsReadPath: "{0}/reads/{1}",
        deletePath: "{0}/notification/{1}",
        unreadsCountPath: "{0}/unreads",
        pushNotificationsDevicePath: "{0}/devices",
        deletePushNotificationsDevicePath: "{0}/devices/{1}"
    };

    var librariesConfig = {
        librariesPath: "library/",
        galleryPath: "{0}",
        topLevelsPath: "{0}/toplevels/{1}/{2}",
        libraryFoldersPath: "{0}/toplevels/{1}/folders",
        subfoldersPath: "{0}/toplevels/{1}/folders/{2}",
        folderPath: "{0}/toplevels/{1}/folder/{2}",
        filesPath: "{0}/toplevels/{1}/folder/{2}/files",
        allFilesPath: "{0}/toplevels/{1}/folder/{2}/allfiles",
        cloudinaryPath: "{0}/toplevels/{1}/folder/{2}/cloudinaryfile",
        uploadCloudinaryDirectly: "/uploadCloudinaryDirectly"
    };

    var learningConfig = {
        learningPath: "learning/",
        categoriesPath: "categories/{0}/{1}",
        curriculumsPath: "categories/{0}/{1}/{2}/curriculums/{3}",
        coursesPath: "categories/{0}/{1}/{2}/curriculums/{3}/{4}/courses",
        lessonsPath: "categories/{0}/{1}/{2}/curriculums/{3}/{4}/courses/{5}/lessons",
        assignTestPath: "categories/{0}/{1}/{2}/curriculums/{3}/{4}/courses/{5}/lessons/{6}/assignments",
        finishTestPath: "categories/{0}/{1}/{2}/curriculums/{3}/{4}/courses/{5}/lessons/{6}/assignments/{7}",
        scorePath: "score",
        scormPath: "scorm/{0}/lessons/{1}?type={2}",
        assessmentsPath: "courses/{0}/tests/{1}/userTest/{2}/question/{3}",
        saveAssessmentsPath: "SaveQuestionAnswer",
        assessmentResultPath: "testresult/{0}/{1}/{2}/{3}",
        finishPdfLessonPath: "FinishPdfAssessment/{0}"
    };

    var bannerConfig = {
        bannerPath: "banner/",
        latestPath: "mobilelatest",
        secondaryPath: "mobilesecondary",
        mobileLatestOfflineStore: "mobilelatest-offline-store",
        mobileSecondaryOfflineStore: "mobilesecondary-offline-store"
    };

    var pollConfig = {
        pollPath: "poll/",
        latestUnansweredPollPath: "GetLatestUnansweredPoll/{0}/{1}",
        lastAnsweredPollPath: "GetLastAnsweredPoll/{0}/{1}",
        pollByIdPath: "GetPollById/{0}/{1}/{2}",
        voteToPollPath: "VoteToPoll",
        pollGraphPath: "PollGraph/{0}",
        pollVotesListPath: "GetPollVotesList/{0}/{1}/{2}",
        getPollByIdPath: "GetPollById/{0}/{1}"
    };

    var surveyConfig = {
		surveyPath: "Survey/",
        getSurveyPath: "GetSurvey/{0}/{1}/{2}",
        saveSurveyQuestionAnswerPath: "SaveSurveyQuestionAnswer",
        latestActiveSurveyPath: "GetLatestActiveSurvey/{0}",
        getSurveyByIdPath: "GetSurveyById/{0}/{1}"
    };
	
	var reportConfig = {
		reportPath: "Report/",
		allStoresPath: "GetAllStores",
		monthlyUserPointsPath: "GetMonthlyUsersPoints/{0}",
		allTimeUserPointsPath: "GetAllTimeUsersPoints/{0}"
	};  

	var chatConfig = {
	    basePath: "chat/",
	    groupsPath: "groups",
	    groupPath: "groups/{0}",
	    groupMessagesPath: "groups/{0}/messages",
	    groupMessageVotePath: "groups/{0}/messages/{1}/votes",
	    groupMembersPath: "groups/{0}/members",
	    leaveGroupPath: "groups/{0}/leave",
	    groupJoinedMembersPath: "groups/{0}/joined",
	    groupSettingsPath: "groups/{0}/settings"
	};

	var tasksConfig = {
	    basePath: "task/",
	    myTasksPath: "user",
	    taskPath: "{0}",
	    userTasksCategoriesPath: "user/categories"
	};

    return {
        appConfig: appConfig,
        cloudinaryConfig: cloudinaryConfig,
        giphyConfig: giphyConfig,
        navConfig: navConfig,
        authConfig: authConfig,
        profileConfig: profileConfig,
        postConfig: postConfig,
        sectionConfig: sectionConfig,
        forumConfig: forumConfig,
        searchConfig: searchConfig,
        notificationsConfig: notificationsConfig,
        librariesConfig: librariesConfig,
        learningConfig: learningConfig,
        bannerConfig: bannerConfig,
        addLibraryFolderViews: addLibraryFolderViews,
        sharePostViews: sharePostViews,
        addThreadViews: addThreadViews,
        editProfileViews: editProfileViews,
        clearNotificationsViews: clearNotificationsViews,
        pollConfig: pollConfig,
        surveyConfig: surveyConfig,
        reportConfig: reportConfig,
        chatConfig: chatConfig,
        chatAddMoreViews: chatAddMoreViews,
        addGroupViews: addGroupViews,
        addRolesViews: addRolesViews,
        tasksConfig: tasksConfig
    };
})();