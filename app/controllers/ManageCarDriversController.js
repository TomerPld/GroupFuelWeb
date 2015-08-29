app.controller('ManageCarDriversController', function ($scope, $modalInstance, $filter, ngTableParams, carNumber, UserService, ManageCarsService, ngNotify) {
    var driverEmail = "";
    (function () {
        $scope.carNumber = carNumber;
        $scope.driverEmail = driverEmail;
        $scope.carDrivers = [];
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
                var data = $scope.carDrivers;
                var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        showDrivers();
    })();

    $scope.addDriver = function () {
        if ($scope.driverEmail == UserService.currentUser.get('email')) {
            ngNotify.set('Warning: you are the car owner. Drivers are other users you share your car with.', {
                type: 'warn',
                position: 'top',
                duration: 2000
            });
            return;
        }
        ManageCarsService.addDriver($scope.carNumber, $scope.driverEmail).then(
            function (results) {
                showDrivers();
                ngNotify.set('Driver added successfully.', {
                    type: 'success',
                    position: 'top',
                    duration: 2000
                });
            },
            function (err) {
                ngNotify.set('Error: failed to add driver, please verify the email address.', {
                    type: 'error',
                    position: 'top',
                    duration: 2000
                });
            }
        );
    };

    function showDrivers() {
        ManageCarsService.showDrivers($scope.carNumber).then(
            function (results) {
                $scope.carDrivers = results;
                $scope.tableParams.reload();
                $scope.tableParams.total($scope.carDrivers.length);
                for (var i = 0; i < results.length; i++) {
                    console.log(JSON.stringify(results[i]));
                }
            },
            function (err) {
                ngNotify.set('Error: failed to load drivers.', {
                    type: 'error',
                    position: 'top',
                    duration: 2000
                });
            }
        );
    }

    $scope.close = function () {
        $modalInstance.close();
    };

    $scope.removeDriver = function (driver) {
        ManageCarsService.removeDriver($scope.carNumber, driver.email).then(
            function (results) {
                showDrivers();
                ngNotify.set('Driver removed successfully.', {
                    type: 'success',
                    position: 'top',
                    duration: 2000
                });
            },
            function (err) {
                ngNotify.set('Error: failed to remove driver.', {
                    type: 'error',
                    position: 'top',
                    duration: 2000
                });
            }
        );
    };

});