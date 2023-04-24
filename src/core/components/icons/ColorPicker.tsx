import React from "react";
import { RiPaletteLine } from "react-icons/all";

export const ColorPicker: React.FC<{className?: string}> = ({className = ''}) => {
  return (
    <RiPaletteLine className={className} fillRule="evenodd"/>
  );
};
