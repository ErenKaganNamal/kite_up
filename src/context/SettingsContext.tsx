import React, { createContext, useContext, useState } from 'react';
import { SPOTS } from '../services/windService';

interface SettingsContextType {
  selectedLocations: number[];   // indices into SPOTS array
  minKnots: number;              // 0-40
  toggleLocation: (idx: number) => void;
  selectAll: () => void;
  setMinKnots: (v: number) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  selectedLocations: SPOTS.map((_, i) => i),
  minKnots: 0,
  toggleLocation: () => {},
  selectAll: () => {},
  setMinKnots: () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLocations, setSelectedLocations] = useState<number[]>(
    SPOTS.map((_, i) => i), // all selected by default
  );
  const [minKnots, setMinKnotsState] = useState(0);

  const toggleLocation = (idx: number) => {
    setSelectedLocations(prev =>
      prev.includes(idx)
        ? prev.length > 1 ? prev.filter(i => i !== idx) : prev // keep at least 1
        : [...prev, idx].sort((a, b) => a - b),
    );
  };

  const selectAll = () => setSelectedLocations(SPOTS.map((_, i) => i));

  const setMinKnots = (v: number) => setMinKnotsState(Math.min(40, Math.max(0, v)));

  return (
    <SettingsContext.Provider value={{ selectedLocations, minKnots, toggleLocation, selectAll, setMinKnots }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
