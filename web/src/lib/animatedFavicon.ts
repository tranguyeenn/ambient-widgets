const SIZE = 32;

function getFaviconLink(): HTMLLinkElement {
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]#favicon');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    link.id = "favicon";
    document.head.appendChild(link);
  }
  return link;
}

/** Spinning orbital ring around the app icon in the browser tab. */
export function startAnimatedFavicon(): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => undefined;
  }

  const link = getFaviconLink();
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => undefined;

  const img = new Image();
  img.src = "/app-icon.png";

  let angle = 0;
  let raf = 0;
  let running = true;

  const draw = () => {
    if (!running) return;

    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const outerR = SIZE / 2 - 1;

    ctx.clearRect(0, 0, SIZE, SIZE);

    ctx.fillStyle = "#050810";
    ctx.beginPath();
    ctx.roundRect(1, 1, SIZE - 2, SIZE - 2, 7);
    ctx.fill();

    if (img.complete && img.naturalWidth > 0) {
      const pad = 4;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(pad, pad, SIZE - pad * 2, SIZE - pad * 2, 5);
      ctx.clip();
      ctx.drawImage(img, pad, pad, SIZE - pad * 2, SIZE - pad * 2);
      ctx.restore();
    }

    ctx.strokeStyle = "rgba(94, 234, 212, 0.85)";
    ctx.lineWidth = 1.25;
    ctx.setLineDash([5, 4]);
    ctx.lineDashOffset = -angle * 12;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(129, 140, 248, 0.45)";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 5]);
    ctx.lineDashOffset = angle * 8;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR - 2, angle * 0.4, angle * 0.4 + Math.PI * 1.1);
    ctx.stroke();

    link.type = "image/png";
    link.href = canvas.toDataURL("image/png");

    angle += 0.07;
    raf = requestAnimationFrame(draw);
  };

  const kick = () => {
    cancelAnimationFrame(raf);
    draw();
  };

  img.addEventListener("load", kick);
  if (img.complete) kick();

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    img.removeEventListener("load", kick);
  };
}
