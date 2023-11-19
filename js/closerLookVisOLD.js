

class CloserLookVis {

    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.selectedData = _data;
        this.displayData = _data;

        this.data.forEach(d => {
            d.bpm = +d.bpm;
            d["danceability_%"] = +d["danceability_%"];
            d["energy_%"] = +d["energy_%"];
            d["instrumentalness_%"] = +d["instrumentalness_%"];
            d["valence_%"] = +d["valence_%"];
            d.release_date = new Date(d.released_year, d.released_month, d.released_day);
        })

        this.formatDate = d3.timeFormat("%Y-%m-%d");

        this.artist = "Taylor Swift"

        this.initVis();
    }


    initVis() {
        let vis = this;

        vis.margin = { top: 20, right: 20, bottom: 200, left: 100 };

        vis.width = 800 - vis.margin.left - vis.margin.right;
        vis.height = 650 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.infoBox = d3.select("#info-box").append("div")

        // Initialize scales
        vis.x = d3.scalePoint()
            .rangeRound([0, vis.width]);
        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        // Axes
        vis.xAxis = d3.axisBottom()
            .scale(vis.x);
        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        let yHeight = vis.height - vis.margin.bottom;
        vis.svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + (vis.height) + ")")
            .call(vis.xAxis);

        vis.svg.append("g")
            .attr("class", "axis y-axis")
            .attr("transform", "translate(0, 0)")
            .call(vis.yAxis);

        vis.wrangleData()
    }

    wrangleData() {
        let vis = this;

        vis.selectedData = vis.data.filter((d) => d["artist(s)_name"].includes(vis.artist))
        vis.selectedData.sort((a,b)=> a.release_date - b.release_date)

        vis.displayData = vis.selectedData
            .map(d => d.release_date.getTime())
            .filter((s, i, a) => a.indexOf(s) == i)
            .map(s => {
                let date = new Date(s);
                return {
                    "date": date,
                    "rows": [],
                    "avgStreams": 0,
                };
            });

        // console.log(uniqueDates)

        vis.selectedData.forEach(function(d){
            vis.displayData.forEach(function(i){
                if (i.date.getTime() === d.release_date.getTime()) {
                    i.rows.push(d)
                }
            });
        });

        // Calculate average streams
        vis.displayData.forEach(function(d) {
            let totalStreams = d.rows.reduce((accum, curr) => accum + curr.streams, 0);
            d.avgStreams = totalStreams / d.rows.length;
        })

        console.log(vis.displayData)

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Update x axis
        let uniqueDates = vis.displayData.map(d => vis.formatDate(d.date));
        vis.x.domain(uniqueDates);
        vis.xAxis.scale(vis.x);
        vis.svg.select(".x-axis").call(vis.xAxis);

        // Update y axis
        vis.y.domain([
            d3.min(vis.selectedData, function(d) { return d.streams }),
            d3.max(vis.selectedData, function(d) { return d.streams })
        ])
        vis.yAxis.scale(vis.y);
        vis.svg.select(".y-axis").call(vis.yAxis);

        // Create line chart
        const line = d3.line()
            .x(function (d) { return vis.x(vis.formatDate(d.date)) })
            .y(function (d) { return vis.y(d.avgStreams) })
            .curve(d3.curveLinear);

        vis.lineChart = vis.svg.selectAll(".line")
            .data(vis.displayData)
            .attr("class", "line");

        vis.lineChart.exit().remove();

        vis.lineChart.enter()
            .append("path")
            .merge(vis.lineChart)
            .transition()
            .duration(800)
            .attr("class", "line")
            .attr("d", line(vis.displayData))
            .attr("fill", "none")
            .attr("stroke", "green")

        // Create data point circles
        vis.circles = vis.svg.selectAll(".circles")
            .data(vis.displayData)
            .attr("class", "circles");

        vis.circles.exit().remove();

        vis.circles.enter()
            .append("circle")
            .merge(vis.circles)
            .on("click", (e,d) => vis.showInfo(d))
            .transition()
            .duration(800)
            .attr("class", "circles")
            .attr("cx", d => vis.x(vis.formatDate(d.date)))
            .attr("cy", d => vis.y(d.avgStreams))
            .attr("r", 5)
            .attr("stroke", "black")
            .attr("fill", "green");
    }

    showInfo(d){
        let vis = this;

        vis.infoBox
            .style("background-color", "white")
            .style("width", "350px")
            .style("padding", "20px")
            .style("border-radius", "10px");
        vis.infoBox.html("");
        vis.infoBox.append("h2").text(vis.formatDate(d.date))

        let infoTable = vis.infoBox.append("table").attr("class", "table")
        for (let i = 0; i < d.rows.length; i++) {
            console.log(d.rows[i])
            let row = infoTable.append("tr")
            row.append("td").text(d.rows[i].track_name)
        }
        // for (const property in d) {
        //     if (property !== "EDITION" && property !== "LOCATION") {
        //         let row = infoTable.append("tr")
        //         propertyFormatted = property.toLowerCase().split("_")
        //         for (let i = 0; i < propertyFormatted.length; i++) {
        //             propertyFormatted[i] = propertyFormatted[i][0].toUpperCase() + propertyFormatted[i].substr(1);
        //         }
        //         row.append("th").text(propertyFormatted.join(" ")).attr("scope", "row")
        //         if (property === "YEAR") {
        //             row.append("td").text(formatDate(d[property]))
        //         } else {
        //             row.append("td").text(d[property])
        //         }
        //
        //     }
        // }
    }

}

