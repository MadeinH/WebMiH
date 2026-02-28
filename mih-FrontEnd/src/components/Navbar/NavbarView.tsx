import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Phone, User } from 'lucide-react';
import './Navbar.css';

interface NavItem {
  path: string;
  label: string;
}

interface NavbarViewProps {
  navItems: NavItem[];
  isMenuOpen: boolean;
  isScrolled: boolean;
  isVisible: boolean;
  isActivePath: (path: string) => boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

const NavbarView: React.FC<NavbarViewProps> = ({
  navItems,
  isMenuOpen,
  isScrolled,
  isVisible,
  isActivePath,
  toggleMobileMenu,
  closeMobileMenu
}) => {
  return (
    <>
      <nav
        className={`navbar ${isScrolled ? 'navbar-scrolled' : ''} ${
          isVisible ? 'navbar-visible' : 'navbar-hidden'
        }`}
      >
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="logo-container">
              <div className="logo-icon">
                <ShoppingBag className="logo-svg" />
              </div>
              <div className="logo-text">
                <span className="logo-main">Made in</span>
                <span className="logo-accent">Heaven</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-nav desktop-nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActivePath(item.path) ? 'nav-link-active' : ''}`}
              >
                <span className="nav-link-text">{item.label}</span>
                <div className="nav-link-indicator"></div>
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="navbar-cta desktop-only">
            <Link to="/contacto" className="cta-button">
              <Phone size={18} />
              <span>Cotizar</span>
            </Link>
          </div>

          {/* Admin Login Icon */}
          <div className="navbar-admin-login" style={{ marginLeft: '1rem' }}>
            <Link to="/admin/login" aria-label="Admin Login">
              <User size={28} style={{ color: '#08415C' }} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`mobile-menu-btn ${isMenuOpen ? 'menu-btn-open' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            <div className="menu-btn-line menu-btn-line-1"></div>
            <div className="menu-btn-line menu-btn-line-2"></div>
            <div className="menu-btn-line menu-btn-line-3"></div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMenuOpen ? 'overlay-active' : ''}`}>
        <div className="mobile-menu">
          <div className="mobile-menu-header">
            <Link to="/" className="mobile-logo">
              <ShoppingBag size={24} />
              <span>Made in Heaven</span>
            </Link>
          </div>

          <nav className="mobile-nav">
            {navItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className={`mobile-nav-link ${isActivePath(item.path) ? 'mobile-nav-active' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={closeMobileMenu}
              >
                <span className="mobile-nav-text">{item.label}</span>
                <div className="mobile-nav-arrow">→</div>
              </Link>
            ))}
          </nav>

          <div className="mobile-menu-footer">
            <Link to="/contacto" className="mobile-cta-button" onClick={closeMobileMenu}>
              <Phone size={20} />
              <span>Solicitar Cotización</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {isMenuOpen && <div className="mobile-menu-backdrop" onClick={closeMobileMenu} />}
    </>
  );
};

export default NavbarView;
