import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import json

scope = 'user-top-read user-read-private user-read-email'

sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(client_id="ff6b74c55ca247b4834cfc7d117d4e90",
                                                           client_secret="0a394b14086049cc81781f9e44afc84c"))

artist_uris = [
    "spotify:artist:3Nrfpe0tUJi4K4DXYWgMUX", # BTS
    "spotify:artist:6vWDO969PvNqNYHIOW5v0m", # Beyonce
    "spotify:artist:06HL4z0CvFAxyc27GXpf02", # TSwift
    "spotify:artist:4Z8W4fKeB5YxbusRsdQVPb", # Radio Head
    "spotify:artist:7FBcuc1gsnv6Y1nwFtNRCb", # My Chemical Romance
    "spotify:artist:1Xyo4u8uXC1ZmMpatF05PJ", # The Weeknd
    "spotify:artist:2YZyLoL8N0Wb9xBt1NhZWg", # Kendrick Lamar
    "spotify:artist:1dfeR4HaWDbWqFHLkxsg1d" # Queen
]

artists = ["BTS", "Beyonce", "TSwift", "RadioHead", "MCR", "TheWeeknd", "KendrickLamar", "Queen"]

for i, uri in enumerate(artist_uris):
    results = sp.artist_albums(uri, album_type='album')
    albums = results['items']

    all_tracks = []

    for album in albums:
        album_uri = album["uri"]
        album_res = sp.album(album_uri)
#         print(album_res)
        tracks = album_res["tracks"]

        track_ids = []
        for j, t in enumerate(tracks["items"]):
            del t["available_markets"]
            print(' ', j, t['name'])
            track_ids.append(t['uri'])

        features = sp.audio_features(track_ids)

        # res = {**dict1, **dict2}
        for j, t in enumerate(tracks["items"]):
            album_info = {
                "popularity": album_res["popularity"],
                "release_date": album_res["release_date"],
                "images": album_res["images"],
                "album": album_res["name"]
            }
            save_object = {**t, **features[j], **album_info}
            all_tracks.append(save_object)

        json_object = json.dumps(all_tracks, indent=4)

        # Writing to sample.json
        with open(f"Data/{artists[i]}.json", "w") as outfile:
            outfile.write(json_object)
