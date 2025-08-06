// controllers/documentController.js 
const Corporate = require('../models/Corporate'); 

exports.getBusinessLicense = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('📥 Incoming request to getBusinessLicense:', userId);
    console.log('User role:', req.user?.role);
    console.log('User ID:', req.user?.id);
    console.log('Request params:', req.params);
    console.log('Request headers:', req.headers);

    // Check if user is admin or the owner of the document
    const isAdmin = req.user?.role === 'admin';
    console.log('Is admin?', isAdmin);
    
    const corporate = await Corporate.findOne({ user: userId });

    if (!corporate) {
      console.log('❌ Corporate user not found with ID:', userId);
      return res.status(404).json({ message: 'Corporate user not found' });
    }
    
    if (!corporate.documents?.businessLicense?.fileData) {
      console.log('❌ Business license document missing for user:', userId);
      console.log('Document structure:', JSON.stringify(corporate.documents || {}));
      return res.status(404).json({ message: 'Document not found' });
    }

    const { fileData, contentType, fileName } = corporate.documents.businessLicense;

    // Diagnostic logs
    console.log('fileData:', fileData);
    console.log('Raw typeof fileData:', typeof fileData);
    console.log('Constructor:', fileData.constructor?.name);
    console.log('Keys in fileData:', Object.keys(fileData));
    console.log('Is fileData a Buffer?', Buffer.isBuffer(fileData));
    console.log('fileData.buffer type:', typeof fileData.buffer);
    console.log('fileData.buffer length:', fileData.buffer?.length);

    // Get the actual buffer
    let buffer;

if (Buffer.isBuffer(fileData)) {
  buffer = fileData;
} else if (fileData?.buffer && Buffer.isBuffer(fileData.buffer)) {
  buffer = fileData.buffer;
} else if (fileData?.data) {
  buffer = Buffer.from(fileData.data);
} else {
  console.error('❌ Invalid fileData format');
  return res.status(400).json({ message: 'Invalid document format' });
}

    //console.log('✅ Serving businessLicense for user:', userId);
    //console.log('Content-Type:', contentType);
    //console.log('Buffer length:', buffer.length);

    // Set appropriate headers
    res.set('Content-Type', contentType || 'application/octet-stream');
    res.set('Content-Disposition', `inline; filename="${fileName || 'business-license.pdf'}"`); 
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    console.log('Final buffer length:', buffer?.length);
    console.log('First 20 bytes of buffer:', buffer?.subarray?.(0, 20));


    return res.send(buffer);
  } catch (error) {
    console.error('❌ Error serving businessLicense:', error);
    res.status(500).json({ message: 'Failed to retrieve document' });
  }
};

exports.getTaxDocument = async (req, res) => { 
  try { 
    const { userId } = req.params;
    console.log('📥 Incoming request to getTaxDocument:', userId);
    console.log('User role:', req.user?.role);
    console.log('User ID:', req.user?.id);
    console.log('Request params:', req.params);
    console.log('Request headers:', req.headers);

    // Check if user is admin or the owner of the document
    const isAdmin = req.user?.role === 'admin';
    console.log('Is admin?', isAdmin);
    
    const corporate = await Corporate.findOne({ user: userId });

    if (!corporate) {
      console.log('❌ Corporate user not found with ID:', userId);
      return res.status(404).json({ message: 'Corporate user not found' });
    }
    
    if (!corporate.documents?.taxDocument?.fileData) { 
      console.log('❌ Tax document missing for user:', userId);
      console.log('Document structure:', JSON.stringify(corporate.documents || {}));
      return res.status(404).json({ message: 'Document not found' }); 
    } 

    const { fileData, contentType, fileName } = corporate.documents.taxDocument; 

    // Diagnostic logs
    console.log('fileData:', fileData);
    console.log('Raw typeof fileData:', typeof fileData);
    console.log('Constructor:', fileData.constructor?.name);
    console.log('Keys in fileData:', Object.keys(fileData));
    console.log('Is fileData a Buffer?', Buffer.isBuffer(fileData));
    console.log('fileData.buffer type:', typeof fileData.buffer);
    console.log('fileData.buffer length:', fileData.buffer?.length);

    // Get the actual buffer
    let buffer;

if (Buffer.isBuffer(fileData)) {
  buffer = fileData;
} else if (fileData?.buffer && Buffer.isBuffer(fileData.buffer)) {
  buffer = fileData.buffer;
} else if (fileData?.data) {
  buffer = Buffer.from(fileData.data);
} else {
  console.error('❌ Invalid fileData format');
  return res.status(400).json({ message: 'Invalid document format' });
}

    console.log('✅ Serving taxDocument for user:', userId); 
    console.log('Content-Type:', contentType); 
    console.log('Buffer length:', buffer.length); 

    // Set appropriate headers
    res.set('Content-Type', contentType || 'application/octet-stream'); 
    res.set('Content-Disposition', `inline; filename="${fileName || 'tax-document.pdf'}"`); 
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    return res.send(buffer);
  } catch (error) {
    console.error('❌ Error serving taxDocument:', error);
    res.status(500).json({ message: 'Failed to retrieve document' });
  }
};