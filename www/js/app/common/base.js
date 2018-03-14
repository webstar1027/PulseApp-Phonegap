CommunityApp.base = (function () {
    var baseData = {
        currentUser: function () { return CommunityApp.session.currentUser.load(); }
    };

    return {
        baseData: baseData
    };
})();