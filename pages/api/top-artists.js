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

    const artistsRes = await fetch(
      "https://api.spotify.com/v1/me/top/artists?limit=5&time_range=short_term",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    if (!artistsRes.ok) {
      console.error('Artists request failed:', artistsRes.status);
      return res.status(artistsRes.status).json({ error: "Failed to fetch top artists" });
    }

    const data = await artistsRes.json();

    const topArtists = data.items.map((artist) => ({
      name: artist.name,
      url: artist.external_urls.spotify,
      image: artist.images[0]?.url || null,
      genres: artist.genres || [],
    }));

    res.status(200).json(topArtists);
  } catch (error) {
    console.error('API Error in top-artists:', error);
    res.status(500).json({ error: "Internal server error" });
  }
}
