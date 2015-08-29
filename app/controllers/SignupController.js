app.controller('SignupController', function ($scope, $location, UserService, ngNotify) {
    'use strict';

    var CleanUserDetails = {
        userName: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        repeatPassword: "",
        gender: "",
        birthDate: ""
    };

    (function () {
        $scope.signupDetails = angular.copy(CleanUserDetails);
        $scope.UserService = UserService;
        if ($scope.UserService.logged) {
            $location.url('/welcome');
        }
        $scope.datepickers = {
            'minDate': '1900-01-01',
            'maxDate': '2099-12-31',
            'birthDateOpened': false
        };
        $scope.openBirthDate = function () {
            $scope.datepickers.birthDateOpened = !$scope.datepickers.birthDateOpened;
        };
    })();

    // TODO - move doSignUp server call to userservice.js
    $scope.doSignUp = function () {
        var details = $scope.signupDetails;
        if (details.userName === "" || details.firstName === "" || details.lastName === "" ||
            details.email === "" || details.password === "" || details.repeatPassword === "") {
            ngNotify.set('Incomplete form.', {
                type: 'warning',
                position: 'top',
                duration: 2000
            });
            return;
        }
        if (details.password != details.repeatPassword) {
            ngNotify.set('Error: repeated password does not match.', {
                type: 'error',
                position: 'top',
                duration: 2000
            });
            return;
        }
        var newUser = new Parse.User();
        //TODO check email regexp // password logic
        newUser.set("username", details.userName);
        newUser.set("password", details.password);
        newUser.set("email", details.email);
        newUser.set("FirstName", details.firstName);
        newUser.set("LastName", details.lastName);
        newUser.set("Gender", details.gender === "true");
        newUser.set("BirthDate", details.birthDate);
        newUser.signUp(null, {
            success: function (user) {
                ngNotify.set('Welcome to GroupFuel :)', {
                    type: 'info',
                    position: 'top',
                    duration: 2000
                });
                $scope.UserService.logged = true;
                $scope.$apply(function () {
                    $location.url('/welcome');
                });
            },
            error: function (user, error) {
                ngNotify.set('Error: failed to sign up.', {
                    type: 'error',
                    position: 'top',
                    duration: 2000
                });
            }
        });
    }
});