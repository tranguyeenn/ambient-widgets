#!/usr/bin/env python3
"""Render premium app-icon.png (1024×1024, transparent squircle corners)."""

from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SIZE = 1024
CORNER_RADIUS = int(SIZE * 0.2237)
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src-tauri" / "app-icon.png"


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def lerp_color(c1: tuple[int, int, int], c2: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return (
        int(lerp(c1[0], c2[0], t)),
        int(lerp(c1[1], c2[1], t)),
        int(lerp(c1[2], c2[2], t)),
    )


def make_background() -> Image.Image:
    """Ambient navy field with soft top-left lift and edge vignette."""
    yy, xx = np.mgrid[0:SIZE, 0:SIZE].astype(np.float32)
    lx, ly = SIZE * 0.38, SIZE * 0.36
    light = np.exp(-(((xx - lx) ** 2 + (yy - ly) ** 2) / (2 * (SIZE * 0.42) ** 2)))
    radial = np.sqrt((xx - SIZE / 2) ** 2 + (yy - SIZE / 2) ** 2) / (SIZE * 0.62)
    radial = np.clip(radial, 0, 1)

    inner = np.array([42.0, 46.0, 74.0])
    mid = np.array([28.0, 31.0, 52.0])
    deep = np.array([16.0, 18.0, 32.0])

    bg = inner * (1 - radial[..., None]) + mid * radial[..., None]
    bg = bg * (0.88 + 0.12 * light[..., None]) + deep * (1 - light[..., None]) * 0.08

    corner = np.maximum(np.abs(xx - SIZE / 2), np.abs(yy - SIZE / 2)) / (SIZE / 2)
    vign = np.clip((corner - 0.55) * 2.0, 0, 1)
    bg = bg * (1 - 0.28 * vign[..., None]) + deep * (0.28 * vign[..., None])

    rgba = np.zeros((SIZE, SIZE, 4), dtype=np.uint8)
    rgba[:, :, :3] = np.clip(bg, 0, 255).astype(np.uint8)
    rgba[:, :, 3] = 255
    return Image.fromarray(rgba, "RGBA")


def squircle_mask(blur: float = 0.85) -> Image.Image:
    mask = Image.new("L", (SIZE, SIZE), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, SIZE - 1, SIZE - 1), radius=CORNER_RADIUS, fill=255
    )
    if blur > 0:
        mask = mask.filter(ImageFilter.GaussianBlur(radius=blur))
    return mask


def apply_mask(img: Image.Image) -> Image.Image:
    out = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    out.paste(img, (0, 0), squircle_mask())
    return out


def draw_gradient_arc(
    layer: Image.Image,
    bbox: tuple[int, int, int, int],
    start: float,
    end: float,
    width: int,
    c_left: tuple[int, int, int],
    c_right: tuple[int, int, int],
) -> None:
    """Anti-aliased arc via short segments (crisp at 1024px)."""
    draw = ImageDraw.Draw(layer)
    cx = (bbox[0] + bbox[2]) / 2
    cy = (bbox[1] + bbox[3]) / 2
    rx = (bbox[2] - bbox[0]) / 2
    ry = (bbox[3] - bbox[1]) / 2
    steps = 360
    points: list[tuple[float, float, tuple[int, int, int]]] = []
    for i in range(steps + 1):
        ang = math.radians(start + (end - start) * i / steps)
        x = cx + rx * math.cos(ang)
        y = cy + ry * math.sin(ang)
        t = (x - bbox[0]) / (bbox[2] - bbox[0])
        color = lerp_color(c_left, c_right, t)
        points.append((x, y, color))

    for i in range(len(points) - 1):
        x1, y1, c1 = points[i]
        x2, y2, c2 = points[i + 1]
        draw.line([(x1, y1), (x2, y2)], fill=c1, width=width, joint="curve")


def draw_glow_dot(layer: Image.Image, x: float, y: float, r: int) -> None:
    glow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    for scale, alpha in [(2.8, 38), (1.9, 62), (1.35, 110)]:
        gr = int(r * scale)
        gdraw.ellipse((x - gr, y - gr, x + gr, y + gr), fill=(186, 168, 255, alpha))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=10))
    layer.alpha_composite(glow)

    draw = ImageDraw.Draw(layer)
    draw.ellipse(
        (x - r, y - r, x + r, y + r),
        fill=(228, 214, 255, 255),
    )
    highlight_r = max(4, r // 4)
    draw.ellipse(
        (x - r * 0.25, y - r * 0.55, x - r * 0.25 + highlight_r, y - r * 0.55 + highlight_r),
        fill=(255, 252, 255, 180),
    )


def draw_gradient_bar(
    layer: Image.Image,
    cx: float,
    cy: float,
    width: float,
    height: float,
    c_left: tuple[int, int, int],
    c_right: tuple[int, int, int],
) -> None:
    x0, y0 = cx - width / 2, cy - height / 2
    x1, y1 = cx + width / 2, cy + height / 2
    bar = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    pixels = bar.load()
    radius = height / 2
    for y in range(int(y0) - 2, int(y1) + 3):
        for x in range(int(x0) - 2, int(x1) + 3):
            if x < 0 or y < 0 or x >= SIZE or y >= SIZE:
                continue
            dx = max(abs(x - cx) - (width / 2 - radius), 0)
            dy = max(abs(y - cy) - radius, 0)
            if dx * dx + dy * dy <= radius * radius:
                t = (x - x0) / max(width, 1)
                color = lerp_color(c_left, c_right, t)
                pixels[x, y] = (*color, 255)
    layer.alpha_composite(bar)


def render() -> Image.Image:
    base = make_background()

    # Foreground layer
    fg = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))

    # Composition — optically centered, tighter crop
    cx, cy = SIZE / 2, SIZE * 0.505
    arc_rx, arc_ry = 278, 262
    arc_cy = cy - 28
    bbox = (
        int(cx - arc_rx),
        int(arc_cy - arc_ry),
        int(cx + arc_rx),
        int(arc_cy + arc_ry),
    )

    lavender = (210, 188, 255)
    periwinkle = (124, 158, 255)
    ice = (240, 232, 255)

    # Soft ring halo (depth, not gloss)
    halo = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw_gradient_arc(halo, bbox, 205, -25, 28, lavender, periwinkle)
    halo = halo.filter(ImageFilter.GaussianBlur(radius=11))
    # Tone down halo without muddying RGBA channels
    h_arr = np.array(halo, dtype=np.float32)
    h_arr[:, :, 3] *= 0.38
    halo = Image.fromarray(np.clip(h_arr, 0, 255).astype(np.uint8), "RGBA")
    fg.alpha_composite(halo)

    # Primary orbit ring
    draw_gradient_arc(fg, bbox, 208, -28, 14, ice, periwinkle)
    draw_gradient_arc(fg, bbox, 208, -28, 7, (225, 210, 255), (148, 182, 255))

    # Planet — upper-right inside arc (identity preserved)
    ang = math.radians(-38)
    dot_x = cx + arc_rx * 0.36 * math.cos(ang)
    dot_y = arc_cy + arc_ry * 0.34 * math.sin(ang)
    draw_glow_dot(fg, dot_x, dot_y, 34)

    # Reflection bars — sharper, balanced spacing
    bar_h = 15
    bar_gap = 30
    base_y = arc_cy + arc_ry * 0.52
    widths = (314, 214, 134)
    for i, w in enumerate(widths):
        draw_gradient_bar(
            fg,
            cx,
            base_y + i * bar_gap,
            w,
            bar_h - i * 2,
            lavender,
            periwinkle,
        )

    # Subtle top atmospheric sheen
    sheen = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(sheen)
    sdraw.ellipse(
        (cx - 320, arc_cy - 340, cx + 320, arc_cy + 40),
        fill=(120, 140, 220, 22),
    )
    sheen = sheen.filter(ImageFilter.GaussianBlur(radius=48))
    base.alpha_composite(sheen)
    base.alpha_composite(fg)

    return apply_mask(base)


def main() -> None:
    icon = render()
    icon.save(OUT, "PNG")
    print(f"Wrote {OUT} ({SIZE}×{SIZE}, transparent squircle corners)")


if __name__ == "__main__":
    main()
