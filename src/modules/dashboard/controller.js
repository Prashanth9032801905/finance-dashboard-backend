const Record = require('../record/model');

const getSummary = async (req, res) => {
  try {
    console.log('Fetching dashboard summary...');
    
    const summary = await Record.aggregate([
      {
        $match: { isDeleted: false }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('Summary aggregation result:', summary);

    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    summary.forEach(item => {
      if (item._id === 'income') {
        totalIncome = item.total;
        incomeCount = item.count;
      } else if (item._id === 'expense') {
        totalExpense = item.total;
        expenseCount = item.count;
      }
    });

    const balance = totalIncome - totalExpense;

    console.log('Final summary:', { totalIncome, totalExpense, balance });

    res.json({
      success: true,
      message: 'Summary retrieved successfully',
      data: {
        summary: {
          totalIncome: totalIncome || 0,
          totalExpense: totalExpense || 0,
          balance: balance || 0,
          totalTransactions: incomeCount + expenseCount,
          incomeCount: incomeCount || 0,
          expenseCount: expenseCount || 0
        }
      }
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving summary'
    });
  }
};

const getMonthlyTrends = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const monthlyData = await Record.aggregate([
      {
        $match: {
          isDeleted: false,
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.month': 1 }
      }
    ]);

    // Transform data for easier consumption
    const monthlyTrends = [];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    for (let i = 1; i <= 12; i++) {
      const monthData = {
        month: monthNames[i - 1],
        monthNumber: i,
        income: 0,
        expense: 0,
        incomeCount: 0,
        expenseCount: 0
      };

      monthlyData.forEach(item => {
        if (item._id.month === i) {
          if (item._id.type === 'income') {
            monthData.income = item.total;
            monthData.incomeCount = item.count;
          } else if (item._id.type === 'expense') {
            monthData.expense = item.total;
            monthData.expenseCount = item.count;
          }
        }
      });

      monthlyTrends.push(monthData);
    }

    res.json({
      success: true,
      message: 'Monthly trends retrieved successfully',
      data: {
        monthlyTrends,
        year: parseInt(year)
      }
    });
  } catch (error) {
    console.error('Get monthly trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving monthly trends'
    });
  }
};

const getCategoryWiseTotals = async (req, res) => {
  try {
    const { type } = req.query;

    const matchStage = { isDeleted: false };
    if (type) {
      matchStage.type = type;
    }

    const categoryData = await Record.aggregate([
      {
        $match: matchStage
      },
      {
        $group: {
          _id: {
            category: '$category',
            type: '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    // Transform data for easier consumption
    const categoryTotals = categoryData.map(item => ({
      category: item._id.category,
      type: item._id.type,
      total: item.total,
      count: item.count
    }));

    // Also get overall category totals (combined income and expense)
    const overallCategoryTotals = await Record.aggregate([
      {
        $match: { isDeleted: false }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          income: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
            }
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
            }
          }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    const overallCategories = overallCategoryTotals.map(item => ({
      category: item._id,
      total: item.total,
      count: item.count,
      income: item.income,
      expense: item.expense,
      balance: item.income - item.expense
    }));

    res.json({
      success: true,
      message: 'Category totals retrieved successfully',
      data: {
        categoryTotals,
        overallCategories
      }
    });
  } catch (error) {
    console.error('Get category totals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving category totals'
    });
  }
};

const getRecentTransactions = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const recentTransactions = await Record.find({ isDeleted: false })
      .populate('createdBy', 'name email')
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      message: 'Recent transactions retrieved successfully',
      data: {
        recentTransactions,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get recent transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving recent transactions'
    });
  }
};

const getYearlyComparison = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    const yearlyData = await Record.aggregate([
      {
        $match: {
          isDeleted: false,
          date: {
            $gte: new Date(`${lastYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1 }
      }
    ]);

    // Transform data for easier consumption
    const comparison = {
      [lastYear]: { income: 0, expense: 0, total: 0 },
      [currentYear]: { income: 0, expense: 0, total: 0 }
    };

    yearlyData.forEach(item => {
      const year = item._id.year;
      const type = item._id.type;
      
      if (comparison[year]) {
        comparison[year][type] = item.total;
        comparison[year].total += item.total;
      }
    });

    // Calculate growth percentages
    const incomeGrowth = comparison[lastYear].income > 0 
      ? ((comparison[currentYear].income - comparison[lastYear].income) / comparison[lastYear].income * 100).toFixed(2)
      : 0;

    const expenseGrowth = comparison[lastYear].expense > 0
      ? ((comparison[currentYear].expense - comparison[lastYear].expense) / comparison[lastYear].expense * 100).toFixed(2)
      : 0;

    const totalGrowth = comparison[lastYear].total > 0
      ? ((comparison[currentYear].total - comparison[lastYear].total) / comparison[lastYear].total * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      message: 'Yearly comparison retrieved successfully',
      data: {
        comparison,
        growth: {
          income: parseFloat(incomeGrowth),
          expense: parseFloat(expenseGrowth),
          total: parseFloat(totalGrowth)
        },
        years: [lastYear, currentYear]
      }
    });
  } catch (error) {
    console.error('Get yearly comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving yearly comparison'
    });
  }
};

module.exports = {
  getSummary,
  getMonthlyTrends,
  getCategoryWiseTotals,
  getRecentTransactions,
  getYearlyComparison
};
