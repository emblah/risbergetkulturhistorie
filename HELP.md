# Developer guide

This site is built with [Eleventy](https://www.11ty.dev/) from files in `src/`.
Use this guide when adding or changing content.

## Local development

Requirements:

- Node.js 20 or newer
- npm (included in most Node.js installations)

Install dependencies and start the development server:

```sh
npm install
npm start
```

The local site is available at `http://localhost:8080/`.

You do not need to run the production build before committing. The pre-commit
hook runs this command automatically:

```sh
npm run build
```

This writes the production site to `docs/` and runs `scripts/check-site.js`.
The check fails on broken local links, missing document titles, or pages that do
not contain exactly one `<h1>`.

If the build fails, the commit is stopped. When the build succeeds, generated
changes in `docs/` are staged automatically so the committed source and GitHub
Pages output stay together. You can still run `npm run build` manually when you
want to check the production output before committing.

Do not edit files in `docs/` directly. They are generated from `src/`.

## Repository structure

- `src/pages/`: normal content pages
- `src/_includes/layouts/`: page layouts
- `src/_includes/components/`: shared Nunjucks components
- `src/_data/`: data available to every template
- `src/assets/images/`: site images, grouped by subject
- `src/assets/documents/`: downloadable documents
- `src/assets/css/site.css`: site styles
- `src/assets/js/site.js`: navigation and gallery lightbox behavior
- `src/_data/navigation.json`: generated sidebar navigation data
- `src/_data/redirects.json`: legacy URL mappings
- `scripts/generate-navigation.js`: generates sidebar navigation from page
  front matter
- `scripts/check-site.js`: validation of generated HTML and local links

## Choosing Markdown or Nunjucks

Use a `.md` file for primarily written content. Markdown is easier to review and
should be the default for articles and simple pages. 

Learn more about Markdown [here](https://www.markdownguide.org/cheat-sheet/).

Use a `.njk` file when the page needs substantial HTML structure, such as card
grids, document images, or a gallery whose data is declared in front matter.

Nunjucks is enabled inside both `.md` and `.njk` files. Small amounts of HTML
may also be embedded directly in Markdown when Markdown alone is insufficient.

Learn more about Nunjucks [here](https://mozilla.github.io/nunjucks/templating.html).

## Front matter

Every content page starts with YAML front matter:

```yaml
---
layout: layouts/page.njk
title: Page title
description: A concise description used in metadata.
introduction: Optional introductory text shown below the heading.
permalink: /section/page/
nav:
  order: 10
breadcrumbs:
  - label: Section
    url: /section/
  - label: Page title
---
```

Conventions:

- Use `layouts/page.njk` for standard pages.
- Use `layouts/gallery.njk` for standalone image galleries.
- Use `layouts/event.njk` for archived events with an optional event gallery.
- Give normal page permalinks a leading and trailing slash.
- Add `nav` only when the page should appear in the sidebar navigation.
- Write public text in Norwegian Bokmål unless the source material requires
  otherwise.
- Keep `title` short and unique.
- Write `description` as a plain-text summary suitable for search results.
- Do not add an `<h1>` in the page body; layouts render it from `title`.
- Breadcrumbs start below the home page because the component adds `Forside`
  automatically.
- The final breadcrumb normally has no `url`, so it represents the current page.

## Markdown pages

A standard Markdown page looks like this:

```md
---
layout: layouts/page.njk
title: Eksempelside
description: Kort beskrivelse av eksempelsiden.
introduction: En valgfri innledning.
permalink: /historie/eksempelside/
breadcrumbs:
  - label: Historie og kultur
    url: /historie/
  - label: Eksempelside
---
Brødtekst skrives som vanlig Markdown.

## Mellomtittel

Bruk [beskrivende lenketekst](/historie/) for interne lenker.
```

Use semantic headings in order: the layout supplies `<h1>`, so page content
normally begins with `##`. Avoid using headings only for visual styling.

Root-relative internal URLs such as `/historie/` and `/assets/images/...` are
the project convention. Eleventy's HTML base plugin adds the GitHub Pages path
prefix during production builds.

## Nunjucks pages

Nunjucks output uses `{{ ... }}` and control flow uses `{% ... %}`:

```njk
{% if introduction %}
  <p>{{ introduction }}</p>
{% endif %}

{% for item in items %}
  <a href="{{ item.url }}">{{ item.label }}</a>
{% endfor %}
```

Shared components belong in `src/_includes/components/`; layouts belong in
`src/_includes/layouts/`. Reference either relative to the includes directory:

```njk
{% include "components/header.njk" %}
```

Eleventy supplies rendered page content through `content`. Layouts must use
`{{ content | safe }}` when intentionally inserting that generated HTML.
Do not apply `safe` to untrusted or user-provided content.

Prefer semantic HTML and existing CSS classes. Check `src/assets/css/site.css`
before adding new markup or styles.

## Images

Store images under the closest subject directory in `src/assets/images/`.
Use lowercase, descriptive filenames with hyphens. Gallery and event files use
zero-padded sequence numbers, for example `var-01.jpg`.

Every `<img>` must include:

- A useful Norwegian `alt` description, or `alt=""` only for a genuinely
  decorative image
- The image's intrinsic `width` and `height`
- `loading="lazy"` for images that are not expected to be the first prominent
  image on the page

Do not put credits or extra context in `alt`; use a visible caption instead.
Linking an image with `data-lightbox` activates the shared lightbox behavior.

## Standalone galleries

Standalone galleries keep their image data in the page front matter:

```yaml
---
layout: layouts/gallery.njk
title: Eksempelgalleri
description: Bilder fra et eksempelgalleri i Risberget.
introduction: Valgfri introduksjon til galleriet.
permalink: /bilder/eksempel/
breadcrumbs:
  - label: Bilder
    url: /bilder/
  - label: Eksempelgalleri
images:
  - src: /assets/images/galleries/example/example-01.jpg
    alt: Konkret beskrivelse av motivet.
    width: 1280
    height: 960
    caption: Valgfri synlig bildetekst.
  - src: /assets/images/galleries/example/example-02.jpg
    large: /assets/images/galleries/example/example-02-large.jpg
    alt: Beskrivelse av det andre motivet.
    width: 640
    height: 480
---
```

`large` is optional. When present, the thumbnail uses `src` and the lightbox
opens `large`; otherwise both use `src`.

When adding a gallery:

1. Put its images in a dedicated directory under
   `src/assets/images/galleries/`.
2. Add the gallery page under `src/pages/`.
3. Add a card or link from its section index.
4. Add `nav` front matter only if it belongs in the sidebar.

## Events

Event pages use Markdown for event text and keep their image data in front
matter, using the same format as standalone galleries:

```md
---
layout: layouts/event.njk
title: Kulturdagen 2026
description: Program og bilder fra Kulturdagen 2026 i Risberget.
introduction: Kort introduksjon til arrangementet.
permalink: /arrangementer/kulturdag-2026/
breadcrumbs:
  - label: Arrangementer
    url: /arrangementer/
  - label: Kulturdagen 2026
images:
  - src: /assets/images/events/kulturdag-2026/kulturdag-2026-01.jpg
    alt: Konkret beskrivelse av motivet i det første bildet.
    width: 1280
    height: 960
  - src: /assets/images/events/kulturdag-2026/kulturdag-2026-02.jpg
    alt: Konkret beskrivelse av motivet i det andre bildet.
    caption: Valgfri synlig bildetekst.
    width: 1280
    height: 960
---
Tekst om arrangementet.
```

Event images are stored in:

```text
src/assets/images/events/kulturdag-2026/
```

Add each image to the page's `images` list with its path, useful alternative
text, and intrinsic dimensions. Add `caption` when visible context is useful.
An event page may omit `images` when it has no images.

When adding an event, also update:

- `src/pages/arrangementer/index.njk`
- The event page's `nav` front matter, if the event should appear in the
  sidebar
- `src/_data/redirects.json`, if an old public URL must continue to work

Historical events may also use the event layout, as the 350-year anniversary
page does.

## Navigation and links

Sidebar navigation is generated from `nav` front matter by
`scripts/generate-navigation.js`. Do not edit `src/_data/navigation.json`
directly; it is generated by `npm start`, `npm run build`, or:

```sh
npm run generate:navigation
```

The generator scans `src/index.njk` and all `.md` and `.njk` files under
`src/pages/`. Pages with no `nav` field, or with `nav: false`, are omitted from
the sidebar.

Top-level navigation item:

```yaml
nav:
  order: 3
```

Child navigation item:

```yaml
nav:
  label: Årringdatering
  order: 4
```

`nav` fields:

- `order`: required integer for included pages. It controls ordering among
  siblings.
- `parent`: optional permalink of another page included in navigation. When it
  is omitted, the generator uses the nearest included ancestor URL, so
  `/historie/arringdatering/` is placed under `/historie/` when that page is in
  navigation. Omit it for normal top-level items and normal section children;
  add it only when the page should appear under a different parent.
- `label`: optional sidebar label. When omitted, the page `title` is used.

Navigation URLs come from each page's `permalink`. The generator normalizes
`permalink` and explicit `nav.parent` values to leading and trailing slashes,
but the project convention is still to write them that way in front matter.

Sibling pages under the same parent must use unique `nav.order` values. The
generator fails when it finds duplicate navigation URLs, duplicate sibling
orders, missing labels, missing permalinks, or a `nav.parent` that is not also
included in navigation. Keep navigation ordering intentional and consistent with
section index pages.

Use root-relative URLs for internal pages and assets. Use descriptive link text;
avoid labels such as “click here”. After renaming or moving a published page,
record the old-to-new mapping in `src/_data/redirects.json`.

## Documents

Store downloadable files in `src/assets/documents/`. Link to the file with a
root-relative URL and include the file type in visible text when useful:

```md
[Årsmøteprotokoll 2026 (PDF)](/assets/documents/arsmoteprotokoll-2026.pdf)
```

If a document is presented as page images, follow the existing
`arsmoteprotokoller` pages and use the `document-image` class.

## Completion checklist

- Content is under `src/`, not `docs/`.
- Front matter has the correct layout, title, description, permalink, and
  breadcrumbs.
- The page body does not add a second `<h1>`.
- Internal links and asset URLs are root-relative.
- Images have accurate dimensions and useful alternative text.
- Section index pages, `nav` front matter, and redirects are updated where
  applicable.
- The automatic pre-commit build completes successfully, or `npm run build`
  has been run manually to check the production output.
- The changed page is checked in the local development server at desktop and
  narrow viewport widths.

## Links

- https://www.11ty.dev/
- https://www.markdownguide.org/cheat-sheet/
- https://mozilla.github.io/nunjucks/templating.html
