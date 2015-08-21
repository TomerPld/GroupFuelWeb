app.service('ParameterService', function ($q) {
    'use strict';

    this.getCarModels = function (make) {
        var defer = $q.defer();
        Parse.Cloud.run('getCarModels', {'Make': make}, {
            success: function (results) {
                defer.resolve(results);
            },
            error: function (err) {
                defer.reject(err);
            }
        });
        return defer.promise;
    };

    this.getDistinctFieldFromDB = function (field, table, equalTos) {
        var defer = $q.defer();
        var deferRecursive = $q.defer();
        var retVal = {};

        getTableChunk(0, table, equalTos, [], deferRecursive);
        deferRecursive.promise.then(function (results) {
            for (var result in results) {
                if (retVal[results[result].get(field)] === undefined) {
                    retVal[results[result].get(field)] = true;
                }
            }
            retVal = Object.keys(retVal);
            console.log(retVal);
            defer.resolve(retVal);
        }, function (err) {
            defer.reject(err);
        });
        return defer.promise;
    };

    // Private function, returns a row chunk of a table.
    function getTableChunk (skip, table, equalTos, prevResults, defer) {
        var query = new Parse.Query(table);
        query.limit(1000);
        if (equalTos) {
            for (var item in equalTos) {
                query.equalTo(item.field, item.value);
            }
        }
        query.skip(skip);
        query.find({
            success: function (results) {
                var curResults = results.concat(prevResults);
                if (results.length < 1000) {
                    defer.resolve(curResults);
                }
                else {
                    getTableChunk(skip + 1000, table, equalTos, curResults, defer);
                }
            },
            error: function (err) {
                defer.reject(err);
            }
        });
    }
});