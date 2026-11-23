import { readFileSync, writeFileSync } from "node:fs";
const read = (path) =>
  JSON.parse(
    readFileSync(new URL("../../src/content/" + path, import.meta.url)),
  );
const catalog = read("catalog.json"),
  assets = read("assets.json");
const languages = ["ar", "en"];
const locales = Object.fromEntries(
  languages.map((l) => [l, read(l + "/portfolio.json")]),
);
const ui = Object.fromEntries(languages.map((l) => [l, read(l + "/ui.json")]));
const bilingual = (fn) => Object.fromEntries(languages.map((l) => [l, fn(l)]));
const archive = { ...assets, ...assets.packaging };
delete archive.packaging;
const picture = (url, i) => {
  const legacy = Object.keys(archive).find((k) => archive[k] === url);
  if (!legacy) throw Error("Unknown legacy image");
  return { _type: "picture", _key: "image" + i, legacy };
};
const types = {
  stages: "stage",
  cases: "project",
  packs: "product",
  films: "film",
};
const docs = [
  { _id: "portfolio-settings", _type: "settings", ...read("settings.json") },
];
for (const [group, rows] of Object.entries(catalog))
  for (const [i, row] of rows.entries()) {
    const value = (k) => bilingual((l) => locales[l][group][row.id][k]);
    const type = types[group],
      d = {
        _id: type + "-" + row.id,
        _type: type,
        title: value(["packs", "films"].includes(group) ? "name" : "title"),
        order: (i + 1) * 10,
        hidden: false,
      };
    if (type === "project")
      Object.assign(d, {
        category: row.cat,
        subtitle: value("sub"),
        period: value("year"),
        description: value("description"),
        steps: value("steps"),
        gallery: row.images.map(picture),
      });
    if (type === "stage")
      Object.assign(d, {
        art: row.type,
        color: row.scene,
        period: row.yr,
        label: value("label"),
        description: value("body"),
        chips: value("chips"),
      });
    if (type === "product")
      Object.assign(d, {
        description: value("description"),
        brand: value("brand"),
        gallery: assets.packaging[row.image] ? [picture(assets.packaging[row.image], 0)] : [],
      });
    if (type === "film")
      Object.assign(d, {
        description: value("description"),
        design: value("design"),
        tag: value("tag"),
      });
    docs.push(d);
  }
const sections = new Map();
const groups = [
  [/^(hero|logo|scroll|explore|firstChapter)/, "الافتتاحية"],
  [/^(nav|pageTitle|description)/, "التنقل وبيانات الصفحة"],
  [/^(art|journey|prelude|intro)/, "المسيرة"],
  [/^(pack|prev|next)/, "التغليف"],
  [/^(model|viewer|threeD|demo)/, "المجسمات"],
  [/^(film|video|play)/, "الفيديو"],
  [/^(contact|end|whats|close|builtFor)/, "التواصل والتذييل"],
  [/^(archive|other|gmcsa|clinic|therapy)/, "الأرشيف"],
];
for (const key of Object.keys(ui.ar)) {
  const index = groups.findIndex(([re]) => re.test(key)),
    id = "section-" + (index + 1);
  if (!sections.has(id))
    sections.set(id, {
      _id: id,
      _type: "section",
      name: groups[index]?.[1] || "المشاريع ونصوص الواجهة",
      entries: [],
    });
  sections
    .get(id)
    .entries.push({
      _key: key,
      _type: "object",
      key,
      value: bilingual((l) => ui[l][key]),
    });
}
docs.push(...sections.values());
writeFileSync(
  new URL("../portfolio.ndjson", import.meta.url),
  docs.map((d) => JSON.stringify(d)).join("\n") + "\n",
);
console.log("Prepared", docs.length, "documents");
