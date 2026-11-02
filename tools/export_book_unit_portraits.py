#!/usr/bin/env python3
"""Export 3/4-view unit portraits into game/book/images."""

from __future__ import annotations

import argparse
import math
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path

from PIL import Image

import export_bacis_unit_batch as batch


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "vec/bacis.svg"
PARESSEUX_SOURCE = ROOT / "vec/paresseux.svg"
OUTPUT_DIR = ROOT / "game/book/images"
LABEL = "{http://www.inkscape.org/namespaces/inkscape}label"
DPI = 384

PORTRAITS = {
    "generic_unit_3q.png": ("basic", None, ("g141",)),
    "happiness.png": ("basic", "frame_1", ()),
    "grand_schtroumpf.png": ("gs_research", None, ("g141",)),
    "lunettes.png": ("lunettes", "frame_1", ()),
    "farceur.png": ("farceur", "frame_1", ()),
    "gourmand.png": ("gourmand", "frame_1", ()),
    "cuisinier.png": ("cuisinier", "frame_1", ()),
    "coquet.png": ("coquet", "frame_1", ()),
    "grognon.png": ("grognon", "frame_1", ()),
    "costaud.png": ("costaud", "frame_1", ()),
}


def save_trimmed(source: Path, destination: Path) -> None:
    with Image.open(source) as image:
        image = image.convert("RGBA")
        bounds = image.getchannel("A").getbbox()
        if bounds is None:
            raise RuntimeError(f"Empty portrait: {destination.name}")
        padding = round(DPI / 24)
        left, top, right, bottom = bounds
        crop = image.crop(
            (
                max(0, left - padding),
                max(0, top - padding),
                min(image.width, right + padding),
                min(image.height, bottom + padding),
            )
        )
        crop.save(destination)


def export_bacis_portrait(
    destination: Path, variant: str | None, frame: str | None, extra: tuple[str, ...]
) -> None:
    tree = ET.parse(SOURCE)
    root = tree.getroot()
    elements = batch.build_id_map(root)
    batch.prepare_base_visibility(elements)
    if variant is not None:
        batch.configure_play_variant(
            elements,
            variant,
            batch.ExportSpec("portrait", batch.PLAY_LAYER_ID, batch.PLAY_CROP_UNIT, play_frame=frame),
        )
    else:
        batch.set_display(batch.require_element(elements, batch.PLAY_LAYER_ID), batch.DISPLAY_INLINE)
        batch.show_elements(
            elements,
            [
                "g135", "path128", "path125", "g97", "g183", "g171",
                "g182", "g146", "g166", "g142-1", batch.PLAY_TAIL_ID,
            ],
        )
    batch.show_elements(elements, list(extra))

    crop_id = batch.PLAY_VARIANTS[variant]["crop"] if variant else batch.PLAY_CROP_UNIT
    crop_area = batch.PLAY_VARIANTS[variant].get("crop_area_px") if variant else None
    if crop_area:
        x, y, width, height = crop_area
        area = f"{x}:{y}:{x + width}:{y + height}"
    else:
        scale_x, scale_y = batch.document_unit_scale(root)
        area = batch.export_area(batch.require_element(elements, crop_id), scale_x, scale_y)

    with tempfile.TemporaryDirectory(prefix="book-portrait-", dir=OUTPUT_DIR) as temp_name:
        temp_dir = Path(temp_name)
        temp_svg = temp_dir / "portrait.svg"
        temp_png = temp_dir / "portrait.png"
        tree.write(temp_svg, encoding="utf-8", xml_declaration=True)
        batch.run_inkscape_export(temp_svg, temp_png, area, DPI)
        save_trimmed(temp_png, destination)


def export_side_portrait(destination: Path, spec_key: str) -> None:
    tree = ET.parse(SOURCE)
    root = tree.getroot()
    elements = batch.build_id_map(root)
    spec = next(spec for spec in batch.EXPORT_SPECS if spec.key == spec_key)
    batch.prepare_base_visibility(elements)
    batch.configure_side_variant(elements, "basic", spec)
    scale_x, scale_y = batch.document_unit_scale(root)
    area = batch.export_area(batch.require_element(elements, spec.crop_rect), scale_x, scale_y)

    with tempfile.TemporaryDirectory(prefix="book-portrait-", dir=OUTPUT_DIR) as temp_name:
        temp_dir = Path(temp_name)
        temp_svg = temp_dir / "portrait.svg"
        temp_png = temp_dir / "portrait.png"
        tree.write(temp_svg, encoding="utf-8", xml_declaration=True)
        batch.run_inkscape_export(temp_svg, temp_png, area, DPI)
        save_trimmed(temp_png, destination)


def export_paresseux_portrait(destination: Path) -> None:
    tree = ET.parse(PARESSEUX_SOURCE)
    root = tree.getroot()
    labeled = {node.get(LABEL): node for node in root.iter() if node.get(LABEL)}
    background = labeled["background"]
    batch.set_display(background, batch.DISPLAY_NONE)
    batch.set_display(labeled["mouth1"], batch.DISPLAY_INLINE)
    batch.set_display(labeled["mouth2"], batch.DISPLAY_NONE)
    x = float(background.get("x"))
    y = float(background.get("y"))
    area = (
        f"{math.floor(x)}:{math.floor(y)}:"
        f"{math.ceil(x + float(background.get('width')))}:"
        f"{math.ceil(y + float(background.get('height')))}"
    )
    with tempfile.TemporaryDirectory(prefix="book-portrait-", dir=OUTPUT_DIR) as temp_name:
        temp_dir = Path(temp_name)
        temp_svg = temp_dir / "portrait.svg"
        temp_png = temp_dir / "portrait.png"
        tree.write(temp_svg, encoding="utf-8", xml_declaration=True)
        batch.run_inkscape_export(temp_svg, temp_png, area, DPI)
        save_trimmed(temp_png, destination)


def main(only: str | None = None) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for filename, (variant, frame, extra) in PORTRAITS.items():
        if only and filename != only:
            continue
        destination = OUTPUT_DIR / filename
        export_bacis_portrait(destination, variant, frame, extra)
        print(destination.relative_to(ROOT))

    for filename in ("bricoleur.png", "paresseux.png"):
        if only and filename != only:
            continue
        destination = OUTPUT_DIR / filename
        if filename == "bricoleur.png":
            export_bacis_portrait(destination, None, None, ())
        else:
            export_paresseux_portrait(destination)
        print(destination.relative_to(ROOT))

    for filename, spec_key in (("paysan.png", "dig_0"), ("schtroumpf.png", "idle_w")):
        if only and filename != only:
            continue
        destination = OUTPUT_DIR / filename
        export_side_portrait(destination, spec_key)
        print(destination.relative_to(ROOT))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--only", choices=sorted(PORTRAITS), help="Export one portrait without rewriting the others")
    main(parser.parse_args().only)
