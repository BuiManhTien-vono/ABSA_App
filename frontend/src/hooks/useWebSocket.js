import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws/notifications';

export function useWebSocket(onAlert, onReview) {
  const clientRef = useRef(null);

  useEffect(() => {
    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      if (onAlert) {
        client.subscribe('/topic/alerts', (message) => {
          try {
            const body = JSON.parse(message.body);
            onAlert(body);
          } catch (e) {
            console.error('Failed to parse alert notification', e);
          }
        });
      }

      if (onReview) {
        client.subscribe('/topic/reviews', (message) => {
          try {
            const body = JSON.parse(message.body);
            onReview(body);
          } catch (e) {
            console.error('Failed to parse review notification', e);
          }
        });
      }
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [onAlert, onReview]);
}
