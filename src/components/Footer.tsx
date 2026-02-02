"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 mb-8 text-center text-sm text-slate-500">
      <div className="flex justify-center gap-6 mb-4">
        <Link
          href="/terms"
          className="hover:text-amber-600 transition-colors underline underline-offset-4 decoration-slate-300"
        >
          Terms of Service
        </Link>
        <Link
          href="/privacy"
          className="hover:text-amber-600 transition-colors underline underline-offset-4 decoration-slate-300"
        >
          Privacy Policy
        </Link>
      </div>
      <p>© 2024 Bronco. Digital Nomad Agent Team.</p>
    </footer>
  );
}
