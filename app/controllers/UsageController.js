/**
 * Created by Tomer on 07/04/2015.
 */
app.controller('UsageController', function ($scope, $filter, UserService, UsageService, ngTableParams, Fueling, Car) {
    'use strict';
    var cleanData = {
        "userCars": {},
        "fuelEvents": [],
        "logFull": false,
        "usage": []
    };
    (function () {
        $scope.UserService = UserService;
        $scope.doLogin = UserService.doLogin;
        $scope.data = angular.copy(cleanData);
        $scope.datepickers = {
            'minDate': '1900-01-01',
            'maxDate': '2099-12-31',
            'fromDateOpened': false,
            'untilDateOpened': false
        };
        $scope.openFromDate = function () {
            $scope.datepickers.fromDateOpened = !$scope.datepickers.fromDateOpened;
        };
        $scope.openUntilDate = function () {
            $scope.datepickers.untilDateOpened = !$scope.datepickers.untilDateOpened;
        };
        $scope.data.untilDate = (new Date()) - 1;

        // Promises dictionary for loading spinner
        $scope.promises = {};
        $scope.charts = {};
        $scope.charts.fuelEvents = {
            options: {
                "chart": {
                    "type": "pieChart",
                    "height": 500,
                    "showLabels": true,
                    "transitionDuration": 500,
                    "labelThreshold": 0.01,
                    "useInteractiveGuideline": false,
                    "tooltipContent": function (key, y) {
                        return key;
                    },
                    "title": "Fuel Event Per Car",
                    "legend": {
                        "margin": {
                            "top": 5,
                            "right": 35,
                            "bottom": 5,
                            "left": 0
                        }
                    }
                }
            },
            data: {}
        };
        // Initializing configuration for ngTable
        $scope.tableParams = new ngTableParams({
            page: 1,
            count: 10,
            sorting: {
                carName: 'asc'
            }
        }, {
            total: 0,
            getData: function ($defer, params) {
                var data = $scope.data.usage;
                var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.loadMore = function () {
            console.log("load more");
            getFuelEvents();
        };
    })();

    $scope.$watch('data.fromDate', function (date) {console.log(date);});
    $scope.$watch('UserService.logged', function (logged) {
        //$scope.data = angular.copy(cleanData);
        getCars();
        getFuelEvents();
    });

    $scope.$watch('data.usage', function (usage) {
        var pieData = [];
        for (var i = 0; i < usage.length; i++) {
            if (usage[i].carName === 'total') {
                continue;
            }
            var dataObject = {};
            dataObject.key = usage[i].carName;
            dataObject.y = usage[i].numOfEvents;
            pieData.push(dataObject);
        }
        $scope.charts.fuelEvents.data = pieData;
    });

    function getCars() {
        if (!UserService.logged) {
            return;
        }
        UsageService.getCars().then(
            function (results) {
                createCarsDict(results);
                updateUsage();
            },
            function (err) {
                console.log("Error: " + err);
            }
        );
    }

    function createCarsDict(parseCars) {
        var carsDict = {};
        for (var i = 0; i < parseCars.length; i++) {
            parseCars[i].marked = true;
            carsDict[parseCars[i].id] = angular.copy(parseCars[i]);
        }
        $scope.data.userCars = carsDict;
    }

    function updateUsage() {
        if (!UserService.logged) {
            return;
        }
        UsageService.getUsage($scope.data.userCars).then(
            function (results) {
                $scope.data.usage = results;
                $scope.tableParams.reload();
                $scope.tableParams.total($scope.data.usage.length);
            },
            function (err) {
                console.log("Error: " + err);
            }
        );
    }

    function getFuelEvents() {
        if (!UserService.logged || $scope.data.logFull) {
            return;
        }
        UsageService.getFuelEvents(UserService.currentUser, $scope.data.fuelEvents.length).then(
            function (results) {
                if (results.length < 10) {
                    $scope.data.logFull = true;
                }
                $scope.data.fuelEvents = $scope.data.fuelEvents.concat(results);
            },
            function (err) {
                console.log("Error: " + err);
            }
        );
    }
});