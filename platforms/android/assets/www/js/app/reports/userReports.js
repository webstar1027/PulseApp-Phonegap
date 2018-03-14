CommunityApp.userReports = (function () {
    var getUserPointsServiceUrl = function (reportType, region) {
	
        var userPointsServiceUrl;
		if (reportType === "All Time") {
			userPointsServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.reportConfig.reportPath + CommunityApp.configuration.reportConfig.allTimeUserPointsPath;
		} else {
			userPointsServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.reportConfig.reportPath + CommunityApp.configuration.reportConfig.monthlyUserPointsPath;
		}
		userPointsServiceUrl = CommunityApp.utilities.stringFormat(userPointsServiceUrl, region);
        return userPointsServiceUrl;
    };
	
	

    var viewModel = kendo.observable({
		regionShow: false,
        dataBound: false,
		reportType: "All Time",
		region: "All",
		pages_read: [],
        dataSource: null,
        load: function (e) {
            //CommunityApp.common.authenticatedUser();

            viewModel.set("regionShow", false);
			viewModel.set("dataBound", false);
			viewModel.set("reportType", "All Time");
            viewModel.set("region", "All");
            viewModel.set("dataSource", null);
			
			var type = e.view.params.type;
			var reportType = "";
			if (type === "AllTime")
				reportType = "All Time";
			else
				reportType = "This Month";
			viewModel.set("reportType", reportType);
			
			var allStoresServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.reportConfig.reportPath + CommunityApp.configuration.reportConfig.allStoresPath;
			
			var allStoresLoadOptions = {
				url: allStoresServiceUrl,
				requestType: "GET",
				dataType: "JSON",
				callBack: viewModel.fnAllRegionsLoadCallBack
			};
			
			var viewArgs = e;
			
			CommunityApp.dataAccess.callService(allStoresLoadOptions, null, null, null, null, null, function () {
				viewModel.load(viewArgs);
			});

            viewModel.setUserReportsDataSource(e);
			
        },
		fnAllRegionsLoadCallBack: function (response) {
			if (response.data) {

				var onChange = function() {
					console.log("event: change");
				};

				var onSelect = function(e) {
					var dataItem = this.dataItem(e.item);
					console.log("event :: select (" + dataItem.text + " : " + dataItem.value + ")" );
					viewModel.set('region', dataItem.value);
					var reportType = viewModel.get('reportType');
					viewModel.setUserReportsDataSource(null);
				};

				var onDataBound = function(e) {
					console.log("event :: dataBound");
				};
			
				var data = [{text: "All", value: "All"}];
				for (var i = 0; i < response.data.length; i++) {
					var iData = {text: response.data[i], value: response.data[i]};
					data.push(iData);
				}
			
				$("#dropDownRegion").kendoDropDownList({
					dataTextField: "text",
					dataValueField: "value",
					dataSource: data,
					select: onSelect,
					change: onChange,
					dataBound:onDataBound,
					value: "All"
				});
				viewModel.set("regionShow", true);
			}
		}, 
        setUserReportsDataSource: function (e) {
            var pageSize = 20;
            var currentPage = 1;
            var scroller;
            var total = 0;
            var newView;
            var viewedIndex = 0;
            var pagingThreshold = 4;

            var thatE = e;
            
            var reportType = viewModel.get('reportType');
            var serviceUrl = getUserPointsServiceUrl(reportType, viewModel.get("region"));
            console.log(serviceUrl);
            
            var dataSource = viewModel.get("dataSource");
            dataSource = CommunityApp.dataAccess.kendoDataSource(currentPage, pageSize, function(){return getUserPointsServiceUrl(viewModel.get("reportType"), viewModel.get("region"));}, "GET", null, "userReports-list", "<h2 class='centerAlign padding-1'>No reports are found!</h2>", null, function(){
                viewModel.setUserReportsDataSource(thatE);
            });
            viewModel.set("dataSource", dataSource);

            dataSource.read().then(function () {
                var view = dataSource.view();
                view = CommunityApp.common.injectIndex(currentPage, pageSize, view);

                var userReportsListTmpl = kendo.template($('#userReports-list-tmpl').html());
                var userReportsResults = kendo.render(userReportsListTmpl, view);
                $("#userReports-list").find(".container-fluid").empty();
                $("#userReports-list").find(".container-fluid").append(userReportsResults);
                
                viewModel.set('dataBound', true);
                viewModel.set('pages_read', []);
                var pages_read = viewModel.get("pages_read");
                pages_read.push(1);
                viewModel.set("pages_read", pages_read);

                //scroller = evt.view.scroller;
                scroller = $('#userReportsScroller').data("kendoMobileScroller");
                if (scroller !== null && typeof scroller !== 'undefined')
                {
                    scroller.reset();

                    scroller.bind("scroll", function (e) {
                        $(".user-reports-item").each(function () {
                            if ($(this).visible()) {
                                viewedIndex = $(this).attr("data-index");
                                total = dataSource.total();
                                pageSize = dataSource.pageSize();
                                currentPage = dataSource.page();

                                if (viewedIndex == ((currentPage * pageSize) - pagingThreshold) && (currentPage * pageSize) < total) {
                                    currentPage += 1;
                                    if (pages_read.indexOf(currentPage) < 0) {
                                        pages_read = viewModel.get("pages_read");
                                        pages_read.push(currentPage);
                                        viewModel.set("pages_read", pages_read);
                                        dataSource.page(currentPage);

                                        dataSource.read().then(function () {
                                            setTimeout(function () {
                                                console.log("rendering page: " + dataSource.page());
                                                newView = dataSource.view();
                                                newView = CommunityApp.common.injectIndex(currentPage, pageSize, newView);
                                                userReportsResults = kendo.render(userReportsListTmpl, newView);
                                                $("#userReports-list").find(".container-fluid").append(userReportsResults);
                                            }, 100);

                                        });
                                    }
                                }
                            }
                        });
                    });
                }
            });
        }
        
    });

	
    return {
        viewModel: viewModel
    };
})();