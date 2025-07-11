import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: 'http://jackdoehrman.com/callback',
});

spotifyApi.setRefreshToken(process.env.SPOTIFY_REFRESH_TOKEN);

export default async function handler(req, res) {
  try {
    const data = await spotifyApi.refreshAccessToken();
    spotifyApi.setAccessToken(data.body.access_token);

    const playback = await spotifyApi.getMyCurrentPlaybackState();
    if (playback.body?.is_playing) {
      const item = playback.body.item;
      res.status(200).json({
        isPlaying: true,
        title: item.name,
        artist: item.artists.map((a) => a.name).join(', '),
        albumImageUrl: item.album.images[0].url,
      });
    } else {
      res.status(200).json({ isPlaying: false });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data', details: err.message });
  }
}
