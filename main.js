/*  Main javascript for index.html
    created by: John Manser
    Date:       19/3/19
    Updated:    19/3/19
*/



function LoadData() {

    var inputYear = 1945;
    var year = [];

    d3.csv("PopulationDataLast30.csv")
        .then(function (population) {

            console.log(population);
            var populationData = updateData(population, inputYear);
            var growth = updateGrowth(population, inputYear);
            var popPercent = updatePopulation(population, inputYear);

            chart(populationData, growth, popPercent);

            for (var i = 0; i < population.length; i++) {
                year.push(population[i].Year);
            }

            d3.select("#timeslide").on("input", function () {
                update(+this.value, populationData);
                var populationData = updateData(population, inputYear);
                var growth = updateGrowth(population, inputYear);
                var popPercent = updatePopulation(population, inputYear);
                chart(populationData, growth, popPercent);
                //console.log(inputYear);
            });
        })
        .catch(function (error) {
            console.log(error);
        });
}

function update(value) {
    document.getElementById("range").innerHTML = year[value];
    inputYear = year[value];
    //chart(population);

}

function chart(dataset, growth, popPercent) {

    //console.log(dataset);

    var chartDiv = document.getElementById("content");
    var w = chartDiv.clientWidth;
    var h = chartDiv.clientHeight;
    var state = ["NSW", "VIC", "SA", "QLD", "WA", "TAS", "NT", "ACT"];


    var yScale = d3.scaleBand()
        .domain(d3.range(growth.length))
        .rangeRound([0, w / 8])
        .paddingInner(0.05);

    var xScale = d3.scaleLinear()
        .domain([0, d3.max(growth)])
        .range([0, 30]);

    // Define map projection as Albers
    var projection = d3.geoAlbers()
        .center([5, 10])
        .scale(w * 0.7)
        .rotate([230, 40])
        .translate([w / 2, h / 2]);

    // Define color scale
    var color = d3.scaleThreshold()
        .domain([1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000])
        .range(['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#0c2c84']);

    var colorGrowth = d3.scaleThreshold()
        .domain([0, 1, 2, 3, 4])
        .range(['#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#4a1486']);

    // Clear existing output
    d3.selectAll("svg > *").remove();

    var svg = d3.select("#visual").append("svg").attr("width", w).attr("height", h).attr("fill", "grey");
    // Generate Path
    var path = d3.geoPath().projection(projection);

    // Load map data
    d3.json("map.geojson", function (error, geoData) {
        if (error) {
            console.error(error);
        }
        //console.log(geoData);

        for (var i = 0; i < dataset.length; i++) {

            for (var j = 0; j < geoData.features.length; j++) {

                geoData.features[j].properties.value = dataset[j];

            }
        }
        svg.selectAll("path")
            .data(geoData.features)
            .enter()
            .append("path")
            .attr("stroke", "#333")
            .attr("d", path)
            .style("fill", function (d) {
                return color(d.properties.value);
            });

        var pop = svg.selectAll("g").data(dataset);

        pop.enter()
            .append("text")
            .attr('y', function (d, i) {
                return yScale(i) + h * 0.02;
            })
            .attr('x', 0)
            .text(function (d, i) {
                return state[i];
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "15px");

        pop.enter()
            .append("text")
            .attr('y', function (d, i) {
                return yScale(i) + h * 0.02;
            })
            .attr('x', 50)
            .text(function (d, i) {
                return d;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "15px");

        pop.enter()
            .append("text")
            .attr('y', function (d, i) {
                return yScale(i) + h * 0.02;
            })
            .attr('x', 130)
            .text(function (d, i) {
                return d3.format(",.0f")(popPercent[i] * 100) + '%';
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "15px");
    });

    var leg_h = 20, leg_w = 20;

    // Draw growth Bars
    var bars = svg.selectAll("rect").data(growth);

    bars.enter()
        .append("rect")
        .attr("x", 40)
        .attr('y', function (d, i) {
            return yScale(i) + h * 0.3;
        })
        .attr("height", yScale.bandwidth())
        .attr("width", function (d) {
            return xScale(d);
        })
        .style("fill", function (d, i) {
            return colorGrowth(d);
        });

    bars.enter()
        .append("text")
        .attr('y', function (d, i) {
            return yScale(i) + h * 0.32;
        })
        .attr('x', 0)
        .text(function (d, i) {
            return state[i];
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "15px");

    bars.enter()
        .append("text")
        .attr('y', function (d, i) {
            return yScale(i) + h * 0.32;
        })
        .attr('x', function (d, i) {
            return xScale(d) + 45;
        })
        .text(function (d, i) {
            return growth[i] + "%";
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "15px");

    // Add Legend

    var legend = svg.selectAll("g").data([0, 1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000]);

    var labels = ["0 - 1 million", "1 - 2 million", "2 - 3 million", "3 - 4 million", "4 - 5 million", "5 - 6 million", "6 - 7 million", "7 - 8 million"]

    var leg_h = 20, leg_w = 20;

    legend.enter()
        .append("rect")
        .attr("x", w * 0.75)
        .attr('y', function (d, i) {
            return yScale(i);
        })
        .attr("width", leg_w)
        .attr("height", yScale.bandwidth())
        .style("fill", function (d) {
            return color(d);
        });

    legend.enter()
        .append("text")
        .attr("x", w * 0.77)
        .attr('y', function (d, i) {
            return yScale(i) + leg_h * 0.8;
        })
        .attr("width", (leg_w))
        .attr("height", leg_h)
        .text(function (d, i) {
            return labels[i];
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "15px");
}

function updateData(population, inputYear) {

    var dataset = [];

    for (var i = 0; i < population.length; i++) {
        if (population[i].Year == inputYear) {
            dataset.push(parseFloat(population[i].NSW));
            dataset.push(parseFloat(population[i].VIC));
            dataset.push(parseFloat(population[i].QLD));
            dataset.push(parseFloat(population[i].SA));
            dataset.push(parseFloat(population[i].WA));
            dataset.push(parseFloat(population[i].TAS));
            dataset.push(parseFloat(population[i].NT));
            dataset.push(parseFloat(population[i].ACT));

        }
    }
    //console.log(growth);
    return dataset;

}

function updateGrowth(population, inputYear) {

    var growth = [];

    for (var i = 0; i < population.length; i++) {
        if (population[i].Year == inputYear) {

            growth.push(parseFloat(population[i].NSWg));
            growth.push(parseFloat(population[i].VICg));
            growth.push(parseFloat(population[i].QLDg));
            growth.push(parseFloat(population[i].SAg));
            growth.push(parseFloat(population[i].WAg));
            growth.push(parseFloat(population[i].TASg));
            growth.push(parseFloat(population[i].NTg));
            growth.push(parseFloat(population[i].ACTg));
        }
    }
    //console.log(growth);
    return growth;

}

function updatePopulation(population, inputYear) {

    var dataset = [];

    for (var i = 0; i < population.length; i++) {
        if (population[i].Year == inputYear) {

            dataset.push(parseFloat(population[i].NSWp));
            dataset.push(parseFloat(population[i].VICp));
            dataset.push(parseFloat(population[i].QLDp));
            dataset.push(parseFloat(population[i].SAp));
            dataset.push(parseFloat(population[i].WAp));
            dataset.push(parseFloat(population[i].TASp));
            dataset.push(parseFloat(population[i].NTp));
            dataset.push(parseFloat(population[i].ACTp));
        }
    }
    //console.log(growth);
    return dataset;

}

function init() {

    LoadData();

}

window.onload = init;