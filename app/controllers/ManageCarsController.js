/**
 * Created by matansab on 5/18/2015.
 */
app.controller('ManageCarsController', function ($scope, $filter, $modal, ngTableParams, UserService, Car) {

    'use strict';
    (function () {
        $scope.UserService = UserService;
        $scope.userCars = [];

        // Initializing configuration for ngTable
        $scope.tableParams = new ngTableParams({
            page: 1,
            count: 15,
            sorting: {
                make: 'asc'
            }
        }, {
            counts: [],
            total: 0,
            getData: function ($defer, params) {

                // Binding table's data. $scope.userCars == [] at initialization,
                // so we actually not showing anything right now.
                var data = $scope.userCars;
                var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // Import user data and update table
        updateCars();
    })();

    /*
     * Gets user's car list from server, and reloads table.
     */
    function updateCars() {
        Parse.Cloud.run('getOwnedCars', {}, {
            success: function (results) {
                $scope.userCars = results;
                // Updating the ngTable data
                $scope.tableParams.reload();
                $scope.tableParams.total($scope.userCars.length);
                $scope.$digest();
            },
            error: function () {
                // TODO - add notification error
                console.log("Error: failed to load user cars.")
            }
        });
    }

    $scope.$watch('UserService.logged', updateCars);

    $scope.removeCar = function (car) {
        console.log(JSON.stringify(car));
        console.log(car.get("CarNumber"));
        Parse.Cloud.run('removeCar', {'carNumber': car.get("CarNumber")}, {
            success: function (results) {
                updateCars();
            },
            error: function () {
                // TODO add notification error
                console.log("Error: query failed in removeCar");
            }
        });
    };
    $scope.addCar = function () {
        console.log('in add a car');
        var modalInstance = $modal.open({
            templateUrl: 'GroupFuelWeb/app/partials/addCar.html',
            controller: 'AddCarController'
        });
        modalInstance.result.then(
            function (res) {
                // show notification
                console.log(res);
            },
            function (res) {
                console.log(res);
                // show notification
            }
        );
    };
    $scope.manageCarDrivers = function(car) {
        console.log('In manageCarDrivers');
        console.log(car.get("CarNumber"));
        var carNum = car.get("CarNumber");
        var modalInstance = $modal.open({
            templateUrl: 'GroupFuelWeb/app/partials/manageCarDrivers.html',
            controller: 'ManageCarDriversController',
            resolve: {
                carNumber : function(){
                    return carNum;
                }
            }
        });
        modalInstance.result.then(
            function (res) {
                // show notification
                console.log(res);
            },
            function (res) {
                console.log(res);
                // show notification
            }
        );
    };
});
