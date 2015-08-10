/**
 * Created by matansab on 8/4/2015.
 */
app.controller('ManageCarDriversController', function ($scope, $modalInstance, $filter, ngTableParams, carNumber, UserService, ManageCarsService) {
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
        if($scope.driverEmail == UserService.currentUser.get('email')){
            alert("You are the Owner, you can't add yourself as a driver");
            return;
        }
        ManageCarsService.addDriver($scope.carNumber, $scope.driverEmail).then(
            function(results){
                showDrivers();
            },
            function(err){
                console.log("Failed to add driver "+ err);
            }
        );
    };

    function showDrivers() {
        ManageCarsService.showDrivers($scope.carNumber).then(
            function(results){
                $scope.carDrivers = results;
                // Updating the ngTable data
                $scope.tableParams.reload();
                $scope.tableParams.total($scope.carDrivers.length);
                for (var i=0; i< results.length; i++){
                    console.log(JSON.stringify(results[i]));
                }
            },
            function(err){
                console.log("Error: failed to load user cars.  " + err);
            }
        );
    }

    $scope.close = function () {
        $modalInstance.close();
    };

    $scope.removeDriver = function (driver) {
        ManageCarsService.removeDriver($scope.carNumber, driver.email).then(
            function(results){
                showDrivers();
            },
            function (err){
                console.log("Error: query failed in removeDriver  "+err );
            }
        );
    };

});