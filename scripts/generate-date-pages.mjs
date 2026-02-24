import fs from "fs";
import path from "path";

const SITE = "https://birthday.studiorich.tv";
const OUT_ROOT = "d"; // outputs to ./d/... (served by GitHub Pages)
const APP_PATH = "/"; // your app lives at /
const OG_IMAGE = "/share.jpg"; // put share.jpg in repo root

const YEAR_FOR_QUERY = 2000; // stable non-leap baseline year

const months = [
  ["january", 31],
  ["february", 28],
  ["march", 31],
  ["april", 30],
  ["may", 31],
  ["june", 30],
  ["july", 31],
  ["august", 31],
  ["september", 30],
  ["october", 31],
  ["november", 30],
  ["december", 31],
];

const pad2 = (n) => String(n).padStart(2, "0");

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });

const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

function pageHtml({ slug, monthName, day, dateParam }) {
  const niceMonth = monthName[0].toUpperCase() + monthName.slice(1);
  const title = `${niceMonth} ${day} Birthday — Famous Birthdays, Zodiac, Events`;
  const desc = `Explore ${niceMonth} ${day}: zodiac identities, famous births, and historical events.`;
  const canonical = `${SITE}/${OUT_ROOT}/${slug}/`;
  const ogImageAbs = `${SITE}${OG_IMAGE}`;
  const appUrl = `${SITE}${APP_PATH}?date=${dateParam}`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${canonical}" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Birthday Cultural Portal" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${ogImageAbs}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(desc)}" />
  <meta name="twitter:image" content="${ogImageAbs}" />

  <meta http-equiv="refresh" content="0; url=${appUrl}" />
  <script>window.location.replace(${JSON.stringify(appUrl)});</script>
</head>
<body>
  <noscript>
    <p>Redirecting… <a href="${appUrl}">Continue</a></p>
  </noscript>
</body>
</html>`;
}

function run() {
  const outBase = path.join(process.cwd(), OUT_ROOT);
  ensureDir(outBase);

  let count = 0;

  for (let m = 0; m < months.length; m++) {
    const [monthName, daysInMonth] = months[m];
    for (let d = 1; d <= daysInMonth; d++) {
      const slug = `${monthName}-${pad2(d)}`;
      const dir = path.join(outBase, slug);
      ensureDir(dir);

      const dateParam = `${YEAR_FOR_QUERY}-${pad2(m + 1)}-${pad2(d)}`;
      const html = pageHtml({ slug, monthName, day: d, dateParam });

      fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
      count++;
    }
  }

  console.log(`✅ Generated ${count} pages at ./${OUT_ROOT}/...`);
}

run();
// scripts/generate-date-pages.mjs
