/**
 * Created by matansab on 8/10/2015.
 */

app.service('ManageCarsService', function ($q) {
    'use strict';

    this.updateOwnedCars = function () {
        var defer = $q.defer();
        Parse.Cloud.run('getOwnedCars', {}, {
            success: function (results) {
                defer.resolve(results);
            },
            error: function (err) {
                defer.reject(err);
            }
        });
        return defer.promise;
    };

    this.updateDrivingCars = function () {
        var defer = $q.defer();
        Parse.Cloud.run('getDrivingCars', {}, {
            success: function (results) {
                defer.resolve(results);
            },
            error: function (err) {
                defer.reject(err);
            }
        });
        return defer.promise;
    };

    this.removeCar = function (carNumber) {
        var defer = $q.defer();
        Parse.Cloud.run('removeCar', {'carNumber': carNumber}, {
            success: function (results) {
                defer.resolve(results);
            },
            error: function (err) {
                defer.reject(err);
            }
        });
        return defer.promise;
    };

    this.addDriver = function (carNumber, email) {
        var defer = $q.defer();
        Parse.Cloud.run('addDriver', {'carNumber': carNumber, 'email': email}, {
            success: function (results) {
                defer.resolve(results);
            },
            error: function (err) {
                defer.reject(err);
            }
        });
        return defer.promise;
    };

    this.showDrivers = function (carNumber) {
        var defer = $q.defer();
        Parse.Cloud.run('getCarDrivers', {'carNumber': carNumber}, {
            success: function (results) {
                defer.resolve(results);
            },
            error: function (err) {
                defer.reject(err);
            }
        });
        return defer.promise;
    };

    this.removeDriver = function (carNumber, email) {
        var defer = $q.defer();
        Parse.Cloud.run('removeDriver', {'carNumber': carNumber, 'email': email}, {
            success: function (results) {
                defer.resolve(results);
            },
            error: function () {
                defer.reject(results);
            }
        });
        return defer.promise;
    };

    this.getCarMakes = function () {
        var defer = $q.defer();

        Parse.Cloud.run('getCarMakes', {}, {
            success: function (results) {
                defer.resolve(results);
            },
            error: function (err) {
                defer.reject(err);
            }
        });
        return defer.promise;
    };

});
