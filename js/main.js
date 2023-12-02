/* main JS file */

let bubbleVis;
let chordVis;
let histVis;
let closerLookVis;

let bubbleSelectedCategory;
let promises = [
    d3.csv("Data/spotify-2023.csv"),
    d3.csv("Data/top-hits.csv"),
    d3.json("Data/Beyonce.json"),
    d3.json("Data/BTS.json"),
    d3.json("Data/TheWeeknd.json"),
    d3.json("Data/KendrickLamar.json"),
    d3.json("Data/MCR.json"),
    d3.json("Data/Queen.json"),
    d3.json("Data/RadioHead.json"),
    d3.json("Data/TSwift.json")
];

Promise.all(promises)
    .then(function (data) {
        createVis(data)
    })
    .catch(function (err) {
        console.log(err)
    });


async function createVis(data) {

    let mostStreamed2023 = data[0];
    let topHits = data[1];
    let closerLookData = [
        { artist_name: "Beyonce", artist_data: data[2] },
        { artist_name: "BTS", artist_data: data[3] },
        { artist_name: "The Weeknd", artist_data: data[4] },
        { artist_name: "Kendrick Lamar", artist_data: data[5] },
        { artist_name: "My Chemical Romance", artist_data: data[6] },
        { artist_name: "Queen", artist_data: data[7] },
        { artist_name: "Radio Head", artist_data: data[8] },
        { artist_name: "Taylor Swift", artist_data: data[9] }
    ]

    let genreButtons = document.getElementsByClassName('genre-button');
    Array.from(genreButtons).forEach(gb => gb.addEventListener('click', () => genreButton(gb.id)));
    let bubbleSelectBox = document.getElementById('bubble-select');
    bubbleSelectBox.addEventListener('change', bubbleSelection);
    let artistSelectBox = document.getElementById('artist-select');
    artistSelectBox.addEventListener('change', artistSelection);
    bubbleVis = new BubbleVis("bubbleVis", topHits);
    chordVis = new ChordVis("chordVis", mostStreamed2023);
    histVis = new HistVis("histVis", topHits);
    closerLookVis = new CloserLookVis("closerLookVis", closerLookData, 0);
}


function bubbleSelection() {
    bubbleSelectedCategory =  document.getElementById('bubble-select').value;
    bubbleVis.selection = bubbleSelectedCategory;
    bubbleVis.wrangleData();
}

function genreButton(id) {
    closerLookVis.index = id;
    closerLookVis.wrangleData();
    document.getElementById('closer-look-container').scrollIntoView();
}

function artistSelection() {
    let artist = document.getElementById('artist-select').value;

    switch (artist) {
        case 'beyonce':
            closerLookVis.index = 0;
            break;
        case 'bts':
            closerLookVis.index = 1;
            break;
        case 'weeknd':
            closerLookVis.index = 2;
            break;
        case 'kendrick_lamar':
            closerLookVis.index = 3;
            break;
        case 'mcr':
            closerLookVis.index = 4;
            break;
        case 'queen':
            closerLookVis.index = 5;
            break;
        case 'radio_head':
            closerLookVis.index = 6;
            break;
        case 'taylor_swift':
            closerLookVis.index = 7;
            break;
    }
    closerLookVis.wrangleData();
}
