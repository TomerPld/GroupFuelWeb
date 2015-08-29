app.controller('LoginController', function ($scope, $modalInstance, $location, UserService, ngNotify) {
    'use strict';
    var cleanLoginDetails = {
        username : "",
        password : ""
    };
    (function () {
        $scope.loginDetails = angular.copy(cleanLoginDetails);
        $scope.UserService = UserService;
        console.log("started");
    })();

    $scope.doLogin = function () {
        var details = $scope.loginDetails;
        if (details.username == "" || details.password == "") {
            return;
        }
        if ($scope.UserService.logged) {
            return;
        }
        Parse.User.logIn(details.username, details.password, {
            success: function(user) {
                ngNotify.set('Welcome back, ' + user.get("username"), {
                    type: 'success',
                    position: 'top',
                    duration: 2000
                });
                $scope.UserService.logged = true;
                $scope.UserService.currentUser = user;
                $modalInstance.close("user " + details.username + " logged in succesfully");
            },
            error: function(user, error) {
                $scope.loginDetails.password = "";
                ngNotify.set('Error: failed to login.', {
                    type: 'error',
                    position: 'top',
                    duration: 2000
                });
            }
        });
    };

    $scope.doCancel = function () {
        // close modal
        console.log("cancel login");
        $modalInstance.dismiss('login canceled');
    };

    // TODO - add forgot my password button
});