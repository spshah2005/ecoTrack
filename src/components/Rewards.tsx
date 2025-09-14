import React, { useState, useEffect } from 'react';
import type { EcoPoints } from '../types';

interface RewardsProps {
  ecoPoints: EcoPoints;
  onPointsEarned?: (points: number) => void;
}

interface Plant {
  id: number;
  type: 'seedling' | 'sprout' | 'tree';
  x: number;
  y: number;
  growth: number;
  animationDelay: number;
  pointsInvested: number;
}

export const Rewards: React.FC<RewardsProps> = ({ ecoPoints }) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [newPlantMessage, setNewPlantMessage] = useState('');
  const [hoveredPlant, setHoveredPlant] = useState<number | null>(null);

  useEffect(() => {
    const newPlants: Plant[] = [];
    
    // Immediate upgrade system: determine how many of each type based on total points
    const totalPoints = ecoPoints.total;
    
    // Calculate how many plants can be fully upgraded to each stage
    const treesCount = Math.floor(totalPoints / 100); // Every 100 points = 1 tree
    const sproutsCount = Math.floor((totalPoints % 100) / 50); // Remaining points / 50 = sprouts
    const seedlingsCount = ecoPoints.plants_unlocked - treesCount - sproutsCount; // Rest are seedlings
    
    let plantIndex = 0;
    
    // Add trees first (most mature)
    for (let i = 0; i < treesCount; i++) {
      const { x, y } = getPlantPosition(plantIndex, ecoPoints.plants_unlocked);
      newPlants.push({
        id: plantIndex,
        type: 'tree',
        x: x,
        y: y,
        growth: 100, // Trees are fully grown
        animationDelay: plantIndex * 0.08,
        pointsInvested: 100
      });
      plantIndex++;
    }
    
    // Add sprouts next
    for (let i = 0; i < sproutsCount; i++) {
      const { x, y } = getPlantPosition(plantIndex, ecoPoints.plants_unlocked);
      newPlants.push({
        id: plantIndex,
        type: 'sprout',
        x: x,
        y: y,
        growth: 75, // Sprouts are 75% grown
        animationDelay: plantIndex * 0.08,
        pointsInvested: 50
      });
      plantIndex++;
    }
    
    // Add remaining seedlings
    for (let i = 0; i < seedlingsCount; i++) {
      const { x, y } = getPlantPosition(plantIndex, ecoPoints.plants_unlocked);
      newPlants.push({
        id: plantIndex,
        type: 'seedling',
        x: x,
        y: y,
        growth: 50, // Seedlings are 50% grown
        animationDelay: plantIndex * 0.08,
        pointsInvested: 25
      });
      plantIndex++;
    }
    
    setPlants(newPlants);
  }, [ecoPoints]);

  // Helper function to calculate plant position
  const getPlantPosition = (plantIndex: number, totalPlants: number) => {
    const maxPlantsPerRow = 8;
    const plantsPerRow = Math.min(maxPlantsPerRow, Math.max(5, Math.ceil(Math.sqrt(totalPlants * 1.2))));
    const currentRow = Math.floor(plantIndex / plantsPerRow);
    const currentCol = plantIndex % plantsPerRow;
    const plantsInCurrentRow = Math.min(plantsPerRow, totalPlants - currentRow * plantsPerRow);
    
    const gardenWidth = 750;
    const plantSpacing = Math.min(90, gardenWidth / (plantsPerRow + 1));
    const rowWidth = (plantsInCurrentRow - 1) * plantSpacing;
    const rowStartX = 75 + (gardenWidth - rowWidth) / 2;
    
    return {
      x: rowStartX + currentCol * plantSpacing,
      y: 200 + currentRow * 65
    };
  };

  const renderPlant = (plant: Plant) => {
    const baseScale = 0.7;
    const growthScale = 0.3 + (plant.growth / 100) * 0.7; // Scale from 0.3 to 1.0
    const scale = baseScale * growthScale;
    const isHovered = hoveredPlant === plant.id;
    const hoverScale = isHovered ? 1.15 : 1;
    
    switch (plant.type) {
      case 'tree':
        return (
          <g 
            transform={`translate(${plant.x}, ${plant.y}) scale(${scale * hoverScale})`}
            style={{ 
              transition: 'transform 0.3s ease',
              cursor: 'pointer',
              filter: isHovered ? 'drop-shadow(0 6px 12px rgba(0,0,0,0.3))' : 'none'
            }}
            onMouseEnter={() => setHoveredPlant(plant.id)}
            onMouseLeave={() => setHoveredPlant(null)}
          >
            {/* Tree trunk with enhanced texture */}
            <rect x="-10" y="10" width="20" height="40" fill="#8B4513" rx="3" />
            <rect x="-7" y="15" width="4" height="35" fill="#A0522D" opacity="0.7" />
            <rect x="3" y="18" width="3" height="30" fill="#654321" opacity="0.5" />
            
            {/* Layered canopy for full tree */}
            <circle cx="0" cy="0" r="32" fill="#228B22" />
            <circle cx="-20" cy="8" r="26" fill="#32CD32" />
            <circle cx="20" cy="8" r="26" fill="#32CD32" />
            <circle cx="-10" cy="-12" r="22" fill="#90EE90" />
            <circle cx="10" cy="-12" r="22" fill="#90EE90" />
            <circle cx="0" cy="-25" r="18" fill="#98FB98" />
            
            {/* Abundant fruits for mature trees */}
            <circle cx="-15" cy="-2" r="4" fill="#FF4500" />
            <circle cx="18" cy="5" r="4" fill="#FF6347" />
            <circle cx="8" cy="-15" r="4" fill="#FF4500" />
            <circle cx="-8" cy="12" r="4" fill="#FF6347" />
            <circle cx="0" cy="-8" r="4" fill="#FF8C00" />
            
            {/* Flowers for aesthetic appeal */}
            <circle cx="-25" cy="2" r="3" fill="#FFB6C1" />
            <circle cx="25" cy="8" r="3" fill="#FFC0CB" />
            <circle cx="2" cy="-28" r="3" fill="#FFB6C1" />
            <circle cx="-12" cy="-18" r="3" fill="#FFC0CB" />
          </g>
        );
      
      case 'sprout':
        return (
          <g 
            transform={`translate(${plant.x}, ${plant.y}) scale(${scale * hoverScale})`}
            style={{ 
              transition: 'transform 0.3s ease',
              cursor: 'pointer',
              filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))' : 'none'
            }}
            onMouseEnter={() => setHoveredPlant(plant.id)}
            onMouseLeave={() => setHoveredPlant(null)}
          >
            {/* Thicker stem for sprout */}
            <rect x="-3" y="20" width="6" height="30" fill="#90EE90" />
            
            {/* Multiple leaf pairs */}
            <ellipse cx="-15" cy="15" rx="12" ry="7" fill="#32CD32" />
            <ellipse cx="15" cy="15" rx="12" ry="7" fill="#32CD32" />
            <ellipse cx="-12" cy="5" rx="10" ry="6" fill="#228B22" />
            <ellipse cx="12" cy="5" rx="10" ry="6" fill="#228B22" />
            
            {/* Growing top leaves */}
            <ellipse cx="-8" cy="-5" rx="8" ry="5" fill="#90EE90" />
            <ellipse cx="8" cy="-5" rx="8" ry="5" fill="#90EE90" />
            
            {/* Small developing buds */}
            <circle cx="-18" cy="12" r="2" fill="#98FB98" />
            <circle cx="18" cy="12" r="2" fill="#98FB98" />
            <circle cx="0" cy="-12" r="2" fill="#98FB98" />
          </g>
        );
      
      case 'seedling':
      default:
        return (
          <g 
            transform={`translate(${plant.x}, ${plant.y}) scale(${scale * hoverScale})`}
            style={{ 
              transition: 'transform 0.3s ease',
              cursor: 'pointer',
              filter: isHovered ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none'
            }}
            onMouseEnter={() => setHoveredPlant(plant.id)}
            onMouseLeave={() => setHoveredPlant(null)}
          >
            {/* Soil mound */}
            <ellipse cx="0" cy="45" rx="20" ry="10" fill="#8B4513" />
            <ellipse cx="0" cy="42" rx="16" ry="7" fill="#A0522D" />
            
            {/* Tiny emerging stem */}
            {plant.growth > 20 && (
              <rect x="-1" y="32" width="2" height="15" fill="#90EE90" />
            )}
            
            {/* First pair of tiny leaves */}
            {plant.growth > 40 && (
              <>
                <ellipse cx="-5" cy="25" rx="5" ry="3" fill="#32CD32" />
                <ellipse cx="5" cy="25" rx="5" ry="3" fill="#32CD32" />
              </>
            )}
            
            {/* Second pair as it grows */}
            {plant.growth > 70 && (
              <>
                <ellipse cx="-7" cy="18" rx="6" ry="4" fill="#228B22" />
                <ellipse cx="7" cy="18" rx="6" ry="4" fill="#228B22" />
              </>
            )}
            
            {/* Growth progress indicator */}
            <circle cx="0" cy="55" r="3" fill="#654321" opacity="0.4" />
          </g>
        );
    }
  };

  const getPlantStageInfo = (plant: Plant) => {
    if (plant.type === 'tree') return { stage: 'Tree', nextStage: 'Fully Grown', pointsNeeded: 0 };
    if (plant.type === 'sprout') return { stage: 'Sprout', nextStage: 'Tree', pointsNeeded: 101 - plant.pointsInvested };
    return { stage: 'Seedling', nextStage: 'Sprout', pointsNeeded: 51 - plant.pointsInvested };
  };

  const triggerCelebration = () => {
    setShowCelebration(true);
    setNewPlantMessage('🌱 Your garden is flourishing! Keep making sustainable choices!');
    setTimeout(() => {
      setShowCelebration(false);
      setNewPlantMessage('');
    }, 4000);
  };

  const nextPlantPoints = (ecoPoints.plants_unlocked + 1) * 50;
  const progressToNext = ((ecoPoints.total % 50) / 50) * 100;

  return (
    <div style={rewardStyles.container}>
      <h1 style={rewardStyles.title}>🌱 Your Virtual Garden</h1>
      
      <div style={rewardStyles.pointsSummary}>
        <div style={rewardStyles.pointsCard}>
          <h3 style={rewardStyles.cardTitle}>🏆 Total EcoPoints</h3>
          <div style={rewardStyles.pointsValue}>{ecoPoints.total}</div>
          <div style={rewardStyles.cardSubtext}>Keep earning to evolve your plants!</div>
        </div>
        
        <div style={rewardStyles.pointsCard}>
          <h3 style={rewardStyles.cardTitle}>🌿 Plants Unlocked</h3>
          <div style={rewardStyles.pointsValue}>{ecoPoints.plants_unlocked}</div>
          <div style={rewardStyles.cardSubtext}>
            {plants.filter(p => p.type === 'tree').length} trees, {plants.filter(p => p.type === 'sprout').length} sprouts, {plants.filter(p => p.type === 'seedling').length} seedlings
          </div>
        </div>
        
        <div style={rewardStyles.progressCard}>
          <h3 style={rewardStyles.cardTitle}>🌱 Next Plant Progress</h3>
          <div style={rewardStyles.progressContainer}>
            <div style={rewardStyles.progressBar}>
              <div 
                style={{
                  ...rewardStyles.progressFill,
                  width: `${progressToNext}%`
                }}
              />
              <div style={rewardStyles.progressGlow} />
            </div>
            <div style={rewardStyles.progressText}>
              {ecoPoints.total % 50} / 50 points
            </div>
          </div>
        </div>
      </div>

      <div style={rewardStyles.gardenContainer}>
        <svg width="900" height="500" style={rewardStyles.gardenSvg} viewBox="0 0 900 500">
          <defs>
            <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#87CEEB" />
              <stop offset="50%" stopColor="#B0E0E6" />
              <stop offset="100%" stopColor="#E0F6FF" />
            </linearGradient>
            <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#90EE90" />
              <stop offset="50%" stopColor="#32CD32" />
              <stop offset="100%" stopColor="#228B22" />
            </linearGradient>
            <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#FFA500" />
            </radialGradient>
            <filter id="cloudShadow">
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.1)" />
            </filter>
          </defs>
          
          {/* Sky background */}
          <rect width="900" height="350" fill="url(#skyGradient)" />
          
          {/* Ground */}
          <rect y="350" width="900" height="150" fill="url(#groundGradient)" />
          
          {/* Sun with glow effect */}
          <circle cx="750" cy="100" r="45" fill="url(#sunGradient)" />
          <circle cx="750" cy="100" r="50" fill="#FFD700" opacity="0.3" />
          
          {/* Animated clouds */}
          <g opacity="0.8" filter="url(#cloudShadow)">
            <ellipse cx="200" cy="80" rx="35" ry="18" fill="white">
              <animateTransform 
                attributeName="transform" 
                type="translate" 
                values="0,0; 10,0; 0,0" 
                dur="6s" 
                repeatCount="indefinite" 
              />
            </ellipse>
            <ellipse cx="225" cy="80" rx="28" ry="15" fill="white">
              <animateTransform 
                attributeName="transform" 
                type="translate" 
                values="0,0; 8,0; 0,0" 
                dur="6s" 
                repeatCount="indefinite" 
              />
            </ellipse>
          </g>
          
          <g opacity="0.7" filter="url(#cloudShadow)">
            <ellipse cx="550" cy="120" rx="40" ry="20" fill="white">
              <animateTransform 
                attributeName="transform" 
                type="translate" 
                values="0,0; -12,0; 0,0" 
                dur="8s" 
                repeatCount="indefinite" 
              />
            </ellipse>
            <ellipse cx="580" cy="120" rx="32" ry="16" fill="white">
              <animateTransform 
                attributeName="transform" 
                type="translate" 
                values="0,0; -10,0; 0,0" 
                dur="8s" 
                repeatCount="indefinite" 
              />
            </ellipse>
          </g>
          
          {/* Garden path - centered */}
          <ellipse cx="450" cy="420" rx="350" ry="25" fill="#8B7355" opacity="0.6" />
          
          {/* Render plants with evolution system */}
          {plants.map((plant) => (
            <g key={plant.id}>
              <g style={{ 
                animation: `plantGrow 0.8s ease-out ${plant.animationDelay}s both` 
              }}>
                {renderPlant(plant)}
              </g>
              
              {/* Enhanced plant info tooltip on hover */}
              {hoveredPlant === plant.id && (
                <g>
                  <rect 
                    x={plant.x - 50} 
                    y={plant.y - 90} 
                    width="100" 
                    height="45" 
                    fill="rgba(0,0,0,0.85)" 
                    rx="6" 
                  />
                  <text 
                    x={plant.x} 
                    y={plant.y - 72} 
                    textAnchor="middle" 
                    fontSize="12" 
                    fill="white"
                    fontWeight="bold"
                  >
                    {getPlantStageInfo(plant).stage} #{plant.id + 1}
                  </text>
                  <text 
                    x={plant.x} 
                    y={plant.y - 58} 
                    textAnchor="middle" 
                    fontSize="10" 
                    fill="#90EE90"
                  >
                    {plant.pointsInvested} points invested
                  </text>
                  {getPlantStageInfo(plant).pointsNeeded > 0 && (
                    <text 
                      x={plant.x} 
                      y={plant.y - 46} 
                      textAnchor="middle" 
                      fontSize="9" 
                      fill="#FFD700"
                    >
                      {getPlantStageInfo(plant).pointsNeeded} pts to {getPlantStageInfo(plant).nextStage}
                    </text>
                  )}
                </g>
              )}
            </g>
          ))}
          
          {/* Empty planting spots - centered */}
          {ecoPoints.plants_unlocked < 10 && (
            <g opacity="0.4">
              {Array.from({ length: Math.min(2, 10 - ecoPoints.plants_unlocked) }, (_, i) => {
                const spotIndex = ecoPoints.plants_unlocked + i;
                const plantsPerRow = Math.min(6, Math.ceil(Math.sqrt(ecoPoints.plants_unlocked + i + 1)));
                const currentRow = Math.floor(spotIndex / plantsPerRow);
                const currentCol = spotIndex % plantsPerRow;
                const gardenWidth = 800;
                const plantSpacing = Math.min(120, gardenWidth / (plantsPerRow + 1));
                const rowWidth = (plantsPerRow - 1) * plantSpacing;
                const rowStartX = (gardenWidth - rowWidth) / 2;
                const x = rowStartX + currentCol * plantSpacing;
                const y = 250 + currentRow * 80;
                
                return (
                  <g key={`empty-${i}`}>
                    <circle cx={x} cy={y + 45} r="22" fill="#8B4513" opacity="0.3" />
                    <circle cx={x} cy={y + 45} r="18" fill="#A0522D" opacity="0.2" />
                    <text x={x} y={y + 75} textAnchor="middle" fontSize="11" fill="#666">
                      {(spotIndex + 1) * 50} pts
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>
        
        {showCelebration && (
          <div style={rewardStyles.celebration}>
            <div style={rewardStyles.celebrationMessage}>
              {newPlantMessage}
            </div>
            <div style={rewardStyles.confetti}>
              {Array.from({ length: 20 }, (_, i) => (
                <div 
                  key={i} 
                  style={{
                    ...rewardStyles.confettiPiece,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5]
                  }} 
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={rewardStyles.gardenStats}>
        <div style={rewardStyles.stat}>
          <span style={rewardStyles.statIcon}>🌱</span>
          <span style={rewardStyles.statLabel}>Evolution System:</span>
          <span style={rewardStyles.statValue}>
            50pts → Sprout → 100pts → Tree
          </span>
        </div>
        <div style={rewardStyles.stat}>
          <span style={rewardStyles.statIcon}>🌍</span>
          <span style={rewardStyles.statLabel}>Carbon Saved:</span>
          <span style={rewardStyles.statValue}>
            {(ecoPoints.total * 0.5).toFixed(1)} kg CO₂e
          </span>
        </div>
        <div style={rewardStyles.stat}>
          <span style={rewardStyles.statIcon}>🎯</span>
          <span style={rewardStyles.statLabel}>Next Plant:</span>
          <span style={rewardStyles.statValue}>
            {nextPlantPoints} points
          </span>
        </div>
      </div>

      <div style={rewardStyles.demoSection}>
        <button onClick={triggerCelebration} style={rewardStyles.demoButton}>
          🎉 Celebrate Growth
        </button>
      </div>
    </div>
  );
};

const rewardStyles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center' as const,
  },
  title: {
    color: '#2d5016',
    marginBottom: '2rem',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  pointsSummary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  pointsCard: {
    background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    textAlign: 'center' as const,
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  progressCard: {
    background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
    color: 'white',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(78, 205, 196, 0.3)',
    textAlign: 'center' as const,
  },
  cardTitle: {
    margin: '0 0 1rem 0',
    color: '#333',
    fontSize: '1.1rem',
    fontWeight: 600,
  },
  pointsValue: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: '0.5rem',
  },
  cardSubtext: {
    color: '#666',
    fontSize: '0.9rem',
    fontStyle: 'italic',
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    position: 'relative' as const,
    width: '100%',
    height: '12px',
    background: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '6px',
    overflow: 'hidden',
    margin: '1rem 0 0.5rem 0',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #FFD700, #FFA500)',
    borderRadius: '6px',
    transition: 'width 0.5s ease',
    position: 'relative' as const,
  },
  progressGlow: {
    position: 'absolute' as const,
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
    animation: 'shimmer 2s infinite',
  },
  progressText: {
    fontSize: '0.9rem',
    color: 'white',
    fontWeight: 'bold',
  },
  gardenContainer: {
    position: 'relative' as const,
    background: 'linear-gradient(135deg, #f0f8ff, #e6f3ff)',
    borderRadius: '20px',
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)',
    margin: '2rem 0',
    overflow: 'hidden',
    border: '3px solid rgba(78, 205, 196, 0.2)',
  },
  gardenSvg: {
    width: '100%',
    height: 'auto',
    display: 'block',
    margin: '0 auto', // Center the SVG
  },
  celebration: {
    position: 'absolute' as const,
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none' as const,
    zIndex: 10,
  },
  celebrationMessage: {
    background: 'rgba(78, 205, 196, 0.95)',
    color: 'white',
    padding: '1.5rem 3rem',
    borderRadius: '30px',
    fontWeight: 'bold',
    fontSize: '1.3rem',
    textAlign: 'center' as const,
    animation: 'bounce 0.6s ease-out',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(10px)',
  },
  confetti: {
    position: 'absolute' as const,
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    pointerEvents: 'none' as const,
  },
  confettiPiece: {
    position: 'absolute' as const,
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    animation: 'confettiFall 3s linear infinite',
  },
  gardenStats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '3rem',
    margin: '2rem 0',
    flexWrap: 'wrap' as const,
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'white',
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(78, 205, 196, 0.2)',
  },
  statIcon: {
    fontSize: '1.5rem',
  },
  statLabel: {
    color: '#666',
    fontWeight: 500,
  },
  statValue: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  demoSection: {
    textAlign: 'center' as const,
    marginTop: '2rem',
  },
  demoButton: {
    background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
    color: 'white',
    border: 'none',
    padding: '1.2rem 2.5rem',
    borderRadius: '30px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 24px rgba(78, 205, 196, 0.3)',
  },
};