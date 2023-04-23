import {Editor} from "../Editor";
import {Meta, StoryObj} from "@storybook/react";

const meta = {
	title: 'Editor',
	component: Editor,
	tags: ['editor', 'rich-text', 'base', 'editing'],
} satisfies Meta<typeof Editor>

export default meta
type Story = StoryObj<typeof meta>

export const Base: Story = {}
