/*
 * Copyright (c) 2026 Eshan Vijay Shettennavar.
 * Licensed under the MIT License. See LICENSE-MIT for details.
 */

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import StaggeredMenu from './StaggeredMenu';
import Image from 'next/image';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'Latest News', ariaLabel: 'Latest News', link: '/' },
    { label: 'About', ariaLabel: 'About Us', link: '/about' },
    { label: 'Contact', ariaLabel: 'Contact Us', link: 'https://portfolio-eshan-2z6t.vercel.app/' },
    { label: 'The Boring Project  ', ariaLabel: 'The Boring Project', link: 'https://the-boring-project.vercel.app/' },
  ];

  return (
    <header>
      {/* Scroll-aware background layer */}
       <div 
        className={`fixed top-0 left-0 w-full h-16 sm:h-20 md:h-24 z-30 transition-all duration-300 pointer-events-none ${
          isScrolled ? 'backdrop-blur-lg bg-white/50 dark:bg-zinc-900/50 shadow-sm' : 'bg-transparent'
        }`}
        aria-hidden="true"
      />

       {/* Placeholder to prevent layout shift if necessary, but StaggeredMenu with isFixed overlays. 
           If we want the logo to be always visible in a 'bar', we might need to adjust.
           For now, let's let StaggeredMenu handle the top bar presentation. */}
      <StaggeredMenu
        position="right"
        isFixed={true}
        items={menuItems}
        colors={["#2563eb", "#06b6d4"]} // Blue-600 to Cyan-500
        accentColor="#2563eb"
        menuButtonColor="#ffffffff"
        openMenuButtonColor="#fff"
        logoContent={
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group min-w-0">
            <Image className="rounded-full bg-black mt-0.5 sm:mt-1 shrink-0 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" src="/brand-logo.png" alt="Logo" width={40} height={40} />
            <span className="font-boldonse text-pink-500 font-bold text-sm sm:text-base truncate">
              The Boring News
            </span>
          </Link>
        }
      />
      {/* Spacer for content below since StaggeredMenu is fixed/absolute header */}
      <div className="h-16 sm:h-20 md:h-24 pointer-events-none" aria-hidden="true" />
    </header>
  );
}
