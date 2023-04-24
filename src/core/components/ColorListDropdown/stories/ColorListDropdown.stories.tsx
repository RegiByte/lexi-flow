import {Meta, StoryObj} from "@storybook/react";
import { ColorListDropdown } from "../index";
import { defaultColorItems } from "../../../defaults/colors";
import { ColorWheelIcon } from "@radix-ui/react-icons";
import React from "react";
import { ColorPicker } from "../../icons/ColorPicker";

const meta = {
  title: 'ColorListDropdown',
  component: ColorListDropdown,
  tags: ['component', 'dropdown', 'atom', 'editing'],
} satisfies Meta<typeof ColorListDropdown>

export default meta
type Story = StoryObj<typeof meta>

export const Base: Story = {
  args: {
    onSelect: (color) => alert(`You selected ${color}`),
    label: "Pick Color",
    icon: <ColorPicker className="h-5 w-5"/>,
    colors: defaultColorItems
  }
}
