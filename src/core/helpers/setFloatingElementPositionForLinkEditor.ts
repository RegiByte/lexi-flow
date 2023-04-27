import { HORIZONTAL_OFFSET, setFloatingElementPosition, VERTICAL_GAP } from "./setFloatingElementPosition";

export const setFloatingElementPositionForLinkEditor = (
  targetRect: ClientRect | null,
  floatingElem: HTMLElement,
  anchorElem: HTMLElement,
  verticalGap: number = VERTICAL_GAP,
  horizontalOffset: number = HORIZONTAL_OFFSET,
): ReturnType<typeof setFloatingElementPosition> => {
  return setFloatingElementPosition(
    targetRect,
    floatingElem,
    anchorElem,
    verticalGap,
    horizontalOffset,
    (targetRect, floatingElemRect, verticalGap) => targetRect.top - verticalGap,
    (targetRect, floatingElemRect, horizontalOffset) => targetRect.left - horizontalOffset,
  );
};
