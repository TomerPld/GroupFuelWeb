/*
 * UserService.js - Provides data regarding the current user.
 */

app.service('UserService', function ($modal) {
    'use strict';
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
});
