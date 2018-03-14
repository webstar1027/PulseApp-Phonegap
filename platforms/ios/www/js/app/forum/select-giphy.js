CommunityApp.selectGiphy = (function () {

    var getGiphySearchServiceUrl = function (queryString, offset, limit) {
        var serviceUrl = CommunityApp.configuration.giphyConfig.giphyServiceUrl + "?q=" + queryString + "&api_key=" + CommunityApp.configuration.giphyConfig.giphyApiKey + "&offset=" + offset + "&limit=" + limit;
        return serviceUrl;
    };
    
    var getGiphyTrendingServiceUrl = function (offset, limit) {
        var serviceUrl = CommunityApp.configuration.giphyConfig.giphyTrendingUrl + "?api_key=" + CommunityApp.configuration.giphyConfig.giphyApiKey + "&offset=" + offset + "&limit=" + limit;
        return serviceUrl;
    };

    var viewModel = kendo.observable({
		threadData: {},
		queryString: "",
        searchText: "Results for:",
        inprogress: false,
        page: 1,
		pageSize: 25,
		total: 0,
        load: function (e) {
			viewModel.set("inprogress", true);
			$('#txt-query').val('');
			viewModel.set("queryString", "");
			viewModel.set("searchText", "Trending GIFs");
			viewModel.set("total", 0);
			var threadData = CommunityApp.session.load(CommunityApp.configuration.giphyConfig.offlineStore);
			viewModel.set("threadData", threadData);
			console.log(threadData);
            
            viewModel.set("inprogress", true);
			viewModel.set("page", 1);
			var pageSize = viewModel.get("pageSize");
			
			$("#giphy-search-result-left").find(".container-fluid").empty();
			$("#giphy-search-result-left").find(".container-fluid").attr("style", "");
			$("#giphy-search-result-right").find(".container-fluid").empty();
			$("#giphy-search-result-right").find(".container-fluid").attr("style", "");
			
			var giphyTrendingServiceUrl = getGiphyTrendingServiceUrl(0, pageSize);
			
			var scroller = $('#giphy-search-result').data("kendoMobileScroller");
			if (scroller !== null && typeof scroller !== "undefined") {
				scroller.reset();
			}
			
			var giphySearchOption = {
				url: giphyTrendingServiceUrl,
				dataType: "JSON",
				requestType: "GET",
				callBack: viewModel.fnGiphySearchCallBack
			};
			
			CommunityApp.dataAccess.callService(giphySearchOption, null, null, null, null, null, function () {
                viewModel.load(e);
            });
            
            $("#select-giphy-form").one("submit", function () {
                viewModel.search();
                return true;
            });
            
        },
		search: function () {
			viewModel.set("inprogress", true);
			viewModel.set("page", 1);
			var queryString = $('#txt-query').val();
			var pageSize = viewModel.get("pageSize");
			viewModel.set("queryString", queryString);
            
            $("#giphy-search-result-left").find(".container-fluid").empty();
			$("#giphy-search-result-left").find(".container-fluid").attr("style", "");
			$("#giphy-search-result-right").find(".container-fluid").empty();
			$("#giphy-search-result-right").find(".container-fluid").attr("style", "");
            
            var scroller = $('#giphy-search-result').data("kendoMobileScroller");
            if (scroller !== null && typeof scroller !== "undefined") {
                scroller.reset();
            }
            
            if (queryString !== "") {
                viewModel.set("searchText", "Results for: " + queryString);
                var giphySearchServiceUrl = getGiphySearchServiceUrl(queryString, 0, pageSize);
                
                var giphySearchOption = {
                    url: giphySearchServiceUrl,
                    dataType: "JSON",
                    requestType: "GET",
                    callBack: viewModel.fnGiphySearchCallBack
                };
                
                CommunityApp.dataAccess.callService(giphySearchOption, null, null, null, null, null, function () {
                    viewModel.search();
                });
            } else {
                viewModel.set("searchText", "Trending GIFs");
                var giphyTrendingServiceUrl = getGiphyTrendingServiceUrl(0, pageSize);
                var giphyTrendingOption = {
                    url: giphyTrendingServiceUrl,
                    dataType: "JSON",
                    requestType: "GET",
                    callBack: viewModel.fnGiphySearchCallBack
                };
                
                CommunityApp.dataAccess.callService(giphyTrendingOption, null, null, null, null, null, function () {
                    viewModel.search();
                });
            }		
		},
		fnGiphySearchCallBack: function (response) {
			if (response.data) {
				var page = viewModel.get("page");
				var pageSize = viewModel.get("pageSize");
				CommunityApp.common.injectIndex(page, pageSize, response.data.data);
				var i = 0;
				var giphySearchResultTemplate = kendo.template($('#giphy-search-result-tmpl').html());
				for (i = 0; i < response.data.data.length; i++) {
					response.data.data[i].width = $("#giphy-search-result").width() / 2 - 10;
					response.data.data[i].height = response.data.data[i].images.fixed_width.height / response.data.data[i].images.fixed_width.width * ($("#giphy-search-result").width() / 2 - 10);
					if (i % 2 === 0) {
						var leftResponse = [];
						leftResponse.push(response.data.data[i]);
						var giphySearchLeftResult = kendo.render(giphySearchResultTemplate, leftResponse);
						$("#giphy-search-result-left").find(".container-fluid").append(giphySearchLeftResult);
					} else {
						var rightResponse = [];
						rightResponse.push(response.data.data[i]);
						var giphySearchRightResult = kendo.render(giphySearchResultTemplate, rightResponse);
						$("#giphy-search-result-right").find(".container-fluid").append(giphySearchRightResult);
					}
				}
					
				$(".giphy-item").each(function () {
					$(this).bind("click", function(e){
						var threadData = viewModel.get("threadData");
						threadData.selectedOriginalGiphy = $(this).attr("data-original");
						threadData.selectedFixedWidthGiphy = $(this).attr("src");
						CommunityApp.session.save(CommunityApp.configuration.giphyConfig.offlineStore, threadData);
						CommunityApp.common.navigateToView(threadData.senderView + "&from=selectGiphy");
					});
				});
				
				viewModel.set("inprogress", false);
				
				var total = response.data.pagination.total_count;
				viewModel.set("total", total);
				
				var scroller = $('#giphy-search-result').data("kendoMobileScroller");
				if (scroller !== null && typeof scroller !== "undefined") {
					scroller.bind("scroll", function (e) {
						$(".giphy-item").each(function () {
							if ($(this).visible()) {
								var pagingThreshold = 8;
								var viewedIndex = $(this).attr("data-index");
								var pageSize = viewModel.get("pageSize");
								var currentPage = viewModel.get("page");
								var total = viewModel.get("total");

                                var queryString = viewModel.get("queryString");
								if ((queryString !== "" && viewedIndex == ((currentPage * pageSize) - pagingThreshold) && (currentPage * pageSize) < total) || 
                                (queryString === "" && viewedIndex == ((currentPage * pageSize) - pagingThreshold))) {
									currentPage += 1;
									viewModel.set("page", currentPage);
									
                                    if (queryString !== "") {
                                        var giphySearchServiceUrl = getGiphySearchServiceUrl(queryString, (currentPage-1)*pageSize, pageSize);
                                        var giphySearchOption = {
                                            url: giphySearchServiceUrl,
                                            dataType: "JSON",
                                            requestType: "GET",
                                            callBack: viewModel.fnGiphySearchCallBack
                                        };
                                        
                                        CommunityApp.dataAccess.callService(giphySearchOption);
                                    } else {
                                        var giphyTrendingServiceUrl = getGiphyTrendingServiceUrl((currentPage-1)*pageSize, pageSize);
                                        var giphyTrendingOption = {
                                            url: giphyTrendingServiceUrl,
                                            dataType: "JSON",
                                            requestType: "GET",
                                            callBack: viewModel.fnGiphySearchCallBack
                                        };
                                        
                                        CommunityApp.dataAccess.callService(giphyTrendingOption);
                                    }
								}
							}
						});
					});
				}
				
			}
		},
		cancel: function () {
		},
		controlViewOnPopup: function () {
			var selection = $('input[name=resourceSelection]:checked').val();
			var threadData = CommunityApp.session.load(CommunityApp.configuration.giphyConfig.offlineStore);
			var senderObject = threadData.senderObject;
			console.log(selection);
			var objectPopup = $("#select-resource-dialog").data("kendoWindow");
			objectPopup.close();
			console.log(threadData);
			if (senderObject === "newThread")
				CommunityApp.newThread.viewModel.triggerUpload(selection);
			else if (senderObject === "replyThread")
				CommunityApp.threadPosts.viewModel.triggerUpload(selection);
			else if (senderObject === "editThread")
				CommunityApp.editThread.viewModel.triggerUpload(selection);
            else if (senderObject === "newStatus")
                CommunityApp.status.viewModel.triggerUpload(selection);
            else if (senderObject === "updateStatus")
                CommunityApp.status.viewModel.triggerUploadForUpdate(selection);
		}
    });

    return {
        viewModel: viewModel
    };
})();