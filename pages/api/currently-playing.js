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

    const nowPlayingRes = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    // 204 means no content (nothing playing)
    if (nowPlayingRes.status === 204) {
      return res.status(200).json({ isPlaying: false });
    }

    if (!nowPlayingRes.ok) {
      console.error('Currently playing request failed:', nowPlayingRes.status);
      return res.status(nowPlayingRes.status).json({ error: "Failed to fetch currently playing" });
    }

    const song = await nowPlayingRes.json();

    // Check if we have valid song data
    if (!song || !song.item) {
      return res.status(200).json({ isPlaying: false });
    }

    res.status(200).json({
      isPlaying: song.is_playing,
      title: song.item.name,
      artist: song.item.artists.map((a) => a.name).join(", "),
      album: song.item.album.name,
      albumImageUrl: song.item.album.images[0]?.url || null,
      songUrl: song.item.external_urls.spotify,
    });
  } catch (error) {
    console.error('API Error in currently-playing:', error);
    res.status(500).json({ error: "Internal server error" });
  }
}
