// pages/api/top-artists.js
export default async function handler(req, res) {
  const basic = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  // Step 1: Get Access Token from Refresh Token
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

  const { access_token } = await tokenRes.json();

  // Step 2: Get Top Artists from Spotify
  const artistsRes = await fetch(
    "https://api.spotify.com/v1/me/top/artists?limit=5&time_range=short_term",
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );

  if (!artistsRes.ok) {
    return res.status(500).json({ error: "Failed to fetch top artists" });
  }

  const data = await artistsRes.json();

  const topArtists = data.items.map((artist) => ({
    name: artist.name,
    url: artist.external_urls.spotify,
    image: artist.images[0]?.url || null,
    genres: artist.genres,
  }));

  res.status(200).json(topArtists);
}
