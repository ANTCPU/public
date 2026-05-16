import React, { useState, useEffect, useCallback } from 'react';
import HUD from './components/HUD.tsx';
import AIAssistant from './components/AIAssistant.tsx';
import StoreLevel from './components/StoreLevel.tsx';
import OfficeLevel from './components/OfficeLevel.tsx';
import RooftopLevel from './components/RooftopLevel.tsx';
import MapScreen from './components/MapScreen.tsx';
import LandingScreen from './components/LandingScreen.tsx';
import StartupGuide from './components/StartupGuide.tsx';
import MapSplash from './components/MapSplash.tsx';
import SystemMessage, { SystemMessageData } from './components/SystemMessage.tsx';
import CryptoDetailModal from './components/CryptoDetailModal.tsx';
import GameManual from './components/GameManual.tsx';
import { GameState, GameLevel, Mission, Transaction, BossState } from './types.ts';
import { generateBossChallenge } from './services/geminiService.ts';

const INITIAL_MISSIONS: Record<number, Mission[]> = {
  1: [
    { id: 'sell_10', description: "Sell 10 Items", target: 10, current: 0, completed: false, rewardXp: 50 },
    { id: 'earn_1000', description: "Earn $1,000 Revenue", target: 1000, current: 0, completed: false, rewardXp: 100 },
    { id: 'hire_sales', description: "Hire Sales Team", target: 1, current: 0, completed: false, rewardXp: 200 },
    { id: 'hire_tech', description: "Hire Systems Tech", target: 1, current: 0, completed: false, rewardXp: 200 },
    { id: 'inventory_20', description: "Stock 20 Items", target: 20, current: 0, completed: false, rewardXp: 100 },
    { id: 'marketing_5', description: "Reach Marketing Lvl 5", target: 5, current: 0, completed: false, rewardXp: 250 },
    { id: 'marketing_10', description: "Reach Marketing Lvl 10", target: 10, current: 0, completed: false, rewardXp: 500 },
    { id: 'campaigns_5', description: "Run 5 Campaigns", target: 5, current: 0, completed: false, rewardXp: 150 },
    { id: 'wealth_5000', description: "Hold $5,000 Cash", target: 5000, current: 0, completed: false, rewardXp: 300 },
    { id: 'grand_opening', description: "Save $25,000 for Office", target: 25000, current: 0, completed: false, rewardXp: 1000 },
  ],
  2: [
    { id: 'build_web', description: "Calibrate Web Server", target: 1, current: 0, completed: false, rewardXp: 200 },
    { id: 'contract_web_1', description: "Ship 3 Website Contracts", target: 3, current: 0, completed: false, rewardXp: 300 },
    { id: 'build_email', description: "Sync Email Server", target: 1, current: 0, completed: false, rewardXp: 300 },
    { id: 'contract_email_1', description: "Manage 3 CRM Systems", target: 3, current: 0, completed: false, rewardXp: 400 },
    { id: 'build_bot', description: "Initialize AntBot Core", target: 1, current: 0, completed: false, rewardXp: 500 },
    { id: 'contract_bot_1', description: "Deploy 3 Custom Bots", target: 3, current: 0, completed: false, rewardXp: 600 },
    { id: 'revenue_50k', description: "Earn $50,000 Revenue", target: 50000, current: 0, completed: false, rewardXp: 800 },
    { id: 'crypto_hold', description: "Mine/Hold 2000 ANT", target: 2000, current: 0, completed: false, rewardXp: 1000 },
    { id: 'contract_master', description: "Complete 20 Total Jobs", target: 20, current: 0, completed: false, rewardXp: 1500 },
    { id: 'boss_prep', description: "Amass $100,000 for IPO", target: 100000, current: 0, completed: false, rewardXp: 2500 },
  ],
  3: [
    { id: 'part_0', description: "Build Chassis", target: 1, current: 0, completed: false, rewardXp: 500 },
    { id: 'part_1', description: "Install Motors", target: 1, current: 0, completed: false, rewardXp: 500 },
    { id: 'part_2', description: "Mount Propellers", target: 1, current: 0, completed: false, rewardXp: 500 },
    { id: 'part_3', description: "Connect Battery", target: 1, current: 0, completed: false, rewardXp: 500 },
    { id: 'part_4', description: "Configure ESC", target: 1, current: 0, completed: false, rewardXp: 500 },
    { id: 'part_5', description: "Setup Flight Controller", target: 1, current: 0, completed: false, rewardXp: 500 },
    { id: 'part_6', description: "Sync GPS Module", target: 1, current: 0, completed: false, rewardXp: 500 },
    { id: 'part_7', description: "Install 4K Camera", target: 1, current: 0, completed: false, rewardXp: 500 },
    { id: 'part_8', description: "Pair Transmitter", target: 1, current: 0, completed: false, rewardXp: 500 },
    { id: 'part_9', description: "Test LED Systems", target: 1, current: 0, completed: false, rewardXp: 500 },
  ]
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    view: 'LANDING',
    level: GameLevel.STORE,
    maxUnlockedLevel: 0,
    highestCompletedLevel: 0,
    money: 0,
    bankHistory: [],
    crypto: 1000,
    cryptoHistory: [],
    usdc: 0,
    dogecoin: 0,
    picoin: 0,
    marketPrices: { ant: 1.24, doge: 0.14, pi: 0.22 },
    portfolioHistory: [],
    xp: 0,
    inventory: 0,
    stockCounts: { 'cpu': 0, 'ram': 0, 'ssd': 0, 'gpu': 0, 'mobo': 0 },
    itemSales: { 'cpu': 0, 'ram': 0, 'ssd': 0, 'gpu': 0, 'mobo': 0 },
    autoRestock: false,
    autoMarketing: false,
    marketingLevel: 0,
    activeCampaign: null,
    campaignHistory: { 'flyers': 0, 'social': 0, 'radio': 0, 'influencer': 0 },
    employees: { salesman: 0, sales_girl: 0, tech_girl: 0 },
    serverLevel: 0,
    officeFacilities: { web: false, email: false, bot: false },
    activeJobs: [],
    droneParts: new Array(10).fill(false),
    eCycle: 0,
    eCycleLevel: 1,
    missions: INITIAL_MISSIONS[1],
    missionProgress: JSON.parse(JSON.stringify(INITIAL_MISSIONS)),
    referralCode: 'ANT-' + Math.floor(Math.random() * 10000),
    referralActivated: false,
    playerName: 'Guest',
    isGuest: true,
    isAdmin: false,
    stats: {
      itemsSold: 0,
      marketingCampaigns: 0,
      seoJobs: 0,
      designJobs: 0,
      appJobs: 0,
      cryptoMined: 0
    },
    flags: {
      ramAirdrop: false
    },
    hasWalletNotification: false,
    debugFlags: {
        infiniteMoney: false,
        autoComplete: false,
        suppressBoss: false,
        unlockAll: false
    },
    errorLog: []
  });

  const [activeBoss, setActiveBoss] = useState<BossState | null>(null);
  const [bossTimer, setBossTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [systemMessage, setSystemMessage] = useState<SystemMessageData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [viewingAsset, setViewingAsset] = useState<'ANT' | 'DOGE' | 'PI' | 'USDC' | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('antcpu_save_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGameState(prev => ({
          ...prev,
          ...parsed,
          activeCampaign: parsed.activeCampaign || null,
          marketPrices: parsed.marketPrices || { ant: 1.24, doge: 0.14, pi: 0.22 },
          view: parsed.view === 'MAP_SPLASH' ? 'MAP' : (parsed.view || 'LANDING'),
        }));
      } catch (e) {
        console.error("Save load failed", e);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('antcpu_save_v1', JSON.stringify(gameState));
    }
  }, [gameState, isInitialized]);

  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (activeBoss) {
          setBossTimer(30);
          interval = setInterval(() => {
              setBossTimer(prev => {
                  if (prev <= 1) {
                      handleBossResponse(false);
                      clearInterval(interval);
                      return 0;
                  }
                  return prev - 1;
              });
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [activeBoss]);

  useEffect(() => {
    if (!isInitialized) return;
    
    const interval = setInterval(() => {
        setGameState(prev => {
            const newAnt = Math.max(0.1, prev.marketPrices.ant + (Math.random() - 0.5) * 0.05);
            const newDoge = Math.max(0.05, prev.marketPrices.doge + (Math.random() - 0.5) * 0.005);
            const newPi = Math.max(0.15, prev.marketPrices.pi + (Math.random() - 0.5) * 0.01);

            const cryptoValue = (prev.crypto * newAnt) + (prev.dogecoin * newDoge) + ((prev.picoin || 0) * newPi) + (prev.usdc || 0);
            const totalValue = prev.money + cryptoValue;
            
            const now = new Date();
            const timeLabel = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
            
            const newHistory = [...prev.portfolioHistory, { time: timeLabel, value: totalValue }].slice(-20);

            return {
                ...prev,
                marketPrices: { ant: newAnt, doge: newDoge, pi: newPi },
                portfolioHistory: newHistory
            };
        });
    }, 5000);

    return () => clearInterval(interval);
  }, [isInitialized]);

  useEffect(() => {
      if (!isInitialized) return;

      const checkLevelCompletion = (lvl: number) => {
          const missions = gameState.missionProgress[lvl];
          if (missions && missions.length > 0 && missions.every(m => m.completed)) {
              if (gameState.highestCompletedLevel < lvl) {
                  setGameState(prev => ({ ...prev, highestCompletedLevel: lvl }));
              }
          }
      };
      checkLevelCompletion(1);
      checkLevelCompletion(2);
  }, [gameState.missionProgress, isInitialized, gameState.highestCompletedLevel]);

  const updateState = useCallback((updates: Partial<GameState>) => {
    setGameState(prev => {
      let newBankHistory = prev.bankHistory;
      let newCryptoHistory = prev.cryptoHistory;

      if (updates.money !== undefined && updates.money !== prev.money) {
          const diff = updates.money - prev.money;
          if (Math.abs(diff) > 0) {
              const transaction: Transaction = {
                  id: Date.now().toString() + Math.random().toString(),
                  amount: diff,
                  reason: diff > 0 ? 'Revenue' : 'Expense',
                  timestamp: Date.now()
              };
              newBankHistory = [transaction, ...prev.bankHistory].slice(0, 20);
          }
      }

      const cryptoAssets: (keyof GameState)[] = ['crypto', 'dogecoin', 'picoin', 'usdc'];
      cryptoAssets.forEach(asset => {
         if (updates[asset] !== undefined && (updates[asset] as number) !== (prev[asset] as number)) {
             const diff = (updates[asset] as number) - (prev[asset] as number);
             if (Math.abs(diff) > 0.000001) {
                 const assetName = asset === 'crypto' ? 'ANT' : asset === 'dogecoin' ? 'DOGE' : asset === 'picoin' ? 'PI' : 'USDC';
                 const transaction: Transaction = {
                     id: `0x${Math.random().toString(16).substr(2, 8)}`,
                     amount: diff,
                     reason: `${assetName} Txn`,
                     timestamp: Date.now()
                 };
                 newCryptoHistory = [transaction, ...newCryptoHistory].slice(0, 20);
             }
         }
      });

      const newState = { 
          ...prev, 
          ...updates,
          bankHistory: updates.bankHistory || newBankHistory,
          cryptoHistory: updates.cryptoHistory || newCryptoHistory
      };
      
      if (newState.activeCampaign && Date.now() > newState.activeCampaign.endTime) {
          newState.activeCampaign = null;
      }

      if (updates.missions) {
        newState.missionProgress = {
          ...prev.missionProgress,
          [newState.level]: updates.missions
        };
      }
      
      return newState;
    });
  }, []);

  const logError = useCallback((msg: string) => {
      console.warn(msg);
      setGameState(prev => ({
          ...prev,
          errorLog: [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.errorLog].slice(0, 50)
      }));
  }, []);

  const showSystemMessage = useCallback((data: SystemMessageData) => {
    setSystemMessage(data);
  }, []);

  const handleStartJourney = useCallback((skipIntro = false, username = 'Guest', isAdmin = false) => {
    const lowerUser = username.toLowerCase();
    let startMoney = 1000;
    let startLevel = 0;
    let completedLevel = 0;
    let isGuest = true;
    
    if (isAdmin && lowerUser === 'admin') {
        startMoney = 1000000000;
        startLevel = 3;
        completedLevel = 3;
        isGuest = false;
    } else if (isAdmin && lowerUser === 'tester') {
        startMoney = 50000;
        startLevel = 1; 
        completedLevel = 1;
        isGuest = false;
    } else {
        if (username !== 'Guest') isGuest = false;
    }

    const nextView = skipIntro ? 'MAP_SPLASH' : 'EMAIL';
    
    updateState({ 
        view: nextView, 
        money: startMoney, 
        playerName: username, 
        isAdmin: isAdmin,
        isGuest: isGuest,
        maxUnlockedLevel: startLevel,
        highestCompletedLevel: completedLevel
    });
  }, [updateState]);

  const handleRegisterUser = useCallback((username: string) => {
      updateState({ playerName: username, isGuest: false });
  }, [updateState]);

  const handleStartupComplete = useCallback((success: boolean) => {
    setGameState(prev => ({ 
      ...prev, 
      view: 'MAP_SPLASH',
      money: prev.money > 1000 ? prev.money : 1000
    }));
  }, []);

  const handleSplashComplete = useCallback(() => {
    updateState({ view: 'MAP' });
  }, [updateState]);

  const handleLevelUnlock = useCallback((level: GameLevel, cost: number) => {
    setGameState(prev => {
        const newMax = Math.max(prev.maxUnlockedLevel, level);
        const nextState = {
            ...prev,
            money: prev.money - cost,
            maxUnlockedLevel: newMax,
            level: level, 
            missions: prev.missionProgress[level] || INITIAL_MISSIONS[level],
            view: 'GAME' as const
        };
        localStorage.setItem('antcpu_save_v1', JSON.stringify(nextState));
        return nextState;
    });
  }, []);

  const handleEnterLevel = useCallback((level: GameLevel) => {
     setGameState(prev => ({
       ...prev,
       level: level,
       missions: prev.missionProgress[level] || INITIAL_MISSIONS[level],
       view: 'GAME'
     }));
  }, []);

  const triggerBossChallenge = useCallback(async () => {
    if (loading || activeBoss) return;
    setLoading(true);

    try {
        const isRepeat = gameState.highestCompletedLevel >= gameState.level;

        if (isRepeat) {
            const options = [
                { id: 1, icon: '🤖', isCorrect: false },
                { id: 2, icon: '🤖', isCorrect: false },
                { id: 3, icon: '👤', isCorrect: true },
                { id: 4, icon: '🤖', isCorrect: false },
            ].sort(() => Math.random() - 0.5);

            setActiveBoss({
                type: 'CAPTCHA',
                captchaData: {
                    question: "VERIFY HUMANITY: IDENTIFY THE FOUNDER",
                    options: options
                }
            });
            return;
        }

        let challenge = await generateBossChallenge(gameState.level);
        
        if (!challenge || !challenge.scenario) {
             challenge = {
                 scenario: "CRITICAL SYSTEM FAILURE. REBOOT REQUIRED.",
                 choices: [
                     { text: "HARD REBOOT", outcome: "SUCCESS", success: true },
                     { text: "WAIT", outcome: "FAILED", success: false },
                     { text: "PANIC", outcome: "FAILED", success: false }
                 ],
                 type: 'SCENARIO'
             } as any;
        }
        
        setActiveBoss({ type: 'SCENARIO', ...challenge });

    } catch (e) {
        setActiveBoss({
             type: 'SCENARIO',
             scenario: "CONNECTION LOST. EMERGENCY PROTOCOL ACTIVATED.",
             choices: [{ text: "PROCEED", outcome: "SAFE MODE", success: true }]
        });
    } finally {
        setLoading(false);
    }
  }, [gameState.level, gameState.highestCompletedLevel, loading, activeBoss]);

  const handleBossResponse = useCallback((success: boolean) => {
    setActiveBoss(null);
    setBossTimer(30);

    if (success) {
      setGameState(prev => {
          const current = prev.level;
          const newHighest = Math.max(prev.highestCompletedLevel, current);
          const next = { ...prev, highestCompletedLevel: newHighest };
          localStorage.setItem('antcpu_save_v1', JSON.stringify(next));
          return next;
      });

      if (gameState.level === GameLevel.STORE) {
        showSystemMessage({
          title: "BASIC TRAINING COMPLETE",
          message: "Congratulations, Founder.\n\nYou have mastered retail. Proceed to antcpu enterprises.",
          type: 'SUCCESS',
          actionLabel: "ESTABLISH ENTERPRISE HQ",
          onAction: () => {
             setGameState(prev => ({
                 ...prev,
                 highestCompletedLevel: 1, 
                 money: prev.money < 25000 ? 25000 : prev.money,
                 view: 'MAP'
             }));
          }
        });
      } else {
        showSystemMessage({
          title: "SECTOR SECURED",
          message: "Operations self-sustaining. Expansion available.",
          type: 'SUCCESS',
          actionLabel: "RETURN TO MAP",
          onAction: () => updateState({ view: 'MAP' })
        });
      }
    } else {
      showSystemMessage({
        title: "SETBACK DETECTED",
        message: "Action failed or timed out. Penalty applied.",
        type: 'ALERT',
        actionLabel: "ACKNOWLEDGE",
        onAction: () => updateState({ 
          money: Math.floor(gameState.money * 0.8),
          view: 'MAP'
        })
      });
    }
  }, [gameState.level, gameState.money, showSystemMessage, updateState]);

  const handleActivateReferral = useCallback(() => {
     updateState({ referralActivated: true });
  }, [updateState]);

  if (!isInitialized) return null;

  return (
    <div className="min-h-screen bg-ant-dark text-white font-mono flex flex-col overflow-hidden">
      
      {gameState.view === 'LANDING' && (
        <LandingScreen onStart={handleStartJourney} />
      )}

      {gameState.view === 'EMAIL' && (
        <StartupGuide onComplete={handleStartupComplete} />
      )}

      {gameState.view === 'MAP_SPLASH' && (
        <MapSplash onComplete={handleSplashComplete} />
      )}

      {(gameState.view === 'GAME' || gameState.view === 'MAP') && (
        <>
          <HUD 
            state={gameState} 
            updateState={updateState}
            onMapClick={gameState.view === 'GAME' ? () => updateState({ view: 'MAP' }) : undefined}
            onViewAsset={(asset) => {
              setViewingAsset(asset);
              setActiveModal('CRYPTO_DETAIL');
            }}
          />
          <AIAssistant 
            gameState={gameState} 
            onActivateReferral={handleActivateReferral}
            updateState={updateState}
            activeModal={activeModal}
            setActiveModal={setActiveModal}
            hasSystemMessage={!!systemMessage}
          />
        </>
      )}

      {(gameState.view === 'MAP' || gameState.view === 'GAME') && (
        <div className="flex-1 p-0 md:p-8 max-w-7xl mx-auto w-full flex relative">
          
          <div className="flex-1 min-h-[600px] flex flex-col relative w-full">
             {loading && (
               <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
                 <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-ant-green"></div>
               </div>
             )}

             {gameState.view === 'MAP' && (
               <MapScreen 
                 gameState={gameState} 
                 onEnterLevel={handleEnterLevel} 
                 onUnlockLevel={handleLevelUnlock}
                 onRegisterUser={handleRegisterUser}
               />
             )}

             {gameState.view === 'GAME' && gameState.level === GameLevel.STORE && (
               <StoreLevel 
                 gameState={gameState} 
                 updateState={updateState} 
                 triggerBoss={triggerBossChallenge}
                 activeModal={activeModal}
                 setActiveModal={setActiveModal}
                 showMessage={showSystemMessage}
                 logError={logError}
               />
             )}
             {gameState.view === 'GAME' && gameState.level === GameLevel.OFFICE && (
               <OfficeLevel 
                 gameState={gameState} 
                 updateState={updateState} 
                 triggerBoss={triggerBossChallenge} 
                 logError={logError}
                 showMessage={showSystemMessage}
               />
             )}
             {gameState.view === 'GAME' && gameState.level === GameLevel.ROOFTOP && (
               <RooftopLevel 
                 gameState={gameState} 
                 updateState={updateState} 
                 triggerBoss={triggerBossChallenge}
                 logError={logError}
                 showMessage={showSystemMessage} 
               />
             )}
          </div>

          {gameState.view === 'GAME' && activeModal === 'MISSIONS' && (
             <div className="absolute right-20 top-4 bottom-4 w-80 bg-ant-panel/95 border border-ant-green rounded p-4 shadow-xl z-30 animate-slide-left backdrop-blur-sm overflow-hidden flex flex-col">
                  <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-2">
                    <h3 className="text-ant-green font-bold uppercase">
                      Current Objectives
                    </h3>
                    <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white">✕</button>
                  </div>
                  
                  <ul className="space-y-2 overflow-y-auto flex-1 pr-2">
                    {gameState.missions.map(m => (
                      <li key={m.id} className={`text-sm p-3 rounded border ${m.completed ? 'bg-green-900/20 border-green-800' : 'bg-gray-800/50 border-gray-700'}`}>
                        <div className="flex justify-between mb-1">
                          <span className={m.completed ? "text-green-500 font-bold" : "text-gray-200"}>{m.description}</span>
                          {m.completed && <span className="text-green-500">✓</span>}
                        </div>
                        {!m.completed && (
                          <div className="w-full bg-gray-900 rounded-full h-1.5 mt-1">
                            <div 
                              className="h-1.5 rounded-full bg-blue-500 transition-all duration-500" 
                              style={{ width: `${(m.current / m.target) * 100}%` }}>
                            </div>
                            <div className="text-[10px] text-right mt-1 text-gray-500">{m.current.toFixed(0)} / {m.target}</div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-center text-gray-500">
                    COMPLETE ALL TO ADVANCE
                  </div>
             </div>
          )}
        </div>
      )}

      {systemMessage && (
        <SystemMessage 
          data={systemMessage} 
          onClose={() => setSystemMessage(null)} 
        />
      )}
      
      {activeModal === 'MANUAL' && (
        <GameManual onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'CRYPTO_DETAIL' && viewingAsset && (
        <CryptoDetailModal 
          asset={viewingAsset}
          gameState={gameState}
          onClose={() => setActiveModal(null)}
          onBuy={() => setActiveModal(null)}
          onSwap={() => setActiveModal(null)}
        />
      )}

      {activeBoss && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in">
           <div className="relative w-full max-w-2xl bg-black border-2 border-red-500 rounded shadow-[0_0_50px_rgba(220,38,38,0.5)] flex flex-col max-h-[90%] overflow-hidden">
               
               <div className="absolute top-0 left-0 h-1 bg-red-600 transition-all duration-1000 ease-linear z-20" style={{ width: `${(bossTimer / 30) * 100}%` }}></div>
               <div className="absolute top-2 right-2 text-red-500 font-bold font-mono z-20 bg-black/80 px-2 rounded">
                   T-MINUS: {bossTimer}s
               </div>

               {activeBoss.type === 'SCENARIO' && (
                 <div className="bg-red-900/10 p-8 overflow-y-auto max-h-screen">
                    <h1 className="text-3xl font-bold text-red-500 mb-4 uppercase tracking-widest">CRITICAL EVENT</h1>
                    <p className="text-xl text-white mb-8 font-mono border-l-4 border-red-500 pl-4">{activeBoss.scenario}</p>
                    <div className="grid gap-4">
                       {activeBoss.choices?.map((choice, idx) => (
                         <button 
                           key={idx}
                           onClick={() => {
                             handleBossResponse(choice.success);
                           }}
                           className="bg-gray-800 hover:bg-red-800 border border-red-900 text-left p-4 rounded transition-colors text-gray-200 hover:text-white flex items-center gap-3"
                         >
                           <span className="font-bold text-red-500">{idx + 1}.</span> {choice.text}
                         </button>
                       ))}
                    </div>
                 </div>
               )}

               {activeBoss.type === 'CAPTCHA' && (
                 <div className="bg-blue-900/10 p-8 flex flex-col items-center text-center">
                    <div className="text-4xl mb-2 animate-pulse">🛡️</div>
                    <h1 className="text-2xl font-bold text-blue-400 mb-4 uppercase tracking-widest">SECURITY VERIFICATION</h1>
                    <p className="text-sm text-gray-300 mb-6 font-mono">{activeBoss.captchaData?.question}</p>
                    
                    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                       {activeBoss.captchaData?.options.map((opt, idx) => (
                           <button
                             key={idx}
                             onClick={() => handleBossResponse(opt.isCorrect)}
                             className="bg-gray-800 hover:bg-gray-700 border border-gray-600 p-6 rounded text-4xl hover:scale-105 transition-transform"
                           >
                               {opt.icon}
                           </button>
                       ))}
                    </div>
                    <div className="mt-4 text-[10px] text-gray-500 font-mono">
                        antcpu secure protocol v9.0
                    </div>
                 </div>
               )}
           </div>
        </div>
      )}
    </div>
  );
};

export default App;