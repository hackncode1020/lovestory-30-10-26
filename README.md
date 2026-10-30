# Our Love Story 📖❤️

**A magical 3D storybook website that tells your love story in 7 chapters, then writes their name on the last page in gold ink.**

Built with only **HTML, CSS, JavaScript and canvas**. No libraries, no frameworks, no images, no audio files: every page, illustration, page-curl, sound and the music is drawn and played in code.

🔗 **Live demo:** https://lovestory-hackncode.sites.tab.bot/

💌 **Make it for your person:** `https://lovestory-hackncode.sites.tab.bot/?name=sweetheart`

▶️ **Auto-play demo:** `https://lovestory-hackncode.sites.tab.bot/?demo=1&name=sweetheart`

---

## ✨ Features

- ✨ **Intro splash**: "A story written only for you…" typed out with their name
- 📖 **A big glowing storybook** on a starry night table, with fairy lights and floating rose petals
- 📄 **Real 3D page-curl flips** (the page wraps around a moving cylinder, with lighting and shadows) on every tap, swipe or drag, with a paper sound
- 📚 **7 animated chapters**, each a full-page canvas illustration with typewriter text:
  1. **The day I first saw you**: two silhouettes walk in and a spark appears
  2. **Our first talk**: chat bubbles pop in with typing dots
  3. **Late night calls**: the moon, a glowing phone and a call timer crossing 3:00 AM
  4. **Our first fight… and the hug after**: rain and lightning, then the clouds part, a rainbow and a hug
  5. **Little things you do**: floating polaroid doodle cards
  6. **Every day with you**: calendar pages flying from Day 1 to ∞
  7. **The last page**: their pet name writes itself in **gold ink** with a quill, then "…is my forever ❤️"
- 🔐 **The book closes** and a **golden heart lock seal** stamps the cover with a heart burst
- 💍 **End screen**: "Will you write the next chapter with me?" with **YES** and **Obviously YES** (both say yes 😄) and confetti hearts
- 📊 Chapter progress bar
- 🎵 Romantic piano music on/off (WebAudio synth) + page-flip, quill and seal sounds
- ⬇️ Downloadable **story card** PNG (canvas)
- 💬 **WhatsApp share** with a personalised `?name=` link
- ✍️ **Create your own story**: type their pet name + your own line for the last page and get a link to send
- 🔁 Replay
- 📱 Mobile-first and BIG: the book fills ~90% of the screen, large text and large buttons (tested at 390×844 and 360×640)

## 🛠️ Customise

| Parameter | What it does | Example |
|---|---|---|
| `name` | Pet name written in gold on the last page (default "my love") | `?name=Jaan` |
| `line` | Your own line under it on the last page | `&line=You are my favourite chapter.` |
| `demo=1` | Plays the whole story automatically | `?demo=1&name=baby` |

## 📁 Files

- `index.html`: page structure, splash, end screen and the "Create your own story" form
- `style.css`: layout and styling
- `app.js`: the book engine (page-curl renderer), the 7 chapter illustrations, sounds, music, story card and share links

## 🚀 Run it

Just open `index.html` in a browser, or host the folder anywhere (GitHub Pages works).

---

Day 4 of 100 💻❤️ · Made by **[@hack.n.code](https://instagram.com/hack.n.code)**
