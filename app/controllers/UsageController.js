/**
 * Created by Tomer on 07/04/2015.
 */
app.controller('UsageController', function ($scope, $filter, UserService, ngTableParams) {
    'use strict';
    var cleanData = {
        "allCars": true,
        "userCars": {},
        "numCars": 0,
        "fuelEvents": [],
        "logSize": 0,
        "usage": []
    };
    (function (){
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
        $scope.UserService = UserService;

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
                // Binding table's data. $scope.userCars == [] at initialization,
                // so we actually not showing anything right now.
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
        console.dir($scope.charts.fuelEvents.data);
    });
    function getCars () {
        if (!UserService.logged) {
            return;
        }
        Parse.Cloud.run('getOwnedCars', {}, {
            success: function (results) {
                // TODO - if no cars -> show proper notification instead of an empty table.
                $scope.data.numCars = results.length;
                refineCarsDict(results);
                updateUsage();
                $scope.$digest();
            },
            error: function () {
                console.log("failed to retrieve fueling log");
            }
        });
    }

    function refineCarsDict (parseCars) {
        $scope.data.userCars = {};
        for (var i = 0; i < parseCars.length; i++) {
            var newCar = {};
            var newModel = parseCars[i].get('Model');
            newCar.model = newModel.get('Model');
            newCar.make = newModel.get('Make');
            newCar.year = newModel.get('Year');
            newCar.number = parseCars[i].get('CarNumber');
            newCar.mileage = parseCars[i].get('Mileage');
            newCar.marked = true;
            $scope.data.userCars[parseCars[i].id] = angular.copy(newCar);
        }
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
                        value.carName = $scope.data.userCars[key].make + " " + $scope.data.userCars[key].model;
                    }
                    usage.push(value);
                });
                $scope.data.usage = usage;
                $scope.tableParams.reload();
                $scope.tableParams.total($scope.data.usage.length);
                // $scope.$digest();
            },
            error: function () {
                console.log("Error: failed to retrieve usage");
            }
        });
    }

    function getFuelEvents () {
        // if logsize is not a mult of 10, means the last query ran over the end of the fuel events.
        if (!UserService.logged || ($scope.data.logSize % 10) != 0) {
            return;
        }
        var query = new Parse.Query("Fueling");
        query.equalTo("User", UserService.currentUser);
        query.include("Car");
        query.limit(10);
        query.skip($scope.data.logSize);
        query.find({
            success: function (results) {
                $scope.data.logSize += results.length;
                refineFuelEvents(results);
                $scope.$digest();
            },
            error: function () {
                console.log("failed to retrieve fueling log");
            }
        });
    }

    /*
     * Private function - gets a list of parse fueling objects and
     * refines it to a bindable json.
     * extra work - add gas station details.
     */
    function refineFuelEvents(parseFuelEvents) {
        // $scope.data.fuelEvents = [];
        for (var i = 0; i < parseFuelEvents.length; i++) {
            var currentEvent = parseFuelEvents[i];
            var currentCar = currentEvent.get('Car');
            var newEvent = {};
            newEvent.ID = currentEvent.id;
            newEvent.amount = currentEvent.get('Amount');
            newEvent.fuelType = currentEvent.get('FuelType');
            newEvent.mileage = currentEvent.get('Mileage');
            newEvent.price = currentEvent.get('Price');
            newEvent.logDate = currentEvent.createdAt;
            newEvent.carID = currentCar.id;
            newEvent.carNumber = currentCar.get('CarNumber');
            $scope.data.fuelEvents.push(angular.copy(newEvent));
        }
    }
});