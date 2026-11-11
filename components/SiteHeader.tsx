"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  { href: "/#top", label: "Home" },
  { href: "/#mission", label: "Our Mission" },
  { href: "/#who-we-help", label: "Who We Help" },
  { href: "/#programs", label: "Programs" },
  { href: "/donate", label: "Donate" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/#top"
          className="flex items-center gap-3"
          aria-label="NHCAF — North Houston Cancer Assistance Foundation, home"
          onClick={close}
        >
          <LogoMark />
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-xl font-semibold tracking-tight text-teal-900">
              NHCAF
            </span>
            <span className="hidden text-xs text-ink-soft sm:block">
              North Houston Cancer Assistance Foundation
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-md px-3 py-2 text-[0.95rem] font-medium text-ink-soft transition-colors hover:bg-teal-50 hover:text-teal-900"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/apply"
            target="_blank"
            rel="noopener noreferrer"
            title="Opens in a new tab or window"
            className="hidden rounded-full bg-teal-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-900 sm:inline-block"
          >
            Apply for Assistance
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-teal-900 hover:bg-teal-50 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <nav
        id="mobile-menu"
        aria-label="Primary mobile"
        className={`${open ? "block" : "hidden"} border-t border-line bg-white lg:hidden`}
      >
        <ul className="mx-auto flex max-w-6xl flex-col px-4 py-3 sm:px-6">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={close}
                className="block rounded-md px-3 py-3 text-base font-medium text-ink hover:bg-teal-50"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="mt-2 sm:hidden">
            <Link
              href="/apply"
            target="_blank"
            rel="noopener noreferrer"
            title="Opens in a new tab or window"
              onClick={close}
              className="block rounded-full bg-teal-800 px-5 py-3 text-center font-semibold text-white hover:bg-teal-900"
            >
              Apply for Assistance
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  // Abstract mark: two overlapping arcs suggesting shelter and support.
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <rect width="40" height="40" rx="10" fill="#14525a" />
      <path
        d="M9 27c0-6.1 4.9-11 11-11s11 4.9 11 11"
        fill="none"
        stroke="#f6efe4"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M14 27c0-3.3 2.7-6 6-6s6 2.7 6 6"
        fill="none"
        stroke="#d9b9d2"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="20" cy="11" r="2.5" fill="#f6efe4" />
    </svg>
  );
}
