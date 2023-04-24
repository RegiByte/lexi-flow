import { IS_DEV } from "./environment";


export default function warnOnlyOnce(message: string) {
  if (!IS_DEV) {
    return;
  }
  let run = false;
  return () => {
    if (!run) {
      console.warn(message);
    }
    run = true;
  };
}
