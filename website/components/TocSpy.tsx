"use client";

import { useEffect } from "react";

export default function TocSpy() {
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(".docs-nav");
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".docs-nav a[href^='#']"));
    const targets = links
      .map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1))))
      .filter((el): el is HTMLElement => el !== null);
    if (!nav || targets.length === 0) return;

    // scrollIntoView here would cancel the page's own smooth scroll to a clicked anchor,
    // so only the sidebar's scrollTop is moved.
    const reveal = (a: HTMLAnchorElement) => {
      const box = nav.getBoundingClientRect();
      const r = a.getBoundingClientRect();
      if (r.top < box.top) nav.scrollTop -= box.top - r.top + 8;
      else if (r.bottom > box.bottom) nav.scrollTop += r.bottom - box.bottom + 8;
    };
    const mark = (id: string) => {
      for (const a of links) {
        if (a.hash !== `#${id}`) a.removeAttribute("aria-current");
        else if (!a.hasAttribute("aria-current")) {
          a.setAttribute("aria-current", "location");
          reveal(a);
        }
      }
    };

    let pinned = "";
    let release = 0;
    let frame = 0;
    const update = () => {
      frame = 0;
      if (pinned) return;
      const line = 120;
      let current = targets[0];
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atEnd) current = targets[targets.length - 1];
      else
        for (const t of targets) {
          if (t.getBoundingClientRect().top <= line) current = t;
          else break;
        }
      mark(current.id);
    };
    const unpin = () => {
      pinned = "";
      window.clearTimeout(release);
    };
    const onScroll = () => {
      if (pinned) {
        window.clearTimeout(release);
        release = window.setTimeout(unpin, 150);
      }
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>("a[href^='#']");
      if (!a || !links.includes(a)) return;
      pinned = decodeURIComponent(a.hash.slice(1));
      mark(pinned);
      window.clearTimeout(release);
      release = window.setTimeout(unpin, 1000);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scrollend", unpin);
    nav.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", unpin);
      nav.removeEventListener("click", onClick);
      window.clearTimeout(release);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}
