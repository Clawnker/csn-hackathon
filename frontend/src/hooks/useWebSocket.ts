'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { AgentMessage, Payment, TaskStatus } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/ws';

interface WSEvent {
  type: 'task:status' | 'agent:message' | 'payment' | 'task:complete';
  taskId: string;
  status?: TaskStatus;
  step?: { specialist: string; action: string };
  from?: string;
  to?: string;
  payload?: unknown;
  amount?: number;
  token?: string;
  txSignature?: string;
  result?: unknown;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  taskStatus: TaskStatus | null;
  currentStep: { specialist: string; action: string } | null;
  messages: AgentMessage[];
  payments: Payment[];
  result: unknown;
  subscribe: (taskId: string) => void;
  unsubscribe: (taskId: string) => void;
  reset: () => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [currentStep, setCurrentStep] = useState<{ specialist: string; action: string } | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [result, setResult] = useState<unknown>(null);
  const subscribedTaskRef = useRef<string | null>(null);

  useEffect(() => {
    const connect = () => {
      try {
        const socket = new WebSocket(WS_URL);

        socket.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          // Re-subscribe if we had a task
          if (subscribedTaskRef.current) {
            socket.send(JSON.stringify({ 
              type: 'subscribe', 
              taskId: subscribedTaskRef.current 
            }));
          }
        };

        socket.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          // Attempt reconnect after 2 seconds
          setTimeout(connect, 2000);
        };

        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        socket.onmessage = (event) => {
          try {
            const data: WSEvent = JSON.parse(event.data);
            console.log('WS Event:', data);

            switch (data.type) {
              case 'task:status':
                if (data.status) setTaskStatus(data.status);
                if (data.step) setCurrentStep(data.step);
                break;

              case 'agent:message':
                setMessages(prev => [...prev, {
                  id: `${Date.now()}`,
                  from: data.from || 'unknown',
                  to: data.to || 'unknown',
                  content: typeof data.payload === 'string' 
                    ? data.payload 
                    : JSON.stringify(data.payload),
                  timestamp: new Date().toISOString(),
                }]);
                break;

              case 'payment':
                setPayments(prev => [...prev, {
                  id: `${Date.now()}`,
                  from: data.from || 'unknown',
                  to: data.to || 'unknown',
                  amount: data.amount || 0,
                  token: data.token || 'USDC',
                  txSignature: data.txSignature || '',
                  timestamp: new Date().toISOString(),
                }]);
                break;

              case 'task:complete':
                setTaskStatus('completed');
                setResult(data.result);
                break;
            }
          } catch (err) {
            console.error('Failed to parse WS message:', err);
          }
        };

        socketRef.current = socket;
      } catch (err) {
        console.error('Failed to create WebSocket:', err);
        setTimeout(connect, 2000);
      }
    };

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const subscribe = useCallback((taskId: string) => {
    subscribedTaskRef.current = taskId;
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'subscribe', taskId }));
    }
  }, []);

  const unsubscribe = useCallback((taskId: string) => {
    subscribedTaskRef.current = null;
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'unsubscribe', taskId }));
    }
  }, []);

  const reset = useCallback(() => {
    setTaskStatus(null);
    setCurrentStep(null);
    setMessages([]);
    setPayments([]);
    setResult(null);
  }, []);

  return {
    isConnected,
    taskStatus,
    currentStep,
    messages,
    payments,
    result,
    subscribe,
    unsubscribe,
    reset,
  };
}
