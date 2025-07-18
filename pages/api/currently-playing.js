export default async function handler(req, res) {
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

  const { access_token } = await tokenRes.json();

  const nowPlayingRes = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );

  if (nowPlayingRes.status === 204) {
    return res.status(200).json({ isPlaying: false });
  }

  const song = await nowPlayingRes.json();

  res.status(200).json({
    isPlaying: song.is_playing,
    title: song.item.name,
    artist: song.item.artists.map((a) => a.name).join(", "),
    album: song.item.album.name,
    albumImageUrl: song.item.album.images[0].url,
    songUrl: song.item.external_urls.spotify,
  });
}
