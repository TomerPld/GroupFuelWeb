/**
 * Created by matansab on 5/18/2015.
 */
app.controller('EditProfileController', function ($scope, $location, UserService) {
    // TODO check why getUserDetails is being called twice
    'use strict';
    var CleanUserDetails = {
        userName: "",
        firstName: "",
        lastName: "",
        email: "",
        birthDate: "",
        gender: ""
    };
    (function () {
        $scope.UserService = UserService;
        $scope.userDetails = {};
        $scope.datepickers = {
            'minDate': '1900-01-01',
            'maxDate': '2099-12-31',
            'birthDateOpened': false
        };
        $scope.openBirthDate = function () {
            $scope.datepickers.birthDateOpened = !$scope.datepickers.birthDateOpened;
        };
        getUserDetails();
    })();

    $scope.$watch('userDetails.birthDate', function (date) {
        console.log(date);
    });

    $scope.doUpdate = function () {
        if (!$scope.UserService.logged) {
            return;
        }
        var userDetailsPromise = UserService.doUpdate($scope.userDetails).then(
            function (user) {
                console.log("User: " + JSON.stringify(user));
            },
            function (err) {
                console.log("Error: " + err);
            }
        );
    };

    $scope.$watch('UserService.logged', getUserDetails);

    function getUserDetails() {
        if (UserService.logged) {
            var currentUser = UserService.currentUser;
            $scope.userDetails.userName = currentUser.get('username');
            $scope.userDetails.firstName = currentUser.get('FirstName');
            $scope.userDetails.lastName = currentUser.get('LastName');
            $scope.userDetails.email = currentUser.get('email');
            $scope.userDetails.birthDate = new Date(currentUser.get('BirthDate')) - 1;
            $scope.userDetails.gender = currentUser.get('Gender');
        }
        else {
            $scope.userDetails = angular.copy(CleanUserDetails);
        }
    }
});
