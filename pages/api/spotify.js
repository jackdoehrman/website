// /pages/api/spotify.js
export default async function handler(req, res) {
  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check for required environment variables
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET || !process.env.SPOTIFY_REFRESH_TOKEN) {
      console.error('Missing required Spotify environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Get access token
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
      return res.status(500).json({ error: 'Failed to get access token' });
    }

    const tokenData = await tokenRes.json();
    
    if (!tokenData.access_token) {
      console.error('No access token in response:', tokenData);
      return res.status(500).json({ error: 'Invalid token response' });
    }

    // Get top artists (short_term = last 4 weeks)
    const topRes = await fetch("https://api.spotify.com/v1/me/top/artists?limit=5&time_range=short_term", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!topRes.ok) {
      console.error('Top artists request failed:', topRes.status);
      return res.status(500).json({ error: 'Failed to get top artists' });
    }

    const data = await topRes.json();
    
    // Transform the data to include only what we need
    const artists = data.items?.map(artist => ({
      name: artist.name,
      images: artist.images,
      external_urls: artist.external_urls,
      genres: artist.genres,
      popularity: artist.popularity
    })) || [];

    // Add cache headers (cache for 1 hour)
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    
    res.status(200).json(artists);
  } catch (error) {
    console.error('Spotify API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
