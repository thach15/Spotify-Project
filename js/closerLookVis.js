

class CloserLookVis {

    constructor(_parentElement, _TSdata) {
        this.parentElement = _parentElement;
        this.TSdata = _TSdata;
        this.selectedData = _TSdata
        this.displayData = _TSdata;

        this.TSdata.forEach(d => {
            d.bpm = +d.bpm;
            d["acousticness"] = +d["acousticness"];
            d["danceability"] = +d["danceability"];
            d["energy"] = +d["energy"];
            d["instrumentalness"] = +d["instrumentalness"];
            d["liveness"] = +d["liveness"];
            d["loudness"] = +d["loudness"];
            d["speechiness"] = +d["speechiness"];
            d["valence"] = +d["valence"];
            d["popularity"] = +d["popularity"];
            d["duration_ms"] = +d["duration_ms"];
            // d.release_date = new Date(d.released_year, d.released_month, d.released_day);
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

        vis.displayData.sort((a,b)=> a.release_date - b.release_date)
        // console.log(vis.selectedData)

        vis.displayData = vis.selectedData
            .map(d => d.album)
            .filter((s, i, self) => self.indexOf(s) == i)
            .map(d => {
                return {
                    "album": d,
                    "rows": [],
                    "avgPopularity": 0
                };
            });

        vis.selectedData.forEach(function(d){
            vis.displayData.forEach(function(i){
                if (i.album === d.album) {
                    i.rows.push(d)
                }
            });
        });

        // Calculate average popularity
        vis.displayData.forEach(function(d) {
            let totalPopularity = d.rows.reduce((accum, curr) => accum + curr.popularity, 0);
            d.avgPopularity = totalPopularity / d.rows.length;
        })

        console.log(vis.displayData)

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Update x axis
        let albums = vis.displayData.map(d => d.album).reverse();
        vis.x.domain(albums);
        vis.xAxis.scale(vis.x);
        vis.svg.select(".x-axis")
            .attr("color", "white")
            .call(vis.xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("transform", "rotate(-65)");

        // Update y axis
        vis.y.domain([0,100])
        vis.yAxis.scale(vis.y);
        vis.svg.select(".y-axis").attr("color", "white").call(vis.yAxis);

        // Create line chart
        const line = d3.line()
            .x(function (d) { return vis.x(d.album) })
            .y(function (d) { return vis.y(d.avgPopularity) })
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
            .attr("stroke", "#D7263D")

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
            .attr("cx", d => vis.x(d.album))
            .attr("cy", d => vis.y(d.avgPopularity))
            .attr("r", 5)
            .attr("stroke", "#F46036")
            .attr("fill", "#F46036");
    }

    showInfo(d){
        let vis = this;

        vis.infoBox
            .style("background-color", "#2E294E")
            .style("width", "640px")
            .style("padding", "20px")
            .style("border-radius", "10px");
        vis.infoBox.html("");
        vis.infoBox.append("h3").attr("id", "album-title").text(d.album)
        vis.infoBox.append("div")
            .attr("id", "attributes")


        let danceability = new Attribute("attributes", "danceability", d.rows)
        let acousticness = new Attribute("attributes", "acousticness", d.rows)
        let valence = new Attribute("attributes", "valence", d.rows)
        let speechiness = new Attribute("attributes", "speechiness", d.rows)

        // let tableDiv = vis.infoBox.append("div").attr("id", "songs-list")
        // let infoTable = tableDiv.append("table").attr("class", "table")
        // for (let i = 0; i < d.rows.length; i++) {
        //     console.log(d.rows[i])
        //     let row = infoTable.append("tr")
        //     row.append("td").text(d.rows[i].name)
        // }
    }
}


class Attribute {
    constructor(_parentElement, _attribute, _data) {
        this.parentElement = _parentElement;
        this.attribute = _attribute;
        this.data = _data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 20, right: 20, bottom: 200, left: 20 };

        vis.width = 100 - vis.margin.left - vis.margin.right;
        vis.height = 250 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", 140)
            .attr("height", 320)

        vis.svg.append("rect")
            .attr("x", 20)
            .attr("y", 20)
            .attr("width", 100)
            .attr("height", 250)
            .attr("fill", "black");

        vis.svg.append("text")
            .attr("x", 70)
            .attr("y", 290)
            .style("text-anchor", "middle")
            .text(vis.attribute);

        vis.heightScale = d3.scaleLinear()
            .range([0,250])
            .domain([0,1]);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.avg = vis.data.reduce((accum, curr) => accum + curr[vis.attribute], 0) / vis.data.length;
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        let percentage = d3.format(".0%")

        vis.svg.append("text")
            .attr("x", 70)
            .attr("y", 12)
            .style("text-anchor", "middle")
            .text(percentage(vis.avg))

        vis.svg.append("rect")
            .attr("x", 20)
            .attr("y", 270 - vis.heightScale(vis.avg))
            .attr("width", 100)
            .attr("height", vis.heightScale(vis.avg))
            .attr("fill", "#F46036")
            .transition()
            .duration(500);
    }

}

