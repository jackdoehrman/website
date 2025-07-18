export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
      return res.status(500).json({ 
        error: 'Missing environment variables',
        missing: {
          client_id: !SPOTIFY_CLIENT_ID,
          client_secret: !SPOTIFY_CLIENT_SECRET,
          refresh_token: !SPOTIFY_REFRESH_TOKEN
        }
      });
    }

    // Get access token
    const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");
    
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: SPOTIFY_REFRESH_TOKEN,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return res.status(tokenResponse.status).json({ 
        error: 'Token request failed',
        details: errorText
      });
    }

    const tokenData = await tokenResponse.json();

    // Get top artists
    const artistsResponse = await fetch("https://api.spotify.com/v1/me/top/artists?limit=5&time_range=short_term", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!artistsResponse.ok) {
      const errorText = await artistsResponse.text();
      return res.status(artistsResponse.status).json({ 
        error: 'Artists request failed',
        details: errorText
      });
    }

    const data = await artistsResponse.json();
    
    const artists = data.items?.map(artist => ({
      name: artist.name,
      images: artist.images,
      external_urls: artist.external_urls,
      genres: artist.genres,
      popularity: artist.popularity
    })) || [];

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json(artists);

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
}
