import { MediumEditor } from "./MediumEditor";
import { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Medium Editor",
  component: MediumEditor,
  tags: ["editor", "rich-text", "base", "editing"],
} satisfies Meta<typeof MediumEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Base: Story = {};
