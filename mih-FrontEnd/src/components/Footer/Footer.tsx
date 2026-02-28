import React from 'react';
import { MapPin, Phone, Instagram, Facebook, MessageCircle, ShoppingBag } from 'lucide-react';
import FooterView from './FooterView';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { path: '/', label: 'Inicio' },
    { path: '/servicios', label: 'Servicios' },
    { path: '/productos', label: 'Productos' },
    { path: '/nosotros', label: 'Nosotros' },
    { path: '/contacto', label: 'Contacto' }
  ];

  const contactInfo = [
    {
      icon: <Phone size={18} />,
      text: '+57 324 9207921',
      href: 'tel:+573249207921'
    },
    {
      icon: <MapPin size={18} />,
      text: 'Pasto, Nariño, Colombia',
      href: 'https://maps.google.com/?q=Pasto,Narino,Colombia'
    }
  ];

  const socialLinks = [
    {
      icon: <Facebook size={20} />,
      href: 'https://www.facebook.com/profile.php?id=61565536753854&mibextid=ZbWKwL',
      label: 'Facebook'
    },
    {
      icon: <Instagram size={20} />,
      href: 'https://www.instagram.com/madeinheaven.shop_/',
      label: 'Instagram'
    },
    {
      icon: <MessageCircle size={20} />,
      href: 'https://wa.me/573249207921',
      label: 'WhatsApp'
    }
  ];

  return (
    <FooterView
      currentYear={currentYear}
      quickLinks={quickLinks}
      contactInfo={contactInfo}
      socialLinks={socialLinks}
    />
  );
};

export default Footer;
