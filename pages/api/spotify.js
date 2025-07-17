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

  const topRes = await fetch("https://api.spotify.com/v1/me/top/artists?limit=5&time_range=short_term", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  const data = await topRes.json();
  res.status(200).json(data.items);
