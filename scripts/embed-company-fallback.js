const fs = require("fs");

const data = JSON.parse(fs.readFileSync("data/companies.json", "utf8"));
const htmlPath = "index.html";
const html = fs.readFileSync(htmlPath, "utf8");
const json = JSON.stringify(data).replace(/<\//g, "<\\/");
const fallbackTag = `<script id="companyDataFallback" type="application/json">${json}</script>`;

let output = html.replace(
  /\s*<script id="companyDataFallback" type="application\/json">[\s\S]*?<\/script>/,
  `\n    ${fallbackTag}`,
);

if (output === html) {
  output = html.replace(/\s*<script src="data\/companies-inline\.js\?v=29"><\/script>/, `\n    ${fallbackTag}`);
}

if (output === html) {
  throw new Error("Could not find companies-inline script tag in index.html");
}

fs.writeFileSync(htmlPath, output, "utf8");
console.log(JSON.stringify({ count: data.length, htmlBytes: output.length }, null, 2));
