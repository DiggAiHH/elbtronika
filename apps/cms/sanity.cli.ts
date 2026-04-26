import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'xbjul8yd',
    dataset: 'production',
  },
  /**
   * Enable auto-updates for studios.
   * See https://www.sanity.io/docs/cli#auto-updates
   */
  autoUpdatesEnabled: true,
})
