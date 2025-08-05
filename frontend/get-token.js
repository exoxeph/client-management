/**
 * Script to extract the token from localStorage
 */

// This script should be run in the browser console
console.log('Admin token:', localStorage.getItem('token'));

// For Node.js environment, we'll just print instructions
console.log('\nTo get your admin token:');
console.log('1. Log in to the admin account in your browser');
console.log('2. Open the browser developer tools (F12 or right-click > Inspect)');
console.log('3. Go to the Console tab');
console.log('4. Run this command: localStorage.getItem("token")');
console.log('5. Copy the token and use it with the test-api.js script');
console.log('\nExample: node test-api.js YOUR_TOKEN_HERE');