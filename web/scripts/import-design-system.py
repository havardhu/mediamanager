"""
Regenerates src/ds/index.js from the Claude Design workbench bundle (_ds_bundle.js).

Usage: python scripts/import-design-system.py <path to _ds_bundle.js>

Only the reusable components under components/ are kept (not the UI kit app). Each component
block keeps its own scope, exactly as in the bundle, and the scope object is exported.
"""
import re, sys, pathlib

src = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")
out = pathlib.Path(__file__).resolve().parent.parent / "src" / "ds" / "index.js"

blocks = re.split(r"\n// (components/[^\n]+|ui_kits/[^\n]+)\n", src)
# blocks = [prelude, name1, body1, name2, body2, ...]
parts, names = [], []
for i in range(1, len(blocks), 2):
    name, body = blocks[i], blocks[i + 1]
    if not name.startswith("components/"):
        continue
    body = body.strip()
    body = re.sub(r"^try \{ \(\(\) => \{\n", "", body)
    body = re.sub(r"\n\}\)\(\); \} catch \(e\) \{ __ds_ns\.__errors\.push\(.*?\); \}\s*$", "", body, flags=re.S)
    exported = re.findall(r"Object\.assign\(__ds_scope, \{ ([^}]+) \}\);", body)
    for e in exported:
        names += [n.strip() for n in e.split(",")]
    parts.append(f"// {name}\n(() => {{\n{body}\n}})();\n")

header = """/* eslint-disable */
// GENERATED from the Claude Design "Workbench" design system bundle by
// scripts/import-design-system.py. Do not edit by hand; re-run the script instead.
import * as React from 'react';

const __ds_scope = {};

"""
footer = "\nexport const {\n" + ",\n".join("  " + n for n in dict.fromkeys(names)) + ",\n} = __ds_scope;\n"
out.write_text(header + "\n".join(parts) + footer, encoding="utf-8")
print(f"wrote {out} with {len(set(names))} exports")
