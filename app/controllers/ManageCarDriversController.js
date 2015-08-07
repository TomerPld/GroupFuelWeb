/**
 * Created by matansab on 8/4/2015.
 */
app.controller('ManageCarDriversController', function ($scope, $modalInstance, $filter, ngTableParams, carNumber, UserService) {
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

                // Binding table's data. $scope.carDrivers == [] at initialization,
                // so we actually not showing anything right now.
                var data = $scope.carDrivers;
                var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        showDrivers();
    })();

    $scope.addDriver = function () {
        console.log('in add driver');
        console.log('driver email is:' + $scope.driverEmail);
        console.log('the car # is:' + $scope.carNumber);

        if($scope.driverEmail == UserService.currentUser.get('email')){
            alert("You are the Owner, you can't add yourself as a driver");
            return;
        }

        Parse.Cloud.run('addDriver', {'carNumber': $scope.carNumber, 'email': $scope.driverEmail}, {
            success: function (results) {
                console.log('great success');
            },
            error: function () {
                alert('This is not an email of a GroupFuel user.')
                console.log("Error: query failed in add driver");
            }
        });

    };

    function showDrivers() {
        Parse.Cloud.run('getCarDrivers', {'carNumber': $scope.carNumber}, {
            success: function (results) {
                $scope.carDrivers = results;
                // Updating the ngTable data
                $scope.tableParams.reload();
                $scope.tableParams.total($scope.carDrivers.length);
                $scope.$digest();
                for (var i=0; i< results.length; i++){
                    console.log(JSON.stringify(results[i]));
                }
            },
            error: function () {
                // TODO - add notification error
                console.log("Error: failed to load user cars.")
            }
        });
    };

    $scope.close = function () {
        $modalInstance.close();
    };

    $scope.removeDriver = function (driver) {
        console.log(JSON.stringify(driver));
        console.log(driver.email);
        console.log($scope.carNumber);
        Parse.Cloud.run('removeDriver', {'carNumber': $scope.carNumber, 'email': driver.email}, {
            success: function (results) {
                showDrivers();
            },
            error: function () {
                // TODO add notification error
                console.log("Error: query failed in removeDriver");
            }
        });
    };

});