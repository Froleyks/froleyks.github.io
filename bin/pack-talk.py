#!/usr/bin/env python3
"""Losslessly package a single-file Manim talk for GitHub Pages.

The SVG exporter repeats large serialized tags throughout animation states. A
dictionary shares those exact byte fragments before gzip; the standalone HTML
restores the original document in the browser, including its embedded runtime.
No presentation data, media, geometry, or animation is changed.
"""

from __future__ import annotations

import argparse
import base64
from collections import Counter
import gzip
import hashlib
import html
import json
from pathlib import Path
import re
import sys
import tempfile


DELIMITER = b"\\u003c"
TOKEN = re.compile(rb"\x00([0-9]+)\x00")
PAYLOAD = re.compile(
    rb'<script id="packed-talk-data" type="application/octet-stream" '
    rb'data-packing="svg-fragments-gzip-v1" data-source-sha256="([0-9a-f]{64})">'
    rb'([A-Za-z0-9+/=\s]+)</script>'
)
MAX_FILE_BYTES = 100 * 1024 * 1024


BOOTSTRAP = r"""<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="icon" href="data:,"><title>@@TITLE@@</title>
<style>html,body{margin:0;width:100%;height:100%;background:#171b25;color:#f0f4fc;font-family:system-ui,sans-serif}body{display:grid;place-items:center}#loading{padding:2rem;max-width:35rem;line-height:1.5}</style>
</head><body><div id="loading" role="status">Loading presentation…</div>
<noscript>This interactive presentation requires JavaScript.</noscript>
<script id="packed-talk-data" type="application/octet-stream" data-packing="svg-fragments-gzip-v1" data-source-sha256="@@SHA256@@">@@PAYLOAD@@</script>
<script>
(async () => {
  try {
    const node = document.getElementById('packed-talk-data');
    let encoded = node.textContent.trim();
    node.remove();
    const chunks = [];
    // Bound the temporary binary string rather than decoding the whole file
    // with one atob call. Each chunk ends on a base64 quartet boundary.
    const chunkSize = 1024 * 1024;
    for (let offset = 0; offset < encoded.length; offset += chunkSize) {
      const binary = atob(encoded.slice(offset, offset + chunkSize));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      chunks.push(bytes);
    }
    encoded = '';
    const compressed = new Blob(chunks);
    chunks.length = 0;
    const stream = compressed.stream().pipeThrough(new DecompressionStream('gzip'));
    const bundle = await new Response(stream).json();
    const source = bundle.body.replace(/\u0000([0-9]+)\u0000/g, (_, index) => {
      const fragment = bundle.strings[Number(index)];
      if (fragment === undefined) throw new Error('Invalid presentation fragment.');
      return fragment;
    });
    bundle.body = '';
    bundle.strings.length = 0;
    // Keep the original URL/origin so its navigation and storage work exactly
    // as they do in the unpacked export, including when opened from disk.
    document.open();
    document.write(source);
    document.close();
  } catch (error) {
    const status = document.getElementById('loading');
    if (status) status.textContent = `The presentation could not be loaded: ${error.message}`;
    console.error(error);
  }
})();
</script></body></html>
"""


def unpack(packed: bytes) -> bytes:
    match = PAYLOAD.search(packed)
    if match is None:
        raise ValueError("not a packed standalone talk")
    bundle = json.loads(gzip.decompress(base64.b64decode(match[2], validate=False)))
    strings = [fragment.encode("utf-8") for fragment in bundle["strings"]]
    body = bundle["body"].encode("utf-8")
    source = TOKEN.sub(lambda item: strings[int(item[1])], body)
    if hashlib.sha256(source).hexdigest().encode("ascii") != match[1]:
        raise ValueError("restored presentation does not match its SHA256")
    return source


def pack(source: bytes) -> bytes:
    if b"\x00" in source:
        raise ValueError("source contains the reserved NUL dictionary marker")
    # Validate UTF-8 before constructing the browser's string representation.
    source.decode("utf-8")
    parts = source.split(DELIMITER)
    counts = Counter(parts[1:])
    repeated = [part for part, count in counts.items() if count > 1 and len(part) > 64]
    lookup = {part: index for index, part in enumerate(repeated)}
    body = parts[0] + b"".join(
        b"\x00" + str(lookup[part]).encode("ascii") + b"\x00"
        if part in lookup else DELIMITER + part
        for part in parts[1:]
    )
    strings = [(DELIMITER + part).decode("utf-8") for part in repeated]
    # mtime=0 makes rerunning the import produce the same HTML bytes.
    bundle = json.dumps(
        {"strings": strings, "body": body.decode("utf-8")},
        ensure_ascii=False,
        separators=(",", ":"),
    ).encode("utf-8")
    compressed = gzip.compress(bundle, compresslevel=6, mtime=0)
    encoded = base64.b64encode(compressed).decode("ascii")
    title = re.search(rb"<title>(.*?)</title>", source, flags=re.DOTALL)
    title_text = html.escape(html.unescape(title[1].decode("utf-8"))) if title else "Presentation"
    document = BOOTSTRAP.replace("@@TITLE@@", title_text)
    document = document.replace("@@SHA256@@", hashlib.sha256(source).hexdigest())
    document = document.replace("@@PAYLOAD@@", encoded).encode("utf-8")
    if len(document) >= MAX_FILE_BYTES:
        raise ValueError(
            f"packed file is {len(document):,} bytes; GitHub requires less than {MAX_FILE_BYTES:,}"
        )
    if unpack(document) != source:
        raise ValueError("lossless packing verification failed")
    return document


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="original single-file HTML export")
    parser.add_argument("destination", type=Path, help="packed standalone HTML")
    parser.add_argument("--verify", action="store_true", help="verify an existing destination without writing")
    args = parser.parse_args()
    source = args.source.read_bytes()
    if args.verify:
        packed = args.destination.read_bytes()
        if unpack(packed) != source:
            raise ValueError(f"{args.destination} differs from {args.source}")
        print(f"Verified {args.destination}: exact {len(source):,}-byte original restored")
        return 0
    packed = pack(source)
    args.destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=args.destination.parent, prefix=".packed-talk-", delete=False) as temporary:
        temporary.write(packed)
        temporary_path = Path(temporary.name)
    try:
        temporary_path.chmod(0o644)
        temporary_path.replace(args.destination)
    finally:
        temporary_path.unlink(missing_ok=True)
    print(f"Packed {args.destination}: {len(source):,} → {len(packed):,} bytes; exact recovery verified")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, ValueError, KeyError, IndexError, json.JSONDecodeError) as error:
        print(f"pack-talk: {error}", file=sys.stderr)
        raise SystemExit(1)
