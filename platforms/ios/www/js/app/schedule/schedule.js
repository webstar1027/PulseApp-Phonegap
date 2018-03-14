CommunityApp.schedule = (function () {
    var getSchedulePositionsServiceUrl = function (userId) {
        var schedulePositionsServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.scheduleConfig.schedulePath + CommunityApp.configuration.scheduleConfig.schedulePositionsPath;
		schedulePositionsServiceUrl = CommunityApp.utilities.stringFormat(schedulePositionsServiceUrl, userId);
        return schedulePositionsServiceUrl;
    };
    
    var getSchedulePositionsByStoreCodeServiceUrl = function(storeCode) {
        var schedulePositionsServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.scheduleConfig.schedulePath + CommunityApp.configuration.scheduleConfig.schedulePositionsByStoreCode;
		schedulePositionsServiceUrl = CommunityApp.utilities.stringFormat(schedulePositionsServiceUrl, storeCode);
        return schedulePositionsServiceUrl;
    };
	
	var getWeeksByPositionServiceUrl = function (positionId) {
        var weeksByPositionServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.scheduleConfig.schedulePath + CommunityApp.configuration.scheduleConfig.weeksByPositionPath;
		weeksByPositionServiceUrl = CommunityApp.utilities.stringFormat(weeksByPositionServiceUrl, positionId);
        return weeksByPositionServiceUrl;
    };
	
	var getScheduleByWeekServiceUrl = function (weekId) {
        var scheduleByWeekServiceUrl = CommunityApp.configuration.appConfig.serviceUrl + CommunityApp.configuration.scheduleConfig.schedulePath + CommunityApp.configuration.scheduleConfig.scheduleByWeekPath;
		scheduleByWeekServiceUrl = CommunityApp.utilities.stringFormat(scheduleByWeekServiceUrl, weekId);
        return scheduleByWeekServiceUrl;
    };

    var viewModel = kendo.observable({
		topShow: false,
        dataBound: false,
		positionId: 0,
		weekId: 0,
		schedule: [],
		weekStart: "",
        load: function (e) {
            //CommunityApp.common.authenticatedUser();

            viewModel.set("topShow", false);
			viewModel.set("dataBound", false);
			viewModel.set("positionId", 0);
			viewModel.set("weekId", 0);
			viewModel.set("schedule", []);
			viewModel.set("weekStart", "");
			
			var currentUserId = CommunityApp.base.baseData.currentUser().id;
            var serviceUrl = "";
            if (e.view.params.storeCode)
                serviceUrl = getSchedulePositionsByStoreCodeServiceUrl(e.view.params.storeCode);
            else
                serviceUrl = getSchedulePositionsServiceUrl(currentUserId);
			
			var schedulePositionsLoadOptions = {
				url: serviceUrl,
				requestType: "GET",
				dataType: "JSON",
				callBack: viewModel.fnPositionsLoadCallBack
			};
			
			var viewArgs = e;
			
			CommunityApp.dataAccess.callService(schedulePositionsLoadOptions, null, null, null, null, null, function () {
				viewModel.load(viewArgs);
			});
			
        },
		fnPositionsLoadCallBack: function (response) {
			if (response.data) {

				var onChange = function() {
					console.log("event: change");
				};

				var onSelect = function(e) {
					var dataItem = this.dataItem(e.item);
					console.log("event :: select (" + dataItem.text + " : " + dataItem.value + ")" );
					viewModel.set("positionId", dataItem.value);
					viewModel.fnShowWeeksByPosition(dataItem.value);
				};

				var onDataBound = function(e) {
					console.log("event :: dataBound");
				};
			
				var data = [];
				for (var i = 0; i < response.data.length; i++) {
					var iData = {text: response.data[i].Position, value: response.data[i].Id};
					data.push(iData);
				}
			
				$("#dropDownPosition").kendoDropDownList({
					dataTextField: "text",
					dataValueField: "value",
					dataSource: data,
					select: onSelect,
					change: onChange,
					dataBound:onDataBound
				});
				viewModel.fnShowWeeksByPosition(response.data[0].Id);
			}
		},
		fnShowWeeksByPosition: function(positionId) {
			var serviceUrl = getWeeksByPositionServiceUrl(positionId);
			var serviceLoadOptions = {
				url: serviceUrl,
				requestType: "GET",
				dataType: "JSON",
				callBack: viewModel.fnWeeksLoadCallBack
			};
			var thatPositionId = positionId;
			CommunityApp.dataAccess.callService(serviceLoadOptions, null, null, null, null, null, function () {
				viewModel.fnShowWeeksByPosition(thatPositionId);
			});
		},
		fnWeeksLoadCallBack: function(response) {
			if (response.data) {
				var weeksData = response.data;
				for (var i = 0; i < weeksData.length; i++) {
					var weekStartDay = new Date(weeksData[i].WeekStart);
					var weekEndDay = new Date(weeksData[i].WeekStart);
					weekEndDay.setDate(weekEndDay.getDate() + 6);
					var startMonth = weekStartDay.toDateString().substr(4, 3);
					var endMonth = weekEndDay.toDateString().substr(4, 3);
					var startYear = weekStartDay.getFullYear();
					var endYear = weekEndDay.getFullYear();
					if (startYear === endYear)
						weeksData[i].FullWeek = startMonth + " " + weekStartDay.getDate() + " - " + endMonth + " " + weekEndDay.getDate() + ", " + startYear;
					else
						weeksData[i].FullWeek = startMonth + " " + weekStartDay.getDate() +", " +startYear + " - " + endMonth + " " + weekEndDay.getDate() + ", " + endYear;
				}
				var weeksTemplate = kendo.template($('#weeks-swiper-tmpl').html());
                var weeksSwiperResult = kendo.render(weeksTemplate, weeksData);
                $("#weeksSwiper").find(".swiper-wrapper").empty();
                $("#weeksSwiper").find(".swiper-wrapper").attr("style", "");
                $("#weeksSwiper").find(".swiper-wrapper").append(weeksSwiperResult);
				
				viewModel.set("topShow", true);

                var swiper = new Swiper('#weeksSwiper', {
                    initialSlide: 0,
					onInit: function (swiper) {
                        viewModel.onSelectWeek(swiper);
                    },
                    onSlideChangeStart: function (swiper) {
                        viewModel.onSelectWeek(swiper);
                    },
					nextButton: '.swiper-button-next',
					prevButton: '.swiper-button-prev'
                });
			}
		},
		onSelectWeek: function (swiper) {
			var activeWeek = swiper.slides[swiper.activeIndex];
			var weekId = $(activeWeek).find('span').data('weekid');
			var weekStart = $(activeWeek).find('span').data('weekstart');
			viewModel.set("weekStart", weekStart);
			var serviceUrl = getScheduleByWeekServiceUrl(weekId);
			console.log(serviceUrl);
			var serviceLoadOptions = {
				url: serviceUrl,
				requestType: "GET",
				dataType: "JSON",
				callBack: viewModel.fnScheduleLoadCallBack
			};
			var thatSwiper = swiper;
			CommunityApp.dataAccess.callService(serviceLoadOptions, null, null, null, null, null, function () {
				viewModel.onSelectWeek(thatSwiper);
			});
		},
		fnScheduleLoadCallBack: function(response) {
			if (response.data) {
				var schedule = response.data;
				viewModel.set("schedule", schedule);
				
				viewModel.fnShowDaySchedule(0);
				
				var weekStart = viewModel.get("weekStart");
				var dayData = [];
				for (var i = 0; i < 7; i++) {
					var dayDate = new Date(weekStart);
					dayDate.setDate(dayDate.getDate() + i);
					var dayEl = {DayText: dayDate.toString().substr(0,3), DateText: dayDate.getDate(), index: i};
					dayData.push(dayEl);
				}
				
				var dayTabTemplate = kendo.template($('#day-tab-tmpl').html());
                var dayTabResult = kendo.render(dayTabTemplate, dayData);
                $("#day-form").empty();
                $("#day-form").attr("style", "");
                $("#day-form").append(dayTabResult);
				
				$("#day-form").kendoMobileButtonGroup({
					select: function (e) {
						viewModel.fnShowDaySchedule(e.index);
					},
					index: 0
				});
				
				viewModel.set('dataBound', true);
			}
		},
		fnShowDaySchedule: function(day) {
			var schedule = viewModel.get('schedule');
			var dataGrid = [
				{Staff: "AMStaff", Schedule: schedule[0].Staff[day].AMStaff},
				{Staff: "PMStaff", Schedule: schedule[0].Staff[day].PMStaff}
			];
			var gridConfig = {
				columns: [
					{field: "Staff", title: "Staff"},
					{field: "Schedule", title: "# of staff"}
				],
				dataSource: dataGrid
			};
			$('#gridScheduleStaff').kendoGrid(gridConfig);
			
			dataGrid = [];
			for (var i = 0; i < schedule.length; i++) {
				var dataEntry = {Name: schedule[i].Employee, Schedule: schedule[i].ScheduleEntries[day].Schedule};
				dataGrid.push(dataEntry);
			}
			
			gridConfig = {
				columns: [
					{field: "Name"},
					{field: "Schedule"}
				],
				dataSource: dataGrid
			};
			$('#gridScheduleEntries').kendoGrid(gridConfig);
		}
    });
	
    return {
        viewModel: viewModel
    };
})();