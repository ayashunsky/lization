"""Export bag-only overlays aligned with the wheelbarrow vehicle sprites."""

from pathlib import Path
import subprocess
import tempfile

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "vec/bacis.svg"
ASSETS = ROOT / "game/assets/vehicles"

# Source image, bag top-left in its 200%-zoom canvas. Mounted overlays are
# drawn 20 asset pixels higher; south work frames need this because their cart
# starts at the top edge. The south idle cart is part of the mounted unit image.
FRAMES = {
    "wb_idle.png": (29, 8, None),
    "wb_mount_w.png": (69, 42, None),
    "wb_mount_e.png": (88, 42, None),
    "wb_mount_n.png": (70, 40, None),
    "wb_empty.png": (76, 47, (106, 96)),
    "wb_mount_work_w.png": (108, 42, None),
    "wb_mount_work_e.png": (56, 42, None),
    "wb_mount_work_n.png": (112, 81, None),
    "wb_mount_work_ne.png": (53, 80, None),
    "wb_mount_work_nw.png": (110, 81, None),
    "wb_mount_work_s.png": (68, 0, None),
    "wb_mount_work_se.png": (50, 0, None),
    "wb_mount_work_sw.png": (108, 0, None),
}


def main() -> None:
    with tempfile.TemporaryDirectory() as temp_dir:
        bag_path = Path(temp_dir) / "bag.png"
        subprocess.run(
            [
                "inkscape",
                str(SOURCE),
                "--export-id=side_bag_body_group",
                "--export-id-only",
                "--export-area-drawing",
                "--export-width=24",
                f"--export-filename={bag_path}",
            ],
            check=True,
        )
        bag = Image.open(bag_path).convert("RGBA")

        for source_name, (x, y, canvas_size) in FRAMES.items():
            with Image.open(ASSETS / source_name) as source:
                size = canvas_size or source.size
            overlay = Image.new("RGBA", size, (0, 0, 0, 0))
            overlay.alpha_composite(bag, (x, y))
            overlay.save(ASSETS / source_name.replace("wb_", "wb_cargo_"))

        # The south-facing idle cart is baked into each mounted unit sprite.
        # Only its bag top can be drawn after that sprite without covering the rim.
        south_front = Image.new("RGBA", (106, 96), (0, 0, 0, 0))
        south_front.alpha_composite(bag, (79, 57))
        south_front.paste((0, 0, 0, 0), (0, 76, 106, 96))
        south_front.save(ASSETS / "wb_cargo_empty_front.png")


if __name__ == "__main__":
    main()
