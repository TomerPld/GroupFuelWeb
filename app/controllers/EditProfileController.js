/**
 * Created by matansab on 5/18/2015.
 */
app.controller('EditProfileController', function ($scope, $location, UserService, ngNotify) {
    'use strict';
    var CleanUserDetails = {
        userName: "",
        firstName: "",
        lastName: "",
        email: "",
        birthDate: "",
        gender: "true"
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

    $scope.doUpdate = function () {
        if (!$scope.UserService.logged) {
            return;
        }
        UserService.doUpdate($scope.userDetails).then(
            function (user) {
                ngNotify.set('User details were updated successfully.', {
                    type: 'success',
                    position: 'top',
                    duration: 2000
                });
            },
            function (err) {
                ngNotify.set('Error: failed to update user details.', {
                    type: 'error',
                    position: 'top',
                    duration: 2000
                });
            }
        );
    };

    $scope.$watch('UserService.logged', getUserDetails);

    function getUserDetails() {
        if (UserService.logged) {
            var currentUser = UserService.currentUser;
            console.log(JSON.stringify(new Date(currentUser.get("BirthDate"))));
            $scope.userDetails.userName = currentUser.get('username');
            $scope.userDetails.firstName = currentUser.get('FirstName');
            $scope.userDetails.lastName = currentUser.get('LastName');
            $scope.userDetails.email = currentUser.get('email');
            $scope.userDetails.birthDate = new Date(currentUser.get('BirthDate'));
            $scope.userDetails.gender = currentUser.get('Gender');
        }
        else {
            $scope.userDetails = angular.copy(CleanUserDetails);
        }
    }
});
