# risbergetfinnskogen.no

Eleventy source for the rebuilt Risberget Finnskogen website. 

## Requirements

- Node.js 20 or newer
- npm

## Development

```sh
npm install
npm start
```

Eleventy serves the site at `http://localhost:8080/`.
Development output is written to `_site/`, leaving the production `docs/`
directory unchanged.

## Production build

```sh
npm run build
```

The generated static site is written to `docs/` with the
`/risbergetfinnskogen/` path prefix required by GitHub Pages.

You do not need to run this before committing. The pre-commit hook runs
`npm run build` automatically, stops the commit if the build fails, and stages
generated changes in `docs/` when the build succeeds. Run `npm run build`
manually only when you want to check the production output before committing.

Commit and push changes and the GitHub page will be updated in a few minutes.

See the live page at https://emblah.github.io/risbergetfinnskogen/.

## Help

Read the [help page](./HELP.md) to learn how to contribute to this website.
