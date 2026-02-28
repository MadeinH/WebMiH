import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

interface FooterViewProps {
  currentYear: number;
  quickLinks: { path: string; label: string }[];
  contactInfo: { icon: React.ReactNode; text: string; href: string }[];
  socialLinks: { icon: React.ReactNode; href: string; label: string }[];
}

const FooterView: React.FC<FooterViewProps> = ({
  currentYear,
  quickLinks,
  contactInfo,
  socialLinks
}) => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section footer-brand">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon">
                {/* Aquí va el ícono de la bolsa de compras */}
              </div>
              <div className="footer-logo-text">
                <span className="footer-logo-main">Made in</span>
                <span className="footer-logo-accent">Heaven</span>
              </div>
            </Link>
            <p className="footer-description">
              Prendas y accesorios personalizados de calidad premium.
              Especialistas en pedidos al por mayor y detal.
            </p>
            <div className="footer-social">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-title">Enlaces Rápidos</h3>
            <nav className="footer-nav">
              {quickLinks.map((link) => (
                <Link key={link.path} to={link.path} className="footer-link">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h3 className="footer-title">Contacto</h3>
            <div className="footer-contact">
              {contactInfo.map((contact, index) => (
                <a
                  key={index}
                  href={contact.href}
                  className="contact-item"
                  target={contact.href.startsWith('http') ? '_blank' : undefined}
                  rel={
                    contact.href.startsWith('http') ? 'noopener noreferrer' : undefined
                  }
                >
                  <span className="contact-icon">{contact.icon}</span>
                  <span className="contact-text">{contact.text}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              &copy; {currentYear} Made in Heaven. Un Producto de ElevaForge.
            </p>
            <div className="footer-bottom-links">
              <a href="#" className="footer-bottom-link">
                Política de Privacidad
              </a>
              <a href="#" className="footer-bottom-link">
                Términos de Servicio
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterView;
