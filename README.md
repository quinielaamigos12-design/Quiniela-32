
# Quiniela 32 - Web App (Static)

This project is a complete static Web App for running a 32-player quiniela
on GitHub Pages. It uses a single shared `data.json` file as the canonical
data store. Because GitHub Pages sites are static, the admin must export and
upload `data.json` to the repository to publish changes for all users.

## How it works

- Admin and players read `data.json` from the site root.
- Admin can edit players, create jornadas, input results, then **Export data.json**
  and upload it to the GitHub repository (replace the old `data.json`) so that
  all users see updates.
- Players can login and save pronósticos in memory; the admin exports those to the repo.

## Files

- index.html — login page
- admin.html — admin panel (import/export, manage players, create jornadas)
- jugador.html — player panel (select jornada, save pronósticos)
- css/style.css — styles
- js/auth.js, js/admin.js, js/jugador.js — application logic
- data.json — initial data with 32 players (Jugador 1..32, password pass1234)

## Notes about automation

- The app can attempt to import jornada data from an API if the admin provides a URL.
- Automatic retrieval of official La Quiniela data ideally requires a server/API key.
- This static version uses a workflow: the admin must export updated `data.json` and
  upload it to the repository (via GitHub UI) so that changes become visible to all users.

## How to publish

1. Upload all files to GitHub repo root.
2. Enable GitHub Pages (Settings → Pages) and use the `Static HTML` workflow or Pages source.
3. Open `https://<user>.github.io/<repo>/`

