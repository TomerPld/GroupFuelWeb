/*
 * UserService.js - Provides data regarding the current user.
 */

app.service('UserService', function ($modal, $q) {
    'use strict';
    var self = this;
    this.logged = false;
    this.currentUser = Parse.User.current();
    if (this.currentUser) {
        this.logged = true;
    }

    this.doLogin = function () {
        if (this.logged) {
            return;
        }
        var modalInstance = $modal.open({
            templateUrl : 'GroupFuelWeb/app/partials/login.html',
            controller : 'LoginController'
        });
        modalInstance.result.then(
            function (res) {
                // show notification
                console.log(res);
            },
            function (res) {
                console.log(res);
                // show notification
            });
    };

    this.doLogout = function () {
        this.currentUser = Parse.User.logOut();
        if (this.currentUser) {
            // TODO - logout failed
        }
        this.logged = false;
    };

    this.doUpdate = function (userDetails) {
        var defer = $q.defer();
        var currentUser = this.currentUser;
        currentUser.set("username", userDetails.userName);
        currentUser.set("FirstName", userDetails.firstName);
        currentUser.set("LastName", userDetails.lastName);
        currentUser.set("email", userDetails.email);
        currentUser.set("BirthDate", userDetails.birthDate);
        currentUser.set("Gender", userDetails.gender === "male");

        currentUser.save(null, {
            success: function (user) {
                defer.resolve(user);
            },
            error: function (user, err) {
                currentUser = Parse.User.current();
                defer.reject(err);
            }
        });
        return defer.promise;
    };
});
