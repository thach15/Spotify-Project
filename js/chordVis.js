


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

        vis.margin = { top: 20, right: 20, bottom: 200, left: 60 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right,
            vis.height = 500 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

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
        console.log(vis.minStreams, vis.arrangedData[0]["artist(s)_name"])
        console.log(vis.maxStreams, vis.arrangedData[vis.dataSize - 1]["artist(s)_name"])

        // Calculating n x n matrix size
        vis.step = 100000000;
        vis.lowerLimit = Math.floor(vis.minStreams / step)*step;
        vis.upperLimit = Math.ceil(vis.maxStreams / step)*step;
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
                    vis.artistMap[name] = entry;
                }
            }
        }

        // Building matrix for artists that appear more than once in hits
        for (const artistEntryKey in vis.artistMap) {

            // Count only if artist appears more than once in data set
            let artistArray = vis.artistMap[artistEntryKey];
            if (artistArray.length > 1) {

                for (let i = 0; i < artistArray.length - 1; i++) {
                    // TO DO
                }

            }
        }


    }

    updateVis() {
        let vis = this;


    }
}