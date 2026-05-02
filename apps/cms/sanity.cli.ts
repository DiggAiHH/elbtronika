import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "xbjul8yd",
    dataset: "production",
  },
  // autoUpdatesEnabled removed: not in CliConfig type for this Sanity version
});
