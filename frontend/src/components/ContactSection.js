import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ContactForm } from './ui/ContactForm';
import {
  MapPin as MapPinIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  Clock as ClockIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  Linkedin as LinkedinIcon,
} from 'lucide-react';

export const ContactSection = memo(function ContactSection({
  darkMode = false,
  address = '123 Business Avenue, Tech District, CA 94107',
  phone = '+1 (555) 123-4567',
  email = 'contact@clientmanager.com',
  hours = 'Monday – Friday: 9AM – 5PM',
  showMap = false, // set true if you want the map embed
}) {
  const info = useMemo(
    () => [
      {
        Icon: MapPinIcon,
        title: 'Our Location',
        details: address,
      },
      {
        Icon: PhoneIcon,
        title: 'Phone Number',
        details: phone,
        href: `tel:${phone.replace(/[^\d+]/g, '')}`,
      },
      {
        Icon: MailIcon,
        title: 'Email Address',
        details: email,
        href: `mailto:${email}`,
      },
      {
        Icon: ClockIcon,
        title: 'Working Hours',
        details: hours,
      },
    ],
    [address, phone, email, hours]
  );

  const bg = darkMode ? 'bg-gray-800' : 'bg-gray-50';
  const panel = darkMode ? 'bg-gray-700' : 'bg-white';
  const titleClr = darkMode ? 'text-white' : 'text-gray-900';
  const textSub = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textFaint = darkMode ? 'text-gray-400' : 'text-gray-600';
  const ring = darkMode ? 'ring-white/10' : 'ring-black/5';

  return (
    <section
      id="contact"
      aria-label="Contact"
      className={`w-full py-20 px-4 sm:px-6 lg:px-8 ${bg}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${titleClr}`}>Get In Touch</h2>
          <p className={`text-lg md:text-xl ${textSub}`}>
            Have questions about our services? Reach out and we’ll get back to you as soon as possible.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Form */}
          <div className="flex-1 order-2 lg:order-1 w-full reveal-up">
            <ContactForm darkMode={darkMode} />
          </div>

          {/* Info */}
          <aside className="flex-1 order-1 lg:order-2 w-full">
            <div className={`p-8 rounded-xl ${panel} ring-1 ${ring} shadow-sm reveal-up`} style={{ animationDelay: '80ms' }}>
              <h3 className={`text-2xl font-semibold mb-6 ${titleClr}`}>Contact Information</h3>

              <ul className="space-y-6" role="list">
                {info.map(({ Icon, title, details, href }) => (
                  <li key={title} role="listitem" className="flex items-start gap-3">
                    <Icon size={22} className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} aria-hidden="true" />
                    <div>
                      <h4 className={`font-medium ${titleClr}`}>{title}</h4>
                      {href ? (
                        <a
                          href={href}
                          className={`underline-offset-2 hover:underline ${textFaint}`}
                        >
                          {details}
                        </a>
                      ) : (
                        <p className={textFaint}>{details}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Optional map embed */}
              {showMap && (
                <div className="mt-8 rounded-lg overflow-hidden ring-1 ${ring}">
                  <iframe
                    title="Office location map"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-56"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      address
                    )}&output=embed`}
                  />
                </div>
              )}

              {/* Social */}
              <div className="mt-8">
                <h4 className={`font-medium mb-3 ${titleClr}`}>Follow Us</h4>
                <div className="flex gap-3">
                  <SocialIcon
                    href="https://facebook.com"
                    label="Facebook"
                    Icon={FacebookIcon}
                    dark={darkMode}
                  />
                  <SocialIcon
                    href="https://twitter.com"
                    label="Twitter"
                    Icon={TwitterIcon}
                    dark={darkMode}
                  />
                  <SocialIcon
                    href="https://instagram.com"
                    label="Instagram"
                    Icon={InstagramIcon}
                    dark={darkMode}
                  />
                  <SocialIcon
                    href="https://linkedin.com"
                    label="LinkedIn"
                    Icon={LinkedinIcon}
                    dark={darkMode}
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* CSS-only reveal */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .reveal-up { opacity: 0; transform: translateY(10px); animation: contact-rise 460ms ease-out forwards; }
        }
        @keyframes contact-rise { to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </section>
  );
});

function SocialIcon({ href, label, Icon, dark }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ring-1 ${
        dark
          ? 'bg-gray-700 ring-white/10 text-gray-300 hover:bg-gray-600 hover:text-white'
          : 'bg-gray-100 ring-black/5 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
      }`}
    >
      <Icon size={18} aria-hidden="true" />
    </a>
  );
}

SocialIcon.propTypes = {
  href: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  Icon: PropTypes.elementType.isRequired,
  dark: PropTypes.bool,
};

ContactSection.propTypes = {
  darkMode: PropTypes.bool,
  address: PropTypes.string,
  phone: PropTypes.string,
  email: PropTypes.string,
  hours: PropTypes.string,
  showMap: PropTypes.bool,
};

export default ContactSection;
