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

  const dataRes = await fetch(
    "https://api.spotify.com/v1/me/player/recently-played?limit=5",
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );

  const data = await dataRes.json();

  const tracks = data.items.map((item) => ({
    name: item.track.name,
    artist: item.track.artists.map((a) => a.name).join(", "),
    url: item.track.external_urls.spotify,
    image: item.track.album.images[0].url,
  }));

  res.status(200).json(tracks);
}
