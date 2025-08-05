import React, { useState } from 'react';
import { Button } from './Button';
import { UserIcon, MailIcon, PhoneIcon, MessageSquareIcon } from 'lucide-react';

export const ContactForm = ({ darkMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      }, 1500);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={`p-8 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-md`}>
      {submitSuccess && (
        <div className={`mb-6 p-4 rounded-md ${darkMode ? 'bg-green-800/30 text-green-400' : 'bg-green-100 text-green-700'}`}>
          Thank you for your message! We'll get back to you soon.
        </div>
      )}
      
      <div className="space-y-6">
        <div>
          <label htmlFor="name" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Your Name
          </label>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <UserIcon size={18} />
            </div>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2 border rounded-md ${errors.name ? 'form-input-error' : darkMode ? 'bg-gray-600 border-gray-500 text-white focus:ring-indigo-500 focus:border-indigo-500' : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'}`}
              placeholder="John Doe"
            />
          </div>
          {errors.name && <p className="error-message">{errors.name}</p>}
        </div>
        
        <div>
          <label htmlFor="email" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Email Address
          </label>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <MailIcon size={18} />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2 border rounded-md ${errors.email ? 'form-input-error' : darkMode ? 'bg-gray-600 border-gray-500 text-white focus:ring-indigo-500 focus:border-indigo-500' : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'}`}
              placeholder="john@example.com"
            />
          </div>
          {errors.email && <p className="error-message">{errors.email}</p>}
        </div>
        
        <div>
          <label htmlFor="phone" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Phone Number (Optional)
          </label>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <PhoneIcon size={18} />
            </div>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2 border rounded-md ${darkMode ? 'bg-gray-600 border-gray-500 text-white focus:ring-indigo-500 focus:border-indigo-500' : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'}`}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="message" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Your Message
          </label>
          <div className="relative">
            <div className={`absolute top-3 left-3 flex items-start pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <MessageSquareIcon size={18} />
            </div>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              className={`block w-full pl-10 pr-3 py-2 border rounded-md ${errors.message ? 'form-input-error' : darkMode ? 'bg-gray-600 border-gray-500 text-white focus:ring-indigo-500 focus:border-indigo-500' : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'}`}
              placeholder="How can we help you?"
            ></textarea>
          </div>
          {errors.message && <p className="error-message">{errors.message}</p>}
        </div>
        
        <div className="pt-2">
          <Button 
            variant={darkMode ? 'primary-dark' : 'primary'} 
            size="lg" 
            className="w-full" 
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </div>
    </form>
  );
};