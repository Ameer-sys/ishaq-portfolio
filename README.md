# Ishaq Nasiru Portfolio

A responsive, framework-free portfolio for Ishaq Nasiru, built with semantic HTML, modern CSS, and vanilla JavaScript. The site highlights software, embedded systems, community involvement, and a small playable ocean game.

## Local Development

The site does not require a build step.

```powershell
python -m http.server 4173
```

Open `http://localhost:4173`.

## Content

Portfolio content is maintained in [`data/portfolio-data.js`](data/portfolio-data.js):

- `projects` controls featured and additional projects.
- `experience` contains formal professional roles.
- `community` contains volunteering, leadership, and hackathon participation.
- `skills` controls the categorized technology collection.

Optional fields such as GitHub and live URLs are only rendered when they contain real values.

## Deployment

The repository is linked to the Vercel project `ishaq-portfolio`. Vercel serves the repository as a static site, so no framework preset or build command is required.

Production changes should be reviewed on a preview deployment before promoting them to the production branch.
