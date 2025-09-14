import express from 'express';

const router = express.Router();

// POST /api/transactions/calculate-carbon - Calculate carbon footprint for transactions
router.post('/calculate-carbon', async (req, res) => {
  try {
    const { transactions } = req.body;

    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'transactions array is required'
        }
      });
    }

    // Carbon intensity rates (kg CO₂e per $) - from EcoTrack guidelines
    const CARBON_RATES = {
      electronics: 1.5,
      clothing: 0.8,
      food: 0.4,
      groceries: 0.4,
      other: 0.6
    };

    const processedTransactions = transactions.map(transaction => {
      const carbonFootprint = transaction.products?.reduce((total, product) => {
        const rate = CARBON_RATES[product.category?.toLowerCase()] || CARBON_RATES.other;
        return total + (product.price * product.quantity * rate);
      }, 0) || 0;

      const ecoPoints = transaction.products?.reduce((points, product) => {
        // +5 points for sustainable products
        const sustainablePoints = product.is_sustainable ? 5 : 0;
        
        // +10 points per 5kg CO₂ saved vs average
        const productCarbon = product.price * product.quantity * (CARBON_RATES[product.category?.toLowerCase()] || CARBON_RATES.other);
        const avgCarbon = product.price * product.quantity * 0.8; // Baseline
        const carbonSaved = Math.max(0, avgCarbon - productCarbon);
        const carbonPoints = Math.floor(carbonSaved / 5) * 10;

        return points + sustainablePoints + carbonPoints;
      }, 0) || 0;

      return {
        ...transaction,
        carbon_footprint: carbonFootprint,
        eco_points: ecoPoints
      };
    });

    res.json({
      success: true,
      data: {
        transactions: processedTransactions,
        summary: {
          total_carbon: processedTransactions.reduce((sum, t) => sum + t.carbon_footprint, 0),
          total_eco_points: processedTransactions.reduce((sum, t) => sum + t.eco_points, 0)
        }
      }
    });

  } catch (error) {
    console.error('❌ Carbon calculation failed:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to calculate carbon footprint',
        details: error.message
      }
    });
  }
});

export default router;