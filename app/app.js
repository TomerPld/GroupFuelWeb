var app = angular.module('GroupFuel', ['ui.bootstrap', 'ngRoute', 'ngTable', 'ui.select2', 'tc.chartjs', 'ngMap']);

(function () {
    'use strict';

    Parse.initialize("LkuUmj7OE1C9BzsbhkpMZEgeAT1A0ZACqTUZgN2f", "SjAjaVwR56asiH2VYZuY2j44LerSTflgvNTyCnzl");

    Date.prototype.monthNames = [
        "January", "February", "March",
        "April", "May", "June",
        "July", "August", "September",
        "October", "November", "December"
    ];

    Date.prototype.getMonthName = function() {
        return this.monthNames[this.getMonth()];
    };

    Date.prototype.getShortMonthName = function () {
        return this.getMonthName().substr(0, 3);
    };

    app.factory('CarModel', function () {
        var CarModel = Parse.Object.extend("CarModel");

        CarModel.prototype.__defineGetter__("Make", function () {
            return this.get("Make");
        });

        CarModel.prototype.__defineGetter__("Model", function () {
            return this.get("Model");
        });

        CarModel.prototype.__defineGetter__("Year", function () {
            return this.get("Year");
        });

        CarModel.prototype.__defineGetter__("Volume", function () {
            return this.get("Volume");
        });

        CarModel.prototype.__defineGetter__("Gear", function () {
            return this.get("Gear");
        });

        CarModel.prototype.__defineGetter__("FuelType", function () {
            return this.get("FuelType");
        });

        CarModel.prototype.__defineGetter__("Name", function () {
            return this.get("Make") + ' ' + this.get("Model");
        });

        return CarModel;
    });

    app.factory('Fueling', function () {
        var Fueling = Parse.Object.extend("Fueling");

        Fueling.prototype.__defineGetter__("Amount", function () {
            return this.get("Amount");
        });
        Fueling.prototype.__defineGetter__("FuelType", function () {
            return this.get("FuelType");
        });
        Fueling.prototype.__defineGetter__("Price", function () {
            return this.get("Price");
        });
        Fueling.prototype.__defineGetter__("LogDate", function () {
            var logDate = new Date(this.createdAt);
            return logDate.toDateString();
        });
        Fueling.prototype.__defineGetter__("CarNumber", function () {
            var car = this.get("Car");
            if (car === undefined) {
                return 'unknown';
            }
            return car.get("CarNumber");
        });
        Fueling.prototype.__defineGetter__("UserName", function () {
            var user = this.get("User");
            return user.get("username");
        });
        Fueling.prototype.__defineGetter__("GasStationLoc", function () {
            var gsl = this.get("GasStation");
            if (gsl === undefined) {
                return undefined;
            }
            var geo = gsl.get("Location");
            if (geo == undefined) {
                return undefined;
            }
            return String(geo.latitude) + ', ' + String(geo.longitude);
        });
        return Fueling;
    });

    app.factory('Car', function () {
        var Car = Parse.Object.extend("Car");

        Car.prototype.__defineGetter__("CarNumber", function () {
            return this.get("CarNumber");
        });

        Car.prototype.__defineGetter__("Mileage", function () {
            return this.get("Mileage");
        });

        Car.prototype.__defineGetter__("InitialMileage", function () {
            return this.get("InitialMileage");
        });

        Car.prototype.__defineGetter__("FuelEvents", function () {
            return this.get("FuelEvents");
        });

        Car.prototype.__defineGetter__("Make", function () {
            var model = this.get("Model");
            if (model === undefined) {
                console.log('model is undefined');
                return undefined;
            }
            return model.get("Make");
        });

        Car.prototype.__defineGetter__("Model", function () {
            var model = this.get("Model");
            if (model === undefined) {
                console.log('model is undefined');
                return undefined;
            }
            return model.get("Model");
        });

        Car.prototype.__defineGetter__("Year", function () {
            var model = this.get("Model");
            return model.get("Year");
        });

        Car.prototype.__defineGetter__("CarName", function () {
            var model = this.get("Model");
            return model.get("Make") + ' ' + model.get("Model");
        });

        return Car;
    });

    app.factory('User', function() {
        var User = Parse.Object.extend("User");
        User.prototype.__defineGetter__("FirstName", function() {
            return this.get("FirstName");
        });

        User.prototype.__defineGetter__("LastName", function() {
            return this.get("LastName");
        });

        User.prototype.__defineGetter__("email", function() {
            return this.get("email");
        });

        return User;
    });

    app.filter('unique', function() {
        return function(collection, keyname) {
            var output = [],
                keys = [];

            angular.forEach(collection, function(item) {
                var key = item[keyname];
                if(keys.indexOf(key) === -1) {
                    keys.push(key);
                    output.push(item);
                }
            });

            return output;
        };
    });

    app.filter('kmPerLiter', function() {
        return function(item) {
            if (!item.amount && !item.totalAmount) {
                return 'No data';
            }
            if (item.amount) {
                var retVal = Number(item.totalMileage / item.amount).toFixed(2);
            }
            else {
                var retVal = Number((item.currentMileage - item.startingMileage) / item.totalAmount).toFixed(2);
            }
            return retVal;
        };
    });

    app.filter('kmPerDollar', function() {
        return function(item) {
            if (!item.price && !item.totalPrice) {
                return 'No data';
            }
            if (item.amount) {
                var retVal = Number(item.totalMileage / item.price).toFixed(2);
            }
            else {
                var retVal = Number((item.currentMileage - item.startingMileage) / item.totalPrice).toFixed(2);
            }
            return retVal;
        };
    });

    app.filter('noData', function() {
        return function(item) {
            if (!item) {
                return 'No data';
            }
            return item;
        };
    });

// Configure routes for app
    app.config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.when('/welcome', {
            controller: 'NavigationController',
            templateUrl: 'GroupFuelWeb/app/partials/welcome.html'
        }).when('/usage', {
            controller: 'UsageController',
            templateUrl: 'GroupFuelWeb/app/partials/usage.html'
        }).when('/statistics', {
            controller: 'StatisticsController',
            templateUrl: 'GroupFuelWeb/app/partials/statistics.html'
        }).when('/mail-report', {
            controller: 'MailReportController',
            templateUrl: 'GroupFuelWeb/app/partials/mailreport.html'
        }).when('/about', {
            controller: 'UsageController',
            templateUrl: 'GroupFuelWeb/app/partials/about.html'
        }).when('/signup', {
            controller: 'SignupController',
            templateUrl: 'GroupFuelWeb/app/partials/signup.html'
        }).when('/manage-cars', {
            controller: 'ManageCarsController',
            templateUrl: 'GroupFuelWeb/app/partials/managecars.html'
        }).when('/edit-profile', {
            controller: 'EditProfileController',
            templateUrl: 'GroupFuelWeb/app/partials/editprofile.html'
        }).otherwise({redirectTo: '/welcome'});
    });

})();

/*function bindParseObject(name, reqGetters, reqSetters) {
    var Obj = Parse.Object.extend(name);
    if (reqGetters !== undefined) {
        for (var i = 0; i < reqGetters.length; i++) {
            Obj.prototype.__defineGetter__(reqGetters[i], function () {
                return this.get(reqGetters[i]);
            });
        }
    }
    if (reqSetters !== undefined) {
        for (var i = 0; i < reqGetters.length; i++) {
            Obj.prototype.__defineSetter__(reqSetters[i], function (aValue) {
                return this.set(reqSetters[i], aValue);
            });
        }
    }
    return Obj;
}*/