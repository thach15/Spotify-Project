

class ChordVis {

    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        // this.originalData = this.data;
        this.arrangedData = [];
        this.n = 0;

        this.data.forEach(d => {
            d.streams = +d.streams;
        })

        this.initVis();
    }


    initVis() {
        let vis = this;

        vis.margin = { top: 70, right: 100, bottom: 100, left: 400 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 750 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left}, ${vis.height* 3/4})`);

        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'chordTooltip');

        vis.svg.append("circle").attr("cx",230).attr("cy",140).attr("r", 6).style("fill", "#D7263D")
        vis.svg.append("circle").attr("cx",230).attr("cy",165).attr("r", 6).style("fill", "#F46036")
        vis.svg.append("circle").attr("cx",230).attr("cy",190).attr("r", 6).style("fill", "#FFD9CE")
        vis.svg.append("text").attr("x", 250).attr("y", 141).text("Increase in streams from previous release").style("font-size", "13px").attr("alignment-baseline","middle")
        vis.svg.append("text").attr("x", 250).attr("y", 166).text("Maintained streams from previous release").style("font-size", "13px").attr("alignment-baseline","middle")
        vis.svg.append("text").attr("x", 250).attr("y", 191).text("Decrease in streams from previous release").style("font-size", "13px").attr("alignment-baseline","middle")

        vis.svg.append("text")
            .attr("x", vis.width - vis.margin.right)
            .attr("y", -320)
            .attr("text-anchor", 'end')
            .attr("font-size", 30)
            .text("2023's Most Popular Artists: How Their Streams Varied")

        vis.svg.append("text")
            .attr("x", vis.width - vis.margin.right)
            .attr("y", -260)
            .attr("text-anchor", 'end')
            .attr("font-size",14)
            .text("Looking at the artists who released the songs with the most streams")

        vis.svg.append("text")
            .attr("x", vis.width - vis.margin.right)
            .attr("y", -240)
            .attr("text-anchor", 'end')
            .attr("font-size",14)
            .text("in 2023, we can see how many artists were able to grow in streams")

        vis.svg.append("text")
            .attr("x", vis.width - vis.margin.right)
            .attr("y", -220)
            .attr("text-anchor", 'end')
            .attr("font-size",14)
            .text("from one release to the next consecutive one, how many stayed in")

        vis.svg.append("text")
            .attr("x", vis.width - vis.margin.right)
            .attr("y", -200)
            .attr("text-anchor", 'end')
            .attr("font-size",14)
            .text("the same range, and how many shrunk in stream range,")

        vis.svg.append("text")
            .attr("x", vis.width - vis.margin.right)
            .attr("y", -180)
            .attr("text-anchor", 'end')
            .attr("font-size",14)
            .text("for each range of 100 million streams.")

        vis.wrangleData()
    }

    wrangleData() {
        let vis = this;


        // console.log(vis.originalData)
        // let minStreams = d3.min(vis.originalData, d => d.streams);
        // let maxStreams = d3.max(vis.originalData, d => d.streams);
        // console.log(minStreams)
        // console.log(maxStreams)

        // find max and min streams
        // create n even partitions of streamsmost
        // consolidate artists who appear more than once on  streamed list
        // for each artist, keep track of flow of streams based on release date
        // need n x n square matrix

        // Filtering and sorting data; finding max and min by streams
        vis.arrangedData = vis.data.filter(d => {
            return d.streams >= 1000000;
        });
        vis.dataSize = this.arrangedData.length;
        vis.arrangedData.sort((a, b) => {
            return a.streams - b.streams;
        });
        vis.minStreams = vis.arrangedData[1].streams;
        vis.maxStreams = vis.arrangedData[vis.dataSize - 1].streams;

        // Calculating n x n matrix size
        vis.step = 100000000;
        vis.lowerLimit = Math.floor(vis.minStreams / vis.step)*vis.step;
        vis.upperLimit = Math.ceil(vis.maxStreams / vis.step)*vis.step;
        vis.n = (vis.upperLimit - vis.lowerLimit) / vis.step;

        // Creating empty matrix for chords
        vis.matrix = [];
        for (let i = 0; i < vis.n; i++) {
            vis.matrix.push([])
            for (let j = 0; j < vis.n; j++) {
                vis.matrix[i].push(0);
            }
        }

        // Mapping entries to artists
        vis.artistMap = {}
        for (const entry of vis.arrangedData) {
            let entrySplit = entry["artist(s)_name"].split(", ");
            for (const name of entrySplit) {
                if (name in vis.artistMap) {
                    vis.artistMap[name].push(entry)
                }
                else {
                    vis.artistMap[name] = [entry];
                }
            }
        }

        // Building matrix for artists that appear more than once in hits
        let count = 0;
        for (const artistEntryKey in vis.artistMap) {

            // Count only if artist appears more than once in data set
            let artistArray = vis.artistMap[artistEntryKey];

            if (artistArray.length > 1) {

                // Sort by release date
                artistArray.sort((a,b) => {
                    let date1 = (a.released_year + "/" + a.released_month + "/" + a.released_day);
                    let date2 = (b.released_year + "/" + b.released_month + "/" + b.released_day);
                    return Date(date1) - Date(date2);
                })

                // Storing transitions in matrix
                let prevHitStreamsFloor = Math.floor( artistArray[0].streams/ vis.step)*vis.step;
                let prevIndex = Math.floor((prevHitStreamsFloor - vis.lowerLimit) / vis.step)
                for (let i = 1; i < artistArray.length; i++) {

                    // Calculating index from previous hit and current, incrementing proper indices in matrix
                    let currHitStreamsFloor = Math.floor( artistArray[i].streams/ vis.step)*vis.step;
                    let currIndex = Math.floor((currHitStreamsFloor - vis.lowerLimit) / vis.step)
                    vis.matrix[prevIndex][currIndex] += 1;

                    currHitStreamsFloor = prevHitStreamsFloor;
                    currIndex = prevIndex;




                }
                count++;
                // console.log(artistArray);

            }
        }
        // console.log(count);

        vis.updateVis();


    }

    updateVis() {
        let vis = this;

        vis.res = d3.chord()
            .padAngle(0.05)
            .sortSubgroups(d3.descending)
            (vis.matrix)

        vis.svg
            .datum(vis.res)
            .append("g")
            .selectAll("path")
            .data(d => d)
            .enter()
            .append("path")
            .attr("d", d3.ribbon()
                .radius(190)
            )
            .on('mouseover', function(event, d){

                d3.select(this)
                    .attr('stroke-width', '1px')
                    .attr('stroke', 'black')
                    .attr('fill', 'black')
                    .attr("opacity", "100%");

                let lowEndMillionSource = (vis.lowerLimit + d["source"].index*vis.step) / (vis.step / 100);
                let highEndMillionSource = (vis.lowerLimit + (d["source"].index+1)*vis.step) / (vis.step / 100);
                let priorRange = lowEndMillionSource.toString() + " - " + highEndMillionSource.toString() + " M";

                let lowEndMillionTarget = (vis.lowerLimit + d["target"].index*vis.step) / (vis.step / 100);
                let highEndMillionTarget = (vis.lowerLimit + (d["target"].index+1)*vis.step) / (vis.step / 100);
                let newRange = lowEndMillionTarget.toString() + " - " + highEndMillionTarget.toString() + " M";

                vis.tooltip
                    .style("fill", "white")
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                         <div style="border: thin solid grey; border-radius: 5px; background: #f7e4f7; padding: 5px; height: 75px">
                             <h5 class="chordToolTipInfo">${d["source"].value} artists</h5> 
                             <p class="chordToolTipInfo">from ${priorRange} to</p>
                             <p class="chordToolTipInfo">${newRange} streams</p>                      
                         </div>`);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr("fill", "#FFD9CE")
                    .style("stroke", "#FFD9CE")
                    .attr("stroke-width", 0.25)
                    .attr("opacity", "80%");

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .style("fill", d => decideShade(d))
            .style("stroke", "#FFD9CE")
            .attr("stroke-width", 0.25)
            .attr("opacity", "80%");

        // console.log(vis.res)
        vis.chordGroup = vis.svg
            .datum(vis.res)
            .append("g")
            .selectAll("g")
            .data(d => {
                // console.log(d, d.groups)
                return d.groups
            })
            .enter()



        vis.chordGroup.append("g")
            .append("path")
            .style("fill", d => {
                //console.log(d)
                return "#FFD9CE";
            })
            .style("stroke", "black")
            .attr("d", d3.arc()
                .innerRadius(190)
                .outerRadius(200)
            )


        vis.chordGroup.selectAll(".group-tick")
            .data(d => groupTicks(d, vis.matrix.length))    // Controls the number of ticks: one tick each 38 here.
            .join("g")
            .attr("transform", d => `rotate(${d.angle * 180 / Math.PI - 90}) translate(200,0)`)
            .append("line")               // By default, x1 = y1 = y2 = 0, so no need to specify it.
            .attr("x2", 6)
            .attr("stroke", "black")



        let tickCount = 0;
        vis.chordGroup.selectAll(".group-tick-label")
            .data(d => groupTicksLabels(d, vis.matrix.length))
            .enter()
            .filter(d => d.value % vis.matrix.length === 0)
            .append("g")
            .attr("transform", d => `rotate(${d.angle * 180 / Math.PI - 90}) translate(200,0)`)
            .append("text")
            .attr("x", 8)
            .attr("dy", ".35em")
            .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180) translate(-16)" : null; })
            .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
            .text((d) => {
                let lowEndMillion = (vis.lowerLimit + tickCount*vis.step) / (vis.step / 100);
                let highEndMillion = (vis.lowerLimit + (tickCount+1)*vis.step) / (vis.step / 100);
                tickCount += 1;
                return lowEndMillion.toString() + " - " + highEndMillion.toString() + " M";
            })
            .style("font-size", 9)

        // vis.svg.attr("transform", "translate("+(vis.width / 3)+",300)")



// Returns an array of tick angles and values for a given group and step.
        function groupTicks(d) {
            return [{value: 0, angle: d.startAngle}, {value: d.value, angle: d.endAngle}]
        }
        function groupTicksLabels(d) {
            return [{value: 0, angle: (d.startAngle + d.endAngle) / 2}]
        }

        function decideShade(d) {
            if (d["target"].index > d["source"].index)
                return "#D7263D";
            else if (d["target"].index === d["source"].index)
                return "#F46036";
            else
                return "#FFD9CE";
        }


    }

}