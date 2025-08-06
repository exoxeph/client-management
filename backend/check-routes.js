// check-routes.js
const express = require('express');
const app = express();

// Import routes
const indexRoutes = require('./routes/index');
const documentRoutes = require('./routes/document.routes');

// Register routes
app.use('/api', indexRoutes);

// Print out all registered routes
console.log('\nRoutes registered through indexRoutes:');
indexRoutes.stack.forEach(r => {
  if (r.route && r.route.path) {
    console.log(`${r.route.stack[0].method.toUpperCase()} /api${r.route.path}`);
  } else if (r.name === 'router') {
    console.log('\nNested routes:');
    r.handle.stack.forEach(nestedRoute => {
      if (nestedRoute.route && nestedRoute.route.path) {
        console.log(`${nestedRoute.route.stack[0].method.toUpperCase()} /api${r.regexp.source.replace('\\/?(?=\\/|$)', '')}${nestedRoute.route.path}`);
      }
    });
  }
});

console.log('\nDocument routes:');
documentRoutes.stack.forEach(r => {
  if (r.route && r.route.path) {
    console.log(`${r.route.stack[0].method.toUpperCase()} /api/documents${r.route.path}`);
  }
});