const Record = require('../record/model');
const User = require('../user/model');

const exportRecords = async (req, res) => {
  try {
    console.log('Exporting financial records...');
    
    const { format = 'json', startDate, endDate, type, category } = req.query;
    const userId = req.user.id;
    
    // Build query
    const query = { 
      isDeleted: false,
      createdBy: userId
    };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    if (type) query.type = type;
    if (category) query.category = { $regex: category, $options: 'i' };
    
    const records = await Record.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: -1 });
    
    // Format data based on export type
    let exportData;
    let contentType;
    let filename;
    
    switch (format.toLowerCase()) {
      case 'csv':
        exportData = convertToCSV(records);
        contentType = 'text/csv';
        filename = `financial-records-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'excel':
        // For now, return JSON (excel would need additional library)
        exportData = JSON.stringify(records, null, 2);
        contentType = 'application/json';
        filename = `financial-records-${new Date().toISOString().split('T')[0]}.json`;
        break;
      default:
        exportData = JSON.stringify(records, null, 2);
        contentType = 'application/json';
        filename = `financial-records-${new Date().toISOString().split('T')[0]}.json`;
    }
    
    console.log(`Exported ${records.length} records in ${format} format`);
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportData);
    
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export records'
    });
  }
};

const convertToCSV = (records) => {
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Note', 'Created By'];
  const csvRows = records.map(record => [
    record.date.toISOString().split('T')[0],
    record.type,
    record.category,
    record.amount,
    record.note || '',
    record.createdBy?.name || ''
  ]);
  
  const csvContent = [headers, ...csvRows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
    
  return csvContent;
};

module.exports = { exportRecords };
