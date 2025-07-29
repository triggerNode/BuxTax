import React, { createContext, useContext, useReducer, useRef, ReactNode } from 'react';
import { ParsedPayoutData } from '@/utils/csvParser';

// State structure for each tab
interface ProfitCalculatorState {
  grossRobux: string;
  adSpend: string;
  groupSplits: string;
  affiliatePayouts: string;
  refunds: string;
  otherCosts: string;
  showAdvanced: boolean;
}

interface GoalSeekerState {
  targetPayout: string;
  deadline: string;
  expectedAdSpend: string;
  expectedOtherCosts: string;
}

interface PayoutPulseState {
  parsedData: ParsedPayoutData[];
  timePeriod: "daily" | "weekly";
  viewMode: "robux" | "usd";
  dateRange: "all" | "30d" | "90d";
  isLoading: boolean;
  showColumnMapper: boolean;
  detectedHeaders: string[];
  suggestedMapping: any;
}

// Combined state for each user type
interface UserTypeState {
  profitCalculator: ProfitCalculatorState;
  goalSeeker: GoalSeekerState;
  payoutPulse: PayoutPulseState;
}

// Main app state
interface AppState {
  gameDev: UserTypeState;
  ugcCreator: UserTypeState;
}

// Action types
type AppAction = 
  | { type: 'SET_PROFIT_CALCULATOR'; userType: 'gameDev' | 'ugcCreator'; payload: Partial<ProfitCalculatorState> }
  | { type: 'SET_GOAL_SEEKER'; userType: 'gameDev' | 'ugcCreator'; payload: Partial<GoalSeekerState> }
  | { type: 'SET_PAYOUT_PULSE'; userType: 'gameDev' | 'ugcCreator'; payload: Partial<PayoutPulseState> }
  | { type: 'CLEAR_USER_TYPE'; userType: 'gameDev' | 'ugcCreator' };

// Default states
const defaultProfitCalculatorState: ProfitCalculatorState = {
  grossRobux: "10000",
  adSpend: "0",
  groupSplits: "0",
  affiliatePayouts: "0",
  refunds: "0",
  otherCosts: "0",
  showAdvanced: false,
};

const defaultGoalSeekerState: GoalSeekerState = {
  targetPayout: "",
  deadline: "",
  expectedAdSpend: "0",
  expectedOtherCosts: "0",
};

const defaultPayoutPulseState: PayoutPulseState = {
  parsedData: [],
  timePeriod: "daily",
  viewMode: "usd",
  dateRange: "all",
  isLoading: false,
  showColumnMapper: false,
  detectedHeaders: [],
  suggestedMapping: {},
};

const defaultUserTypeState: UserTypeState = {
  profitCalculator: defaultProfitCalculatorState,
  goalSeeker: defaultGoalSeekerState,
  payoutPulse: defaultPayoutPulseState,
};

const initialState: AppState = {
  gameDev: defaultUserTypeState,
  ugcCreator: defaultUserTypeState,
};

// Reducer
function appStateReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PROFIT_CALCULATOR':
      return {
        ...state,
        [action.userType]: {
          ...state[action.userType],
          profitCalculator: {
            ...state[action.userType].profitCalculator,
            ...action.payload,
          },
        },
      };
    case 'SET_GOAL_SEEKER':
      return {
        ...state,
        [action.userType]: {
          ...state[action.userType],
          goalSeeker: {
            ...state[action.userType].goalSeeker,
            ...action.payload,
          },
        },
      };
    case 'SET_PAYOUT_PULSE':
      return {
        ...state,
        [action.userType]: {
          ...state[action.userType],
          payoutPulse: {
            ...state[action.userType].payoutPulse,
            ...action.payload,
          },
        },
      };
    case 'CLEAR_USER_TYPE':
      return {
        ...state,
        [action.userType]: defaultUserTypeState,
      };
    default:
      return state;
  }
}

// Context type
interface AppStateContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  csvDataRef: React.MutableRefObject<{ [key: string]: ParsedPayoutData[] }>;
}

// Create context
const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

// Provider component
interface AppStateProviderProps {
  children: ReactNode;
}

export function AppStateProvider({ children }: AppStateProviderProps) {
  const [state, dispatch] = useReducer(appStateReducer, initialState);
  
  // Large data storage using useRef to avoid reducer bloat
  const csvDataRef = useRef<{ [key: string]: ParsedPayoutData[] }>({
    gameDev: [],
    ugcCreator: [],
  });

  return (
    <AppStateContext.Provider value={{ state, dispatch, csvDataRef }}>
      {children}
    </AppStateContext.Provider>
  );
}

// Hook to use context
export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}

// Selector hooks for convenience
export function useProfitCalculatorState(userType: 'gameDev' | 'ugcCreator') {
  const { state, dispatch } = useAppState();
  
  const profitState = state[userType].profitCalculator;
  
  const updateState = (updates: Partial<ProfitCalculatorState>) => {
    dispatch({ type: 'SET_PROFIT_CALCULATOR', userType, payload: updates });
  };

  return { profitState, updateState };
}

export function useGoalSeekerState(userType: 'gameDev' | 'ugcCreator') {
  const { state, dispatch, csvDataRef } = useAppState();
  
  const goalState = state[userType].goalSeeker;
  const csvData = csvDataRef.current[userType] || [];
  
  const updateState = (updates: Partial<GoalSeekerState>) => {
    dispatch({ type: 'SET_GOAL_SEEKER', userType, payload: updates });
  };

  return { goalState, updateState, csvData };
}

export function usePayoutPulseState(userType: 'gameDev' | 'ugcCreator') {
  const { state, dispatch, csvDataRef } = useAppState();
  
  const pulseState = state[userType].payoutPulse;
  
  const updateState = (updates: Partial<PayoutPulseState>) => {
    dispatch({ type: 'SET_PAYOUT_PULSE', userType, payload: updates });
  };
  
  const setCsvData = (data: ParsedPayoutData[]) => {
    csvDataRef.current[userType] = data;
    updateState({ parsedData: data });
  };
  
  const getCsvData = (): ParsedPayoutData[] => {
    return csvDataRef.current[userType] || [];
  };

  return { pulseState, updateState, setCsvData, getCsvData };
}

export function useClearUserType() {
  const { dispatch, csvDataRef } = useAppState();
  
  const clearUserType = (userType: 'gameDev' | 'ugcCreator') => {
    // Clear CSV data from ref
    csvDataRef.current[userType] = [];
    // Clear state
    dispatch({ type: 'CLEAR_USER_TYPE', userType });
  };
  
  return clearUserType;
}