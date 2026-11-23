import { defineType } from "sanity";

export const titles = {
  project: "المشاريع ودراسات الحالة",
  stage: "المسيرة المهنية",
  product: "تغليف المنتجات",
  film: "الفيديوهات",
  model: "المجسمات",
  section: "نصوص الصفحة والأزرار",
  settings: "الهوية وروابط التواصل",
};
const field = (name, title, type = "string", extra = {}) => ({
  name,
  title,
  type,
  ...extra,
});
const required = (rule) => rule.required();
const bi = (name, title, type = "string") =>
  field(name, title, "object", {
    fields: ["ar", "en"].map((lang) =>
      field(lang, lang === "ar" ? "العربية" : "English", type, {
        validation: required,
        ...(type === "array" ? { of: [{ type: "string" }] } : {}),
      }),
    ),
  });
const text = (name, title) => bi(name, title, "text");
const choice = (name, title, values) =>
  field(name, title, "string", {
    options: { list: values },
    validation: required,
  });
const photo = (name, title) =>
  field(name, title, "image", { options: { hotspot: true } });
const file = (name, title, accept) =>
  field(name, title, "file", { options: { accept } });
const gallery = field("gallery", "الصور بالترتيب", "array", {
  of: [{ type: "picture" }],
});
const common = [
  bi("title", "العنوان"),
  field("order", "ترتيب العرض", "number", {
    initialValue: 100,
    validation: (r) => r.required().integer(),
  }),
  field("hidden", "إخفاء من الموقع", "boolean", { initialValue: false }),
];
const fields = {
  project: [
    choice("category", "التصنيف", [
      "brand",
      "pack",
      "corporate",
      "training",
      "health",
      "freelance",
    ]),
    bi("subtitle", "العنوان الفرعي"),
    bi("period", "الفترة"),
    text("description", "وصف المشروع"),
    bi("steps", "خطوات دراسة الحالة", "array"),
    gallery,
  ],
  stage: [
    field("period", "الفترة الزمنية", "string", { validation: required }),
    choice("art", "تصميم المشهد", [
      "study",
      "university",
      "agency",
      "gmcsa",
      "therapy",
      "othaim",
      "cement",
      "3d",
    ]),
    field("color", "لون المشهد المعتمد", "string", {
      initialValue: "#263039",
      validation: (r) => r.required().regex(/^#[a-f0-9]{6}$/i),
    }),
    bi("label", "اسم المرحلة"),
    text("description", "السرد"),
    bi("chips", "التصنيفات", "array"),
  ],
  product: [
    bi("brand", "العلامة التجارية"),
    text("description", "وصف العبوة"),
    gallery,
  ],
  film: [
    bi("tag", "التصنيف"),
    bi("design", "نص الغلاف"),
    text("description", "وصف الفيديو والدور"),
    photo("cover", "صورة الغلاف"),
    file("video", "ملف الفيديو", "video/*"),
  ],
  model: [file("object", "ملف المجسم GLB أو STL", ".glb,.stl")],
};
const docs = Object.entries(fields).map(([name, extra]) =>
  defineType({
    name,
    title: titles[name],
    type: "document",
    fields: [...common, ...extra],
    orderings: [
      {
        name: "sequence",
        title: "حسب ترتيب العرض",
        by: [{ field: "order", direction: "asc" }],
      },
    ],
    preview: {
      select: { title: "title.ar", position: "order", hidden: "hidden" },
      prepare: ({ title, position, hidden }) => ({
        title,
        subtitle: [position, hidden ? "مخفي" : ""]
          .filter((v) => v !== "")
          .join(" · "),
      }),
    },
  }),
);
export const schemaTypes = [
  defineType({
    name: "picture",
    title: "صورة",
    type: "object",
    fields: [
      photo("image", "صورة معتمدة"),
      field("legacy", "مرجع المعاينة الأصلية", "string", { readOnly: true }),
    ],
    preview: {
      select: { title: "legacy", media: "image" },
      prepare: ({ title, media }) => ({ title: title || "صورة", media }),
    },
  }),
  ...docs,
  defineType({
    name: "section",
    title: titles.section,
    type: "document",
    fields: [
      field("name", "القسم"),
      field("entries", "النصوص", "array", {
        of: [
          {
            type: "object",
            fields: [
              field("key", "معرّف النص", "string", { readOnly: true }),
              text("value", "النص"),
            ],
            preview: { select: { title: "value.ar", subtitle: "key" } },
          },
        ],
      }),
    ],
    preview: { select: { title: "name" } },
  }),
  defineType({
    name: "settings",
    title: titles.settings,
    type: "document",
    fields: [
      field("contactE164", "هاتف الاتصال وواتساب", "string", {
        validation: (r) => r.regex(/^\+[1-9]\d{7,14}$/),
      }),
      field("behance", "Behance", "url"),
      field("shutterstock", "Shutterstock", "url"),
      photo("logo", "الشعار الأصلي"),
      photo("training", "صورة أرشيف التدريب"),
      photo("clinic", "صورة أرشيف العيادات"),
    ],
    preview: { prepare: () => ({ title: titles.settings }) },
  }),
];
