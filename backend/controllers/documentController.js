// controllers/documentController.js 
const Corporate = require('../models/Corporate'); 

exports.getBusinessLicense = async (req, res) => {
  try {
    const { corporateId } = req.params;
    console.log('📥 Incoming request to getBusinessLicense:', corporateId);

    const corporate = await Corporate.findById(corporateId);
    if (!corporate || !corporate.documents?.businessLicense?.fileData) {
      console.log('❌ Document or fileData is missing for:', corporateId);
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
    const buffer = fileData.buffer || Buffer.from(fileData);

    console.log('✅ Serving businessLicense for user:', corporateId);
    console.log('Content-Type:', contentType);
    console.log('Buffer length:', buffer.length);

    res.set('Content-Type', contentType);
    res.set('Content-Disposition', `inline; filename="${fileName}"`);

    return res.send(buffer);
  } catch (error) {
    console.error('❌ Error serving businessLicense:', error);
    res.status(500).json({ message: 'Failed to retrieve document' });
  }
};

exports.getTaxDocument = async (req, res) => { 
  try { 
    const { corporateId } = req.params; 
    const corporate = await Corporate.findById(corporateId); 

    if (!corporate || !corporate.documents?.taxDocument?.fileData) { 
      return res.status(404).json({ message: 'Document not found' }); 
    } 

    const { fileData, contentType, fileName } = corporate.documents.taxDocument; 

    console.log('Serving taxDocument from MongoDB for user', corporateId); 
    console.log('Content-Type:', contentType); 
    console.log('Buffer length:', Buffer.byteLength(fileData)); // safe for binary 

    res.set('Content-Type', contentType); 
    res.set('Content-Disposition', `inline; filename="${fileName}"`); 
    
    // If fileData is a Buffer (check if necessary) 
    const buffer = fileData.buffer; // Extract raw binary from MongoDB's Binary object
    return res.send(buffer);


  } catch (error) { 
    console.error('Error serving taxDocument:', error); 
    res.status(500).json({ message: 'Failed to retrieve document' }); 
  } 
};