import { useEffect } from "react";
/** DOM geometry is evidence of layout bounds, not an aesthetic score. */
export function useLayoutAudit(frame: number) {
  useEffect(() => {
    let active = true;
    document.fonts.ready.then(() => {
      if (!active) return;
      const regions = Array.from(document.querySelectorAll("[data-safe]")).map(
        (el) => {
          const r = el.getBoundingClientRect();
          const kind = el.getAttribute("data-safe");
          const textRects: {
            text: string;
            x: number;
            y: number;
            width: number;
            height: number;
          }[] = [];
          if (kind !== "footage") {
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            let node;
            while ((node = walker.nextNode())) {
              if (!node.textContent?.trim()) continue;
              const range = document.createRange();
              range.selectNodeContents(node);
              const box = range.getBoundingClientRect();
              if (box.width && box.height)
                textRects.push({
                  text: node.textContent.trim(),
                  x: box.x,
                  y: box.y,
                  width: box.width,
                  height: box.height,
                });
            }
          }
          return {
            kind,
            x: r.x,
            y: r.y,
            width: r.width,
            height: r.height,
            textRects,
          };
        },
      );
      console.info("__FACTORY_LAYOUT__" + JSON.stringify({ frame, regions }));
    });
    return () => {
      active = false;
    };
  }, [frame]);
}
