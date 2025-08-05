import { useState, useEffect } from 'react';

export const useScrollSpy = (sectionIds, offset = 100) => {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      // Get all sections
      const sections = sectionIds.map(id => document.getElementById(id));
      
      // Find the section that is currently in view
      let currentSection = '';
      sections.forEach(section => {
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          
          if (
            window.scrollY >= sectionTop - offset &&
            window.scrollY < sectionTop + sectionHeight - offset
          ) {
            currentSection = section.id;
          }
        }
      });
      
      // Special case for home section when at the top of the page
      if (window.scrollY < 100 && sectionIds.includes('home')) {
        currentSection = 'home';
      }
      
      // Update state if the active section has changed
      if (currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Call handleScroll right away to set the initial active section
    handleScroll();
    
    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sectionIds, activeSection, offset]);

  return activeSection;
};