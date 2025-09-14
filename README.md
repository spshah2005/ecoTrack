# EcoTrack - Carbon Footprint Tracking MVP

EcoTrack is a React TypeScript web application that helps users track their carbon footprint based on purchases and earn interactive rewards for sustainable shopping.

## Features

### 🌱 Core Functionality
- **Carbon Footprint Tracking**: Automatically calculate CO₂ emissions from purchases
- **Merchant Integration**: Connect to Amazon, Walmart, Instacart, and other retailers (via Knot API)
- **EcoPoints Reward System**: Earn points for sustainable purchases
- **Virtual Garden**: Interactive visualization that grows with your eco-friendly choices

### 📊 Dashboard
- Total carbon footprint with weekly/monthly breakdowns
- EcoPoints earned and progress tracking
- Interactive charts showing carbon footprint trends
- Category-based carbon impact analysis

### 🛒 Transaction History
- Complete purchase history with carbon impact calculations
- Filter by product category (Electronics, Clothing, Food, etc.)
- Sort by date, carbon impact, or purchase amount
- Sustainable purchase highlighting

### 🌳 Virtual Garden Rewards
- Animated garden that grows based on EcoPoints earned
- Different plant types unlock at various milestones
- Celebration animations for achievements
- Garden statistics and progress tracking

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Charts**: Recharts for data visualization
- **Styling**: CSS-in-JS with inline styles
- **API Integration**: Knot SDK for merchant connections (mocked for demo)

## Carbon Calculation Model

- **Electronics**: 1.5 kg CO₂e per $
- **Clothing**: 0.8 kg CO₂e per $
- **Food/Groceries**: 0.4 kg CO₂e per $

## EcoPoints System

- **Sustainable Purchases**: +5 points per sustainable item
- **Carbon Savings**: +10 points per 5 kg CO₂ saved
- **Plant Unlocks**: 1 plant per 50 points earned

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/           # React components
│   ├── Dashboard.tsx    # Main dashboard with metrics
│   ├── Transactions.tsx # Transaction history view
│   ├── Rewards.tsx      # Virtual garden rewards
│   └── KnotLink.tsx     # Merchant connection component
├── types/               # TypeScript type definitions
│   └── index.ts        # Application interfaces
├── utils/               # Utility functions
│   └── carbonCalculations.ts # Carbon footprint logic
├── App.tsx             # Main application component
├── App.css             # Global styles
└── main.tsx            # Application entry point
```

## Demo Data

The application includes sample transaction data to demonstrate functionality:
- 3 sample transactions with various product categories
- Mix of sustainable and regular purchases
- Calculated carbon footprints and EcoPoints

## Knot SDK Integration

Currently uses a mock implementation of the Knot SDK. To use the real SDK:

1. Install the actual Knot SDK:
```bash
npm install @knotapi/sdk-react
```

2. Replace the mock `KnotLink` component in `src/components/KnotLink.tsx` with:
```tsx
import { KnotLink } from "@knotapi/sdk-react";
```

3. Add your Knot API key to the environment variables

## Backend Integration

For production, you'll need to implement backend endpoints:

- `POST /api/transactions/sync` - Sync transactions from Knot API
- `POST /api/session/create` - Create secure Knot sessions
- Carbon footprint calculation and storage
- User authentication and data persistence

## Future Enhancements

- Real-time transaction syncing
- More sophisticated carbon calculation models
- Social features and leaderboards
- Additional merchant integrations
- Mobile app version
- Carbon offset marketplace integration

## License

MIT License - see LICENSE file for details

---

Built with ❤️ for a more sustainable future 🌍
