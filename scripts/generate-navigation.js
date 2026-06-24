#!/usr/bin/env node

/**
 * Generate Eleventy navigation data from page front matter.
 */

import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

const ROOT = process.cwd();
const SOURCES = ["src/index.njk", "src/pages"];
const OUTPUT = "src/_data/navigation.json";
const PAGE_EXTENSIONS = new Set([".md", ".njk"]);

const collator = new Intl.Collator("nb");

function findPageFiles(source) {
  const sourcePath = path.join(ROOT, source);
  const stat = fs.statSync(sourcePath);

  if (stat.isFile()) {
    return PAGE_EXTENSIONS.has(path.extname(sourcePath)) ? [sourcePath] : [];
  }

  const files = [];
  for (const entry of fs.readdirSync(sourcePath, { withFileTypes: true })) {
    const entryPath = path.join(sourcePath, entry.name);
    if (entry.isDirectory()) {
      files.push(...findPageFiles(path.relative(ROOT, entryPath)));
    } else if (entry.isFile() && PAGE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }
  return files.sort();
}

function normalizeUrl(value, file) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${file}: nav pages must define a permalink`);
  }

  let url = value.trim();
  if (!url.startsWith("/")) {
    url = `/${url}`;
  }
  if (!url.endsWith("/")) {
    url = `${url}/`;
  }
  return url;
}

function readNavPage(file) {
  const relativeFile = path.relative(ROOT, file);
  const { data } = matter(fs.readFileSync(file, "utf8"));

  if (data.nav === undefined || data.nav === false) {
    return null;
  }
  if (data.nav !== true && (typeof data.nav !== "object" || Array.isArray(data.nav))) {
    throw new Error(`${relativeFile}: nav must be an object, true, or false`);
  }

  const nav = data.nav === true ? {} : data.nav;
  const url = normalizeUrl(data.permalink, relativeFile);
  const label = nav.label ?? data.title;

  if (typeof label !== "string" || label.trim() === "") {
    throw new Error(`${relativeFile}: nav pages must define nav.label or title`);
  }
  if (!Number.isInteger(nav.order)) {
    throw new Error(`${relativeFile}: nav.order must be an integer`);
  }

  return {
    children: [],
    file: relativeFile,
    label: label.trim(),
    order: nav.order,
    parent: nav.parent ? normalizeUrl(nav.parent, relativeFile) : null,
    url,
  };
}

function collectPages() {
  const files = SOURCES.flatMap(findPageFiles).sort();
  const pages = files.map(readNavPage).filter(Boolean);
  const byUrl = new Map();

  for (const page of pages) {
    const duplicate = byUrl.get(page.url);
    if (duplicate) {
      throw new Error(`${page.file}: duplicate nav URL ${page.url} also used by ${duplicate.file}`);
    }
    byUrl.set(page.url, page);
  }

  return { byUrl, pages };
}

function comparePages(a, b) {
  return a.order - b.order || collator.compare(a.label, b.label) || collator.compare(a.url, b.url);
}

function assertUniqueSiblingOrders(parentLabel, pages) {
  const byOrder = new Map();
  for (const page of pages) {
    const duplicate = byOrder.get(page.order);
    if (duplicate) {
      throw new Error(
        `${page.file}: duplicate nav.order ${page.order} with ${duplicate.file} under ${parentLabel}`,
      );
    }
    byOrder.set(page.order, page);
  }
}

function buildTree(pages, byUrl) {
  const roots = [];
  const siblingsByParent = new Map([["root", roots]]);

  for (const page of pages) {
    if (!page.parent) {
      roots.push(page);
      continue;
    }

    const parent = byUrl.get(page.parent);
    if (!parent) {
      throw new Error(`${page.file}: nav.parent ${page.parent} is not included in navigation`);
    }
    parent.children.push(page);
    siblingsByParent.set(page.parent, parent.children);
  }

  for (const [parent, siblings] of siblingsByParent) {
    assertUniqueSiblingOrders(parent, siblings);
    siblings.sort(comparePages);
  }

  roots.sort(comparePages);
  return roots;
}

function toNavigationItem(page) {
  const item = {
    label: page.label,
    url: page.url,
  };

  if (page.children.length > 0) {
    item.children = page.children.map(toNavigationItem);
  }

  return item;
}

function main() {
  const { byUrl, pages } = collectPages();
  const navigation = buildTree(pages, byUrl).map(toNavigationItem);
  const outputPath = path.join(ROOT, OUTPUT);
  fs.writeFileSync(outputPath, `${JSON.stringify(navigation, null, 2)}\n`);
  console.log(`Generated ${OUTPUT} from ${pages.length} nav pages.`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
