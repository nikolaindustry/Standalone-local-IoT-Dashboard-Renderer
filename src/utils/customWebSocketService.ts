type MessageHandler = (data: any) => void;
type ConsoleLogCallback = (type: 'log' | 'warn' | 'error' | 'info', message: string, args: any[]) => void;

interface WebSocketConnection {
  socket: WebSocket;
  messageHandlers: Set<MessageHandler>;
}

class CustomWebSocketService {
  private connections: Map<string, WebSocketConnection> = new Map();
  private onConsoleLog?: ConsoleLogCallback;

  setConsoleLogger(callback: ConsoleLogCallback | undefined) {
    this.onConsoleLog = callback;
  }

  async connect(url: string, onMessage?: MessageHandler): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        // Check if already connected
        if (this.connections.has(url)) {
          const connection = this.connections.get(url)!;
          if (connection.socket.readyState === WebSocket.OPEN) {
            console.log(`[Custom WebSocket] Already connected to ${url}`);
            this.onConsoleLog?.('info', `Already connected to ${url}`, []);
            
            // Add the new message handler if provided
            if (onMessage) {
              connection.messageHandlers.add(onMessage);
            }
            
            resolve(true);
            return;
          } else {
            // Remove stale connection
            this.connections.delete(url);
          }
        }

        const ws = new WebSocket(url);
        const connection: WebSocketConnection = {
          socket: ws,
          messageHandlers: new Set()
        };

        if (onMessage) {
          connection.messageHandlers.add(onMessage);
        }

        ws.onopen = () => {
          console.log(`[Custom WebSocket] Connected to ${url}`);
          this.onConsoleLog?.('log', `Connected to ${url}`, []);
          this.connections.set(url, connection);
          resolve(true);
        };

        ws.onerror = (error) => {
          console.error(`[Custom WebSocket] Error connecting to ${url}:`, error);
          this.onConsoleLog?.('error', `Error connecting to ${url}`, [error]);
          reject(error);
        };

        ws.onclose = () => {
          console.log(`[Custom WebSocket] Disconnected from ${url}`);
          this.onConsoleLog?.('info', `Disconnected from ${url}`, []);
          this.connections.delete(url);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log(`[Custom WebSocket] Message from ${url}:`, data);
            this.onConsoleLog?.('log', `Message from ${url}`, [data]);
            
            // Call all registered message handlers
            connection.messageHandlers.forEach(handler => {
              try {
                handler(data);
              } catch (error) {
                console.error('[Custom WebSocket] Error in message handler:', error);
              }
            });
          } catch (e) {
            console.log(`[Custom WebSocket] Raw message from ${url}:`, event.data);
            this.onConsoleLog?.('log', `Raw message from ${url}`, [event.data]);
            
            // Call all registered message handlers with raw data
            connection.messageHandlers.forEach(handler => {
              try {
                handler(event.data);
              } catch (error) {
                console.error('[Custom WebSocket] Error in message handler:', error);
              }
            });
          }
        };
      } catch (error) {
        console.error(`[Custom WebSocket] Failed to create connection:`, error);
        this.onConsoleLog?.('error', `Failed to create connection`, [error]);
        reject(error);
      }
    });
  }

  disconnect(url: string) {
    const connection = this.connections.get(url);
    if (connection) {
      connection.socket.close();
      this.connections.delete(url);
      console.log(`[Custom WebSocket] Disconnected from ${url}`);
      this.onConsoleLog?.('info', `Disconnected from ${url}`, []);
    }
  }

  sendTo(url: string, data: any): boolean {
    const connection = this.connections.get(url);
    if (connection && connection.socket.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      connection.socket.send(message);
      console.log(`[Custom WebSocket] Sent to ${url}:`, data);
      this.onConsoleLog?.('log', `Sent to ${url}`, [data]);
      return true;
    }
    console.error(`[Custom WebSocket] Not connected to ${url}`);
    this.onConsoleLog?.('error', `Not connected to ${url}`, []);
    return false;
  }

  isConnected(url: string): boolean {
    const connection = this.connections.get(url);
    return connection ? connection.socket.readyState === WebSocket.OPEN : false;
  }

  cleanup() {
    this.connections.forEach((connection, url) => {
      if (connection.socket.readyState === WebSocket.OPEN) {
        connection.socket.close();
      }
    });
    this.connections.clear();
  }

  clearMessageHandlers(url: string) {
    const connection = this.connections.get(url);
    if (connection) {
      connection.messageHandlers.clear();
    }
  }
}

// Export singleton instance
export const customWebSocketService = new CustomWebSocketService();
