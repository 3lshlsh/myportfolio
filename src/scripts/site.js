import portfolio from "../generated/portfolio.json";
const { assets, models } = portfolio;
const attr = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
import { contentFor, strings } from "../lib/content.js";
let stages, cases, packs, films;
import { initViewer } from "./viewer.js";
// Contact number obtained from an archived CV and must be confirmed before publishing.
import { initContactDialog } from "./contact.js";
import { initEnhancedMotion } from "./reveal.js";
let lang = "ar",
  packIndex = 0,
  filmIndex = 0,
  modelAngle = 0;
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
if (assets.gm) $("#gmcsaArchiveImg").src = assets.gm;
if (assets.clinic3) $("#clinicArchiveImg").src = assets.clinic3;
$$("[data-open-case]").forEach(
  (el) => (el.onclick = () => openCase(el.dataset.openCase)),
);
function setLanguage(l) {
  lang = l;
  ({ stages, cases, packs, films } = contentFor(l));
  document.querySelectorAll("[data-open-case]").forEach((el) => {
    el.hidden = !cases.some((item) => item.id === el.dataset.openCase);
    if (el.hidden) el.style.display = "none";
    else el.style.removeProperty("display");
  });
  for (const [id, items] of [
    ["packaging", packs],
    ["films", films],
    ["works", cases],
  ]) {
    const section = document.getElementById(id);
    section.style.display = items.length ? "" : "none";
  }
  document.querySelectorAll("#modelSelection option").forEach((option, i) => {
    option.textContent = models[i].name[l];
  });
  const currentModel = models.find(
    (m) => m.id === $("#modelType").dataset.modelId,
  );
  if (currentModel) $("#modelType").textContent = currentModel.name[l];
  document.title = strings[l].pageTitle;
  document.querySelector("meta[name=description]").content =
    strings[l].description;
  for (const attr of ["aria-label", "title", "alt"]) {
    for (const el of document.querySelectorAll("[data-i18n-" + attr + "]"))
      el.setAttribute(attr, strings[l][el.getAttribute("data-i18n-" + attr)]);
  }
  document.documentElement.lang = l;
  document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  $$("[data-lang]").forEach((b) =>
    b.classList.toggle("active", b.dataset.lang === l),
  );
  $$("[data-t]").forEach(
    (el) => (el.innerHTML = strings[l][el.dataset.t] || el.innerHTML),
  );
  renderStages();
  renderCases();
  renderPacks();
  renderVideos();
  try {
    localStorage.setItem("ali-lang", l);
  } catch (e) {}
  onScroll();
}
function stageMarkup(s) {
  let art = "";
  if (s.type === "study")
    art =
      '<div class="stageOrbit"></div><div class="paper large"><span class="eyebrow" style="color:#6a897b">' +
      strings[lang].artFoundations2014 +
      '</span><h3 style="font:900 50px Manrope;margin:35px 0 0">ABC<br>123</h3><div class="line"></div><div class="line sm"></div></div><div class="paper small"><strong style="font:900 36px Alexandria,Manrope">' +
      strings[lang].artTheFirstMark +
      '</strong></div><div class="sceneStamp" style="font-size:74px">·</div>';
  else if (s.type === "university")
    art =
      '<div class="stageOrbit"></div><div class="paper large"><span class="eyebrow" style="color:#6b7c77">' +
      strings[lang].artELearning +
      '</span><h3 style="font:900 45px Manrope;margin:40px 0 12px">' +
      strings[lang].artReachBrExpands +
      '</h3><div class="line"></div><div class="line sm"></div></div><div class="compFloat">' +
      strings[lang].artPrintMotion +
      "</div>";
  else if (s.type === "agency")
    art =
      '<div class="stageOrbit"></div><div class="paper large" style="background:#dfe6ca"><h3 style="font:900 54px Manrope;margin:40px 0">CREATIVE<br>GRAPHICS</h3><div class="line"></div></div><div class="paper small" style="background:#365650;color:white;display:grid;place-items:center;font:900 65px Manrope">OBAB</div>';
  else if (s.type === "gmcsa")
    art =
      '<div class="photoStage" style="background:linear-gradient(140deg,#2b3e48,#4c6665)"><img src="' +
      assets.gm +
      '" alt="GMCSA training design"><div class="photoTitle">' +
      strings[lang].artGmcsaTrainingContent +
      '</div></div><div class="compFloat">' +
      strings[lang].artEducationMotion +
      "</div>";
  else if (s.type === "therapy")
    art =
      '<div class="photoStage" style="background:linear-gradient(140deg,#233f54,#244f61)"><img src="' +
      (assets.clinic1 || assets.clinic3) +
      '" alt="Therapy Solutions design"><div class="photoTitle">' +
      strings[lang].artTherapySolutions +
      '</div></div><div class="compFloat">' +
      strings[lang].artIdentityContent +
      "</div>";
  else if (s.type === "othaim")
    art =
      '<div class="photoStage"><img src="' +
      assets.packaging["haley-coffee"] +
      '" alt="Haley coffee packaging"><div class="photoTitle">' +
      strings[lang].artAlOthaimProductPackaging +
      '</div></div><div class="compFloat">' +
      strings[lang].artPrivateLabels +
      "</div>";
  else if (s.type === "cement")
    art =
      '<div class="stageOrbit"></div><div class="paper large" style="background:#dce4de"><span class="eyebrow" style="color:#53685d">' +
      strings[lang].artCorporateCommunication +
      '</span><h3 style="font:900 62px Manrope;margin:38px 0">' +
      strings[lang].artRccBrStories +
      '</h3><div class="line"></div></div><div class="compFloat">' +
      strings[lang].artPhotoVideo +
      "</div>";
  else
    art =
      '<div class="stageOrbit"></div><div class="threeStage"><div class="abstract3d">3D</div></div><div class="compFloat">' +
      strings[lang].artFromFileToForm +
      "</div>";
  return `<section class="sceneTrack" style="--scene:${s.scene}"><div class="scenePin" ><div class="sceneInner"><div class="sceneCopy"><span class="eyebrow">${s.label} · <bdi dir="ltr">${s.yr}</bdi></span><h2>${s.title}</h2><p>${s.body}</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:20px">${s.chips.map((c) => `<span class="tag">${c}</span>`).join("")}</div></div><div class="sceneArt">${art}</div></div></div></section>`;
}
function renderStages() {
  $("#storyMount").innerHTML = stages.map(stageMarkup).join("");
}
function renderCases() {
  const active = $(".galleryNav button.active")?.dataset.filter || "all";
  $("#caseGrid").innerHTML = cases
    .filter((c) => active === "all" || c.cat === active)
    .map(
      (c) =>
        `<button class="case" data-case="${c.id}" style="text-align:inherit;color:inherit"><div class="caseHero" style="--casebg:${c.cat === "pack" ? "#4f665e" : c.cat === "corporate" ? "#344650" : "#455959"}">${c.images.length ? `<img src="${c.images[0]}" alt="${attr(c.title)}" loading="lazy" onerror="this.style.display='none'">` : `<div class="fallbackArt">${c.id === "cement" ? "RCC" : c.id === "blur" ? "BLUR" : "BLUE"}</div>`}</div><div class="caseInfo"><div class="eyebrow">${c.sub}</div><h3>${c.title}</h3><p>${c.description}</p><footer><span>${c.year}</span><span>${strings[lang].more} ↗</span></footer></div></button>`,
    )
    .join("");
  $$("[data-case]").forEach((el) =>
    el.addEventListener("click", () => openCase(el.dataset.case)),
  );
}
function openCase(id) {
  const c = cases.find((x) => x.id === id);
  if (!c) return;
  $("#projectDetails").innerHTML =
    `<div class="modalHead"><span class="eyebrow" style="color:#5e7764">${c.sub} · ${c.year}</span><h2>${c.title}</h2><p>${c.description}</p></div><div class="modalSteps">${c.steps.map((s, i) => `<div><b>0${i + 1}</b>${s}</div>`).join("")}</div>${c.images.length ? `<div class="modalGallery">${c.images.map((img, i) => `<img alt="${attr(c.title)} ${i + 1}" src="${img}" onerror="this.style.display='none'">`).join("")}</div>` : `<div style="background:#d8e1d7;border-radius:20px;padding:40px;font:900 80px DM Sans;text-align:center;color:#35534d">${c.title}</div>`}<div class="modalFooter">${strings[lang].detailThisIsAnOnSiteCaseStudyFinalAssetsAndDetailWillBeComple}</div>`;
  $("#projectModal").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  $$(".modal").forEach((x) => x.classList.remove("open"));
  document.body.style.overflow = "";
  $("#videoPlayer").pause();
}
function renderPacks() {
  if (!packs.length) return;
  $("#packStrip").innerHTML = packs
    .map(
      (p, i) =>
        `<button class="packThumb ${i === packIndex ? "active" : ""}" data-pack="${i}" aria-label="${attr(p.name)}"><img src="${assets.packaging[p.image]}" alt="${attr(p.name)}" loading="lazy" onerror="this.style.opacity='.1'"></button>`,
    )
    .join("");
  $$("[data-pack]").forEach(
    (el) =>
      (el.onclick = () => {
        packIndex = Number(el.dataset.pack);
        renderPacks();
      }),
  );
  const p = packs[packIndex];
  $("#packName").textContent = p.name;
  $("#packDescription").textContent = p.description;
  $("#packBrand").textContent = p.brand;
  $("#packCount").textContent =
    String(packIndex + 1).padStart(2, "0") +
    " / " +
    String(packs.length).padStart(2, "0");
  if (assets.packaging[p.image]) $("#packImage").src = assets.packaging[p.image];
  else $("#packImage").removeAttribute("src");
  $("#packImage").alt = p.name;
  const photos = $("#productPhotos");
  photos.replaceChildren();
  photos.hidden = !(p.gallery?.length > 1);
  if (!photos.hidden)
    for (const [i, url] of p.gallery.entries()) {
      const button = document.createElement("button");
      button.className = "packThumb";
      const image = new Image();
      image.src = url;
      image.alt = p.name + " " + (i + 1);
      button.append(image);
      button.onclick = () => {
        $("#packImage").src = url;
      };
      photos.append(button);
    }
}
function renderVideos() {
  $("#videoGrid").innerHTML = films
    .map(
      (f, i) =>
        `<div class="videoCard"><div class="videoImage ${["one", "two", "three", "two", "one"][i % 5]}"><strong>${f.design}</strong><button class="play" data-film="${i}" aria-label="${attr(strings[lang].play)}">▶</button></div><div class="videoInfo"><span class="eyebrow">${f.tag}</span><h3>${f.name}</h3><p>${f.description}</p><button class="vidAction" data-film="${i}">${strings[lang].detailExploreTheVideo} ↗</button></div></div>`,
    )
    .join("");
  $$(".videoCard").forEach((el, i) => {
    if (films[i].cover) {
      const cover = el.querySelector(".videoImage");
      cover.style.backgroundImage = 'url("' + films[i].cover + '")';
      cover.style.backgroundSize = "cover";
      cover.style.backgroundPosition = "center";
    }
  });
  $$("[data-film]").forEach(
    (x) => (x.onclick = () => openFilm(Number(x.dataset.film))),
  );
}
function openFilm(i) {
  filmIndex = i;
  const f = films[i];
  $("#videoModalTitle").textContent = f.name;
  $("#videoModalDesc").textContent = f.description;
  $("#videoPlaceholder").textContent = strings[lang].videoText;
  const player = $("#videoPlayer");
  if (f.video) {
    player.src = f.video;
    $("#videoPlaceholder").textContent = "";
  } else player.removeAttribute("src");
  if (f.cover) player.poster = f.cover;
  else player.removeAttribute("poster");
  $("#videoPlayer").load();
  $("#videoModal").classList.add("open");
  document.body.style.overflow = "hidden";
}
function onScroll() {
  const d = document.documentElement;
  $("#progress").style.width =
    (window.scrollY / (d.scrollHeight - innerHeight)) * 100 + "%";
  const hero = $(".hero"),
    r = hero.getBoundingClientRect(),
    pr = Math.max(0, Math.min(1, -r.top / (hero.offsetHeight - innerHeight)));
  hero.style.setProperty("--hero", pr.toFixed(4));
  $$(".sceneTrack").forEach((el) => {
    const x = el.getBoundingClientRect();
    const p = Math.max(
      0,
      Math.min(1, -x.top / Math.max(1, el.offsetHeight - innerHeight)),
    );
    const entrance = Math.max(0, Math.min(1, (p + 0.03) / 0.24));
    el.style.setProperty("--p", p.toFixed(4));
    el.style.setProperty("--copy-o", entrance.toFixed(3));
    el.style.setProperty("--copy-y", Math.round((1 - entrance) * 40) + "px");
  });
  const intro = $(".storyIntro");
  if (intro) {
    const r = intro.getBoundingClientRect();
    const t = Math.max(
      0,
      Math.min(1, (innerHeight - r.top) / (innerHeight + r.height)),
    );
    intro.style.setProperty("--intro-p", t.toFixed(3));
  }
  const pEl = $("#packShow"),
    pp = pEl.getBoundingClientRect(),
    p = Math.max(
      0,
      Math.min(1, (innerHeight - pp.top) / (innerHeight + pp.height)),
    );
  pEl.style.setProperty("--packp", p.toFixed(3));
  const m = $("#models").getBoundingClientRect(),
    mp = Math.max(
      0,
      Math.min(1, (innerHeight - m.top) / (innerHeight + m.height)),
    );
  $("#modelViewer").style.setProperty("--modelp", mp.toFixed(4));
  modelAngle = mp * Math.PI * 5;
}
$$("[data-lang]").forEach(
  (b) => (b.onclick = () => setLanguage(b.dataset.lang)),
);
$$(".galleryNav button").forEach(
  (b) =>
    (b.onclick = () => {
      $$(".galleryNav button").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      renderCases();
    }),
);
$("#packPrev").onclick = () => {
  packIndex = (packIndex - 1 + packs.length) % packs.length;
  renderPacks();
};
$("#packNext").onclick = () => {
  packIndex = (packIndex + 1) % packs.length;
  renderPacks();
};
$("#closeProject").onclick = closeModal;
$("#closeVideo").onclick = closeModal;
$$(".modal").forEach((m) =>
  m.addEventListener("click", (e) => {
    if (e.target === m) closeModal();
  }),
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});
let currentVideoURL = null;
$("#videoFile").addEventListener("change", (e) => {
  const f = e.target.files[0];
  if (!f) return;
  if (currentVideoURL) URL.revokeObjectURL(currentVideoURL);
  currentVideoURL = URL.createObjectURL(f);
  $("#videoPlayer").src = currentVideoURL;
  $("#videoPlayer")
    .play()
    .catch(() => {});
  $("#videoPlaceholder").textContent = f.name;
});
let saved = "ar";
try {
  saved = localStorage.getItem("ali-lang") === "en" ? "en" : "ar";
} catch (e) {}
setLanguage(saved);
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
onScroll();

// The real source remains linked to the user's Dropbox logo V3; temporary preview failures are handled gracefully.
const logoInput = document.getElementById("logoFile");
let logoObjectUrl = null;
logoInput?.addEventListener("change", (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  if (logoObjectUrl) URL.revokeObjectURL(logoObjectUrl);
  logoObjectUrl = URL.createObjectURL(f);
  const img = document.getElementById("heroLogo");
  img.src = logoObjectUrl;
  img.style.display = "block";
  const mini = document.getElementById("miniLogo");
  if (mini) {
    mini.src = logoObjectUrl;
    mini.style.display = "block";
  }
  document.querySelector(".brandFallback")?.classList.add("withLogo");
});
const miniImage = document.getElementById("miniLogo");
if (assets.logo) miniImage.src = assets.logo;
const mainImage = document.getElementById("heroLogo");
if (assets.logo) mainImage.src = assets.logo;

initContactDialog();
initEnhancedMotion();
initViewer(
  () => modelAngle,
  (key) => strings[lang][key],
  models,
  () => lang,
);
