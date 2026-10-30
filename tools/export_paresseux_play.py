#!/usr/bin/env python3
"""Export the two Paresseux play frames from vec/paresseux.svg."""

from pathlib import Path
import math
import subprocess
import tempfile
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
SVG_PATH = ROOT / "vec/paresseux.svg"
OUTPUT_DIR = ROOT / "game/assets/units"
LABEL = "{http://www.inkscape.org/namespaces/inkscape}label"


def labeled(root: ET.Element, name: str) -> ET.Element:
    matches = [element for element in root.iter() if element.get(LABEL) == name]
    if len(matches) != 1:
        raise ValueError(f"Expected one SVG object labeled {name!r}, found {len(matches)}")
    return matches[0]


def set_display(element: ET.Element, visible: bool) -> None:
    parts = [part for part in element.get("style", "").split(";") if part and not part.startswith("display:")]
    parts.insert(0, f"display:{'inline' if visible else 'none'}")
    element.set("style", ";".join(parts))


def main() -> None:
    tree = ET.parse(SVG_PATH)
    root = tree.getroot()
    background = labeled(root, "background")
    mouth1 = labeled(root, "mouth1")
    mouth2 = labeled(root, "mouth2")
    x = math.floor(float(background.get("x")))
    y = math.floor(float(background.get("y")))
    right = math.ceil(float(background.get("x")) + float(background.get("width")))
    bottom = math.ceil(float(background.get("y")) + float(background.get("height")))
    set_display(background, False)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="paresseux-play-", dir=OUTPUT_DIR) as temp_dir:
        temp_dir = Path(temp_dir)
        temp_svg = temp_dir / "frame.svg"
        for filename, first_mouth in (("paresseux_play.png", True), ("paresseux_play_1.png", False)):
            temp_output = temp_dir / filename
            set_display(mouth1, first_mouth)
            set_display(mouth2, not first_mouth)
            tree.write(temp_svg, encoding="utf-8", xml_declaration=True)
            subprocess.run(
                [
                    "inkscape",
                    str(temp_svg),
                    "--export-type=png",
                    f"--export-filename={temp_output}",
                    "--export-background-opacity=0",
                    f"--export-area={x}:{y}:{right}:{bottom}",
                ],
                check=True,
            )
            if not temp_output.is_file() or temp_output.stat().st_size == 0:
                raise RuntimeError(f"Inkscape did not export {filename}")
        for filename in ("paresseux_play.png", "paresseux_play_1.png"):
            (temp_dir / filename).replace(OUTPUT_DIR / filename)
            print(f"Wrote {OUTPUT_DIR / filename}")


if __name__ == "__main__":
    main()
