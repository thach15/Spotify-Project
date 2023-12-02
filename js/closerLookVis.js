
class CloserLookVis {

    constructor(_parentElement, data, artistIndex) {
        this.parentElement = _parentElement;
        this.data = data;
        this.index = artistIndex;

        this.data.forEach(dataset => {
            dataset.artist_data.forEach(d => {
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
            })
        })

        this.formatDate = d3.timeFormat("%Y-%m-%d");

        this.artist = data[artistIndex].artist_name;

        this.initVis();
    }


    initVis() {
        let vis = this;

        vis.margin = { top: 50, right: 20, bottom: 110, left: 60 };

        vis.width = 580 - vis.margin.left - vis.margin.right;
        vis.height = 440 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        document.getElementById("closer-look-title").innerHTML = `A Closer Look: ${this.artist}`;

        vis.infoBox = d3.select("#info-box")
            .append("div")
            .attr("id", "info");

        vis.infoBox
            .append("div")
            .text("Click on the dots to learn about an album!")
            .style("margin-top", "170px")

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

        // Add y-axis label
        vis.svg.append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -vis.height / 2)
            .attr("y", -30)
            .style("text-anchor", "middle")
            .text("Popularity");

        vis.wrangleData()
    }

    wrangleData() {
        let vis = this;

        document.getElementById('closer-look-title').innerHTML = `A Closer Look: ${vis.data[vis.index].artist_name}`;
        vis.selectedData = vis.data[vis.index].artist_data;
        console.log(vis.selectedData);

        vis.selectedData.sort((a,b)=> a.release_date - b.release_date)

        vis.displayData = vis.selectedData
            .map(d => d.album)
            .filter((s, i, self) => self.indexOf(s) == i)
            .map(d => {
                return {
                    "album": d,
                    "rows": [],
                    "avgPopularity": 0,
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

        console.log("display data", vis.displayData)

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Function to truncate long text
        let wrap = function() {
            var self = d3.select(this),
                textLength = self.node().getComputedTextLength(),
                text = self.text();
            while (textLength > (130) && text.length > 0) {
                text = text.slice(0, -1);
                self.text(text + '...');
                textLength = self.node().getComputedTextLength();
            }
        };

        // Update x axis
        let albums = vis.displayData.map(d => d.album).reverse();
        vis.x.domain(albums);
        vis.xAxis.scale(vis.x);
        vis.svg.select(".x-axis")
            .attr("color", "white")
            .call(vis.xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("transform", "rotate(-45)")
            .each(wrap);

        // Update y axis
        vis.y.domain([0,100])
        vis.yAxis.scale(vis.y);
        vis.svg.select(".y-axis").attr("color", "white").call(vis.yAxis);

        // Create line chart
        const line = d3.line()
            .x(function (d) { return vis.x(d.album) })
            .y(function (d) { return vis.y(d.avgPopularity) })
            .curve(d3.curveLinear);

        vis.lineChart = vis.svg.selectAll(".line-chart")
            .data([vis.displayData]);

        vis.lineChart.exit().remove();

        vis.lineChart.enter()
            .append("path")
            .merge(vis.lineChart)
            .transition()
            .duration(800)
            .attr("class", "line-chart")
            .attr("d", line(vis.displayData))
            .attr("fill", "none")
            .attr("stroke", "#DB5461")
            .attr("stroke-width", 4);

        // Create data point circles
        vis.circles = vis.svg.selectAll(".circles")
            .data(vis.displayData);

        vis.circles.exit().remove();

        let highlightedCircle = d3.select(null);

        vis.circles.enter()
            .append("circle")
            .merge(vis.circles)
            .on("click", function(e,d) {
                highlightedCircle.transition().duration(300).attr("fill", "#d1e08a").attr("stroke", "#d1e08a").attr("r", 5);
                highlightedCircle = d3.select(this);
                highlightedCircle.transition().duration(300).attr("fill", "white").attr("stroke", "white").attr("r", 8);
                vis.showInfo(d);
            })
            .transition()
            .duration(800)
            .attr("class", "circles")
            .attr("cx", d => vis.x(d.album))
            .attr("cy", d => vis.y(d.avgPopularity))
            .attr("r", 5)
            .attr("stroke", "#d1e08a")
            .attr("fill", "#d1e08a");
    }

    showInfo(d){
        let vis = this;

        vis.height = 300 - vis.margin.top - vis.margin.bottom;
        vis.svg.attr("height", vis.height + vis.margin.top + vis.margin.bottom);

        vis.infoBox.style("background-color", "#593C8F")
        vis.infoBox.html("");
        let left = vis.infoBox.append("div").attr("class", "col").style("margin-left", "10px");
        let right = vis.infoBox.append("div").attr("class", "col").attr("id", "attributes");

        left.append("h3").attr("id", "album-title").text(d.album)
        left.append("img").attr("src", d.rows[0].images[1].url).attr("height", 250)
        left.append("p").attr("class", "album-info").text(`Release Date: ${d.rows[0].release_date}`)
        console.log(d.rows[0])

        let danceability = new Attribute("attributes", "danceability", d.rows)
        let acousticness = new Attribute("attributes", "acousticness", d.rows)
        let valence = new Attribute("attributes", "valence", d.rows)
        let energy = new Attribute("attributes", "energy", d.rows)
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

        vis.margin = { top: 35, right: 15, bottom: 35, left: 15 };

        vis.width = 80 - vis.margin.left - vis.margin.right;
        vis.height = 200 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)

        vis.svg.append("rect")
            .attr("x", vis.margin.left)
            .attr("y", vis.margin.top)
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr("fill", "black");

        vis.svg.append("text")
            .attr("x", vis.margin.left + vis.width / 2)
            .attr("y", vis.height + vis.margin.top + vis.margin.bottom - 15)
            .attr("font-size", 12)
            .style("text-anchor", "middle")
            .text(vis.attribute);

        vis.heightScale = d3.scaleLinear()
            .range([0,vis.height])
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
            .attr("x", vis.margin.left + vis.width / 2)
            .attr("y", 27)
            .style("text-anchor", "middle")
            .text(percentage(vis.avg))

        vis.svg.append("rect")
            .attr("x", vis.margin.left)
            .attr("y", vis.height + vis.margin.top - vis.heightScale(vis.avg))
            .attr("width", vis.width)
            .attr("height", vis.heightScale(vis.avg))
            .attr("fill", "#d1e08a")
            .transition()
            .duration(500);
    }

}

