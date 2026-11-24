/**
 * Dark code theme for the landing page, using light tints of the shader
 * palette. Every token passes 4.5:1 contrast on the #18171e background.
 */
export const nightTheme = {
  name: "glimmer-night",
  type: "dark" as const,
  colors: {
    "editor.background": "#18171e",
    "editor.foreground": "#e9e8ee",
  },
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#8f8d98", fontStyle: "italic" } },
    { scope: ["keyword", "storage", "keyword.control", "storage.type", "storage.modifier"], settings: { foreground: "#b9a9ff" } },
    { scope: ["string", "string.quoted", "string.template"], settings: { foreground: "#f2a7c3" } },
    { scope: ["constant.numeric", "constant.language"], settings: { foreground: "#f2a7c3" } },
    {
      scope: ["entity.name.tag", "support.class.component", "entity.name.function", "entity.name.type", "support.type"],
      settings: { foreground: "#f7c98b" },
    },
    { scope: ["entity.other.attribute-name"], settings: { foreground: "#9fe3d6" } },
    { scope: ["punctuation", "meta.brace", "punctuation.definition.tag"], settings: { foreground: "#a3a1ad" } },
  ],
};
