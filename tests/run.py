#!/usr/bin/env python3
"""ชุดทดสอบในคลังงาน: การเผยแพร่ โครงการ หลักฐาน และสูตรประเมิน (ผ่าน Node)."""
from __future__ import annotations

import json
import re
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://ayeduplan1.thamdee.com"
failed: list[str] = []
passed = 0


def check(name: str, cond: bool, detail: str = "") -> None:
    global passed
    if cond:
        passed += 1
        return
    failed.append(f"{name}: {detail}" if detail else name)


class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.hrefs: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        ad = dict(attrs)
        for key in ("href", "src"):
            val = ad.get(key)
            if val:
                self.hrefs.append(val)


html_files = sorted(p for p in ROOT.rglob("*.html") if ".git" not in p.parts)
indexable = [p for p in html_files if p.name != "404.html"]

# T22–T30 projects and costs
projects = json.loads((ROOT / "assets/projects.json").read_text(encoding="utf-8"))
check("T22 six projects", len(projects) == 6, str(len(projects)))
check("T23 ids E1–E6", [p["id"] for p in projects] == [f"E{i}" for i in range(1, 7)])
check(
    "T24 illustrative status",
    all(p["status"] == "illustrative-proposal-not-approved" for p in projects),
)
check("T25 five work packages", all(len(p["workPackages"]) == 5 for p in projects))
mins = sum(p["fiveYearProposedBudgetMillion"][0] for p in projects)
maxs = sum(p["fiveYearProposedBudgetMillion"][1] for p in projects)
check("T26 budget floor 190", mins == 190, str(mins))
check("T27 budget ceiling 310", maxs == 310, str(maxs))
pilots = sum(p["illustrativePilotCostBaht"] for p in projects)
check("T28 pilot cost 6,300,000", pilots == 6_300_000, str(pilots))
check("T29 project HTML exists", all((ROOT / p["url"]).is_file() for p in projects))
check("T30 project MD exists", all((ROOT / p["download"]).is_file() for p in projects))

# T31–T33 evidence pages
check("T31 document 10", (ROOT / "articles/document-10.html").is_file())
check("T32 plan-review", (ROOT / "plan-review.html").is_file())
assessment = (ROOT / "assessment.html").read_text(encoding="utf-8")
check("T33 assessment has no revision banner", "revision-note" not in assessment)

# T34–T40 publishing
sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
locs = re.findall(r"<loc>([^<]+)</loc>", sitemap)
check("T34 sitemap 37 URLs", len(locs) == 37, str(len(locs)))
check("T34b homepage first-class URL", f"{SITE}/" in locs)

missing_canon = []
for p in indexable:
    rel = p.relative_to(ROOT).as_posix()
    want = f"{SITE}/" if rel == "index.html" else f"{SITE}/{rel}"
    text = p.read_text(encoding="utf-8")
    if f'rel="canonical" href="{want}"' not in text:
        missing_canon.append(rel)
check("T35 canonical on indexable pages", not missing_canon, ", ".join(missing_canon[:8]))

titles = []
descs = []
for p in indexable:
    text = p.read_text(encoding="utf-8")
    tm = re.search(r"<title>(.*?)</title>", text)
    dm = re.search(r'<meta name="description" content="([^"]*)"', text)
    titles.append(tm.group(1) if tm else "")
    descs.append(dm.group(1) if dm else "")
check("T36 unique titles", len(titles) == len(set(titles)), str(len(titles) - len(set(titles))))

cname = (ROOT / "CNAME").read_text(encoding="utf-8").strip()
check("T37 CNAME", cname == "ayeduplan1.thamdee.com", cname)
robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
check("T38 robots points to sitemap", f"{SITE}/sitemap.xml" in robots)

joined = "\n".join(p.read_text(encoding="utf-8") for p in html_files)
trackers = [
    "www.google-analytics.com",
    "googletagmanager.com",
    "connect.facebook.net",
    "fonts.googleapis.com",
]
check("T39 no third-party trackers or font CDNs", not any(t in joined for t in trackers))
check("T40 Open Graph image file", (ROOT / "assets/og-image.png").is_file())
check("T40b apple-touch-icon", (ROOT / "assets/apple-touch-icon.png").is_file())
check("site logo", (ROOT / "assets/logo.png").is_file())
check("header uses site logo", 'src="assets/logo.png"' in (ROOT / "index.html").read_text(encoding="utf-8") and 'class="brandmark"' in (ROOT / "index.html").read_text(encoding="utf-8"))
check("old gold-bar favicon unlinked", "favicon.svg" not in (ROOT / "index.html").read_text(encoding="utf-8"))
check("T40c LICENSE", (ROOT / "LICENSE.txt").is_file())
check("author portrait", (ROOT / "assets/author.jpg").is_file())
check("author thumb", (ROOT / "assets/author-thumb.jpg").is_file())
check("about shows author photo", 'src="assets/author.jpg"' in (ROOT / "about.html").read_text(encoding="utf-8"))

# Extra publishing integrity
check("404 stays noindex", 'name="robots" content="noindex"' in (ROOT / "404.html").read_text(encoding="utf-8"))
check("404 not in sitemap", "404.html" not in sitemap)
generic = "ด้วยหลักฐาน ความเสมอภาค และการมีส่วนร่วม"
generic_pages = []
for p in [
    ROOT / "learn.html",
    ROOT / "tools.html",
    ROOT / "privacy.html",
    ROOT / "projects.html",
    ROOT / "assessment.html",
]:
    if generic in (re.search(r'<meta name="description" content="([^"]*)"', p.read_text(encoding="utf-8")).group(1)):
        generic_pages.append(p.name)
check("unique key-page descriptions", not generic_pages, ", ".join(generic_pages))

# Internal links
broken = []
skip_schemes = ("http:", "https:", "mailto:", "tel:")
for p in html_files:
    parser = LinkParser()
    parser.feed(p.read_text(encoding="utf-8"))
    for href in parser.hrefs:
        if href.startswith(("#", "javascript:")) or href.startswith(skip_schemes):
            continue
        path = unquote(urlparse(href).path)
        if not path:
            continue
        target = (p.parent / path).resolve()
        try:
            target.relative_to(ROOT.resolve())
        except ValueError:
            continue
        if not target.exists():
            broken.append(f"{p.relative_to(ROOT)} -> {href}")
check("internal files exist", not broken, "; ".join(broken[:8]))

# Node EduCore tests (T01–T21)
node = subprocess.run(
    ["node", str(ROOT / "tests/edu-core.test.js")],
    cwd=ROOT,
    capture_output=True,
    text=True,
)
check("edu-core node tests", node.returncode == 0, node.stderr.strip() or node.stdout.strip())

print(f"passed {passed}")
if failed:
    print("failed", len(failed))
    for item in failed:
        print("-", item)
    sys.exit(1)
print("all checks passed")
