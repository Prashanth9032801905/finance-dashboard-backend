const Record = require('./model');

const createRecord = async (req, res) => {
  try {
    const recordData = {
      ...req.body,
      createdBy: req.user._id
    };

    const record = new Record(recordData);
    await record.save();

    // Populate user data for response
    await record.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Record created successfully',
      data: {
        record
      }
    });
  } catch (error) {
    console.error('Create record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating record'
    });
  }
};

const getRecords = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      category,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isDeleted: false };
    
    if (type) {
      filter.type = type;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get records with pagination
    const records = await Record.find(filter)
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await Record.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      message: 'Records retrieved successfully',
      data: {
        records,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRecords: total,
          limit: parseInt(limit),
          hasNextPage,
          hasPrevPage
        },
        filters: {
          type,
          category,
          startDate,
          endDate,
          sortBy,
          sortOrder
        }
      }
    });
  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving records'
    });
  }
};

const getRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await Record.findOne({ _id: id, isDeleted: false })
      .populate('createdBy', 'name email');
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    res.json({
      success: true,
      message: 'Record retrieved successfully',
      data: {
        record
      }
    });
  } catch (error) {
    console.error('Get record error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while retrieving record'
    });
  }
};

const updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const record = await Record.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    res.json({
      success: true,
      message: 'Record updated successfully',
      data: {
        record
      }
    });
  } catch (error) {
    console.error('Update record error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating record'
    });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await Record.findOne({ _id: id, isDeleted: false });
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    // Soft delete
    await record.softDelete();

    res.json({
      success: true,
      message: 'Record deleted successfully',
      data: {
        record
      }
    });
  } catch (error) {
    console.error('Delete record error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting record'
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Record.distinct('category', { isDeleted: false });

    res.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving categories'
    });
  }
};

module.exports = {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  getCategories
};
