import { CAN_USE_DOM } from "../../shared/canUseDOM";

export const getDOMSelection = (targetWindow: Window | null): Selection | null =>
  CAN_USE_DOM ? (targetWindow || window).getSelection() : null;
