var app = angular.module('GroupFuel', ['ui.bootstrap', 'ngRoute', 'ngTable', 'ui.select2', 'nvd3']);

(function() {
	'use strict';
	console.log("app started");

    Parse.initialize("LkuUmj7OE1C9BzsbhkpMZEgeAT1A0ZACqTUZgN2f", "SjAjaVwR56asiH2VYZuY2j44LerSTflgvNTyCnzl");

    // Configure routes for app
    app.config(function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.when('/welcome', {
            controller:'NavigationController',
            templateUrl: 'GroupFuelWeb/app/partials/welcome.html'
        }).when('/usage', {
            controller:'UsageController',
            templateUrl: 'GroupFuelWeb/app/partials/usage.html'
        }).when('/statistics', {
            controller:'StatisticsController',
            templateUrl: 'GroupFuelWeb/app/partials/statistics.html'
        }).when('/mail-report', {
            controller:'MailReportController',
            templateUrl: 'GroupFuelWeb/app/partials/mailreport.html'
        }).when('/about', {
            controller:'UsageController',
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
        }).otherwise({ redirectTo: '/welcome'});
    });

})();