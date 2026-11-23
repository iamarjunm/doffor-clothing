import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: 'mwmriieg',
    dataset: 'production',
  },
  studioHost: 'doffor-clothing',
  deployment: {
    autoUpdates: false,
  },
});
