import { readFile, writeFile, mkdir } from "node:fs/promises";
const root = new URL("../", import.meta.url);
const local = async (path) =>
  JSON.parse(await readFile(new URL("src/content/" + path + ".json", root)));
const [assets, settings, catalog, ar, en, arUI, enUI] = await Promise.all(
  [
    "assets",
    "settings",
    "catalog",
    "ar/portfolio",
    "en/portfolio",
    "ar/ui",
    "en/ui",
  ].map(local),
);
let data = { assets, settings, catalog, ar, en, arUI, enUI, models: [] };
const langs = ["ar", "en"];
const url = (value) => {
  if (!value) return "";
  const parsed = new URL(value);
  if (parsed.protocol !== "https:" || /["'<>\s]/.test(value))
    throw Error("Expected an HTTPS media or platform URL");
  return parsed.href;
};
// V11 uses only these exact formatting tags in editorial text.
const formatting =
  /<\/?(?:em|span)>|<br>|<span style="color:(?:var\(--lime\)|#557766)">/g;
function safeText(value) {
  if (typeof value !== "string") throw Error("Missing translation");
  if (value.replace(formatting, "").includes("<"))
    throw Error("Unsupported markup in translation");
  return value;
}
function projectDocuments(docs) {
  const result = {
    assets: structuredClone(assets),
    catalog: { stages: [], cases: [], packs: [], films: [] },
    ar: {},
    en: {},
    arUI: {},
    enUI: {},
    models: [],
  };
  const links = docs.find((d) => d._id === "portfolio-settings");
  if (!links || links.contactE164 && !/^\+[1-9]\d{7,14}$/.test(links.contactE164))
    throw Error("Missing site settings or invalid contact number");
  result.settings = {
    contactE164: links.contactE164 || "",
    behance: url(links.behance),
    shutterstock: url(links.shutterstock),
  };
  for (const [key, field] of [
    ["logo", "logoUrl"],
    ["gm", "trainingUrl"],
    ["clinic3", "clinicUrl"],
  ])
    if (links[field]) result.assets[key] = url(links[field]);
  const legacy = { ...assets, ...assets.packaging };
  const photos = (d) =>
    (d.gallery || [])
      .map((pic) => url(pic.url || legacy[pic.legacy]))
      .filter(Boolean);
  for (const l of langs)
    for (const group of Object.keys(result.catalog)) result[l][group] = {};
  const sections = docs.filter((d) => d._type === "section");
  for (const s of sections)
    for (const { key, value } of s.entries || [])
      if (Object.hasOwn(arUI, key))
        for (const l of langs) result[l + "UI"][key] = safeText(value[l]);
  for (const key of Object.keys(arUI))
    if (!Object.hasOwn(result.arUI, key))
      throw Error("Missing interface text: " + key);
  const groups = {
    stage: "stages",
    project: "cases",
    product: "packs",
    film: "films",
  };
  for (const d of docs
    .filter((d) => !d.hidden)
    .sort(
      (a, b) =>
        (a.order ?? 100) - (b.order ?? 100) || a._id.localeCompare(b._id),
    )) {
    const group = groups[d._type];
    if (d._type === "model" && d.modelUrl) {
      result.models.push({
        id: d._id,
        url: url(d.modelUrl),
        name: Object.fromEntries(langs.map((l) => [l, safeText(d.title[l])])),
      });
      continue;
    }
    if (!group) continue;
    const id = d._id.replace(new RegExp("^" + d._type + "-"), "");
    if (
      !/^[A-Za-z0-9_.-]+$/.test(id) ||
      ["constructor", "__proto__", "prototype"].includes(id) ||
      Object.hasOwn(result.ar[group], id)
    )
      throw Error("Invalid or duplicate item id: " + id);
    const row = { id };
    if (group === "stages") {
      if (!/^#[a-f\d]{6}$/i.test(d.color)) throw Error("Invalid scene color");
      Object.assign(row, {
        type: d.art,
        scene: d.color,
        yr: safeText(d.period),
      });
    }
    if (group === "cases")
      Object.assign(row, { cat: d.category, images: photos(d) });
    if (group === "packs") {
      row.image = id;
      row.gallery = photos(d);
      result.assets.packaging[id] = row.gallery[0] || "";
    }
    if (group === "films")
      Object.assign(row, { cover: url(d.coverUrl), video: url(d.videoUrl) });
    result.catalog[group].push(row);
    const mapping = {
      stages: {
        title: "title",
        body: "description",
        label: "label",
        chips: "chips",
      },
      cases: {
        title: "title",
        sub: "subtitle",
        year: "period",
        description: "description",
        steps: "steps",
      },
      packs: { name: "title", description: "description", brand: "brand" },
      films: {
        name: "title",
        description: "description",
        tag: "tag",
        design: "design",
      },
    }[group];
    for (const l of langs)
      result[l][group][id] = Object.fromEntries(
        Object.entries(mapping).map(([target, source]) => {
          const value = d[source]?.[l];
          return [
            target,
            Array.isArray(value) ? value.map(safeText) : safeText(value),
          ];
        }),
      );
  }
  return result;
}
const id = process.env.SANITY_PROJECT_ID,
  dataset = process.env.SANITY_DATASET || "production";
if (process.argv[2]) {
  const rows = (await readFile(process.argv[2], "utf8"))
    .trim()
    .split("\n")
    .map(JSON.parse);
  data = projectDocuments(rows);
} else if (id) {
  if (!/^[a-z0-9]+$/.test(id) || !/^[-a-z0-9_]+$/.test(dataset))
    throw Error("Invalid project or dataset");
  const query =
    '*[_type in ["settings","section","project","stage","product","film","model"]]{...,gallery[]{..., "url":image.asset->url},"logoUrl":logo.asset->url,"clinicUrl":clinic.asset->url,"trainingUrl":training.asset->url,"coverUrl":cover.asset->url,"videoUrl":video.asset->url,"modelUrl":object.asset->url}';
  const endpoint = new URL(
    "https://" + id + ".api.sanity.io/v2025-02-19/data/query/" + dataset,
  );
  endpoint.searchParams.set("perspective", "published");
  endpoint.searchParams.set("query", query);
  const response = await fetch(endpoint, {
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw Error("Sanity read failed: " + response.status);
  data = projectDocuments((await response.json()).result);
}
const directory = new URL("src/generated/", root);
await mkdir(directory, { recursive: true });
await writeFile(new URL("portfolio.json", directory), JSON.stringify(data));
console.log(
  "Portfolio content prepared:",
  Object.fromEntries(
    Object.entries(data.catalog).map(([k, v]) => [k, v.length]),
  ),
);
