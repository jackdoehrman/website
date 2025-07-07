import { useEffect } from "react";
import Head from "next/head";

export default function Home() {
  useEffect(() => {
    // Load Instagram embed script
    const script = document.createElement("script");
    script.src = "https://embedsocial.com/cdn/ht.js";
    script.id = "EmbedSocialHashtagScript";
    document.head.appendChild(script);

    // Spotify widget logic
    async function fetchNowPlaying() {
      try {
        const res = await fetch("/api/now-playing");
        const data = await res.json();
        const el = document.getElementById("spotify-widget");
        if (data.isPlaying) {
          el.innerHTML = `<img src="${data.albumImageUrl}" width="64" style="border-radius:6px;vertical-align:middle"/>
              <span style="margin-left:1rem;color:#64ffda">${data.title}</span> — <span style="color:#8892b0">${data.artist}</span>`;
        } else {
          el.textContent = "Not playing anything 🎶";
        }
      } catch (err) {
        console.error("Spotify widget error:", err);
      }
    }

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 20000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>Jack Doehrman</title>
        <meta
          name="description"
          content="Jack Doehrman | Data Analyst & Engineer"
        />
        <link rel="stylesheet" href="/style.css" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <body>
        <header>
          <h1>Jack Doehrman</h1>
          <h2>Data Analyst & Engineer</h2>
          <p>
            I transform raw data into insights and scalable solutions for
            smarter decisions. Currently at Houston Dynamo FC.
          </p>
          <nav>
            <ul>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#skills">Skills</a>
              </li>
              <li>
                <a href="#experience">Experience</a>
              </li>
              <li>
                <a href="#projects">Projects</a>
              </li>
            </ul>
          </nav>
        </header>

        <main>
          <section id="about">
            <h2>About</h2>
            <p>
              I'm a passionate data professional working as a Business
              Intelligence and Strategy Analyst for Houston Dynamo FC. I
              specialize in CRM strategy, dashboarding, and predictive modeling
              to optimize operat
