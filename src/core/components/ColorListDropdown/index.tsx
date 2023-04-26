import * as Select from "@radix-ui/react-select";
import React from "react";
import { ColorItem, ColorList } from "../../types/colors";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  DotFilledIcon,
  HamburgerMenuIcon,
} from "@radix-ui/react-icons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface ColorListProps {
  colors: ColorList;
  onSelect: (color: string) => void;
  label?: string;
  icon?: JSX.Element;
}

export const ColorListDropdown: React.FC<ColorListProps> = (props) => {
  const { colors, onSelect, label = "Choose Text Color", icon } = props;

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          title={label}
          className="rounded-full w-[35px] h-[35px] inline-flex items-center justify-center text-violet11 bg-white shadow-[0_2px_10px] shadow-blackA7 outline-none hover:bg-violet3 focus:shadow-[0_0_0_2px] focus:shadow-black"
          aria-label={label}>
          {icon}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={`min-w-[200px] space-y-1.5 p-4 bg-white rounded-md p-[5px] shadow-md will-change-[opacity,transform] 
          data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade 
          data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade z-10`}
          sideOffset={5}>
          {colors.map((color) => (
            <DropdownMenu.Item
              key={color.value}
              style={{ backgroundColor: color.value }}
              onClick={(e) => {
                e.preventDefault();
                onSelect(color.value);
              }}
              className={`group text-[13px] font-semibold leading-none text-neutral-100 rounded-[3px]
               flex items-center h-[30px] px-[5px] relative pl-[25px] select-none outline-6 data-highlighted:h-[33px]
                data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:text-white`}>
              {color.label}{" "}
            </DropdownMenu.Item>
          ))}

          <DropdownMenu.Arrow className="fill-white" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
