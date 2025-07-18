export default async function handler(req, res) {
  try {
    const basic = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: process.env.SPOTIFY_REFRESH_TOKEN,
      }),
    });

    if (!tokenRes.ok) {
      console.error('Token request failed:', tokenRes.status);
      return res.status(401).json({ error: "Failed to get access token" });
    }

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('No access token in response');
      return res.status(401).json({ error: "Invalid token response" });
    }

    const dataRes = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played?limit=5",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    if (!dataRes.ok) {
      console.error('Recently played request failed:', dataRes.status);
      return res.status(dataRes.status).json({ error: "Failed to fetch recently played tracks" });
    }

    const data = await dataRes.json();

    if (!data.items || !Array.isArray(data.items)) {
      console.error('Invalid response structure from Spotify API');
      return res.status(500).json({ error: "Invalid API response" });
    }

    const tracks = data.items.map((item) => ({
      name: item.track.name,
      artist: item.track.artists.map((a) => a.name).join(", "),
      url: item.track.external_urls.spotify,
      image: item.track.album.images[0]?.url || null,
    }));

    res.status(200).json(tracks);
  } catch (error) {
    console.error('API Error in recently-played:', error);
    res.status(500).json({ error: "Internal server error" });
  }
}
