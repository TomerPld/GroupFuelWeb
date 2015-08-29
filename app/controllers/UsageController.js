/**
 * Created by Tomer on 07/04/2015.
 */
app.controller('UsageController', function ($scope, $filter, $q, ChartsService, UserService, UsageService, ngTableParams, Fueling, Car, ngNotify) {
    'use strict';

    $scope.chartConfig = {};
    $scope.chartConfig.pieOptions =  ChartsService.pieOptions;
    $scope.chartConfig.pieCharts = ChartsService.pieCharts;
    $scope.chartConfig.pieChartData = [];
    $scope.chartConfig.pieChosenChart = 'fuelPerCar';
    $scope.chartConfig.lineOptions =  ChartsService.lineOptions;
    $scope.chartConfig.lineCharts = ChartsService.lineCharts;
    $scope.chartConfig.lineChartData = [];
    $scope.chartConfig.lineChosenChart = 'fuelPerMonth';

    $scope.lineChangeChart = function (chartName) {
        $scope.chartConfig.lineChosenChart = chartName;
    };

    $scope.pieChangeChart = function (chartName) {
        $scope.chartConfig.pieChosenChart = chartName;
    };

    $scope.hasGasStation = function (fueling) {
        return fueling.GasStationLoc !== undefined;
    };
    var cleanData = {
        "allCars": true,
        "userCars": {},
        "fuelEvents": [],
        "logFull": false,
        "usage": []
    };

    (function () {
        $scope.UserService = UserService;
        $scope.doLogin = UserService.doLogin;
        $scope.data = angular.copy(cleanData);

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
            getFuelEvents();
        };
    })();

    // Initializing the controller will invoke the watch.
    $scope.$watch('UserService.logged', function (logged) {
        $scope.data = angular.copy(cleanData);
        getCars();
    });

    $scope.$watch('chartConfig.pieChosenChart', updatePieCharts);
    $scope.$watch('chartConfig.lineChosenChart', updateLineCharts);


    $scope.$watch('data.fuelEvents', function (events) {
        if (events.length > 0) {
            updateLineCharts();
        }
    });

    $scope.$watch('data.userCars', function (cars) {
        if (Object.keys(cars).length > 0) {
            var vals = Object.keys(cars).map(function (key) {
                var pointer = new Parse.Object("Car");
                pointer.id = key;
                return pointer;
            });
            getFuelEvents(vals);
        }
    });


    function getFuelEvents(vals) {
        if (!UserService.logged || $scope.data.logFull) {
            return;
        }
        UsageService.getFuelEvents(vals, $scope.data.fuelEvents.length).then(
            function (results) {
                if (results.length < 1000) {
                    $scope.data.logFull = true;
                }
                $scope.data.fuelEvents = $scope.data.fuelEvents.concat(results);
            },
            function (err) {
                ngNotify.set('Error: failed to load fueling data.', {
                    type: 'error',
                    position: 'top',
                    duration: 2000
                });
            }
        );
    }

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
                ngNotify.set('Error: failed to load owned cars.', {
                    type: 'error',
                    position: 'top',
                    duration: 2000
                });
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
                updatePieCharts();
                $scope.tableParams.reload();
                $scope.tableParams.total($scope.data.usage.length);
            },
            function (err) {
                ngNotify.set('Error: failed to personal usage info.', {
                    type: 'error',
                    position: 'top',
                    duration: 2000
                });
            }
        );
    }

    function updatePieCharts () {
        if ($scope.chartConfig.pieChosenChart === undefined) {
            return;
        }
        $scope.chartConfig.pieChartData = $scope.chartConfig.pieCharts[$scope.chartConfig.pieChosenChart]($scope.data.usage);
    }

    function updateLineCharts () {
        if ($scope.chartConfig.lineChosenChart === undefined) {
            return;
        }
        var datasets = $scope.chartConfig.lineCharts[$scope.chartConfig.lineChosenChart]($scope.data.fuelEvents, $scope.data.userCars);
        var labels = ChartsService.lastSixMonths;
        $scope.chartConfig.lineChartData = {
            datasets: datasets,
            labels: labels
        };
    }
});