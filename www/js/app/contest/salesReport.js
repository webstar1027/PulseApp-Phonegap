CommunityApp.contestsSalesReport = (function () {
    
    var viewModel = kendo.observable({
        salesReport: [],
        load: function (e) {
            //CommunityApp.common.authenticatedUser();

            var currentUser = CommunityApp.base.baseData.currentUser();

            var rawSession = CommunityApp.session.load("imei_" + currentUser.id);
            var imeiEntry = JSON.parse(rawSession);

            viewModel.set("salesReport", [imeiEntry]);
        }
    });

    return {
        viewModel: viewModel  
    };

})();