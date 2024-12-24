import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ConsoleContextProps {
  logs: string[];
  addLog: (message: string) => void;
}

const ConsoleContext = createContext<ConsoleContextProps | undefined>(undefined);

export const ConsoleProvider = ({ children }: { children: ReactNode }) => {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prevLogs) => [message, ...prevLogs]);
  };

  return (
    <ConsoleContext.Provider value={{ logs, addLog }}>
      {children}
    </ConsoleContext.Provider>
  );
};

export const useConsole = (): ConsoleContextProps => {
  const context = useContext(ConsoleContext);
  if (!context) {
    throw new Error('useConsole must be used within a ConsoleProvider');
  }
  return context;
};