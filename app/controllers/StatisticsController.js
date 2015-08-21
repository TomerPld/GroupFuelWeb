/**
 * Created by Tomer on 07/04/2015.
 */
app.controller('StatisticsController', function ($scope, ngTableParams, $filter, StatisticsService, ParameterService, CarModel) {
    'use strict';

    // dictionary with entry for each selection level. each entry is a set of all avaliable values for the level.
    $scope.options = {};
    // dictionary with entry for each selection level. each entry is the selected value of the level.
    $scope.selection = {};
    // dictionary of selected cars - cars that we'll show statistics for.
    $scope.selectedCars = {};
    $scope.selectedCarsList = [];

    // setting
    $scope.tableParams = new ngTableParams({
        page: 1,
        count: 15,
        sorting: {
            make: 'asc',
            model: 'asc',
            year: 'asc'
        }
    }, {
        counts: [],
        total: 0,
        getData: function ($defer, params) {
            var data = $scope.selectedCarsList;
            var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
    });

    ParameterService.getDistinctFieldFromDB('Make', 'CarModel').then(function (result) {
        $scope.options.makes = result;
        console.log('recieved ' + result.length + ' makes');
    }, function (err) {
        console.log(err);
    });


    $scope.$watch('selection.make', function (make) {
        if (!make) {
            $scope.options.models = undefined;
            return;
        }
        // Init fields after make.
        $scope.selection.model = undefined;
        // Re-Populate next field valus.
        ParameterService.getCarModels(make).then(function (result) {
            $scope.options.models = result.resultSet;
        });
    });

    $scope.$watch('selection.model', function (model) {
        $scope.selection.year = undefined;
        if (!model) {
            $scope.options.years = undefined;
            return;
        }
        $scope.options.years = $scope.options.models.filter(function (item) { return item.Model == model;});
    });

    $scope.$watch('selection.year', function (year) {
        $scope.selection.volume = undefined;
        if (!year) {
            $scope.options.volumes = undefined;
            return;
        }
        $scope.options.volumes = $scope.options.years.filter(function (item) { return item.Year == year;});
    });

    $scope.$watch('selection.volume', function (volume) {
        $scope.selection.gear = undefined;
        if (!volume) {
            $scope.options.gears = undefined;
            return;
        }
        $scope.options.gears = $scope.options.volumes.filter(function (item) { return item.Volume == volume;});
    });

    $scope.$watch('selection.gear', function (gear) {
        $scope.selection.fuel = undefined;
        if (!gear) {
            $scope.options.fuels = undefined;
            return;
        }
        $scope.options.fuels = $scope.options.gears.filter(function (item) { return item.Gear == gear;});
    });

    $scope.addSelection = function () {
        var selection = $scope.selection;
        if (!selection.make) {
            return;
        }
        for (var key in selection) {
            var options = $scope.options[key + 's'];
            if (!selection[key] && options && key != 'make') {
                options.map(function (option) {
                    if ($scope.selectedCars[option.id] === undefined) {
                        $scope.selectedCars[option.id] = option;
                    }
                });
            }
        }
        refreshTable();
    };

    $scope.cancelSelection = function (carId) {
        delete $scope.selectedCars[carId];
        refreshTable();
        if ($scope.tableParams.$params.page > 1) {
            if ($scope.tableParams.$params.count * ($scope.tableParams.$params.page - 1) >= $scope.selectedCarsList.length) {
                $scope.tableParams.$params.page -= 1;
            }
        }
    };

    $scope.clearForm = function () {
        $scope.selection.make = undefined;
    };

    $scope.clearSelection = function () {
        $scope.selectedCars = {};
        refreshTable();
        $scope.tableParams.$params.page = 1;
    };

    function refreshTable () {
        $scope.selectedCarsList = [];
        for (var key in $scope.selectedCars) {
            $scope.selectedCarsList.push($scope.selectedCars[key]);
        }
        $scope.tableParams.reload();
        $scope.tableParams.total($scope.selectedCarsList.length);
    }
});