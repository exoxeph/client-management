import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Tabs } from '../components/ui/Tabs'
// Removing unused import
import { isValidPhoneNumber } from 'libphonenumber-js'
import authService from '../services/authService'
import { useToast } from '../components/ui/Toast'
import {
  UserIcon,
  MailIcon,
  LockIcon,
  Building,
  PhoneIcon,
  CreditCardIcon, // Using this instead of IdentificationIcon
  GlobeIcon,
  MapPinIcon,
  FileTextIcon,
} from 'lucide-react'
export const RegisterPage = ({ darkMode }) => {
  // State for account type selection
  const [accountType, setAccountType] = useState('Individual')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const { addToast } = useToast()
  // State for file uploads
  const [businessLicenseFile, setBusinessLicenseFile] = useState(null)
  const [taxDocumentFile, setTaxDocumentFile] = useState(null)
  // Individual form state
  const [individualForm, setIndividualForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    nid: '',
    password: '',
    confirmPassword: '',
  })
  // Corporate form state
  const [corporateForm, setCorporateForm] = useState({
    // Company Info
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    registrationNumber: '',
    taxId: '',
    website: '',
    // Address
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    // Primary Contact
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    // Authentication
    password: '',
    confirmPassword: '',
  })
  // Validation for individual form
  const validateIndividualForm = () => {
    const newErrors = {}
    
    // Full Name validation (2-60 chars; letters, spaces, .'- allowed)
    if (!individualForm.fullName) {
      newErrors.fullName = 'Enter your full name.'
    } else if (individualForm.fullName.length < 2 || individualForm.fullName.length > 60 || !/^[a-zA-Z\s.']+$/.test(individualForm.fullName)) {
      newErrors.fullName = 'Enter your full name.'
    }
    
    // Email validation (RFC email format)
    if (!individualForm.email) {
      newErrors.email = 'Enter a valid email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(individualForm.email)) {
      newErrors.email = 'Enter a valid email address.'
    }
    
    // Phone validation (international format using libphonenumber-js)
    if (!individualForm.phone) {
      newErrors.phone = 'Enter a valid phone number (e.g., +1 555 123 4567).'
    } else {
      try {
        if (!isValidPhoneNumber(individualForm.phone)) {
          newErrors.phone = 'Enter a valid phone number (e.g., +1 555 123 4567).'
        }
      } catch (error) {
        newErrors.phone = 'Enter a valid phone number (e.g., +1 555 123 4567).'
      }
    }
    
    // National ID validation (10-13 digits only)
    if (!individualForm.nid) {
      newErrors.nid = 'National ID must be 10–13 characters (numbers).'
    } else if (!/^\d{10,13}$/.test(individualForm.nid)) {
      newErrors.nid = 'National ID must be 10–13 characters (numbers).'
    }
    
    // Password validation (min 8 chars, must contain uppercase, lowercase, number, special !@#$%^&*)
    if (!individualForm.password) {
      newErrors.password = 'Password must be 8+ characters with upper, lower, number, and special character.'
    } else if (
      individualForm.password.length < 8 ||
      !/[A-Z]/.test(individualForm.password) ||
      !/[a-z]/.test(individualForm.password) ||
      !/[0-9]/.test(individualForm.password) ||
      !/[!@#$%^&*]/.test(individualForm.password)
    ) {
      newErrors.password = 'Password must be 8+ characters with upper, lower, number, and special character.'
    }
    
    // Confirm Password validation (must match Password)
    if (individualForm.password !== individualForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  // Validation for corporate form
  const validateCorporateForm = () => {
    const newErrors = {}
    
    // Company Information
    // Company Name (required): 2–80 chars; letters, numbers, spaces, & . -
    if (!corporateForm.companyName) {
      newErrors.companyName = 'Enter a company name (2–80 characters).'
    } else if (corporateForm.companyName.length < 2 || corporateForm.companyName.length > 80 || !/^[a-zA-Z0-9\s.&-]+$/.test(corporateForm.companyName)) {
      newErrors.companyName = 'Enter a company name (2–80 characters).'
    }
    
    // Company Email (required, RFC email)
    if (!corporateForm.companyEmail) {
      newErrors.companyEmail = 'Enter a valid company email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(corporateForm.companyEmail)) {
      newErrors.companyEmail = 'Enter a valid company email address.'
    }
    
    // Company Phone (required, international): E.164 or valid national
    if (!corporateForm.companyPhone) {
      newErrors.companyPhone = 'Enter a valid phone number (e.g., +1 555 123 4567).'
    } else {
      try {
        if (!isValidPhoneNumber(corporateForm.companyPhone)) {
          newErrors.companyPhone = 'Enter a valid phone number (e.g., +1 555 123 4567).'
        }
      } catch (error) {
        newErrors.companyPhone = 'Enter a valid phone number (e.g., +1 555 123 4567).'
      }
    }
    
    // Registration Number (required): 3–32, A–Z 0–9 - /
    if (!corporateForm.registrationNumber) {
      newErrors.registrationNumber = 'Registration number must be 3–32 characters (letters, numbers, \'-\', \'/\').'
    } else if (corporateForm.registrationNumber.length < 3 || corporateForm.registrationNumber.length > 32 || !/^[A-Z0-9-/]+$/.test(corporateForm.registrationNumber)) {
      newErrors.registrationNumber = 'Registration number must be 3–32 characters (letters, numbers, \'-\', \'/\').'
    }
    
    // Tax ID / VAT Number (required): 8–20, A–Z 0–9
    if (!corporateForm.taxId) {
      newErrors.taxId = 'Tax/VAT ID must be 8–20 alphanumeric characters.'
    } else if (corporateForm.taxId.length < 8 || corporateForm.taxId.length > 20 || !/^[A-Z0-9]+$/.test(corporateForm.taxId)) {
      newErrors.taxId = 'Tax/VAT ID must be 8–20 alphanumeric characters.'
    }
    
    // Website (Optional): valid http(s):// URL
    if (corporateForm.website && !/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/.test(corporateForm.website)) {
      newErrors.website = 'Enter a valid website URL (starts with http:// or https://).'
    }
    
    // Headquarters Address
    // Street Address (required): 5–120 chars
    if (!corporateForm.street) {
      newErrors.street = 'Enter the street address (5–120 characters).'
    } else if (corporateForm.street.length < 5 || corporateForm.street.length > 120) {
      newErrors.street = 'Enter the street address (5–120 characters).'
    }
    
    // City (required): letters, spaces, - (2–60)
    if (!corporateForm.city) {
      newErrors.city = 'Enter a valid city name.'
    } else if (corporateForm.city.length < 2 || corporateForm.city.length > 60 || !/^[a-zA-Z\s-]+$/.test(corporateForm.city)) {
      newErrors.city = 'Enter a valid city name.'
    }
    
    // State / Province (required): 2–40 chars (US format like 'NY' should pass)
    if (!corporateForm.state) {
      newErrors.state = 'Enter a valid state/province.'
    } else if (corporateForm.state.length < 2 || corporateForm.state.length > 40) {
      newErrors.state = 'Enter a valid state/province.'
    }
    
    // ZIP / Postal Code (required): 3–12; allow letters, numbers, - (US/EU compatible)
    if (!corporateForm.zipCode) {
      newErrors.zipCode = 'Enter a valid ZIP/Postal code.'
    } else if (corporateForm.zipCode.length < 3 || corporateForm.zipCode.length > 12 || !/^[a-zA-Z0-9-]+$/.test(corporateForm.zipCode)) {
      newErrors.zipCode = 'Enter a valid ZIP/Postal code.'
    }
    
    // Country (required): must be one of supported countries list
    if (!corporateForm.country) {
      newErrors.country = 'Select a country.'
    }
    
    // Primary Contact
    // Contact Name (required): 2–60; letters, spaces, .'-
    if (!corporateForm.contactName) {
      newErrors.contactName = 'Enter the contact\'s full name.'
    } else if (corporateForm.contactName.length < 2 || corporateForm.contactName.length > 60 || !/^[a-zA-Z\s.'-]+$/.test(corporateForm.contactName)) {
      newErrors.contactName = 'Enter the contact\'s full name.'
    }
    
    // Contact Email (required, RFC email)
    if (!corporateForm.contactEmail) {
      newErrors.contactEmail = 'Enter a valid contact email.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(corporateForm.contactEmail)) {
      newErrors.contactEmail = 'Enter a valid contact email.'
    }
    
    // Contact Phone (required, phone validation as above)
    if (!corporateForm.contactPhone) {
      newErrors.contactPhone = 'Enter a valid contact phone number.'
    } else {
      try {
        if (!isValidPhoneNumber(corporateForm.contactPhone)) {
          newErrors.contactPhone = 'Enter a valid contact phone number.'
        }
      } catch (error) {
        newErrors.contactPhone = 'Enter a valid contact phone number.'
      }
    }
    
    // Documents (Optional uploads) - These would be handled in the file input change handlers
    
    // Password (required): min 8, must contain uppercase, lowercase, number, special !@#$%^&*
    if (!corporateForm.password) {
      newErrors.password = 'Password must be 8+ characters with upper, lower, number, and special character.'
    } else if (
      corporateForm.password.length < 8 ||
      !/[A-Z]/.test(corporateForm.password) ||
      !/[a-z]/.test(corporateForm.password) ||
      !/[0-9]/.test(corporateForm.password) ||
      !/[!@#$%^&*]/.test(corporateForm.password)
    ) {
      newErrors.password = 'Password must be 8+ characters with upper, lower, number, and special character.'
    }
    
    // Confirm Password (required): must match Password
    if (corporateForm.password !== corporateForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  // Handle individual form input changes
  const handleIndividualChange = (e) => {
    const { name, value } = e.target
    setIndividualForm((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    
    // Validate field in real-time
    validateField(name, value, 'individual')
  }
  
  // Validate individual fields in real-time
  const validateField = (name, value, formType) => {
    let error = null
    
    if (formType === 'individual') {
      // Individual form field validation
      switch (name) {
        case 'fullName':
          if (!value || value.length < 2 || value.length > 60 || !/^[a-zA-Z\s.'-]+$/.test(value)) {
            error = 'Enter your full name.'
          }
          break
          
        case 'email':
          if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            error = 'Enter a valid email address.'
          }
          break
          
        case 'phone':
          if (!value) {
            error = 'Enter a valid phone number (e.g., +1 555 123 4567).'
          } else {
            try {
              if (!isValidPhoneNumber(value)) {
                error = 'Enter a valid phone number (e.g., +1 555 123 4567).'
              }
            } catch (e) {
              error = 'Enter a valid phone number (e.g., +1 555 123 4567).'
            }
          }
          break
          
        case 'nid':
          if (!value || !/^\d{10,13}$/.test(value)) {
            error = 'National ID must be 10–13 characters (numbers).'
          }
          break
          
        case 'password':
          if (!value || 
              value.length < 8 ||
              !/[A-Z]/.test(value) ||
              !/[a-z]/.test(value) ||
              !/[0-9]/.test(value) ||
              !/[!@#$%^&*]/.test(value)) {
            error = 'Password must be 8+ characters with upper, lower, number, and special character.'
          }
          break
          
        case 'confirmPassword':
          if (value !== individualForm.password) {
            error = 'Passwords do not match.'
          }
          break
          
        default:
          break
      }
    } else if (formType === 'corporate') {
      // Corporate form field validation
      switch (name) {
        case 'companyName':
          if (!value || value.length < 2 || value.length > 80 || !/^[a-zA-Z0-9\s.&-]+$/.test(value)) {
            error = 'Enter a company name (2–80 characters).'
          }
          break
          
        case 'companyEmail':
          if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            error = 'Enter a valid company email address.'
          }
          break
          
        case 'companyPhone':
          if (!value) {
            error = 'Enter a valid phone number (e.g., +1 555 123 4567).'
          } else {
            try {
              if (!isValidPhoneNumber(value)) {
                error = 'Enter a valid phone number (e.g., +1 555 123 4567).'
              }
            } catch (e) {
              error = 'Enter a valid phone number (e.g., +1 555 123 4567).'
            }
          }
          break
          
        case 'registrationNumber':
          if (!value || value.length < 3 || value.length > 32 || !/^[A-Z0-9-/]+$/.test(value)) {
            error = 'Registration number must be 3–32 characters (letters, numbers, \'-\', \'/\').'
          }
          break
          
        case 'taxId':
          if (!value || value.length < 8 || value.length > 20 || !/^[A-Z0-9]+$/.test(value)) {
            error = 'Tax/VAT ID must be 8–20 alphanumeric characters.'
          }
          break
          
        case 'website':
          if (value && !/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/.test(value)) {
            error = 'Enter a valid website URL (starts with http:// or https://).'
          }
          break
          
        case 'street':
          if (!value || value.length < 5 || value.length > 120) {
            error = 'Enter the street address (5–120 characters).'
          }
          break
          
        case 'city':
          if (!value || value.length < 2 || value.length > 60 || !/^[a-zA-Z\s-]+$/.test(value)) {
            error = 'Enter a valid city name.'
          }
          break
          
        case 'state':
          if (!value || value.length < 2 || value.length > 40) {
            error = 'Enter a valid state/province.'
          }
          break
          
        case 'zipCode':
          if (!value || value.length < 3 || value.length > 12 || !/^[a-zA-Z0-9-]+$/.test(value)) {
            error = 'Enter a valid ZIP/Postal code.'
          }
          break
          
        case 'country':
          if (!value) {
            error = 'Select a country.'
          }
          break
          
        case 'contactName':
          if (!value || value.length < 2 || value.length > 60 || !/^[a-zA-Z\s.'-]+$/.test(value)) {
            error = 'Enter the contact\'s full name.'
          }
          break
          
        case 'contactEmail':
          if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            error = 'Enter a valid contact email.'
          }
          break
          
        case 'contactPhone':
          if (!value) {
            error = 'Enter a valid contact phone number.'
          } else {
            try {
              if (!isValidPhoneNumber(value)) {
                error = 'Enter a valid contact phone number.'
              }
            } catch (e) {
              error = 'Enter a valid contact phone number.'
            }
          }
          break
          
        case 'password':
          if (!value || 
              value.length < 8 ||
              !/[A-Z]/.test(value) ||
              !/[a-z]/.test(value) ||
              !/[0-9]/.test(value) ||
              !/[!@#$%^&*]/.test(value)) {
            error = 'Password must be 8+ characters with upper, lower, number, and special character.'
          }
          break
          
        case 'confirmPassword':
          if (value !== corporateForm.password) {
            error = 'Passwords do not match.'
          }
          break
          
        default:
          break
      }
    }
    
    // Update errors state if there's an error
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }))
    }
  }
  // Handle corporate form input changes
  const handleCorporateChange = (e) => {
    const { name, value } = e.target
    setCorporateForm((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    
    // Validate field in real-time
    validateField(name, value, 'corporate')
  }
  
  // Handle file uploads
  const handleFileChange = (e) => {
    const { name, files } = e.target
    const file = files[0] // Get the first file
    
    // Clear error when user selects a new file or clears the input
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    
    // If user cleared the file input
    if (!file) {
      if (name === 'businessLicense') {
        setBusinessLicenseFile(null)
      } else if (name === 'taxDocument') {
        setTaxDocumentFile(null)
      }
      return
    }
    
    // Validate file type
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [name]: 'Upload a PDF/PNG/JPG file up to 5 MB.'
      }))
      return
    }
    
    // Validate file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        [name]: 'Upload a PDF/PNG/JPG file up to 5 MB.'
      }))
      return
    }
    
    // Store the file in state
    if (name === 'businessLicense') {
      setBusinessLicenseFile(file)
    } else if (name === 'taxDocument') {
      setTaxDocumentFile(file)
    }
  }
  // Navigation hook for redirecting after successful registration
  const navigate = useNavigate()

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    let isValid = false
    if (accountType === 'Individual') {
      isValid = validateIndividualForm()
    } else {
      isValid = validateCorporateForm()
    }
    
    if (isValid) {
      setIsSubmitting(true)
      try {
        if (accountType === 'Individual') {
          // Map form data to API expected format
          const userData = {
            fullName: individualForm.fullName,
            email: individualForm.email,
            phoneNumber: individualForm.phone,
            nationalId: individualForm.nid,
            password: individualForm.password
          }
          
          // Call the API to register individual user
          const response = await authService.registerIndividual(userData)
          console.log('Registration successful:', response)
          
          // Show success notification and redirect to login page
          addToast({
            title: 'Registration Successful',
            description: 'Account created successfully! Please log in.',
            type: 'success',
            duration: 5000
          })
          navigate('/login')
        } else {
          // Map form data to API expected format for corporate
          const userData = {
            companyName: corporateForm.companyName,
            companyEmail: corporateForm.companyEmail,
            companyPhone: corporateForm.companyPhone,
            registrationNumber: corporateForm.registrationNumber,
            taxId: corporateForm.taxId,
            website: corporateForm.website,
            headquartersAddress: {
              street: corporateForm.street,
              city: corporateForm.city,
              state: corporateForm.state,
              zipCode: corporateForm.zipCode,
              country: corporateForm.country
            },
            primaryContact: {
              name: corporateForm.contactName,
              email: corporateForm.contactEmail,
              phone: corporateForm.contactPhone
            },
            password: corporateForm.password,
            businessLicense: businessLicenseFile,
            taxDocument: taxDocumentFile
          }
          
          // Call the API to register corporate user
          const response = await authService.registerCorporate(userData)
          console.log('Registration successful:', response)
          
          // Show success notification and redirect to login page
          addToast({
            title: 'Registration Successful',
            description: 'Corporate account created successfully! Please log in.',
            type: 'success',
            duration: 5000
          })
          navigate('/login')
        }
      } catch (error) {
        console.error('Registration error:', error)
        // Handle specific error messages from the API
        if (error.response && error.response.data) {
          addToast({
            title: 'Registration Failed',
            description: `${error.response.data.message || 'Please try again later.'}`,
            type: 'error',
            duration: 5000
          })
        } else {
          addToast({
            title: 'Registration Failed',
            description: 'Please try again later.',
            type: 'error',
            duration: 5000
          })
        }
      } finally {
        setIsSubmitting(false)
      }
    }
  }
  // CSS class for form input error
  const formInputErrorClass = 'border-red-500 focus:border-red-500 focus:ring-red-500'
  // CSS class for normal form input based on dark mode
  const formInputClass = (fieldName) => {
    const baseClass = 'block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2'
    const darkModeClass = darkMode 
      ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' 
      : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
    return `${baseClass} ${errors[fieldName] ? formInputErrorClass : darkModeClass}`
  }
  // CSS class for form input with icon
  const formInputWithIconClass = (fieldName) => {
    const baseClass = 'block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2'
    const darkModeClass = darkMode 
      ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' 
      : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
    return `${baseClass} ${errors[fieldName] ? formInputErrorClass : darkModeClass}`
  }
  return (
    <div
      className={`w-full min-h-screen pt-24 pb-16 px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
    >
      <div className="max-w-3xl mx-auto">
        <div
          className={`rounded-lg shadow-md overflow-hidden ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}
        >
          <div className="px-6 py-8">
            <div className="text-center mb-6">
              <h1
                className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}
              >
                Create Account
              </h1>
              <p
                className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
              >
                Register to get started with our client management platform
              </p>
            </div>
            {/* Account Type Tabs */}
            <Tabs 
              tabs={['Individual', 'Corporate']} 
              activeTab={accountType} 
              onTabChange={(tab) => {
                setAccountType(tab)
                setErrors({})
              }}
              darkMode={darkMode}
            />
            {/* Registration Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {accountType === 'Individual' ? (
                <>
                  {/* Individual Registration Form */}
                  <div>
                    <label
                      htmlFor="fullName"
                      className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <div
                        className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                      >
                        <UserIcon size={18} />
                      </div>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={individualForm.fullName}
                        onChange={handleIndividualChange}
                        className={formInputWithIconClass('fullName')}
                        placeholder="John Doe"
                      />
                    </div>
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="email"
                        className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <div
                          className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                        >
                          <MailIcon size={18} />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={individualForm.email}
                          onChange={handleIndividualChange}
                          className={formInputWithIconClass('email')}
                          placeholder="your@email.com"
                        />
                      </div>
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Phone Number
                      </label>
                      <div className="relative">
                        <div
                          className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                        >
                          <PhoneIcon size={18} />
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={individualForm.phone}
                          onChange={handleIndividualChange}
                          className={formInputWithIconClass('phone')}
                          placeholder="(123) 456-7890"
                        />
                      </div>
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="nid"
                      className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      National ID
                    </label>
                    <div className="relative">
                      <div
                        className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                      >
                        <CreditCardIcon size={18} />
                      </div>
                      <input
                        type="text"
                        id="nid"
                        name="nid"
                        value={individualForm.nid}
                        onChange={handleIndividualChange}
                        className={formInputWithIconClass('nid')}
                        placeholder="National ID Number"
                      />
                    </div>
                    {errors.nid && <p className="text-red-500 text-sm mt-1">{errors.nid}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="password"
                        className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Password
                      </label>
                      <div className="relative">
                        <div
                          className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                        >
                          <LockIcon size={18} />
                        </div>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={individualForm.password}
                          onChange={handleIndividualChange}
                          className={formInputWithIconClass('password')}
                          placeholder="••••••••"
                        />
                      </div>
                      {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div
                          className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                        >
                          <LockIcon size={18} />
                        </div>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={individualForm.confirmPassword}
                          onChange={handleIndividualChange}
                          className={formInputWithIconClass('confirmPassword')}
                          placeholder="••••••••"
                        />
                      </div>
                      {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Corporate Registration Form */}
                  {/* Company Information */}
                  <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Company Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="companyName"
                          className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          Company Name
                        </label>
                        <div className="relative">
                          <div
                            className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                          >
                            <Building size={18} />
                          </div>
                          <input
                            type="text"
                            id="companyName"
                            name="companyName"
                            value={corporateForm.companyName}
                            onChange={handleCorporateChange}
                            className={formInputWithIconClass('companyName')}
                            placeholder="Acme Corporation"
                          />
                        </div>
                        {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="companyEmail"
                            className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            Company Email
                          </label>
                          <div className="relative">
                            <div
                              className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                            >
                              <MailIcon size={18} />
                            </div>
                            <input
                              type="email"
                              id="companyEmail"
                              name="companyEmail"
                              value={corporateForm.companyEmail}
                              onChange={handleCorporateChange}
                              className={formInputWithIconClass('companyEmail')}
                              placeholder="info@company.com"
                            />
                          </div>
                          {errors.companyEmail && <p className="text-red-500 text-sm mt-1">{errors.companyEmail}</p>}
                        </div>
                        <div>
                          <label
                            htmlFor="companyPhone"
                            className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            Company Phone
                          </label>
                          <div className="relative">
                            <div
                              className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                            >
                              <PhoneIcon size={18} />
                            </div>
                            <input
                              type="tel"
                              id="companyPhone"
                              name="companyPhone"
                              value={corporateForm.companyPhone}
                              onChange={handleCorporateChange}
                              className={formInputWithIconClass('companyPhone')}
                              placeholder="(123) 456-7890"
                            />
                          </div>
                          {errors.companyPhone && <p className="text-red-500 text-sm mt-1">{errors.companyPhone}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label
                            htmlFor="registrationNumber"
                            className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            Registration Number
                          </label>
                          <input
                            type="text"
                            id="registrationNumber"
                            name="registrationNumber"
                            value={corporateForm.registrationNumber}
                            onChange={handleCorporateChange}
                            className={formInputClass('registrationNumber')}
                            placeholder="REG123456789"
                          />
                          {errors.registrationNumber && <p className="text-red-500 text-sm mt-1">{errors.registrationNumber}</p>}
                        </div>
                        <div>
                          <label
                            htmlFor="taxId"
                            className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            Tax ID / VAT Number
                          </label>
                          <input
                            type="text"
                            id="taxId"
                            name="taxId"
                            value={corporateForm.taxId}
                            onChange={handleCorporateChange}
                            className={formInputClass('taxId')}
                            placeholder="TAX123456789"
                          />
                          {errors.taxId && <p className="text-red-500 text-sm mt-1">{errors.taxId}</p>}
                        </div>
                        <div>
                          <label
                            htmlFor="website"
                            className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            Website (Optional)
                          </label>
                          <div className="relative">
                            <div
                              className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                            >
                              <GlobeIcon size={18} />
                            </div>
                            <input
                              type="url"
                              id="website"
                              name="website"
                              value={corporateForm.website}
                              onChange={handleCorporateChange}
                              className={formInputWithIconClass('website')}
                              placeholder="https://www.example.com"
                            />
                          </div>
                          {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Headquarters Address */}
                  <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Headquarters Address
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="street"
                          className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          Street Address
                        </label>
                        <div className="relative">
                          <div
                            className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                          >
                            <MapPinIcon size={18} />
                          </div>
                          <input
                            type="text"
                            id="street"
                            name="street"
                            value={corporateForm.street}
                            onChange={handleCorporateChange}
                            className={formInputWithIconClass('street')}
                            placeholder="123 Business Ave"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="city"
                            className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            City
                          </label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={corporateForm.city}
                            onChange={handleCorporateChange}
                            className={formInputClass('city')}
                            placeholder="New York"
                          />
                          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                        </div>
                        <div>
                          <label
                            htmlFor="state"
                            className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            State / Province
                          </label>
                          <input
                            type="text"
                            id="state"
                            name="state"
                            value={corporateForm.state}
                            onChange={handleCorporateChange}
                            className={formInputClass('state')}
                            placeholder="NY"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="zipCode"
                            className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            ZIP / Postal Code
                          </label>
                          <input
                            type="text"
                            id="zipCode"
                            name="zipCode"
                            value={corporateForm.zipCode}
                            onChange={handleCorporateChange}
                            className={formInputClass('zipCode')}
                            placeholder="10001"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="country"
                            className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            Country
                          </label>
                          <input
                            type="text"
                            id="country"
                            name="country"
                            value={corporateForm.country}
                            onChange={handleCorporateChange}
                            className={formInputClass('country')}
                            placeholder="United States"
                          />
                          {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Primary Contact */}
                  <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Primary Contact
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="contactName"
                          className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          Contact Name
                        </label>
                        <div className="relative">
                          <div
                            className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                          >
                            <UserIcon size={18} />
                          </div>
                          <input
                            type="text"
                            id="contactName"
                            name="contactName"
                            value={corporateForm.contactName}
                            onChange={handleCorporateChange}
                            className={formInputWithIconClass('contactName')}
                            placeholder="John Doe"
                          />
                        </div>
                        {errors.contactName && <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="contactEmail"
                            className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            Contact Email
                          </label>
                          <div className="relative">
                            <div
                              className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                            >
                              <MailIcon size={18} />
                            </div>
                            <input
                              type="email"
                              id="contactEmail"
                              name="contactEmail"
                              value={corporateForm.contactEmail}
                              onChange={handleCorporateChange}
                              className={formInputWithIconClass('contactEmail')}
                              placeholder="john@company.com"
                            />
                          </div>
                          {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
                        </div>
                        <div>
                          <label
                            htmlFor="contactPhone"
                            className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            Contact Phone
                          </label>
                          <div className="relative">
                            <div
                              className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                            >
                              <PhoneIcon size={18} />
                            </div>
                            <input
                              type="tel"
                              id="contactPhone"
                              name="contactPhone"
                              value={corporateForm.contactPhone}
                              onChange={handleCorporateChange}
                              className={formInputWithIconClass('contactPhone')}
                              placeholder="(123) 456-7890"
                            />
                          </div>
                          {errors.contactPhone && <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Optional Documents */}
                  <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Documents (Optional)
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="businessLicense"
                          className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          Business License
                        </label>
                        <div className="relative">
                          <div
                            className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                          >
                            <FileTextIcon size={18} />
                          </div>
                          <input
                            type="file"
                            id="businessLicense"
                            name="businessLicense"
                            onChange={handleFileChange}
                            className={`block w-full pl-10 pr-3 py-2 border rounded-md ${
                              errors.businessLicense
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : darkMode 
                                  ? 'bg-gray-600 border-gray-500 text-white file:bg-gray-700 file:text-white file:border-gray-600' 
                                  : 'bg-white border-gray-300 text-gray-900 file:bg-gray-100 file:text-gray-700 file:border-gray-300'
                            } file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:text-sm file:font-medium`}
                            accept=".pdf,.png,.jpg,.jpeg"
                          />
                          {errors.businessLicense && <p className="text-red-500 text-sm mt-1">{errors.businessLicense}</p>}
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="taxDocument"
                          className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          Tax Registration Document
                        </label>
                        <div className="relative">
                          <div
                            className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                          >
                            <FileTextIcon size={18} />
                          </div>
                          <input
                            type="file"
                            id="taxDocument"
                            name="taxDocument"
                            onChange={handleFileChange}
                            className={`block w-full pl-10 pr-3 py-2 border rounded-md ${
                              errors.taxDocument
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : darkMode 
                                  ? 'bg-gray-600 border-gray-500 text-white file:bg-gray-700 file:text-white file:border-gray-600' 
                                  : 'bg-white border-gray-300 text-gray-900 file:bg-gray-100 file:text-gray-700 file:border-gray-300'
                            } file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:text-sm file:font-medium`}
                            accept=".pdf,.png,.jpg,.jpeg"
                          />
                          {errors.taxDocument && <p className="text-red-500 text-sm mt-1">{errors.taxDocument}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Authentication */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="password"
                        className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Password
                      </label>
                      <div className="relative">
                        <div
                          className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                        >
                          <LockIcon size={18} />
                        </div>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={corporateForm.password}
                          onChange={handleCorporateChange}
                          className={formInputWithIconClass('password')}
                          placeholder="••••••••"
                        />
                      </div>
                      {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div
                          className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                        >
                          <LockIcon size={18} />
                        </div>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={corporateForm.confirmPassword}
                          onChange={handleCorporateChange}
                          className={formInputWithIconClass('confirmPassword')}
                          placeholder="••••••••"
                        />
                      </div>
                      {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                </>
              )}
              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  variant={darkMode ? 'primary-dark' : 'primary'}
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </form>
            {/* Login Link */}
            <div className="mt-6 text-center">
              <p
                className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                Already have an account?{' '}
                <Link
                  to="/login"
                  className={`font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
