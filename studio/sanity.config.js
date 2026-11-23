import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes, titles } from "./schema";
const projectId = (process.env.SANITY_STUDIO_PROJECT_ID || "f61knmhk");
const dataset = process.env.SANITY_STUDIO_DATASET || "production";
// GitHub Pages redirects deep Studio routes through the admin entry point.
if (typeof window !== "undefined") {
  const route = new URLSearchParams(window.location.search).get("studioRoute");
  if (route?.startsWith("/myportfolio/admin/")) {
    window.history.replaceState(null, "", route);
  }
}
export default defineConfig({
  name: "portfolio",
  title: "Ali Abuwardeh · إدارة الموقع",
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("إدارة المحتوى")
          .items(
            Object.entries(titles).map(([id, title]) =>
              id === "settings"
                ? S.listItem()
                    .title(title)
                    .child(
                      S.document()
                        .schemaType(id)
                        .documentId("portfolio-settings"),
                    )
                : S.documentTypeListItem(id).title(title),
            ),
          ),
    }),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter((t) => !["settings", "section"].includes(t.schemaType)),
  },
});
