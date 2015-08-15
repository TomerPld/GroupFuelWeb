/**
 * Created by Tomer on 09/04/2015.
 */
app.service('UsageService', function ($q){
   'use strict';

    this.getFuelEvents = function (user, skip) {
        var defer = $q.defer();
        var query = new Parse.Query("Fueling");
        query.equalTo("User", user);
        query.include("Car");
        query.include("User");
        query.include("GasStation")
        query.limit(1000);
        query.skip(skip);
        query.find({
            success: function (results) {
                defer.resolve(results);
            },
            error: function (err) {
                defer.reject(err);
            }
        });
        return defer.promise;
    };

    this.getUsage = function (userCars) {
        var defer = $q.defer();
        var cars = [];
        Object.keys(userCars).forEach(function (key) {
            var value = userCars[key];
            if (value.marked) {
                var carPointer = {"__type":"Pointer","className":"Car","objectId":key};
                cars.push(carPointer);
            }
        });
        Parse.Cloud.run('getUsage', {'cars': cars}, {
            success: function (result) {
                var usage = [];
                Object.keys(result).forEach(function (key){
                    var value = result[key];
                    value.carName = key;
                    if (key != 'total') {
                        value.carName = userCars[key].Make + " " + userCars[key].Model;
                    }
                    usage.push(value);
                });
                defer.resolve(usage);
            },
            error: function (err) {
                defer.reject(err);
            }
        });
        return defer.promise;
    };

    this.getCars = function () {
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
});