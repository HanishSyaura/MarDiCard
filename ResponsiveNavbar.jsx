import React, { useState, useEffect } from 'react';
import { 
  HomeIcon, 
  CalendarIcon, 
  MapPinIcon, 
  EnvelopeIcon, 
  EllipsisHorizontalIcon,
  XMarkIcon,
  MusicalNoteIcon,
  PhotoIcon,
  PhoneIcon,
  GiftIcon,
  HeartIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const ResponsiveNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Mobile navigation items (main bottom bar)
  const mobileNavItems = [
    { id: 'home', label: 'Home', icon: HomeIcon, href: '#home' },
    { id: 'event', label: 'Tarikh', icon: CalendarIcon, href: '#event' },
    { id: 'location', label: 'Lokasi', icon: MapPinIcon, href: '#location' },
    { id: 'rsvp', label: 'RSVP', icon: EnvelopeIcon, href: '#rsvp' },
  ];

  // Additional menu items (popup)
  const additionalMenuItems = [
    { id: 'music', label: 'Muzik', icon: MusicalNoteIcon, href: '#music' },
    { id: 'gallery', label: 'Galeri', icon: PhotoIcon, href: '#gallery' },
    { id: 'contact', label: 'Hubungi', icon: PhoneIcon, href: '#contact' },
    { id: 'gift', label: 'Hadiah', icon: GiftIcon, href: '#gift' },
    { id: 'wishes', label: 'Ucapan', icon: HeartIcon, href: '#wishes' },
    { id: 'admin', label: 'Admin', icon: CogIcon, href: '#admin' },
  ];

  // Desktop navigation items
  const desktopNavItems = [
    { id: 'home', label: 'Home', href: '#home' },
    { id: 'event', label: 'Acara', href: '#event' },
    { id: 'gallery', label: 'Galeri', href: '#gallery' },
    { id: 'rsvp', label: 'RSVP', href: '#rsvp' },
    { id: 'contact', label: 'Hubungi', href: '#contact' },
  ];

  // Handle smooth scrolling
  const handleNavClick = (e, href) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    // Close mobile menu if open
    setIsMobileMenuOpen(false);
  };

  // Handle active section highlighting
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      let currentSection = '';
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
          currentSection = section.getAttribute('id');
        }
      });

      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    let scrollTimeout;
    const throttledHandleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 10);
    };

    window.addEventListener('scroll', throttledHandleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('#mobileMenu') && !event.target.closest('#moreBtn')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <a href="#" className="text-2xl font-bold text-blue-600">
                <HeartIcon className="inline w-6 h-6 mr-2" />
                MarDiCard
              </a>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              {desktopNavItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`transition-colors duration-200 ${ 
                    activeSection === item.id
                      ? 'text-blue-600 font-semibold'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation (Fixed Bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 animate-slideUp">
        <div className="flex justify-around items-center py-2">
          {/* Main navigation items */}
          {mobileNavItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`flex flex-col items-center py-2 px-3 transition-colors duration-200 group ${
                  activeSection === item.id
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <IconComponent className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-xs font-medium">{item.label}</span>
              </a>
            );
          })}

          {/* More button */}
          <button
            id="moreBtn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors duration-200 group"
          >
            <EllipsisHorizontalIcon className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform duration-200" />
            <span className="text-xs font-medium">Lagi</span>
          </button>
        </div>
      </nav>

      {/* Mobile More Menu (Popup) */}
      <div
        id="mobileMenu"
        className={`md:hidden fixed bottom-20 left-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 z-40 transition-all duration-300 transform ${
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto translate-y-0'
            : 'opacity-0 pointer-events-none translate-y-4'
        }`}
      >
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4">
            {additionalMenuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="flex flex-col items-center py-3 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  <IconComponent className="w-8 h-8 mb-2" />
                  <span className="text-sm">{item.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Backdrop for mobile menu */}
      <div
        className={`fixed inset-0 bg-black z-30 transition-opacity duration-300 ${
          isMobileMenuOpen
            ? 'bg-opacity-20 pointer-events-auto'
            : 'bg-opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Custom Styles (add to your CSS or Tailwind config) */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }

        /* Prevent navbar from overlapping content */
        @media (max-width: 768px) {
          body {
            padding-bottom: 80px;
          }
        }
      `}</style>
    </>
  );
};

// Example usage in a page component
const ExamplePage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <ResponsiveNavbar />
      
      {/* Main Content */}
      <main className="pt-16 md:pt-16">
        {/* Hero Section */}
        <section id="home" className="min-h-screen bg-gradient-to-br from-pink-100 to-blue-100 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
              Wedding Invitation
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Jemputan Majlis Perkahwinan
            </p>
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Ahmad & Siti</h2>
              <p className="text-gray-600">20 Disember 2024</p>
            </div>
          </div>
        </section>

        {/* Event Section */}
        <section id="event" className="min-h-screen bg-white flex items-center justify-center py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
              Butiran Acara
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Tarikh & Masa</h3>
                <p className="text-gray-600">Sabtu, 20 Disember 2024</p>
                <p className="text-gray-600">10:00 AM - 4:00 PM</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Tempat</h3>
                <p className="text-gray-600">Dewan Serbaguna</p>
                <p className="text-gray-600">Taman Setia, Johor</p>
              </div>
            </div>
          </div>
        </section>

        {/* More sections... */}
        <section id="location" className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">Lokasi Majlis</h2>
          </div>
        </section>

        <section id="rsvp" className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">RSVP Section</h2>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ResponsiveNavbar;
export { ExamplePage };