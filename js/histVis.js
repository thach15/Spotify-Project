class HistVis {

    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        //this.formElement = _formElement;
        this.data = _data;
        this.data.forEach(d => {
            d.duration_ms = +d.duration_ms / 60000;
            d.year = + d.year;
        })
        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 200, left: 60};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 500;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


        // Add a slider event listener
        d3.select("#yearRange").on("input", function() {
            // Get the selected year from the slider
            vis.selectedYear = +this.value;

            // Update the visualization based on the selected year
            vis.wrangleData();

        });

        // Add axis groups
        vis.svg.append("g")
            .attr("class", "axis axis-y")

        vis.svg.append("g")
            .attr("class", "axis axis-x")

        // Add x-axis label
        vis.svg.append("text")
            .attr("class", "x-axis-label")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + vis.margin.top + 40) // Adjust the y-position as needed
            .style("text-anchor", "middle")
            .text("Duration (in milliseconds)");

        // Add y-axis label
        vis.svg.append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -vis.height / 2)
            .attr("y", -30)
            .style("text-anchor", "middle")
            .text("Frequency");

        vis.wrangleData();

    }

    wrangleData() {
        let vis = this;

        if (vis.selectedYear === undefined){
            vis.selectedYear = 1999;
        }

        //console.log("selected year", vis.selectedYear);

        vis.displayData = vis.data;
        vis.displayData = vis.displayData.filter(d => d.year === vis.selectedYear);

        // console.log("filtered", vis.displayData);

        vis.updateVis();


    }

    updateVis() {
        let vis = this;
        //console.log(d3.max(vis.displayData, function(d){return d.duration_ms}))
        vis.x = d3.scaleLinear()
            .domain([d3.min(vis.displayData, function(d){return d.duration_ms}), d3.max(vis.displayData, function(d){return d.duration_ms})])
            .range([0, vis.width]);

        vis.histogram = d3.histogram()
            .value(function(d) { return d.duration_ms; })
            .domain(vis.x.domain())
            .thresholds(vis.x.ticks(10));

        vis.bins = vis.histogram(vis.displayData)

        //console.log('bins', vis.bins)

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);
        vis.y.domain([0, d3.max(vis.bins, function(d) { return d.length; })]);

        vis.svg.select("g.axis-y")
            .transition()
            .duration(500)
            .attr("color", "white")
            .call(d3.axisLeft(vis.y));

        let bars = vis.svg.selectAll("rect").data(vis.bins);

        bars
            .enter()
            .append("rect")
            .merge(bars)
            .transition(80)
            .attr("x", d => vis.x(d.x0))
            .attr("y", d => vis.y(d.length))
            .attr("width", d => vis.x(d.x1) - vis.x(d.x0) - 1)
            .attr("height", d => vis.height - vis.y(d.length))
            .style("fill", "#1B998B");

        bars.exit().remove();

        // Add axes
        vis.svg.select("g.axis-x")
            .transition()
            .duration(500)
            .attr("transform", "translate(0," + vis.height + ")")
            .attr("color", "white")
            .call(d3.axisBottom(vis.x));

        // Add summary statistics
        let meanDuration = d3.mean(vis.displayData, d => d.duration_ms);
        let medDuration = d3.median(vis.displayData, d => d.duration_ms);
        //let modeDuration = d3.mode(vis.displayData, d => d.duration_ms);
        let maxDuration = d3.max(vis.displayData, d => d.duration_ms);
        let minDuration = d3.min(vis.displayData, d => d.duration_ms);

        d3.select("#summaryStats")
            .html(`
            <h3 id="sumtitle"><strong>Summary Statistics</strong></h3>
            <p class="sumlines"><strong>Selected Year:</strong> ${vis.selectedYear}</p>
            <p class="sumlines"><strong>Mean Duration:</strong> ${meanDuration.toFixed(2)} min</p>
            <p class="sumlines"><strong>Median Duration:</strong> ${medDuration.toFixed(2)} min</p>
   
            <p class="sumlines"><strong>Max Duration:</strong> ${maxDuration.toFixed(2)} min</p>
            <p class="sumlines"><strong>Min Duration:</strong> ${minDuration.toFixed(2)} min</p>
        `);



    }
}
