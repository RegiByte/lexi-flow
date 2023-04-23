import type { Preview } from "@storybook/react";
import "../src/index.css";
import { addons } from "@storybook/manager-api";
import { FORCE_REMOUNT, STORY_ARGS_UPDATED } from "@storybook/core-events";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

const channel = addons.getChannel();

const storyListener = (args) => {
  if (args.storyId.startsWith("editor--")) {
    channel.emit(FORCE_REMOUNT);
  }
};

const setupStoryListener = () => {
  channel.removeListener(STORY_ARGS_UPDATED, storyListener);
  channel.addListener(STORY_ARGS_UPDATED, storyListener);
};

setupStoryListener();

export default preview;
