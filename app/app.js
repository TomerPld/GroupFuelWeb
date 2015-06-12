var app = angular.module('GroupFuel', ['ui.bootstrap', 'ngRoute', 'ngTable', 'ui.select2', 'nvd3', 'cgBusy']);

(function () {
    'use strict';
    console.log("app started");

    Parse.initialize("LkuUmj7OE1C9BzsbhkpMZEgeAT1A0ZACqTUZgN2f", "SjAjaVwR56asiH2VYZuY2j44LerSTflgvNTyCnzl");

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
            return car.get("CarNumber")
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
        Car.prototype.__defineGetter__("Make", function () {
            var model = this.get("Model");
            return model.get("Make")
        });
        Car.prototype.__defineGetter__("Model", function () {
            var model = this.get("Model");
            return model.get("Model")
        });
        Car.prototype.__defineGetter__("Year", function () {
            var model = this.get("Model");
            return model.get("Year")
        });
        return Car;
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