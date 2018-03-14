CommunityApp.dataAccess = (function () {

    var callService = function (options, controlId, emptyMessageHtml, showLoading, processData, contentType, failureCallback) {

        var settings = {
            url: options.url,
            type: options.requestType,
            data: options.data,
            dataType: options.dataType,
            cache: false,
            processData: processData,
            contentType: contentType,
            tryCount: 0,
            retryLimit: 3,
            beforeSend: function (xhr) {
                if (typeof options.httpHeader !== 'undefined' && typeof options.headerValue !== 'undefined') {
                    $.each(options.httpHeader, function (index, key) {
                        xhr.setRequestHeader(key, options.headerValue[index]);
                    });
                }

                if (showLoading !== null && showLoading === false) {
                    var application = CommunityApp.main.getKendoApplication();
                    if (application && application !== null && application.pane) {
                        application.hideLoading();
                    }
                }
            },
            success: function (resultData, status, xhr) {

                var response = {
                    success: resultData !== null? resultData.IsSuccessful : false,
                    data: resultData
                };

                if (options.callBack)
                    options.callBack(response, options.sender);

                if ((resultData === null || resultData.length <= 0 || (resultData.Items && resultData.Items.length <= 0)) && controlId && emptyMessageHtml) {
                    $("#" + controlId).html(emptyMessageHtml);
                }
            },
            error: function (xhr, status, errorThrown) {
                switch (xhr.status) {
                    case 401:
                        //CommunityApp.userAccount.viewModel.logOff();
                        break;
                    case 500:
                        console.error("server app error 500: " + errorThrown);
                        break;
                    default:
                        console.error("server error: " + errorThrown);
                        break;
                }

                if (failureCallback && failureCallback !== null)
                {
                    failureCallback();
                }
                

                var result = { success: false, status: xhr.status, settings: settings };

                if (options.callBack)
                    options.callBack(result, options.sender);
            }
        };
       
        $.ajax(settings);
    };

    var configureDataSource = function (page, pageSize, serviceUrl, type, data, controlId, emptyHtml, offlineStore, failureCallback) {
        var dataSource;

        dataSource = new kendo.data.DataSource({
            offlineStorage: offlineStore,
            serverPaging: true,
            pageSize: pageSize,
            page: page,
            transport: {
                read: {
                    url: serviceUrl,
                    beforeSend: function (xhr) {
                        var accessToken = CommunityApp.session.accessToken.load();
                        xhr.setRequestHeader('Authorization', "Basic " + accessToken.token);
                    },
                    data: { query: data },
                    type: type,
                    dataType: "json",
                    cache: false
                }
            },
            error: function (e) {
                var application = CommunityApp.main.getKendoApplication();
                if (application && application !== null && typeof application !== "undefined")
                    application.hideLoading();

                switch (e.xhr.status) {
                    case 401:
                        //CommunityApp.userAccount.viewModel.logOff();
                        break;
                    default:
                        console.error(JSON.stringify(e));
                        break;
                }

                if(failureCallback && failureCallback !== null)
                {
                    failureCallback();
                }
            },
            requestEnd: function (e) {
                if (e.type === 'read' && controlId && controlId !== null) {
                    $("#" + controlId).children().not(".container-fluid").remove();

                    if (e.response && e.response.Items && e.response.Items.length <= 0 && controlId && emptyHtml) {
                        if ($("#" + controlId).has(".container-fluid")) {
                            $("#" + controlId).append(emptyHtml);
                        }
                        else {
                            $("#" + controlId).html(emptyHtml);
                        }
                    }
                }
            },
            parameterMap: function (options) {

                var parameters = {
                    pageNumber: options.page,
                    pageSize: options.pageSize
                };

                return parameters;
            },
            schema: {
                total: function (data) {
                    return data.Total;
                },
                data: function (data) {
                    return data.Items;
                }
            }
        });
        return dataSource;
    };

    var configureOfflineDataSource = function (offlineStore) {
        var dataSource = new kendo.data.DataSource({
            transport: {
                read: function (options) {
                    var localData = JSON.parse(localStorage[offlineStore]);
                    console.log("Local Data to fetch: " + localStorage[offlineStore]);
                    options.success(localData);
                }
            }
        });

        return dataSource;
    };

    var configureNonpagedDataSource = function (serviceUrl, type, data, offlineStore) {
        var dataSource;

        dataSource = new kendo.data.DataSource({
            offlineStorage: offlineStore,
            transport: {
                read: {
                    url: serviceUrl,
                    beforeSend: function (xhr) {
                        var accessToken = CommunityApp.session.accessToken.load();
                        xhr.setRequestHeader('Authorization', "Basic " + accessToken.token);
                    },
                    data: { query: data },
                    type: type,
                    dataType: "json",
                    cache: false
                }
            },
            error: function (e) {
                var application = CommunityApp.main.getKendoApplication();
                if (application && application !== null && typeof application !== "undefined")
                    application.hideLoading();

                switch (e.xhr.status) {
                    case 401:
                        //CommunityApp.userAccount.viewModel.logOff();
                        break;
                    default:
                        console.error(JSON.stringify(e));
                        break;
                }
            }
        });



        return dataSource;
    };

    return {
        callService: callService,
        kendoDataSource: configureDataSource,
        kendoOfflineDataSource: configureOfflineDataSource,
        kendoNonpagedDataSource: configureNonpagedDataSource
    };
})();