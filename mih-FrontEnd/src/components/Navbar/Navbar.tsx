import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NavbarView from './NavbarView';

interface NavItem {
  path: string;
  label: string;
}

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const location = useLocation();

  const navItems: NavItem[] = [
    { path: '/', label: 'Inicio' },
    { path: '/productos', label: 'Productos' },
    { path: '/servicios', label: 'Servicios' },
    { path: '/contacto', label: 'Contacto' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setIsScrolled(currentScrollY > 20);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const toggleMobileMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMenuOpen(false);

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <NavbarView
      navItems={navItems}
      isMenuOpen={isMenuOpen}
      isScrolled={isScrolled}
      isVisible={isVisible}
      isActivePath={isActivePath}
      toggleMobileMenu={toggleMobileMenu}
      closeMobileMenu={closeMobileMenu}
    />
  );
};

export default Navbar;
