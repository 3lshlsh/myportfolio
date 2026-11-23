import portfolio from "../generated/portfolio.json";
const { catalog, ar, arUI, en, enUI } = portfolio;
export const strings = { ar: arUI, en: enUI };
export function contentFor(locale) {
  const translations = { ar, en }[locale];
  return Object.fromEntries(
    Object.entries(catalog).map(([group, rows]) => [
      group,
      rows.map((row) => ({ ...row, ...translations[group][row.id] })),
    ]),
  );
}
