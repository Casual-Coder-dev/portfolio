# CasualCoder.dev portfolio

Plain HTML/CSS/JS. No build step.

- Preview: open `index.html`, or run `python -m http.server` in this folder.
- Deploy: push to a GitHub repo, then Settings > Pages > deploy from branch (root).
- Edit the "Lab" and "About" text in `index.html`.
- Cards currently link to your Fab seller page. Swap in each listing URL if you want direct links.

## Before you launch (2 minutes)

1. In `index.html` `<head>`, follow the TODO comment: add `canonical` + `og:url`, and make `og:image` / `twitter:image` absolute URLs (`https://YOUR-DOMAIN/assets/og.png`). Social sites ignore relative image paths.
2. Add your domain to `robots.txt` (the commented `Sitemap:` line) if you make a sitemap.
3. `404.html` works on GitHub Pages automatically.

## Fullscreen viewer

Click any work image/video (or the corner expand button) to maximize it. Inside:
`←` `→` or the arrow buttons switch slides, `Space`/`K` or the button plays and pauses video, `M` mutes, `Esc`, the X, the dark background or the browser Back button closes. Swipe works on touch.

## Adding media

- Image slide: `<img src="assets/x.webp" data-full="assets/x-full.webp" alt="..." width="900" height="506" loading="lazy">`. `src` is the small card version (~900px wide), `data-full` is what the viewer loads (~1920px wide).
- Video slide: `<video src="assets/x.mp4" poster="assets/x-poster.webp" muted loop playsinline preload="none"></video>`. Encode as **H.264** (not HEVC), e.g.
  `ffmpeg -i in.mp4 -c:v libx264 -crf 26 -pix_fmt yuv420p -movflags +faststart out.mp4`
- Convert screenshots to WebP instead of shipping PNGs (PNG screenshots were 4 MB each).

## Icons

`assets/logo-circle.png` is the round logo used in the header. `favicon.ico` and `assets/icon-*.png` are the browser/tab/home-screen icons (small sizes use a tighter crop of the `<_ }` mark so it stays readable at 16px).
