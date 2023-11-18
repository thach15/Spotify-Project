/* main JS file */

console.log("Hello JS world!");

let promises = [
    d3.csv("Data/spotify-2023.csv"),
    d3.csv("Data/top-hits.csv"),
    // d3.csv("Data/tracks_features.csv")
];

Promise.all(promises)
    .then(function (data) {
        createVis(data)
    })
    .catch(function (err) {
        console.log(err)
    });


function createVis(data) {

    let mostStreamed2023 = data[0];
    let topHits = data[1];
    // let tracksFeatures = data[2];

    console.log(data);
    // allData = data
    //
    let chordVis = new ChordVis("chordVis", mostStreamed2023);
    let histVis = new HistVis("histVis", topHits);
}