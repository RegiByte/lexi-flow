import React, { HTMLAttributes, PropsWithChildren } from "react";
import { NativeButtonProps, NativeElementProps } from "../../types/jsx";
import classNames from "classnames";

export const ToolbarButton: React.FC<PropsWithChildren<NativeButtonProps<HTMLButtonElement>>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <button
      {...props}
      className={classNames(
        `rounded-full w-[35px] h-[35px] inline-flex items-center justify-center text-violet11 bg-white shadow-[0_2px_10px] shadow-blackA7 outline-none hover:bg-violet3 focus:shadow-[0_0_0_2px] focus:shadow-black`,
        className,
      )}>
      {children}
    </button>
  );
};
