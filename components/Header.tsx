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
        className={`fixed top-0 left-0 w-full h-24 z-30 transition-all duration-300 pointer-events-none ${
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
        menuButtonColor="#2563eb"
        openMenuButtonColor="#fff"
        logoContent={
          <Link href="/" className="flex items-center gap-2 group">
            
              <Image  className='rounded-full bg-black mt-1 pt-1 mb-1 pb-1' src="/brand-logo.png" alt="Logo" width={40} height={40} />
            <span className="font-boldonse font-bold ">
              The Boring News
            </span>
          </Link>
        }
      />
      {/* Spacer for content below since StaggeredMenu is fixed/absolute header */}
      <div className="h-24 pointer-events-none" aria-hidden="true" />
    </header>
  );
}
