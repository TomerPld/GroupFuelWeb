/**
 * Created by matansab on 5/18/2015.
 */
app.controller('ManageCarsController', function ($scope, $filter, $modal, ngTableParams, UserService, ManageCarsService, Car, User, ngNotify) {

    'use strict';
    (function () {
        $scope.UserService = UserService;
        $scope.userCars = [];
        $scope.userDriving = [];
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
                var data = $scope.userCars;
                var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.tableParams2 = new ngTableParams({
            page: 1,
            count: 15,
            sorting: {
                make: 'asc'
            }
        }, {
            counts: [],
            total: 0,
            getData: function ($defer, params) {
                var data = $scope.userDriving;
                var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // Import user data and update tables
        updateOwnedCars();
        updateDrivingCars();
    })();

    /*
     * Gets user's car list from server, and reloads table.
     */
    function updateOwnedCars() {
        ManageCarsService.updateOwnedCars().then(
            function (results) {
                $scope.userCars = results;
                $scope.tableParams.reload();
                $scope.tableParams.total($scope.userCars.length);
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

    function updateDrivingCars() {
        ManageCarsService.updateDrivingCars().then(
            function (results) {
                $scope.userDriving = results;
                $scope.tableParams2.reload();
                $scope.tableParams2.total($scope.userDriving.length);
            },
            function (err) {
                ngNotify.set('Error: failed to cars shared with you.', {
                    type: 'error',
                    position: 'top',
                    duration: 2000
                });
            });
    }

    $scope.$watch('UserService.logged', updateOwnedCars);

    $scope.removeCar = function (car) {
        var carNumber = car.get("CarNumber");
        ManageCarsService.removeCar(carNumber).then(
            function (results) {
                updateOwnedCars();
                ngNotify.set('Car removed successfully.', {
                    type: 'success',
                    position: 'top',
                    duration: 2000
                });
            },
            function (err) {
                ngNotify.set('Error: failed to remove car.', {
                    type: 'error',
                    position: 'top',
                    duration: 2000
                });
            }
        );
    };

    $scope.addCar = function () {
        var modalInstance = $modal.open({
            templateUrl: 'GroupFuelWeb/app/partials/addCar.html',
            controller: 'AddCarController'
        });
        modalInstance.result.then(
            function (res) {
                updateOwnedCars();
            },
            function (res) {
                updateOwnedCars();
            }
        );
    };
    $scope.manageCarDrivers = function (car) {
        var carNum = car.get("CarNumber");
        var modalInstance = $modal.open({
            templateUrl: 'GroupFuelWeb/app/partials/manageCarDrivers.html',
            controller: 'ManageCarDriversController',
            resolve: {
                carNumber: function () {
                    return carNum;
                }
            }
        });
        modalInstance.result.then(
            function (res) {
                // show notification
            },
            function (res) {
                // show notification
            }
        );
    };
    $scope.removeDriver = function (car) {
        var carNum = car.get("CarNumber");
        ManageCarsService.removeDriver(carNum, UserService.currentUser.get("email")).then(
            function () {
                ngNotify.set('Car removed successfully.', {
                    type: 'success',
                    position: 'top',
                    duration: 2000
                });
                updateDrivingCars();
            },
            function () {
                ngNotify.set('Error: failed to leave car.', {
                    type: 'error',
                    position: 'top',
                    duration: 2000
                });
            }
        );
    };
});
