CommunityApp.scheduleLocation = (function () {
    var getScheduleLocationServiceUrl = function (userId) {
        var scheduleLocationServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.scheduleConfig.schedulePath + CommunityApp.configuration.scheduleConfig.scheduleLocationsPath;
        scheduleLocationServiceUrl = CommunityApp.utilities.stringFormat(scheduleLocationServiceUrl, userId);
        return scheduleLocationServiceUrl;
    };

    var viewModel = kendo.observable({
		topShow: false,
        dataBound: false,
		storeCode: 0,
        load: function (e) {
            //CommunityApp.common.authenticatedUser();

            viewModel.set("topShow", false);
			viewModel.set("dataBound", false);
			viewModel.set("storeCode", 0);
			
			var currentUserId = CommunityApp.base.baseData.currentUser().id;
			var scheduleLocationServiceUrl = getScheduleLocationServiceUrl(currentUserId);
            
            console.log(scheduleLocationServiceUrl);
			
			var scheduleLocationsLoadOptions = {
				url: scheduleLocationServiceUrl,
				requestType: "GET",
				dataType: "JSON",
				callBack: viewModel.fnLocationsLoadCallBack
			};
			
			var viewArgs = e;
			
			CommunityApp.dataAccess.callService(scheduleLocationsLoadOptions, null, null, null, null, null, function () {
				viewModel.load(viewArgs);
			});
			
        },
		fnLocationsLoadCallBack: function (response) {
			if (response.data) {

				var onChange = function() {
					console.log("event: change");
				};

				var onSelect = function(e) {
					var dataItem = this.dataItem(e.item);
					console.log("event :: select (" + dataItem.text + " : " + dataItem.value + ")" );
					viewModel.set("storeCode", dataItem.value);
				};

				var onDataBound = function(e) {
					console.log("event :: dataBound");
				};
			
				var data = [];
				for (var i = 0; i < response.data.length; i++) {
					var iData = {text: response.data[i].Store, value: response.data[i].StoreCode};
					data.push(iData);
				}
			
				$("#dropDownLocation").kendoDropDownList({
					dataTextField: "text",
					dataValueField: "value",
					dataSource: data,
					select: onSelect,
					change: onChange,
					dataBound:onDataBound
				});
                
                viewModel.set("storeCode", response.data[0].StoreCode);
                viewModel.set("topShow", true);
			}
		},
        gotoSchedule: function () {
            var storeCode = viewModel.get("storeCode");
            CommunityApp.common.navigateToView("#views/schedule/schedule.html?storeCode=" + storeCode);
            console.log(viewModel.get('storeCode'));
        }
    });
	
    return {
        viewModel: viewModel
    };
})();