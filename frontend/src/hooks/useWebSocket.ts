'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { WSEvent, AgentMessage, Payment, TaskStatus } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

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
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [currentStep, setCurrentStep] = useState<{ specialist: string; action: string } | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [result, setResult] = useState<unknown>(null);

  useEffect(() => {
    const socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('event', (event: WSEvent) => {
      console.log('WS Event:', event);
      
      switch (event.type) {
        case 'task:status':
          setTaskStatus(event.status);
          if (event.step) {
            setCurrentStep(event.step);
          }
          break;

        case 'agent:message':
          setMessages(prev => [...prev, {
            id: `${event.taskId}-${event.timestamp}-${Math.random()}`,
            taskId: event.taskId,
            from: event.from,
            to: event.to,
            payload: event.payload,
            timestamp: event.timestamp,
          }]);
          break;

        case 'payment':
          setPayments(prev => [...prev, {
            id: `${event.txSignature}`,
            taskId: event.taskId,
            from: event.from,
            to: event.to,
            amount: event.amount,
            token: event.token,
            purpose: `${event.from} → ${event.to}`,
            txSignature: event.txSignature,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
          }]);
          break;

        case 'task:complete':
          setTaskStatus('completed');
          setResult(event.result);
          setCurrentStep(null);
          break;
      }
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  const subscribe = useCallback((taskId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe', { taskId });
    }
  }, []);

  const unsubscribe = useCallback((taskId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('unsubscribe', { taskId });
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
