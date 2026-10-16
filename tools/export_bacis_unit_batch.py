#!/usr/bin/env python3
from __future__ import annotations

import argparse
import base64
import io
import subprocess
import tempfile
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from pathlib import Path

from PIL import Image


INKSCAPE_NS = "http://www.inkscape.org/namespaces/inkscape"
DISPLAY_INLINE = "inline"
DISPLAY_NONE = "none"


SIDE_LAYER_ID = "layer1"
BACK_LAYER_ID = "layer2"
FRONT_LAYER_ID = "layer3"
PLAY_LAYER_ID = "layer4"
FISHING_SIDE_LAYER_ID = "layer6"
FISHING_FRONT_LAYER_ID = "layer5"
FISHING_BACK_LAYER_ID = "layer7"


SIDE_CROP_IDLE = "rect4-2"
SIDE_CROP_WORK = "rect4-2-4"
SIDE_CROP_DIG = "rect218"
SIDE_CROP_WB = "rect6"
BACK_CROP_IDLE = "rect4-2-1"
BACK_CROP_WB = "rect81"
FRONT_CROP_IDLE = "rect9"
FRONT_CROP_WB = "rect121"
PLAY_CROP_CUIS = "rect361"
FISHING_SIDE_CROP = "rect278"
FISHING_FRONT_CROP = "rect319"
FISHING_BACK_CROP = "rect332"


SIDE_VARIANTS = {
    "basic": {
        "group": "g14",
        "idle_feet": "g3",
        "step_feet": "g12",
        "extras": ["g7"],
        "hand": "g2-3",
    },
    "bricoleur": {
        "group": "g13",
        "idle_feet": "g3-1",
        "step_feet": "g12-4",
        "extras": ["g7"],
    },
    "gs": {
        "group": "g14-2",
        "idle_feet": "g3-5",
        "step_feet": "g12-6",
        "extras": ["g7-6"],
        "hand": "g2-3",
    },
    "lunettes": {
        "group": "g14",
        "idle_feet": "g3",
        "step_feet": "g12",
        "extras": ["g7", "g5-8"],
        "hand": "g2-3",
    },
    "cuisinier": {
        "group": "g14",
        "idle_feet": "g3",
        "step_feet": "g12",
        "extras": ["g173"],
        "hand": "g2-3",
    },
}


BACK_VARIANTS = {
    "basic": {
        "pants": "g52",
        "idle_feet": "g45",
        "step_feet_1": "g58",
        "step_feet_2": "g61",
        "hat": "path4",
        "extras": [],
    },
    "bricoleur": {
        "pants": "g51",
        "idle_feet": "g49",
        "step_feet_1": "g53",
        "step_feet_2": "g55",
        "hat": "path4",
        "extras": ["g41"],
    },
    "gs": {
        "pants": "g84",
        "idle_feet": "g81",
        "step_feet_1": "g76",
        "step_feet_2": "g79",
        "hat": "path4-3",
        "extras": [],
    },
    "lunettes": {
        "pants": "g52",
        "idle_feet": "g45",
        "step_feet_1": "g58",
        "step_feet_2": "g61",
        "hat": "path4",
        "extras": [],
    },
    "cuisinier": {
        "pants": "g52",
        "idle_feet": "g45",
        "step_feet_1": "g58",
        "step_feet_2": "g61",
        "hat": "g255",
        "extras": [],
    },
}


FRONT_VARIANTS = {
    "basic": {
        "hat": "path85",
        "pants": "path99",
        "extras": [],
        "idle_feet": "g106",
        "step_feet_1": "g111",
        "step_feet_2": "g117",
        "idle_hands": "g110",
        "step_hands_1": "g113",
        "step_hands_2": "g115",
    },
    "bricoleur": {
        "hat": "path85",
        "pants": "path100",
        "extras": ["g142"],
        "idle_feet": "g108",
        "step_feet_1": "g119",
        "step_feet_2": "g121",
        "idle_hands": "g110",
        "step_hands_1": "g113",
        "step_hands_2": "g115",
    },
    "gs": {
        "hat": "path86",
        "pants": "path99",
        "extras": [],
        "idle_feet": "g106",
        "step_feet_1": "g111",
        "step_feet_2": "g117",
        "idle_hands": "g110",
        "step_hands_1": "g113",
        "step_hands_2": "g115",
    },
    "lunettes": {
        "hat": "path85",
        "pants": "path99",
        "extras": ["g103"],
        "idle_feet": "g106",
        "step_feet_1": "g111",
        "step_feet_2": "g117",
        "idle_hands": "g110",
        "step_hands_1": "g113",
        "step_hands_2": "g115",
    },
    "cuisinier": {
        "hat": "g262",
        "pants": "path99",
        "extras": [],
        "idle_feet": "g106",
        "step_feet_1": "g111",
        "step_feet_2": "g117",
        "idle_hands": "g110",
        "step_hands_1": "g113",
        "step_hands_2": "g115",
    },
}


DEFAULT_PRESETS = {
    "unit": ("basic", "unit"),
    "brico": ("bricoleur", "brico"),
    "gs": ("gs", "gs"),
    "lunettes": ("lunettes", "lunettes"),
    "cuis": ("cuisinier", "cuis"),
}


DEFAULT_FILENAMES = {
    "idle_w": "{prefix}.png",
    "step_w": "{prefix}_step.png",
    "idle_n": "{prefix}_back.png",
    "step_n_1": "{prefix}_back_step_1.png",
    "step_n_2": "{prefix}_back_step_2.png",
    "idle_s": "{prefix}_front.png",
    "step_s_1": "{prefix}_front_step_1.png",
    "step_s_2": "{prefix}_front_step_2.png",
    "work_0": "{prefix}_work.png",
    "work_1": "{prefix}_work_1.png",
    "stone_0": "{prefix}_stone.png",
    "stone_1": "{prefix}_stone_1.png",
    "lumber_0": "{prefix}_lumber.png",
    "lumber_1": "{prefix}_lumber_1.png",
    "food_0": "{prefix}_food_sprite.png",
    "food_1": "{prefix}_food_sprite_1.png",
    "fishing_0": "{prefix}_fishing.png",
    "fishing_1": "{prefix}_fishing_1.png",
    "fishing_n_0": "{prefix}_fishing_north.png",
    "fishing_n_1": "{prefix}_fishing_north_1.png",
    "fishing_s_0": "{prefix}_fishing_south.png",
    "fishing_s_1": "{prefix}_fishing_south_1.png",
    "dig_0": "{prefix}_dig.png",
    "dig_1": "{prefix}_dig_1.png",
    "play_0": "{prefix}_play.png",
    "play_1": "{prefix}_play_1.png",
    "wb_idle_w": "{prefix}_wb_w.png",
    "wb_step_w": "{prefix}_wb_step_w.png",
    "wb_idle_n": "{prefix}_wb_n.png",
    "wb_step_n_1": "{prefix}_wb_step_n_1.png",
    "wb_step_n_2": "{prefix}_wb_step_n_2.png",
    "wb_idle_s": "{prefix}_wb_s.png",
    "wb_step_s_1": "{prefix}_wb_step_s_1.png",
    "wb_step_s_2": "{prefix}_wb_step_s_2.png",
    "cargo_idle_w": "{prefix}_cargo_w.png",
    "cargo_step_w": "{prefix}_cargo_step_w.png",
    "cargo_idle_n": "{prefix}_cargo_n.png",
    "cargo_step_n_1": "{prefix}_cargo_step_n_1.png",
    "cargo_step_n_2": "{prefix}_cargo_step_n_2.png",
    "cargo_idle_s": "{prefix}_cargo_s.png",
    "cargo_step_s_1": "{prefix}_cargo_step_s_1.png",
    "cargo_step_s_2": "{prefix}_cargo_step_s_2.png",
}


ALL_SIDE_VARIANT_GROUPS = [
    SIDE_VARIANTS[name]["group"] for name in SIDE_VARIANTS
]
ALL_SIDE_FEET = sorted(
    {SIDE_VARIANTS[name]["idle_feet"] for name in SIDE_VARIANTS}
    | {SIDE_VARIANTS[name]["step_feet"] for name in SIDE_VARIANTS}
)
ALL_SIDE_EXTRAS = sorted(
    {extra for name in SIDE_VARIANTS for extra in SIDE_VARIANTS[name]["extras"]}
)

ALL_BACK_PANTS = sorted({BACK_VARIANTS[name]["pants"] for name in BACK_VARIANTS})
ALL_BACK_FEET = sorted(
    {BACK_VARIANTS[name]["idle_feet"] for name in BACK_VARIANTS}
    | {BACK_VARIANTS[name]["step_feet_1"] for name in BACK_VARIANTS}
    | {BACK_VARIANTS[name]["step_feet_2"] for name in BACK_VARIANTS}
)
ALL_BACK_HATS = sorted({BACK_VARIANTS[name]["hat"] for name in BACK_VARIANTS})
ALL_BACK_EXTRAS = sorted(
    {extra for name in BACK_VARIANTS for extra in BACK_VARIANTS[name]["extras"]}
)
ALL_FRONT_PANTS = sorted({FRONT_VARIANTS[name]["pants"] for name in FRONT_VARIANTS})
ALL_FRONT_HATS = sorted({FRONT_VARIANTS[name]["hat"] for name in FRONT_VARIANTS})
ALL_FRONT_EXTRAS = sorted(
    {extra for name in FRONT_VARIANTS for extra in FRONT_VARIANTS[name]["extras"]}
)
ALL_FRONT_FEET = sorted(
    {FRONT_VARIANTS[name]["idle_feet"] for name in FRONT_VARIANTS}
    | {FRONT_VARIANTS[name]["step_feet_1"] for name in FRONT_VARIANTS}
    | {FRONT_VARIANTS[name]["step_feet_2"] for name in FRONT_VARIANTS}
)
ALL_FRONT_HANDS = sorted(
    {FRONT_VARIANTS[name]["idle_hands"] for name in FRONT_VARIANTS}
    | {FRONT_VARIANTS[name]["step_hands_1"] for name in FRONT_VARIANTS}
    | {FRONT_VARIANTS[name]["step_hands_2"] for name in FRONT_VARIANTS}
)
ALL_FRONT_WB_ELEMENTS = ["image1-53-2"]
ALL_PLAY_ELEMENTS = [
    "rect361",
    "rect4-2-1-3",
    "g354",
    "g97",
    "g135",
    "path128",
    "g183",
    "g134",
    "g171",
    "path125",
    "g138",
    "g182",
    "g127",
    "path135",
    "g146",
    "g141",
    "g166",
    "g142-1",
    "g145",
    "g341",
    "g355",
    "g361",
]
ALL_PLAY_BASE_ART = [
    "g135",
    "path128",
    "g134",
    "path125",
    "g138",
    "g127",
    "path135",
    "g341",
]
PLAY_VARIANTS = {
    "cuisinier": {
        "hat": "g354",
        "hand_1": "g355",
        "hand_2": "g361",
    },
}


ALL_SIDE_ACTION_POSES = ["g29", "g25", "g25-5"]
ALL_SIDE_ACTION_TOOLS = ["g19-3", "g4", "g32", "g19", "g32-3", "g4-0", "g19-33"]
ALL_SIDE_ACTION_GROUPS = ["g204", "g217", "g226"]
ALL_SIDE_IDLE_HANDS = ["g2-3"]
ALL_SIDE_FOOD_GROUPS = ["g239", "g206", "g247"]
ALL_BACK_HANDS = ["g62", "g72", "g63", "g66", "g70"]
ALL_CROP_RECTS = [
    SIDE_CROP_IDLE,
    SIDE_CROP_WORK,
    SIDE_CROP_DIG,
    SIDE_CROP_WB,
    BACK_CROP_IDLE,
    BACK_CROP_WB,
    FRONT_CROP_IDLE,
    FRONT_CROP_WB,
    FISHING_SIDE_CROP,
    FISHING_FRONT_CROP,
    FISHING_BACK_CROP,
]
ALL_FISHING_SIDE_ELEMENTS = [
    "image1-6-0-6",
    "rect278",
    "g251",
    "g286",
    "g264",
    "g267",
    "g1",
    "path267",
    "path268",
    "g272",
    "g270",
    "path265",
    "g278",
]
ALL_FISHING_SIDE_BASE_ART = [
    "g264",
    "g1",
    "path267",
    "path268",
    "g272",
    "g270",
    "path265",
]
FISHING_SIDE_VARIANTS = {
    "basic": {
        "hat": "g251",
        "extras": [],
    },
    "bricoleur": {
        "hat": "g251",
        "extras": [],
    },
    "gs": {
        "hat": "g251",
        "extras": [],
    },
    "lunettes": {
        "hat": "g251",
        "extras": ["g267"],
    },
    "cuisinier": {
        "hat": "g286",
        "extras": [],
    },
}
ALL_FISHING_FRONT_ELEMENTS = [
    "rect319",
    "g290",
    "g292",
    "g319",
    "g300",
    "g312",
    "path296",
    "g305",
    "path300",
    "g304",
    "path305",
    "g308",
]
ALL_FISHING_FRONT_BASE_ART = [
    "g290",
    "g300",
    "path296",
    "g305",
    "path300",
    "path305",
    "g308",
]
FISHING_FRONT_VARIANTS = {
    "basic": {
        "hat": "g292",
        "extras": [],
    },
    "bricoleur": {
        "hat": "g292",
        "extras": [],
    },
    "gs": {
        "hat": "g292",
        "extras": [],
    },
    "lunettes": {
        "hat": "g292",
        "extras": ["g312"],
    },
    "cuisinier": {
        "hat": "g319",
        "extras": [],
    },
}
ALL_FISHING_BACK_ELEMENTS = [
    "rect332",
    "image1-3",
    "g330",
    "path320",
    "path321",
    "path322",
    "g327",
    "path328",
    "path319",
    "g329",
    "g332",
]
ALL_FISHING_BACK_BASE_ART = [
    "g330",
    "path320",
    "path321",
    "path322",
    "g327",
    "path328",
]
FISHING_BACK_VARIANTS = {
    "basic": {
        "hat": "path319",
        "extras": [],
    },
    "bricoleur": {
        "hat": "path319",
        "extras": [],
    },
    "gs": {
        "hat": "path319",
        "extras": [],
    },
    "lunettes": {
        "hat": "path319",
        "extras": [],
    },
    "cuisinier": {
        "hat": "g329",
        "extras": [],
    },
}


@dataclass(frozen=True)
class ExportSpec:
    key: str
    layer: str
    crop_rect: str
    side_feet: str | None = None
    back_feet: str | None = None
    back_hands: tuple[str, str] | None = None
    front_feet: str | None = None
    front_hands: str | None = None
    front_wb: bool = False
    side_action: tuple[str, str] | None = None
    side_group: str | None = None
    side_food_groups: tuple[str, str] | None = None
    play_hand: str | None = None
    fishing_float: bool = False
    cargo_bag: bool = False


EXPORT_SPECS = [
    ExportSpec("idle_w", SIDE_LAYER_ID, SIDE_CROP_IDLE, side_feet="idle"),
    ExportSpec("step_w", SIDE_LAYER_ID, SIDE_CROP_IDLE, side_feet="step"),
    ExportSpec("idle_n", BACK_LAYER_ID, BACK_CROP_IDLE, back_feet="idle", back_hands=("g62", "g63")),
    ExportSpec("step_n_1", BACK_LAYER_ID, BACK_CROP_IDLE, back_feet="step_1", back_hands=("g72", "g70")),
    ExportSpec("step_n_2", BACK_LAYER_ID, BACK_CROP_IDLE, back_feet="step_2", back_hands=("g62", "g66")),
    ExportSpec("idle_s", FRONT_LAYER_ID, FRONT_CROP_IDLE, front_feet="idle", front_hands="idle"),
    ExportSpec("step_s_1", FRONT_LAYER_ID, FRONT_CROP_IDLE, front_feet="step_1", front_hands="step_1"),
    ExportSpec("step_s_2", FRONT_LAYER_ID, FRONT_CROP_IDLE, front_feet="step_2", front_hands="step_2"),
    ExportSpec("work_0", SIDE_LAYER_ID, SIDE_CROP_WORK, side_feet="idle", side_action=("g25", "g19")),
    ExportSpec("work_1", SIDE_LAYER_ID, SIDE_CROP_WORK, side_feet="idle", side_action=("g29", "g19-3")),
    ExportSpec("stone_0", SIDE_LAYER_ID, SIDE_CROP_WORK, side_feet="idle", side_action=("g25-5", "g4-0")),
    ExportSpec("stone_1", SIDE_LAYER_ID, SIDE_CROP_WORK, side_feet="idle", side_action=("g29", "g4")),
    ExportSpec("lumber_0", SIDE_LAYER_ID, SIDE_CROP_WORK, side_feet="idle", side_action=("g25", "g32")),
    ExportSpec("lumber_1", SIDE_LAYER_ID, SIDE_CROP_WORK, side_feet="idle", side_action=("g25-5", "g32-3")),
    ExportSpec("food_0", SIDE_LAYER_ID, SIDE_CROP_WORK, side_feet="idle", side_food_groups=("g239", "g206")),
    ExportSpec("food_1", SIDE_LAYER_ID, SIDE_CROP_WORK, side_feet="idle", side_food_groups=("g239", "g247")),
    ExportSpec("fishing_0", FISHING_SIDE_LAYER_ID, FISHING_SIDE_CROP, fishing_float=True),
    ExportSpec("fishing_1", FISHING_SIDE_LAYER_ID, FISHING_SIDE_CROP, fishing_float=False),
    ExportSpec("fishing_n_0", FISHING_BACK_LAYER_ID, FISHING_BACK_CROP, fishing_float=True),
    ExportSpec("fishing_n_1", FISHING_BACK_LAYER_ID, FISHING_BACK_CROP, fishing_float=False),
    ExportSpec("fishing_s_0", FISHING_FRONT_LAYER_ID, FISHING_FRONT_CROP, fishing_float=True),
    ExportSpec("fishing_s_1", FISHING_FRONT_LAYER_ID, FISHING_FRONT_CROP, fishing_float=False),
    ExportSpec("dig_0", SIDE_LAYER_ID, SIDE_CROP_DIG, side_feet="idle", side_group="g204"),
    ExportSpec("dig_1", SIDE_LAYER_ID, SIDE_CROP_DIG, side_feet="idle", side_group="g226"),
    ExportSpec("play_0", PLAY_LAYER_ID, PLAY_CROP_CUIS, play_hand="hand_1"),
    ExportSpec("play_1", PLAY_LAYER_ID, PLAY_CROP_CUIS, play_hand="hand_2"),
    ExportSpec("wb_idle_w", SIDE_LAYER_ID, SIDE_CROP_WB, side_feet="idle"),
    ExportSpec("wb_step_w", SIDE_LAYER_ID, SIDE_CROP_WB, side_feet="step"),
    ExportSpec("wb_idle_n", BACK_LAYER_ID, BACK_CROP_WB, back_feet="idle", back_hands=("g62", "g63")),
    ExportSpec("wb_step_n_1", BACK_LAYER_ID, BACK_CROP_WB, back_feet="step_1", back_hands=("g72", "g70")),
    ExportSpec("wb_step_n_2", BACK_LAYER_ID, BACK_CROP_WB, back_feet="step_2", back_hands=("g62", "g66")),
    ExportSpec("wb_idle_s", FRONT_LAYER_ID, FRONT_CROP_WB, front_feet="idle", front_hands="idle", front_wb=True),
    ExportSpec("wb_step_s_1", FRONT_LAYER_ID, FRONT_CROP_WB, front_feet="step_1", front_hands="step_1", front_wb=True),
    ExportSpec("wb_step_s_2", FRONT_LAYER_ID, FRONT_CROP_WB, front_feet="step_2", front_hands="step_2", front_wb=True),
    ExportSpec("cargo_idle_w", SIDE_LAYER_ID, SIDE_CROP_IDLE, side_feet="idle", cargo_bag=True),
    ExportSpec("cargo_step_w", SIDE_LAYER_ID, SIDE_CROP_IDLE, side_feet="step", cargo_bag=True),
    ExportSpec("cargo_idle_n", BACK_LAYER_ID, BACK_CROP_IDLE, back_feet="idle", back_hands=("g62", "g63"), cargo_bag=True),
    ExportSpec("cargo_step_n_1", BACK_LAYER_ID, BACK_CROP_IDLE, back_feet="step_1", back_hands=("g72", "g70"), cargo_bag=True),
    ExportSpec("cargo_step_n_2", BACK_LAYER_ID, BACK_CROP_IDLE, back_feet="step_2", back_hands=("g62", "g66"), cargo_bag=True),
    ExportSpec("cargo_idle_s", FRONT_LAYER_ID, FRONT_CROP_IDLE, front_feet="idle", front_hands="idle", cargo_bag=True),
    ExportSpec("cargo_step_s_1", FRONT_LAYER_ID, FRONT_CROP_IDLE, front_feet="step_1", front_hands="step_1", cargo_bag=True),
    ExportSpec("cargo_step_s_2", FRONT_LAYER_ID, FRONT_CROP_IDLE, front_feet="step_2", front_hands="step_2", cargo_bag=True),
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Export the side/back/front sprite batch that can be derived from vec/bacis.svg. "
            "Cuisinier play sprites can also be derived from the 3/4 layer."
        )
    )
    parser.add_argument(
        "--svg",
        default="vec/bacis.svg",
        help="Source SVG. Defaults to vec/bacis.svg.",
    )
    parser.add_argument(
        "--output-dir",
        default="game/assets/units",
        help="Directory where PNG files will be written.",
    )
    parser.add_argument(
        "--preset",
        choices=sorted(DEFAULT_PRESETS),
        help="Use a built-in (variant, prefix) preset.",
    )
    parser.add_argument(
        "--variant",
        choices=sorted(SIDE_VARIANTS),
        help="Variant to export when not using --preset.",
    )
    parser.add_argument(
        "--prefix",
        help="Output filename prefix when not using --preset.",
    )
    parser.add_argument(
        "--only",
        action="append",
        choices=[spec.key for spec in EXPORT_SPECS],
        help="Export only the selected logical frame(s).",
    )
    parser.add_argument(
        "--name-override",
        action="append",
        default=[],
        metavar="FRAME=FILENAME",
        help="Override the output filename for a logical frame.",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List available presets, variants, and logical frame keys.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.list:
        print("Presets:")
        for name, (variant, prefix) in sorted(DEFAULT_PRESETS.items()):
            print(f"  {name}: variant={variant} prefix={prefix}")
        print("\nVariants:")
        for name in sorted(SIDE_VARIANTS):
            print(f"  {name}")
        print("\nFrames:")
        for spec in EXPORT_SPECS:
            print(f"  {spec.key}")
        return 0

    if args.preset:
        variant, prefix = DEFAULT_PRESETS[args.preset]
    else:
        if not args.variant or not args.prefix:
            raise SystemExit("Use either --preset or both --variant and --prefix.")
        variant = args.variant
        prefix = args.prefix

    output_dir = Path(args.output_dir).resolve()
    svg_path = Path(args.svg).resolve()
    name_overrides = parse_name_overrides(args.name_override)
    filename_map = build_filename_map(prefix, name_overrides)
    selected = {spec.key for spec in EXPORT_SPECS} if not args.only else set(args.only)

    output_dir.mkdir(parents=True, exist_ok=True)
    for spec in EXPORT_SPECS:
        if spec.key not in selected:
            continue
        if spec.layer == PLAY_LAYER_ID and variant not in PLAY_VARIANTS:
            continue
        output_path = output_dir / filename_map[spec.key]
        export_frame(svg_path, variant, spec, output_path)
        print(f"Wrote {output_path}")
    return 0


def parse_name_overrides(pairs: list[str]) -> dict[str, str]:
    overrides: dict[str, str] = {}
    valid_keys = set(DEFAULT_FILENAMES)
    for pair in pairs:
        key, sep, value = pair.partition("=")
        if sep != "=" or not key or not value:
            raise SystemExit(f"Invalid --name-override value: {pair}")
        if key not in valid_keys:
            valid_list = ", ".join(sorted(valid_keys))
            raise SystemExit(f"Unknown frame key {key}. Valid keys: {valid_list}")
        overrides[key] = value
    return overrides


def build_filename_map(prefix: str, overrides: dict[str, str]) -> dict[str, str]:
    result = {
        key: template.format(prefix=prefix)
        for key, template in DEFAULT_FILENAMES.items()
    }
    result.update(overrides)
    return result


def export_frame(svg_path: Path, variant: str, spec: ExportSpec, output_path: Path) -> None:
    tree = ET.parse(svg_path)
    root = tree.getroot()
    id_map = build_id_map(root)
    prepare_base_visibility(id_map)
    if spec.layer == SIDE_LAYER_ID:
        configure_side_variant(id_map, variant, spec)
    elif spec.layer == BACK_LAYER_ID:
        configure_back_variant(id_map, variant, spec)
    elif spec.layer == FRONT_LAYER_ID:
        configure_front_variant(id_map, variant, spec)
    elif spec.layer == PLAY_LAYER_ID:
        configure_play_variant(id_map, variant, spec)
    elif spec.layer == FISHING_SIDE_LAYER_ID:
        configure_fishing_side_variant(id_map, variant, spec)
    elif spec.layer == FISHING_BACK_LAYER_ID:
        configure_fishing_back_variant(id_map, variant, spec)
    elif spec.layer == FISHING_FRONT_LAYER_ID:
        configure_fishing_front_variant(id_map, variant, spec)
    else:
        raise ValueError(f"Unsupported layer {spec.layer}")

    crop_rect = require_element(id_map, spec.crop_rect)
    scale_x, scale_y = document_unit_scale(root)
    area = export_area(crop_rect, scale_x, scale_y)

    with tempfile.TemporaryDirectory(prefix="bacis-export-") as temp_dir_name:
        temp_dir = Path(temp_dir_name)
        temp_svg = temp_dir / "frame.svg"
        tree.write(temp_svg, encoding="utf-8", xml_declaration=True)
        run_inkscape_export(temp_svg, output_path, area)
    if spec.front_wb:
        composite_svg_images(
            output_path,
            svg_path,
            id_map,
            crop_rect,
            ALL_FRONT_WB_ELEMENTS,
            scale_x,
            scale_y,
        )


def build_id_map(root: ET.Element) -> dict[str, ET.Element]:
    result: dict[str, ET.Element] = {}
    for element in root.iter():
        element_id = element.attrib.get("id")
        if element_id:
            result[element_id] = element
    return result


def require_element(id_map: dict[str, ET.Element], element_id: str) -> ET.Element:
    element = id_map.get(element_id)
    if element is None:
        raise SystemExit(f"Missing SVG element id: {element_id}")
    return element


def prepare_base_visibility(id_map: dict[str, ET.Element]) -> None:
    set_display(require_element(id_map, SIDE_LAYER_ID), DISPLAY_NONE)
    set_display(require_element(id_map, BACK_LAYER_ID), DISPLAY_NONE)
    set_display(require_element(id_map, FRONT_LAYER_ID), DISPLAY_NONE)
    set_display(require_element(id_map, PLAY_LAYER_ID), DISPLAY_NONE)
    set_display(require_element(id_map, FISHING_SIDE_LAYER_ID), DISPLAY_NONE)
    set_display(require_element(id_map, FISHING_FRONT_LAYER_ID), DISPLAY_NONE)
    set_display(require_element(id_map, FISHING_BACK_LAYER_ID), DISPLAY_NONE)

    hide_elements(
        id_map,
        ALL_CROP_RECTS
        + ALL_SIDE_VARIANT_GROUPS
        + ALL_SIDE_FEET
        + ALL_SIDE_EXTRAS
        + ALL_SIDE_ACTION_POSES
        + ALL_SIDE_ACTION_TOOLS
        + ALL_SIDE_ACTION_GROUPS
        + ALL_SIDE_IDLE_HANDS
        + ALL_SIDE_FOOD_GROUPS
        + ALL_BACK_PANTS
        + ALL_BACK_FEET
        + ALL_BACK_HATS
        + ALL_BACK_EXTRAS
        + ALL_BACK_HANDS
        + ALL_FRONT_PANTS
        + ALL_FRONT_HATS
        + ALL_FRONT_EXTRAS
        + ALL_FRONT_FEET
        + ALL_FRONT_HANDS
        + ALL_FRONT_WB_ELEMENTS
        + ALL_PLAY_ELEMENTS
        + ALL_FISHING_SIDE_ELEMENTS
        + ALL_FISHING_FRONT_ELEMENTS
        + ALL_FISHING_BACK_ELEMENTS
        + ["side_bag", "back_bag", "front_bag"],
    )


def configure_side_variant(
    id_map: dict[str, ET.Element],
    variant: str,
    spec: ExportSpec,
) -> None:
    variant_config = SIDE_VARIANTS[variant]
    set_display(require_element(id_map, SIDE_LAYER_ID), DISPLAY_INLINE)
    set_display(require_element(id_map, variant_config["group"]), DISPLAY_INLINE)
    show_elements(id_map, variant_config["extras"])

    if spec.side_feet == "idle":
        set_display(require_element(id_map, variant_config["idle_feet"]), DISPLAY_INLINE)
    elif spec.side_feet == "step":
        set_display(require_element(id_map, variant_config["step_feet"]), DISPLAY_INLINE)

    if spec.side_action:
        pose_id, tool_id = spec.side_action
        set_display(require_element(id_map, pose_id), DISPLAY_INLINE)
        set_display(require_element(id_map, tool_id), DISPLAY_INLINE)

    if spec.side_group:
        set_display(require_element(id_map, spec.side_group), DISPLAY_INLINE)

    if spec.side_food_groups:
        show_elements(id_map, list(spec.side_food_groups))

    if (
        variant_config.get("hand")
        and not spec.side_action
        and not spec.side_group
        and not spec.side_food_groups
    ):
        set_display(require_element(id_map, variant_config["hand"]), DISPLAY_INLINE)

    if spec.cargo_bag:
        set_display(require_element(id_map, "side_bag"), DISPLAY_INLINE)


def configure_back_variant(
    id_map: dict[str, ET.Element],
    variant: str,
    spec: ExportSpec,
) -> None:
    variant_config = BACK_VARIANTS[variant]
    set_display(require_element(id_map, BACK_LAYER_ID), DISPLAY_INLINE)
    show_elements(
        id_map,
        [variant_config["pants"], variant_config["hat"], *variant_config["extras"]],
    )

    if spec.back_feet == "idle":
        set_display(require_element(id_map, variant_config["idle_feet"]), DISPLAY_INLINE)
    elif spec.back_feet == "step_1":
        set_display(require_element(id_map, variant_config["step_feet_1"]), DISPLAY_INLINE)
    elif spec.back_feet == "step_2":
        set_display(require_element(id_map, variant_config["step_feet_2"]), DISPLAY_INLINE)

    if spec.back_hands:
        left_hand_id, right_hand_id = spec.back_hands
        show_elements(id_map, [left_hand_id, right_hand_id])

    if spec.cargo_bag:
        set_display(require_element(id_map, "back_bag"), DISPLAY_INLINE)


def configure_front_variant(
    id_map: dict[str, ET.Element],
    variant: str,
    spec: ExportSpec,
) -> None:
    variant_config = FRONT_VARIANTS[variant]
    set_display(require_element(id_map, FRONT_LAYER_ID), DISPLAY_INLINE)
    show_elements(
        id_map,
        [variant_config["hat"], variant_config["pants"], *variant_config["extras"]],
    )

    if spec.front_feet == "idle":
        set_display(require_element(id_map, variant_config["idle_feet"]), DISPLAY_INLINE)
    elif spec.front_feet == "step_1":
        set_display(require_element(id_map, variant_config["step_feet_1"]), DISPLAY_INLINE)
    elif spec.front_feet == "step_2":
        set_display(require_element(id_map, variant_config["step_feet_2"]), DISPLAY_INLINE)

    if spec.front_hands == "idle":
        set_display(require_element(id_map, variant_config["idle_hands"]), DISPLAY_INLINE)
    elif spec.front_hands == "step_1":
        set_display(require_element(id_map, variant_config["step_hands_1"]), DISPLAY_INLINE)
    elif spec.front_hands == "step_2":
        set_display(require_element(id_map, variant_config["step_hands_2"]), DISPLAY_INLINE)

    if spec.cargo_bag:
        set_display(require_element(id_map, "front_bag"), DISPLAY_INLINE)


def configure_fishing_side_variant(
    id_map: dict[str, ET.Element],
    variant: str,
    spec: ExportSpec,
) -> None:
    variant_config = FISHING_SIDE_VARIANTS[variant]
    set_display(require_element(id_map, FISHING_SIDE_LAYER_ID), DISPLAY_INLINE)
    show_elements(id_map, ALL_FISHING_SIDE_BASE_ART)
    show_elements(
        id_map,
        [variant_config["hat"], *variant_config["extras"]],
    )
    if spec.fishing_float:
        set_display(require_element(id_map, "g278"), DISPLAY_INLINE)


def configure_play_variant(
    id_map: dict[str, ET.Element],
    variant: str,
    spec: ExportSpec,
) -> None:
    variant_config = PLAY_VARIANTS[variant]
    set_display(require_element(id_map, PLAY_LAYER_ID), DISPLAY_INLINE)
    show_elements(id_map, ALL_PLAY_BASE_ART)
    show_elements(id_map, [variant_config["hat"]])
    if spec.play_hand == "hand_1":
        show_elements(id_map, [variant_config["hand_1"]])
    elif spec.play_hand == "hand_2":
        show_elements(id_map, [variant_config["hand_2"]])


def configure_fishing_front_variant(
    id_map: dict[str, ET.Element],
    variant: str,
    spec: ExportSpec,
) -> None:
    variant_config = FISHING_FRONT_VARIANTS[variant]
    set_display(require_element(id_map, FISHING_FRONT_LAYER_ID), DISPLAY_INLINE)
    show_elements(id_map, ALL_FISHING_FRONT_BASE_ART)
    show_elements(
        id_map,
        [variant_config["hat"], *variant_config["extras"]],
    )
    if spec.fishing_float:
        set_display(require_element(id_map, "g304"), DISPLAY_INLINE)


def configure_fishing_back_variant(
    id_map: dict[str, ET.Element],
    variant: str,
    spec: ExportSpec,
) -> None:
    variant_config = FISHING_BACK_VARIANTS[variant]
    set_display(require_element(id_map, FISHING_BACK_LAYER_ID), DISPLAY_INLINE)
    show_elements(id_map, ALL_FISHING_BACK_BASE_ART)
    show_elements(
        id_map,
        [variant_config["hat"], *variant_config["extras"]],
    )
    if spec.fishing_float:
        set_display(require_element(id_map, "g332"), DISPLAY_INLINE)

def hide_elements(id_map: dict[str, ET.Element], element_ids: list[str]) -> None:
    for element_id in element_ids:
        element = id_map.get(element_id)
        if element is not None:
            set_display(element, DISPLAY_NONE)


def show_elements(id_map: dict[str, ET.Element], element_ids: list[str]) -> None:
    for element_id in element_ids:
        element = require_element(id_map, element_id)
        set_display(element, DISPLAY_INLINE)


def set_display(element: ET.Element, value: str) -> None:
    style = element.attrib.get("style", "")
    style_parts = [part for part in style.split(";") if part and not part.startswith("display:")]
    style_parts.insert(0, f"display:{value}")
    element.attrib["style"] = ";".join(style_parts)


def export_area(rect: ET.Element, scale_x: float, scale_y: float) -> str:
    x = float(rect.attrib["x"]) * scale_x
    y = float(rect.attrib["y"]) * scale_y
    width = float(rect.attrib["width"]) * scale_x
    height = float(rect.attrib["height"]) * scale_y
    return f"{x}:{y}:{x + width}:{y + height}"


def document_unit_scale(root: ET.Element) -> tuple[float, float]:
    view_box = root.attrib.get("viewBox")
    if not view_box:
        return (1.0, 1.0)
    _, _, view_box_width, view_box_height = [float(value) for value in view_box.split()]
    width_value, width_unit = parse_length(root.attrib.get("width"))
    height_value, height_unit = parse_length(root.attrib.get("height"))
    if width_value is None or height_value is None or view_box_width <= 0 or view_box_height <= 0:
        return (1.0, 1.0)
    width_px = length_to_px(width_value, width_unit)
    height_px = length_to_px(height_value, height_unit)
    return (width_px / view_box_width, height_px / view_box_height)


def parse_length(raw_value: str | None) -> tuple[float | None, str]:
    if not raw_value:
        return (None, "px")
    raw_value = raw_value.strip()
    for unit in ("mm", "cm", "in", "px"):
        if raw_value.endswith(unit):
            return (float(raw_value[: -len(unit)]), unit)
    return (float(raw_value), "px")


def length_to_px(value: float, unit: str) -> float:
    if unit == "px":
        return value
    if unit == "in":
        return value * 96.0
    if unit == "cm":
        return (value / 2.54) * 96.0
    if unit == "mm":
        return (value / 25.4) * 96.0
    raise ValueError(f"Unsupported SVG unit: {unit}")


def run_inkscape_export(temp_svg: Path, output_path: Path, area: str) -> None:
    command = [
        "inkscape",
        str(temp_svg),
        "--export-type=png",
        f"--export-filename={output_path}",
        "--export-background-opacity=0",
        "--export-dpi=96",
        f"--export-area={area}",
    ]
    subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def composite_svg_images(
    output_path: Path,
    svg_path: Path,
    id_map: dict[str, ET.Element],
    crop_rect: ET.Element,
    image_ids: list[str],
    scale_x: float,
    scale_y: float,
) -> None:
    base_image = Image.open(output_path).convert("RGBA")
    crop_x = float(crop_rect.attrib["x"])
    crop_y = float(crop_rect.attrib["y"])

    for image_id in image_ids:
        image_element = require_element(id_map, image_id)
        overlay_image = load_svg_image_payload(svg_path, image_element)
        if overlay_image is None:
            continue

        target_x = int(round((float(image_element.attrib["x"]) - crop_x) * scale_x))
        target_y = int(round((float(image_element.attrib["y"]) - crop_y) * scale_y))
        target_width = max(1, int(round(float(image_element.attrib["width"]) * scale_x)))
        target_height = max(1, int(round(float(image_element.attrib["height"]) * scale_y)))
        resized_overlay = overlay_image.resize((target_width, target_height), Image.Resampling.LANCZOS)

        layer = Image.new("RGBA", base_image.size, (0, 0, 0, 0))
        layer.alpha_composite(resized_overlay, (target_x, target_y))
        base_image = Image.alpha_composite(base_image, layer)

    base_image.save(output_path)


def load_svg_image_payload(svg_path: Path, image_element: ET.Element) -> Image.Image | None:
    href = image_element.attrib.get("{http://www.w3.org/1999/xlink}href") or image_element.attrib.get("href")
    if not href:
        return None
    if href.startswith("data:image/") and ";base64," in href:
        encoded = href.split(",", 1)[1]
        data = base64.b64decode(encoded)
        return Image.open(io.BytesIO(data)).convert("RGBA")
    if href.startswith("file://"):
        image_path = Path(href.removeprefix("file://"))
    else:
        image_path = Path(href)
        if not image_path.is_absolute():
            image_path = (svg_path.parent / image_path).resolve()
    return Image.open(image_path).convert("RGBA")


if __name__ == "__main__":
    raise SystemExit(main())
