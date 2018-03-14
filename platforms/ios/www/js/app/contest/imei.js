CommunityApp.contestsImei = (function () {
    
    var viewModel = kendo.observable({
        imei: "",
        load: function(e){
            //CommunityApp.common.authenticatedUser();
        },
        saveImei: function(){
            //CommunityApp.common.authenticatedUser();

            var currentUser = CommunityApp.base.baseData.currentUser();
            var imei = viewModel.get("imei");

            if (imei !== "" && imei !== null)
            {
                if (imei.length === 15)
                {
                    var imeiEntry = {
                        imei: imei,
                        username: currentUser.username,
                        userId: currentUser.id
                    };

                    CommunityApp.session.save("imei_" + currentUser.id, JSON.stringify(imeiEntry));

                    CommunityApp.common.navigateToView("views/contests/sales-contest-report.html");
                }
                else
                {
                    CommunityApp.common.showErrorNotification("", "Invalid IMEI");
                }
            }
            else
            {
                CommunityApp.common.showErrorNotification("", "Enter IMEI or MEID");
            }
        }
    });

    return {
        viewModel: viewModel
    };    

})();