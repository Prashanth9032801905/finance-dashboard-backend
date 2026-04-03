const Record = require('../record/model');
const User = require('../user/model');

const getAdvancedAnalytics = async (req, res) => {
  try {
    console.log('Fetching advanced analytics...');
    
    const { startDate, endDate, groupBy, metric } = req.query;
    const userId = req.user.id;
    
    // Build base query
    const baseQuery = { 
      isDeleted: false,
      createdBy: userId
    };
    
    // Date range filtering
    if (startDate || endDate) {
      baseQuery.date = {};
      if (startDate) baseQuery.date.$gte = new Date(startDate);
      if (endDate) baseQuery.date.$lte = new Date(endDate);
    }
    
    let analyticsData = {};
    
    switch (groupBy) {
      case 'category':
        analyticsData = await getCategoryAnalytics(baseQuery, startDate, endDate);
        break;
      case 'monthly':
        analyticsData = await getMonthlyAnalytics(baseQuery, startDate, endDate);
        break;
      case 'trend':
        analyticsData = await getTrendAnalytics(baseQuery, startDate, endDate);
        break;
      default:
        analyticsData = await getOverallAnalytics(baseQuery, startDate, endDate);
    }
    
    // Add specific metric if requested
    if (metric) {
      analyticsData = await getSpecificMetric(baseQuery, metric, startDate, endDate);
    }
    
    console.log('Advanced analytics retrieved successfully');
    
    res.json({
      success: true,
      message: 'Advanced analytics retrieved successfully',
      data: {
        analytics: analyticsData,
        filters: {
          startDate,
          endDate,
          groupBy,
          metric
        },
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Advanced analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve advanced analytics'
    });
  }
};

const getCategoryAnalytics = async (baseQuery, startDate, endDate) => {
  const categoryStats = await Record.aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' },
        incomeTotal: {
          $sum: {
            $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
          }
        },
        expenseTotal: {
          $sum: {
            $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
          }
        }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);
  
  return {
    type: 'category',
    data: categoryStats,
    summary: {
      totalCategories: categoryStats.length,
      topCategory: categoryStats[0],
      totalIncome: categoryStats.reduce((sum, cat) => sum + (cat.incomeTotal || 0), 0),
      totalExpenses: categoryStats.reduce((sum, cat) => sum + (cat.expenseTotal || 0), 0)
    }
  };
};

const getMonthlyAnalytics = async (baseQuery, startDate, endDate) => {
  const monthlyStats = await Record.aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' }
        },
        totalIncome: {
          $sum: {
            $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
          }
        },
        totalExpense: {
          $sum: {
            $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
          }
        },
        balance: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  
  return {
    type: 'monthly',
    data: monthlyStats,
    summary: {
      totalMonths: monthlyStats.length,
      avgMonthlyIncome: monthlyStats.reduce((sum, month) => sum + (month.totalIncome || 0), 0) / monthlyStats.length,
      avgMonthlyExpense: monthlyStats.reduce((sum, month) => sum + (month.totalExpense || 0), 0) / monthlyStats.length,
      bestMonth: monthlyStats.reduce((best, month) => (month.balance || 0) > (best.balance || 0) ? month : best),
      worstMonth: monthlyStats.reduce((worst, month) => (month.balance || 0) < (worst.balance || 0) ? month : worst)
    }
  };
};

const getTrendAnalytics = async (baseQuery, startDate, endDate) => {
  const trendData = await Record.aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: {
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$date'
            }
          }
        },
        dailyIncome: {
          $sum: {
            $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
          }
        },
        dailyExpense: {
          $sum: {
            $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
          }
        },
        dailyBalance: { $sum: '$amount' },
        transactionCount: { $sum: 1 }
      }
    },
    { $sort: { '_id.date': 1 } }
  ]);
  
  // Calculate moving averages
  const movingAvgPeriod = 7;
  const movingAverages = trendData.map((item, index, array) => {
    if (index < movingAvgPeriod - 1) return null;
    
    const period = array.slice(index - movingAvgPeriod + 1, index + 1);
    const avgBalance = period.reduce((sum, day) => sum + (day.dailyBalance || 0), 0) / movingAvgPeriod;
    const avgIncome = period.reduce((sum, day) => sum + (day.dailyIncome || 0), 0) / movingAvgPeriod;
    const avgExpense = period.reduce((sum, day) => sum + (day.dailyExpense || 0), 0) / movingAvgPeriod;
    
    return {
      date: item._id.date,
      actualBalance: item.dailyBalance,
      movingAvgBalance: avgBalance,
      movingAvgIncome: avgIncome,
      movingAvgExpense: avgExpense,
      trend: item.dailyBalance > avgBalance ? 'upward' : item.dailyBalance < avgBalance ? 'downward' : 'stable'
    };
  }).filter(item => item !== null);
  
  return {
    type: 'trend',
    data: movingAverages,
    summary: {
      totalDays: trendData.length,
      movingAvgPeriod,
      overallTrend: movingAverages[movingAverages.length - 1]?.trend || 'stable',
      avgDailyBalance: movingAverages.reduce((sum, day) => sum + day.movingAvgBalance, 0) / movingAverages.length
    }
  };
};

const getSpecificMetric = async (baseQuery, metric, startDate, endDate) => {
  let pipeline = [];
  
  switch (metric) {
    case 'total_volume':
      pipeline = [
        { $match: baseQuery },
        { $group: { _id: null, totalVolume: { $sum: '$amount' }, count: { $sum: 1 } } }
      ];
      break;
    case 'avg_transaction_size':
      pipeline = [
        { $match: baseQuery },
        { $group: { _id: null, avgAmount: { $avg: '$amount' } } }
      ];
      break;
    case 'transaction_frequency':
      pipeline = [
        { $match: baseQuery },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ];
      break;
    default:
      pipeline = [
        { $match: baseQuery },
        { $group: { _id: null, count: { $sum: 1 } } }
      ];
  }
  
  const result = await Record.aggregate(pipeline);
  
  return {
    type: 'metric',
    metric,
    data: result[0] || {},
    summary: {
      description: `Analytics for ${metric}`,
      calculatedAt: new Date().toISOString()
    }
  };
};

const getOverallAnalytics = async (baseQuery, startDate, endDate) => {
  const overallStats = await Record.aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: {
            $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
          }
        },
        totalExpense: {
          $sum: {
            $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
          }
        },
        netBalance: { $sum: '$amount' },
        totalTransactions: { $sum: 1 },
        avgTransaction: { $avg: '$amount' },
        maxTransaction: { $max: '$amount' },
        minTransaction: { $min: '$amount' }
      }
    }
  ]);
  
  return {
    type: 'overall',
    data: overallStats[0] || {},
    summary: {
      profitMargin: overallStats[0] ? ((overallStats[0].totalIncome / overallStats[0].totalIncome) * 100).toFixed(2) : 0,
      savingsRate: overallStats[0] ? ((overallStats[0].netBalance / overallStats[0].totalIncome) * 100).toFixed(2) : 0
    }
  };
};

module.exports = {
  getAdvancedAnalytics
};
