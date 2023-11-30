
const clientId = 'ff6b74c55ca247b4834cfc7d117d4e90';
const clientSecret = '0a394b14086049cc81781f9e44afc84c';
const redirectUri = 'http://localhost:63342/Spotify%20Project/index.html?_ijt=huknvqbuar7qqua6pd83d8n442';
// const redirectUri = 'http://localhost:8080/Spotify%20Project/index.html?_ijt=mjpfqec29q6rr9tgahut5193bp';

const scope = 'user-top-read user-read-private user-read-email';
const authUrl = new URL("https://accounts.spotify.com/authorize")
const tokenUrl = new URL("https://accounts.spotify.com/api/token");

document.getElementById ("getAuth").addEventListener ("click", requestAuthorization, false);


async function requestAuthorization() {
    console.log("here")
    const generateRandomString = (length) => {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const values = crypto.getRandomValues(new Uint8Array(length));
        return values.reduce((acc, x) => acc + possible[x % possible.length], "");
    }

    const codeVerifier  = generateRandomString(64);

    const sha256 = async (plain) => {
        const encoder = new TextEncoder()
        const data = encoder.encode(plain)
        return window.crypto.subtle.digest('SHA-256', data)
    }

    const base64encode = (input) => {
        return btoa(String.fromCharCode(...new Uint8Array(input)))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    }

    const hashed = await sha256(codeVerifier)
    const codeChallenge = base64encode(hashed);

    window.localStorage.setItem('code_verifier', codeVerifier);

    const params =  {
        response_type: 'code',
        client_id: clientId,
        scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: redirectUri,
    }

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
}