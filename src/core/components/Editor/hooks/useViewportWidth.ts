import { useEffect, useState } from "react";
import { CAN_USE_DOM } from "../../../../shared/canUseDOM";

type IsSmallWidthViewport = boolean;
type ViewportWidth = number;

export default function useViewportWidth(maxWidth: number = 1025): [IsSmallWidthViewport, ViewportWidth] {
  const [width, setWidth] = useState(0);
  const [isSmallWidthViewport, setIsSmallWidthViewport] = useState(false);

  useEffect(() => {
    const updateViewPortWidth = () => {
      setWidth(window.innerWidth);
      const isNextSmallWidthViewport = CAN_USE_DOM && window.matchMedia(`(max-width: ${maxWidth}px)`).matches;

      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport);
      }
    };
    updateViewPortWidth();

    window.addEventListener("resize", updateViewPortWidth);

    return () => {
      window.removeEventListener("resize", updateViewPortWidth);
    };
  }, [isSmallWidthViewport, maxWidth]);

  return [isSmallWidthViewport, width];
}
