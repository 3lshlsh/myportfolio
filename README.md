# موقع علي أبوورده | المرحلة الثانية

لتشغيل نسخة Astro من مجلد المشروع، استخدم Node.js 22.12 أو أحدث ثم:

```sh
npm ci
npm run dev
```

لإنتاج النسخة الثابتة شغّل `npm run build`، ثم `npm run preview` لمراجعتها. يمكن معاينة نسخة dist المرفقة أيضاً بتشغيل `python3 -m http.server 8080 --directory dist`.

تجمع `src/pages/index.astro` المكوّنات. يضم مجلدا `src/content/ar` و`src/content/en` المحتوى لكل لغة، ويحدد `catalog.json` ترتيب العناصر ومعرّفاتها، و`settings.json` روابط التواصل. ملف HTML الأصلي ولقطات baseline هما مرجع V11. تعتمد بعض الصور على معاينات خارجية، والعارض يدعم ملفات الجهاز. ربط لوحة Sanity مرحلة مستقلة.

## توثيق التسليم الأصلي

# ALI Abuwardeh — Creative Journey V11 / Codex Handoff

## Start here

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080` in a browser. All files stay in this project. Internet access is required for fonts, Three.js modules and old Dropbox **preview** links.

**This is a functional frontend prototype, not an installed CMS and not a finished production site.** It includes bilingual copy, scroll interactions, project and packaging galleries, a 3D viewer that can load local STL/GLB, video preview selection, and a two-option contact modal.

## What V11 changes

- Creative chronology opens in **2014**, not 2008. A small expandable optional aside contains the earlier working experience.
- The pre-design text and the opening labels are localized to Arabic and English.
- All current page copy is editable in the existing JavaScript data structures; it is not yet an online CMS.

- Shorter, professional Arabic and original English phrasing, keeping proper project/brand names where appropriate.
- Stronger motion: blurred + staggered section entrances, layered project cards, pinned chapter depth, scroll-driven imagery, transitions and hover states.
- Top **Contact** button opens a focused overlay with exactly **Call** and **WhatsApp** actions. Footer CTA opens WhatsApp directly; no email link.
- Dark green design only; no light mode.
- Big `2014` is the only opening year reveal, representing the beginning of the creative career. Earlier professional experience (2008–2014) is **hidden by default** under an unobtrusive accessible `<details>` labelled `ما قبل التصميم` / `Before Design`, and is not a full chapter. Later chapters are not giant year counters.
- Preserve on-site projects, Al-Othaim packaging, motion/video chapters, 3D, Behance/Shutterstock as small footer links.

## Critical: confirm the public phone number

Contact and portfolio links can be configured in Sanity Studio.

## Asset and content reality

Some images are loaded from temporary Dropbox preview URLs. They can expire. The original V3 logo, full project photos, industrial footage and 3D models are **not bundled**. Do not present temporary previews or demo 3D geometry as final assets. Work with the owner to export approved assets to `public/assets/` and obtain publication permissions for client/employer work.

## Codex implementation plan

1. Preserve layout and interactions. Review `index.html` and `PROJECT_BRIEF_AR.md` before edits.
2. Split the prototype into components and styles using Astro/React or equivalent. Keep Arabic and English in one structured content schema, with a strict language switch, Western numerals in both languages.
3. Replace preview URLs with optimized, locally hosted assets; embed owner's V3 original logo. Encode selected videos and maintain a per-video title/context/production-role description.
4. Add real portfolio project detail routes, searchable/filterable complete archive, 3D viewer with hosted GLB/STL, thumbnails, responsive loading, fallback, reduced motion.
5. Add Sanity (or agreed CMS) for bilingual project editing, chronology, media, featured order, drafts and publishing. Include explicit publication-clearance field.
6. Test **desktop and mobile, RTL and LTR**, contact modal accessibility, real `tel:` and `wa.me` links, animation frame rate, LCP/CLS, and WebGL fallback.
7. Deploy only after verifying owner contact number and rights to all media.

A static single-file prototype can be previewed immediately; full archive and CMS require continued implementation in Codex.

## المرحلة الثالثة
توجد لوحة Sanity وملف الاستيراد وتعليمات ربط حساب المالك في [دليل لوحة التحكم](studio/README_AR.md). يمكن تشغيل الواجهة ببيانات V11 المحلية أو بناء نسخة من بيانات Sanity المنشورة.
