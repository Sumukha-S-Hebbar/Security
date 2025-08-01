
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  LogOut,
  Menu
} from 'lucide-react';
import { NavLinks, menuItems } from './sidebar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ModuleSwitcher } from '@/components/module-switcher';

export default function AgencyHeader() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (event.clientY < 100) { // Increased threshold to avoid hiding with the new top bar
            setIsVisible(true);
        }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [lastScrollY]);


  return (
    <header className={cn(
        "bg-header text-header-foreground sticky top-0 z-50 transition-transform duration-300",
        !isVisible && "-translate-y-full"
    )}>
      <ModuleSwitcher portalHome="/agency/home" />
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-6 flex-1">
          <Link href="/agency/home" className="flex items-center gap-2 text-header-foreground">
            <ShieldCheck className="w-8 h-8" />
            <span className="text-xl font-bold">GuardLink</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-2 justify-center flex-1">
          <NavLinks />
        </nav>

        <div className="hidden md:flex items-center gap-2 justify-end flex-1">
           <Button asChild variant="ghost" className="text-base text-header-foreground hover:text-header-foreground hover:bg-header-background/50">
              <Link href="/">
                <LogOut className="mr-2 h-5 w-5" />
                <span>Logout</span>
              </Link>
            </Button>
        </div>
        
        <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] bg-header text-header-foreground p-0">
                     <div className="flex items-center gap-2 p-4 border-b border-white/10">
                        <ShieldCheck className="w-8 h-8" />
                        <div>
                            <h1 className="text-xl font-bold">GuardLink</h1>
                            <p className="text-xs">Agency Portal</p>
                        </div>
                    </div>
                    <nav className="flex flex-col p-4 space-y-2">
                        {menuItems.map((item) => (
                           <SheetClose key={item.href} asChild>
                             <Link href={item.href} className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-header-foreground/70 transition-all hover:text-header-foreground",
                                pathname.startsWith(item.href) && "bg-black/20 text-header-foreground"
                             )}>
                               <item.icon className="h-5 w-5" />
                               {item.label}
                             </Link>
                           </SheetClose>
                        ))}
                    </nav>
                     <div className="p-4 mt-auto border-t border-white/10">
                        <SheetClose asChild>
                            <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-header-foreground transition-all hover:text-header-foreground/80">
                                <LogOut className="h-5 w-5" />
                                Logout
                            </Link>
                        </SheetClose>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
