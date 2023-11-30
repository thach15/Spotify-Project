/* main JS file */

let bubbleVis;
let chordVis;
let histVis;
let closerLookVis;

let bubbleSelectedCategory;
let promises = [
    d3.csv("Data/spotify-2023.csv"),
    d3.csv("Data/top-hits.csv"),
    d3.csv("Data/taylor_swift_spotify.csv")
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
    let taylorSwift = data[2];
    let personalizedData = [];
    let topArtist = null;

    console.log(data);

    const args = new URLSearchParams(window.location.search);
    const code = args.get('code');

    if (localStorage.getItem('access_token')) {
        localStorage.clear();
    }

    if (code) {
        await getAccessToken(code);
    }

    const access_token = localStorage.getItem('access_token');

    if (access_token) {
        const topArtists = await fetchTopArtist(access_token);
        topArtist = topArtists.items[0];
        console.log("the top artist is", topArtist);
        const albums = await fetchAlbums(access_token, topArtist.id);
        console.log("albums are", albums);
        for (let i = 0; i < albums.length; i++) {
            const tracks = await fetchTracks(access_token, albums[i]);
            console.log("tracks:", tracks)
            personalizedData = personalizedData.concat(tracks);
        }
        console.log("got the data!!!")
        console.log(personalizedData);
    } else {
        console.log("no access token")
    }



    bubbleVis = new BubbleVis("bubbleVis", topHits);
    chordVis = new ChordVis("chordVis", mostStreamed2023);
    histVis = new HistVis("histVis", topHits);
    // getToken();
    if (personalizedData && topArtist) {
        closerLookVis = new CloserLookVis("closerLookVis", personalizedData, topArtist.name, true);
    } else {
        closerLookVis = new CloserLookVis("closerLookVis", taylorSwift, "Taylor Swift", false);
    }

}

async function getAccessToken(code) {
    const codeVerifier = localStorage.getItem("code_verifier");
    console.log("the code verifier is", codeVerifier);

    const payload = {
        method: 'POST',
        headers: {
            // "Access-Control-Allow-Headers": "http://localhost:8080",
            // "Origin": "http://localhost:8080",
            'Content-Type': 'application/x-www-form-urlencoded',
            // 'Authorization': 'Basic ' + (new Buffer.from(clientId + ':' + clientSecret).toString('base64'))
        },
        body: new URLSearchParams({
            client_id: clientId,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
        }),
    }

    const body = await fetch(tokenUrl, payload)
        .then(res => res.clone().json())
        .then(response => {
            console.log("fuck yeah")
            console.log(response)
            const { access_token } = response;
            console.log(access_token);
            if (access_token) {
                window.localStorage.setItem('access_token', access_token);
            }
        })
        .catch(err => {
            console.log("there was an error FUCK")
            console.log(err)
        });
}

async function fetchTopArtist(token) {
    const result = await fetch("https://api.spotify.com/v1/me/top/artists", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

async function fetchAlbums(token, artist_id) {
    const result = await fetch(`https://api.spotify.com/v1/artists/${artist_id}/albums`, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });
    const albums = await result.json();

    await timeout(5000);

    const album_ids = albums.items.map(album => album.id).join("%2C");
    const album_full_results = await fetch(`https://api.spotify.com/v1/albums?ids=${album_ids}`, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    })
    const albums_full = await album_full_results.json();
    console.log("albums full", albums_full);
    return albums_full.albums;
}

async function fetchTracks(token, album) {
    // await timeout(3000);

    const album_id = album.id;
    const result = await fetch(`https://api.spotify.com/v1/albums/${album_id}/tracks`, {
        method: "GET", headers: { Authorization: `Bearer ${token}`}
    });
    const res = await result.json();
    const tracks = res.items;
    console.log("tracks are", tracks);
    // await timeout(3000);

    // Get audio features
    const track_ids = tracks.map(album => album.id).join("%2C");
    console.log(track_ids);
    const features_response = await fetch(`https://api.spotify.com/v1/audio-features?ids=${track_ids}`, {
        method: "GET", headers: { Authorization: `Bearer ${token}`}
    })

    const features = await features_response.json();
    console.log(features);

    let ret = []
    for (let i = 0; i < tracks.length; i++) {
        const extra_info = {
            "popularity": album.popularity,
            "album": album.name,
            "release_date": album.release_date
        }
        const merged_object = {...tracks[i], ...features.audio_features[i], ...extra_info}
        ret.push(merged_object)
    }

    console.log("ret is", ret);
    return ret;
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function bubbleSelection() {
    bubbleSelectedCategory =  document.getElementById('bubble-select').value;
    bubbleVis.selection = bubbleSelectedCategory;
    bubbleVis.wrangleData();
}
