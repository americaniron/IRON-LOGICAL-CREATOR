import React, { createContext, ReactNode, useState, useCallback, useMemo, useEffect } from 'react';
import { SystemLog, TelemetryMetrics, LogSeverity } from '../types';

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface SystemStatusContextType {
  logs: SystemLog[];
  telemetry: TelemetryMetrics;
  isOnline: boolean;
  emergencyHalt: () => void;
  logOperation: (log: Omit<SystemLog, 'id' | 'timestamp'>) => void;
  notify: (message: string, type: Notification['type']) => void;
  notifications: Notification[];
}

export const SystemStatusContext = createContext<SystemStatusContextType>({} as SystemStatusContextType);

const initialTelemetry: TelemetryMetrics = {
  lastLatency: 0,
  totalOps: 0,
  errorCount: 0,
  providerLoad: {
    iron: 0,
    guest: 0,
    xcorp: 0,
  },
};

export const SystemStatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryMetrics>(initialTelemetry);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const emergencyHalt = useCallback(() => {
    logOperation({
        message: "EMERGENCY_HALT_TRIGGERED_BY_OPERATOR",
        severity: LogSeverity.CRITICAL,
        provider: 'system'
    });
    window.dispatchEvent(new CustomEvent('emergency-halt'));
  }, []);

  const logOperation = useCallback((logData: Omit<SystemLog, 'id' | 'timestamp'>) => {
    const newLog: SystemLog = {
      ...logData,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };
    setLogs(prev => [newLog, ...prev].slice(0, 200)); // Keep last 200 logs

    setTelemetry(prev => {
        const newProviderLoad = { ...prev.providerLoad };
        if (logData.provider !== 'system') {
            newProviderLoad[logData.provider] = (newProviderLoad[logData.provider] || 0) + 1;
        }

        return {
            ...prev,
            totalOps: prev.totalOps + 1,
            errorCount: prev.errorCount + (logData.severity === LogSeverity.ERROR || logData.severity === LogSeverity.CRITICAL ? 1 : 0),
            lastLatency: logData.latency || prev.lastLatency,
            providerLoad: newProviderLoad,
        }
    });
  }, []);

  const notify = useCallback((message: string, type: Notification['type']) => {
    const newNotification: Notification = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      message,
    };
    setNotifications(prev => [...prev, newNotification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  }, []);

  const value = useMemo(() => ({
    logs,
    telemetry,
    isOnline,
    emergencyHalt,
    logOperation,
    notify,
    notifications,
  }), [logs, telemetry, isOnline, emergencyHalt, logOperation, notify, notifications]);

  return <SystemStatusContext.Provider value={value}>{children}</SystemStatusContext.Provider>;
};
