#!/usr/bin/env python3
"""Extrae estructura de un HTML Shopify y la imprime como spec."""
import re, sys, json, os

def extract(html_path):
    with open(html_path) as f: html = f.read()
    title = re.search(r'<title>([^<]+)</title>', html)
    sections = re.findall(r'<section[^>]*class="([^"]*)"[^>]*>(.*?)</section>', html, re.DOTALL)
    out = []
    for cls, body in sections:
        if 'drawer-menu' in cls or 'shopify-section-group-footer' in cls or 'header-section' in cls:
            continue
        headings = []
        for tag, content in re.findall(r'<(h[1-3])[^>]*>(.*?)</\1>', body, re.DOTALL):
            txt = re.sub(r'<[^>]+>', '', content).strip()
            if txt: headings.append({"tag": tag, "text": txt[:120]})
        text = re.sub(r'<style[^>]*>.*?</style>', '', body, flags=re.DOTALL)
        text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL)
        text = re.sub(r'<[^>]+>', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()[:200]
        out.append({"class": cls.strip()[:80], "headings": headings, "text_sample": text})
    return {"title": title.group(1) if title else "", "sections": out, "section_count": len(out)}

if __name__ == "__main__":
    path = sys.argv[1]
    spec = extract(path)
    print(json.dumps(spec, ensure_ascii=False, indent=2))
