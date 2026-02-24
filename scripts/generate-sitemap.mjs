// scripts/generate-sitemap.mjs

import fs from "fs";

const SITE = "https://birthday.studiorich.tv";
const OUT_ROOT = "d"; // must match your pages output folder

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

function run() {
  const urls = [];

  // Home (optional but nice)
  urls.push(`${SITE}/`);

  // Date pages
  for (let m = 0; m < months.length; m++) {
    const [monthName, daysInMonth] = months[m];
    for (let d = 1; d <= daysInMonth; d++) {
      const slug = `${monthName}-${pad2(d)}`;
      urls.push(`${SITE}/${OUT_ROOT}/${slug}/`);
    }
  }

  const now = new Date().toISOString();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (loc) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${now}</lastmod>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  fs.writeFileSync("sitemap.xml", sitemap, "utf8");

  // Optional robots.txt (recommended)
  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;
  fs.writeFileSync("robots.txt", robots, "utf8");

  console.log(`✅ Wrote sitemap.xml (${urls.length} urls) and robots.txt`);
}

run();
