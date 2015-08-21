app.service('StatisticsService', function ($q, Car, Fueling) {
    'use strict';

    this.getStats = function (models) {
        var deferred = $q.defer();
        var modelsStats = {};
        var modelPromises = [];
        for (var k = 0; k < models.length; k++) {
            modelPromises.push(modelQuery(models[k]));
        }
        $q.all(modelPromises).then(function (results) {
            var statsPromises = [];
            for (var result in results) {
                var model = results[result];
                if (model.length === 0) {
                    continue;
                }

                // each result is all the cars of a specific model
                var modelId = model[0].get("Model").id;
                var totalMileage = 0;
                var numOfCars = model.length;
                var fuelEvents = [];
                for (var index in model) {
                    var car = model[index];
                    totalMileage += car.Mileage - car.InitialMileage;
                    if (car.FuelEvents) {
                        fuelEvents = fuelEvents.concat(car.FuelEvents);
                    }
                }
                if (fuelEvents.length > 0) {
                    statsPromises.push(getModelStats (modelId, totalMileage, numOfCars, fuelEvents));
                }
            }
            $q.all(statsPromises).then(function (stats) {
                for (var item in stats) {
                    modelsStats[stats[item].id] = stats[item];
                }
                deferred.resolve(modelsStats);
            });
        });

        return deferred.promise;
    };


    // helper function, returns all the car object of a model.
    function modelQuery (modelId) {
        var pointer = {
            '__type': 'Pointer',
            'className': 'CarModel',
            'objectId': modelId
        };
        var deferred = $q.defer();
        var query = new Parse.Query("Car");
        query.limit(1000);
        query.equalTo("Model", pointer);
        query.include("Model");
        query.find({
            success: function (results) {
                deferred.resolve(results);
            },
            error: function (err) {
                deferred.reject(new Error(err));
            }
        });

        return deferred.promise;
    }

    function getModelStats (modelId, totalMileage, numOfCars, fuelEvents) {
        var deferred = $q.defer();
        console.log(numOfCars);
        Parse.Object.fetchAll(fuelEvents, {
            success: function (events) {
                var retVal = {
                    id: modelId,
                    totalMileage: totalMileage,
                    numOfEvents: fuelEvents.length,
                    numOfCars: numOfCars,
                    price: 0,
                    amount: 0
                };
                for (var event in events) {
                    retVal.price += events[event].Price;
                    retVal.amount += events[event].Amount;
                }
                deferred.resolve(retVal);
            },
            error: function (err) {
                deferred.reject(new Error(err));
            }
        });

        return deferred.promise;
    }

});

