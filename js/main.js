/* main JS file */

let bubbleVis;
let chordVis;
let histVis;
let closerLookVis;

let bubbleSelectedCategory;
let promises = [
    d3.csv("Data/spotify-2023.csv"),
    d3.csv("Data/top-hits.csv"),
    d3.csv("Data/Spotify_BTS_AudioFeatures.csv"),
    d3.csv("Data/taylor_swift_spotify.csv")
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
    let BTS = data[2];
    let taylorSwift = data[3];
    // let tracksFeatures = data[2];

    console.log(data);

    bubbleVis = new BubbleVis("bubbleVis", topHits);
    chordVis = new ChordVis("chordVis", mostStreamed2023);
    histVis = new HistVis("histVis", topHits);
    closerLookVis = new CloserLookVis("closerLookVis", taylorSwift, BTS);

    let currSlide = 0;
    let slides = ["chordVis", "hist-container", "closer-look-container"]

    let upButton = document.querySelector("#up");
    let downButton = document.querySelector("#down");
    upButton.addEventListener("click", () => changeSlide("up"));
    downButton.addEventListener("click", () => changeSlide("down"));

    const changeSlide = (dir) => {
        if (dir === "down") {
            if (currSlide < 2) {
                currSlide++;
                let nextSlide = slides[currSlide];
                console.log(nextSlide)
                document.getElementById(nextSlide).scrollIntoView();
            }
        } else if (dir === "up") {
            if (currSlide > 0) {
                currSlide--;
                let nextSlide = slides[currSlide];
                console.log(nextSlide)
                document.getElementById(nextSlide).scrollIntoView();
            }
        }
    }

}

function bubbleSelection() {
    bubbleSelectedCategory =  document.getElementById('bubble-select').value;
    bubbleVis.selection = bubbleSelectedCategory;
    bubbleVis.wrangleData();
}
