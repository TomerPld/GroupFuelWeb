/**
 * Created by Tomer on 07/04/2015.
 */
app.controller('UsageController', function ($scope, $filter, UserService, ngTableParams, Fueling) {
    'use strict';
    var cleanData = {
        "allCars": true,
        "userCars": {},
        "numCars": 0,
        "fuelEvents": [],
        "logFull": false,
        "usage": []
    };
    (function (){
        $scope.UserService = UserService;
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
                    "tooltipContent": function(key, y){
                        console.log(key);
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
            //config: {},
            //events: {}
        };
        $scope.data = angular.copy(cleanData);
        $scope.doLogin = UserService.doLogin;

        // Initializing configuration for ngTable
        $scope.tableParams = new ngTableParams({
            page: 1,
            count: 10,
            sorting: {
                carName: 'asc'
            }
        },  {
            total: 0,
            getData: function($defer, params) {
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

    $scope.$watch('UserService.logged', function (logged) {
        $scope.data = angular.copy(cleanData);
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
            dataObject["key"] = usage[i].carName;
            dataObject.y = usage[i].numOfEvents;
            pieData.push(dataObject);
        }
        $scope.charts.fuelEvents.data = pieData;
    });

    function getCars () {
        if (!UserService.logged) {
            return;
        }
        Parse.Cloud.run('getOwnedCars', {}, {
            success: function (results) {
                // TODO - if no cars -> show proper notification instead of an empty table.
                createCarsDict(results);
                updateUsage();
                //$scope.$digest();
            },
            error: function () {
                console.log("failed to retrieve fueling log");
            }
        });
    }

    function createCarsDict (parseCars) {
        var carsDict = {};
        for (var i = 0; i < parseCars.length; i++) {
            parseCars[i].marked = true;
            carsDict[parseCars[i].id] = angular.copy(parseCars[i]);
        }
        $scope.data.userCars = carsDict;
    }

    function updateUsage () {
        var cars = [];
        Object.keys($scope.data.userCars).forEach(function (key) {
            var value = $scope.data.userCars[key];
            if (value.marked) {
                var carPointer = {"__type":"Pointer","className":"Car","objectId":key};
                cars.push(carPointer);
            }
        });
        Parse.Cloud.run('getUsage', {'cars': cars}, {
            success: function (result) {
                var usage = [];
                Object.keys(result).forEach(function (key){
                    var value = result[key];
                    value.carName = key;
                    if (key != 'total') {
                        value.carName = $scope.data.userCars[key].get("Model").get("Make") + " " + $scope.data.userCars[key].get("Model").get("Model");
                    }
                    usage.push(value);
                });
                $scope.data.usage = usage;
                $scope.tableParams.reload();
                $scope.tableParams.total($scope.data.usage.length);
                $scope.$digest();
            },
            error: function () {
                console.log("Error: failed to retrieve usage");
            }
        });
    }

    function getFuelEvents () {
        if (!UserService.logged || $scope.data.logFull) {
            return;
        }
        var query = new Parse.Query("Fueling");
        query.equalTo("User", UserService.currentUser);
        query.include("Car");
        query.limit(10);
        query.skip($scope.data.fuelEvents.length);
        query.find({
            success: function (results) {
                if (results.length < 10) {
                    $scope.data.logFull = true;
                }
                //refineFuelEvents(results);
                $scope.data.fuelEvents = $scope.data.fuelEvents.concat(results);
                $scope.$digest();
            },
            error: function () {
                console.log("failed to retrieve fueling log");
            }
        });
    }
});