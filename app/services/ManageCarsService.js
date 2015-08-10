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
});
