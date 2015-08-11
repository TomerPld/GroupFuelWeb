/**
 * Created by matansab on 5/21/2015.
 */
app.controller('AddCarController', function ($scope, $modalInstance, ManageCarsService) {
    'use strict';
    var carDetails = {
        car_number: "",
        mileage: "",
        make: "",
        model: "",
        volume: "",
        year: "",
        fuelType: "",
        hybrid: ""
    };

    (function () {
        $scope.carDetails = angular.copy(carDetails);
        $scope.makes = [];
        $scope.parseModels = [];
        $scope.markedDic = {};
        $scope.modelsDic = {};
        $scope.volumesDic = {};
        $scope.yearsDic = {};
        $scope.fuelTypesDic = {};
        $scope.hybridDic = {};

        ManageCarsService.getCarMakes().then(
            function (results) {
                for (var i = 0; i < results.length; i++) {
                    $scope.makes.push(results[i]);
                }
            },
            function (err) {
                console.log("Error: failed to retrieve Makes.   " + err);
            }
        );
    })();

    $scope.$watch('carDetails.make', function (make) {
        if (String(make) == "") {
            return;
        }
        disableFollowingSelects('make', 'model');

        ManageCarsService.getCarModels(make).then(
            function (results) {
                $scope.parseModels = results.resultSet;
                fillDictionary($scope.parseModels, $scope.modelsDic, 'Model');
            },
            function (err) {
                console.log("Error: Failed to load models   " + err);
            }
        );
    });
    $scope.$watch('carDetails.model', function (model) {
        if (String(model) == "" || model === undefined)
            return;
        disableFollowingSelects('model', 'volume');

        fillDictionary($scope.modelsDic[model], $scope.volumesDic, 'Volume');
    });

    $scope.$watch('carDetails.volume', function (volume) {
        if (String(volume) == "" || volume === undefined)
            return;
        disableFollowingSelects('volume', 'year');

        fillDictionary($scope.volumesDic[volume], $scope.yearsDic, 'Year');
    });

    $scope.$watch('carDetails.year', function (year) {
        if (String(year) == "" || year === undefined)
            return;
        disableFollowingSelects('year', 'fuelType');

        fillDictionary($scope.yearsDic[year], $scope.fuelTypesDic, 'FuelType');
    });

    $scope.$watch('carDetails.fuelType', function (fuelType) {
        if (String(fuelType) == "" || fuelType === undefined)
            return;
        disableFollowingSelects('fuelType', 'hybrid');

        fillDictionary($scope.fuelTypesDic[fuelType], $scope.hybridDic, 'Hybrid');
    });

    $scope.$watch('carDetails.hybrid', function (type) {
        if (String(type) == "" || type === undefined)
            return;
        disableFollowingSelects('hybrid', '');
    });


    function fillDictionary(fromArray, toDic, parseKey) {
        // toDic = {};
        for (var i = 0; i < fromArray.length; i++) {
            var current = fromArray[i].get(parseKey);
            if (toDic[current] === undefined) {
                toDic[current] = [];
            }
            toDic[current].push(fromArray[i]);
        }
        console.dir(toDic);
    }

    $scope.addCar = function () {
        console.dir($scope.carDetails);
        ManageCarsService.addCar($scope.carDetails).then(
            function (results) {
                //TODO close modal
                console.dir(results);
            },
            function (err) {
                console.log("Error: Failed to add a car   " + err);
            }
        );
    };

    $scope.clearCarsForm = function () {
        var marked = $scope.markedDic;
        for (var key in marked) {
            if (marked.hasOwnProperty(key)) {
                marked[key] = false;
            }
        }
        $scope.carDetails = angular.copy(carDetails);
    };
    $scope.close = function () {
        $modalInstance.close();
    };


    function disableFollowingSelects(current, next) {
        $scope.markedDic[current] = true;
        //noinspection FallThroughInSwitchStatementJS
        switch (next) {
            case 'model':
                $scope.markedDic['model'] = false;
                $scope.carDetails['model'] = "";
            case 'volume':
                $scope.markedDic['volume'] = false;
                $scope.carDetails['volume'] = "";
            case 'year':
                $scope.markedDic['year'] = false;
                $scope.carDetails['year'] = "";
            case 'fuelType':
                $scope.markedDic['fuelType'] = false;
                $scope.carDetails['fuelType'] = "";
                break;
            case 'hybrid':
                $scope.markedDic['hybrid'] = false;
                $scope.carDetails['hybrid'] = "";
        }
    }
});