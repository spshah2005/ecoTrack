import express from 'express';
import axios from 'axios';

const router = express.Router();

// Knot API configuration
const KNOT_API_BASE_URL = process.env.KNOT_ENVIRONMENT === 'production' 
  ? 'https://api.knotapi.com'
  : 'https://development.knotapi.com';

const KNOT_API_KEY = process.env.KNOT_API_KEY;

// Middleware to validate Knot API key
const validateKnotApiKey = (req, res, next) => {
  if (!KNOT_API_KEY) {
    console.error('❌ KNOT_API_KEY not found in environment variables');
    return res.status(500).json({
      success: false,
      error: {
        message: 'Knot API key not configured on server'
      }
    });
  }
  next();
};

// POST /api/knot/session - Create Knot session
router.post('/session', validateKnotApiKey, async (req, res) => {
  try {
    const { product = 'transaction_link', merchantIds = [] } = req.body;

    console.log('🔗 Creating Knot session:', { product, merchantIds });

    const sessionPayload = {
      product,
      ...(merchantIds.length > 0 && { merchant_ids: merchantIds })
    };

    const response = await axios.post(
      `${KNOT_API_BASE_URL}/session/create`,
      sessionPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${KNOT_API_KEY}`
        },
        timeout: 10000 // 10 second timeout
      }
    );

    const { session_id, expires_at } = response.data;

    console.log('✅ Knot session created:', { session_id, expires_at });

    res.json({
      success: true,
      data: {
        sessionId: session_id,
        expiresAt: expires_at,
        environment: process.env.KNOT_ENVIRONMENT || 'development'
      }
    });

  } catch (error) {
    console.error('❌ Knot session creation failed:', error.response?.data || error.message);

    if (error.response) {
      // Knot API returned an error
      const status = error.response.status;
      const errorData = error.response.data;

      return res.status(status).json({
        success: false,
        error: {
          message: errorData.message || 'Failed to create Knot session',
          code: errorData.code,
          details: errorData
        }
      });
    } else {
      // Network or other error
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to connect to Knot API',
          details: error.message
        }
      });
    }
  }
});

// POST /api/knot/transactions/sync - Sync transactions from Knot
router.post('/transactions/sync', validateKnotApiKey, async (req, res) => {
  try {
    const { merchant_id, external_user_id, limit = 50 } = req.body;

    if (!merchant_id || !external_user_id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'merchant_id and external_user_id are required'
        }
      });
    }

    console.log('🔄 Syncing transactions:', { merchant_id, external_user_id, limit });

    const response = await axios.post(
      `${KNOT_API_BASE_URL}/transactions/sync`,
      {
        merchant_id,
        external_user_id,
        limit
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${KNOT_API_KEY}`
        },
        timeout: 30000 // 30 second timeout for transaction sync
      }
    );

    const transactions = response.data.transactions || [];

    console.log(`✅ Synced ${transactions.length} transactions`);

    res.json({
      success: true,
      data: {
        transactions,
        count: transactions.length,
        merchant_id,
        external_user_id
      }
    });

  } catch (error) {
    console.error('❌ Transaction sync failed:', error.response?.data || error.message);

    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      return res.status(status).json({
        success: false,
        error: {
          message: errorData.message || 'Failed to sync transactions',
          code: errorData.code,
          details: errorData
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to connect to Knot API for transaction sync',
          details: error.message
        }
      });
    }
  }
});

// GET /api/knot/merchants - List available merchants
router.get('/merchants', validateKnotApiKey, async (req, res) => {
  try {
    console.log('📋 Fetching merchant list');

    const response = await axios.get(
      `${KNOT_API_BASE_URL}/merchants`,
      {
        headers: {
          'Authorization': `Bearer ${KNOT_API_KEY}`
        },
        timeout: 10000
      }
    );

    const merchants = response.data.merchants || [];

    res.json({
      success: true,
      data: {
        merchants,
        count: merchants.length
      }
    });

  } catch (error) {
    console.error('❌ Merchant list fetch failed:', error.response?.data || error.message);

    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      return res.status(status).json({
        success: false,
        error: {
          message: errorData.message || 'Failed to fetch merchants',
          code: errorData.code
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to connect to Knot API for merchant list',
          details: error.message
        }
      });
    }
  }
});

export default router;