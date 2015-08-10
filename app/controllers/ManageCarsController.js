/**
 * Created by matansab on 5/18/2015.
 */
app.controller('ManageCarsController', function ($scope, $filter, $modal, ngTableParams, UserService, ManageCarsService, Car, User) {

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

                // Binding table's data. $scope.userCars == [] at initialization,
                // so we actually not showing anything right now.
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

                // Binding table's data. $scope.userCars == [] at initialization,
                // so we actually not showing anything right now.
                var data = $scope.userDriving;
                var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // Import user data and update table
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
                console.log("Error: failed to load user cars " + err);
            }
        );
    }

    function updateDrivingCars() {
        ManageCarsService.updateDrivingCars().then(
            function (results) {
                $scope.userDriving = results;
                // Updating the ngTable data
                $scope.tableParams2.reload();
                $scope.tableParams2.total($scope.userDriving.length);
            },
            function (err) {
            // TODO - add notification error
            console.log("Error: failed to load user driving cars. " + err)
        });
    }

    $scope.$watch('UserService.logged', updateOwnedCars);

    $scope.removeCar = function (car) {
        var carNumber = car.get("CarNumber");
        ManageCarsService.removeCar(carNumber).then(
            function(results){
                updateOwnedCars();
            },
            function(err){
                console.log("Error: query failed in removeCar " + err);
            }
        );
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
    $scope.manageCarDrivers = function (car) {
        console.log('In manageCarDrivers');
        console.log(car.get("CarNumber"));
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
                console.log(res);
            },
            function (res) {
                console.log(res);
                // show notification
            }
        );
    };
});
