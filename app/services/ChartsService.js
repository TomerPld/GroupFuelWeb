app.service('ChartsService', function ($q, Fueling, Car) {
    'use strict';

    var self = this;

    function pieDataItem(value, label) {
        var r = randomRgba();
        var g = randomRgba();
        var b = randomRgba();
        var color = [r,g,b,1].join(',');
        this.value = value;
        this.color = 'rgba(' + color + ')';
        this.hightlight = color;
        this.label = label;
    }

    function lineDataItem(label, data) {
        var r = randomRgba();
        var g = randomRgba();
        var b = randomRgba();
        var color = [r,g,b,1].join(',');
        var background = [r,g,b,0.2].join(',');
        this.label = label;
        this.fillColor = 'rgba(' + background + ')';
        this.strokeColor = 'rgba(' + color + ')';
        this.pointColor = 'rgba(' + color + ')';
        this.pointStrokeColor = '#fff';
        this.pointHighlightFill = '#fff';
        this.pointHighlightStroke = 'rgba(' + color + ')';
        this.data = data;
    }

    this.pieOptions = {
        responsive: true,
        segmentShowStroke : true,
        segmentStrokeColor : '#fff',
        segmentStrokeWidth : 2,
        percentageInnerCutout : 0,
        animationSteps : 100,
        animationEasing : 'easeOutBounce',
        animateRotate : true,
        animateScale : false,
        legendTemplate : '<ul class="tc-chart-js-legend"><% for (var i=0; i<segments.length; i++){%><li><span style="background-color:<%=segments[i].fillColor%>"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>'
    };

    this.lineOptions =  {
        responsive: true,
        scaleShowGridLines : true,
        scaleGridLineColor : "rgba(0,0,0,.05)",
        scaleGridLineWidth : 1,
        bezierCurve : true,
        bezierCurveTension : 0.4,
        pointDot : true,
        pointDotRadius : 4,
        pointDotStrokeWidth : 1,
        pointHitDetectionRadius : 20,
        datasetStroke : true,
        datasetStrokeWidth : 2,
        datasetFill : true,
        percentageInnerCutout : 70,
        onAnimationProgress: function(){},
        onAnimationComplete: function(){},
        legendTemplate : '<ul class="tc-chart-js-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'
    };

    this.lastSixMonths = lastSixMonths();

    var calcFuelPerCar = function (data) {
        var fpc = [];
        for (var index in data) {
            fpc.push(new pieDataItem(data[index].totalAmount, data[index].carName));
        }
        return fpc;
    };

    var calcMoneyPerCar = function (data) {
        var mpc = [];
        for (var index in data) {
            mpc.push(new pieDataItem(data[index].totalPrice, data[index].carName));
        }
        return mpc;
    };

    var calcKmPerLiter = function (data) {
        var kpl = [];
        for (var index in data) {
            if (data[index].totalAmount > 0) {
                kpl.push(new pieDataItem((data[index].currentMileage - data[index].startingMileage)/data[index].totalAmount, data[index].carName));
            }
        }
        return kpl;
    };

    this.pieCharts = {
        fuelPerCar: calcFuelPerCar,
        moneyPerCar: calcMoneyPerCar,
        kmPerLiter: calcKmPerLiter
    };

    var calcFuelPerMonth = function (fuelList, carDict) {
        var resultDict = {};
        for (var id in carDict) {
            resultDict[carDict[id].CarNumber] = {};
        }
        fuelList.map(function (event) {
            var carData = resultDict[event.CarNumber];
            if (carData !== undefined) {
                var month = event.LogDate.split(' ')[1];
                if (self.lastSixMonths.indexOf(month) > -1) {
                    if (carData[month] === undefined) {
                        carData[month] = event.Amount;
                    }
                    else {
                        carData[month] = carData[month] + event.Amount;
                    }
                }
            }
        });
        var lineChartData = [];
        for (var key in resultDict) {
            var label = getCarName(key, carDict);
            var item = resultDict[key];
            var monthlyUsage = [];
            for (var month in self.lastSixMonths) {
                item[self.lastSixMonths[month]] || (item[self.lastSixMonths[month]] = 0);
                monthlyUsage.push(item[self.lastSixMonths[month]]);
            }
            lineChartData.push(new lineDataItem(label, monthlyUsage));
        }
        return lineChartData;
    };

    var calcMoneyPerMonth = function (fuelList) {
        var resultDict = {};
        for (var id in carDict) {
            resultDict[carDict[id].CarNumber] = {};
        }
        fuelList.map(function (event) {
            var carData = resultDict[event.CarNumber];
            if (carData !== undefined) {
                var month = event.LogDate.split(' ')[1];
                if (self.lastSixMonths.indexOf(month) > -1) {
                    if (carData[month] === undefined) {
                        carData[month] = event.Price;
                    }
                    else {
                        carData[month] = carData[month] + event.Price;
                    }
                }
            }
        });
        var lineChartData = [];
        for (var key in resultDict) {
            var label = getCarName(key, carDict);
            var item = resultDict[key];
            var monthlyUsage = [];
            for (var month in self.lastSixMonths) {
                item[self.lastSixMonths[month]] || (item[self.lastSixMonths[month]] = 0);
                monthlyUsage.push(item[self.lastSixMonths[month]]);
            }
            lineChartData.push(new lineDataItem(label,  monthlyUsage));
        }
        return lineChartData;
    };

    this.lineCharts = {
        fuelPerMonth: calcFuelPerMonth,
        moneyPerMonth: calcMoneyPerMonth
    };

    function lastSixMonths () {
        var d = new Date();
        var last6 = [];
        for (var i = 0; i < 6; i++) {
            last6.push(d.getShortMonthName());
            d.setMonth(d.getMonth()-1);
        }
        return last6.reverse();
    }

    function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function randomRgba () {
        return Math.floor(Math.random() * 256);
    }

    function getCarName(carNumber, carDict) {
        for (var car in carDict) {
            if (carDict[car].CarNumber == carNumber) {
                return carDict[car].CarName;
            }
        }
        return "";
    }
});
