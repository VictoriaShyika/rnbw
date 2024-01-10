import { useCallback, useContext, useEffect, useState } from "react";
import { MainContext } from "@_redux/main";

export const useZoom = (iframeRefState: HTMLIFrameElement | null) => {
  const { isCodeTyping } = useContext(MainContext);
  const [zoomLevel, setZoomLevel] = useState(1);

  const setZoom = useCallback(
    (level: number) => {
      // TODO: need to add detection code typing to not zoom on code typing
      setZoomLevel(level);
      iframeRefState && (iframeRefState.style.transform = `scale(${level})`);

      // TODO: Fix zoom in left part overflow by fixing next functionality
      //   if (zoomLevel > 1) {
      //     iframeRefState.style.transformOrigin = "top left";
      //   }
    },
    [iframeRefState, zoomLevel, isCodeTyping.current],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const key = event.key;
      if (key >= "1" && key <= "9") {
        setZoom(Number(`0.${key}`));
      } else {
        switch (key) {
          case "0":
          case "Escape":
            setZoom(1);
            break;
          case "+":
            setZoom(zoomLevel + 0.25);
            break;
          case "-":
            setZoom(zoomLevel <= 0.25 ? zoomLevel : zoomLevel - 0.25);
            break;
          default:
            break;
        }
      }
    },
    [setZoom, zoomLevel],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [zoomLevel, iframeRefState]);
};
