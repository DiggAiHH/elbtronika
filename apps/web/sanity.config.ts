import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemas/index";

export default defineConfig({
  name: "elbtronika",
  title: "ELBTRONIKA Studio",

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",

  plugins: [
    structureTool(),
    // Vision: GROQ query playground — dev only
    ...(process.env.NODE_ENV === "development" ? [visionTool()] : []),
  ],

  schema: {
    types: schemaTypes,
  },
});
