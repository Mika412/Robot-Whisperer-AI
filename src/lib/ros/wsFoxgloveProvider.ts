import type { ROSProvider, ConnectionEvents } from './provider'
import type { TopicInfo } from './types'

// The URL for the connection worker, resolved at module load time.
const ConnectionWorkerUrl = new URL('../workers/connection.worker.ts', import.meta.url);

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';


/**
 * Provides a high-level API to connect to a ROS system via the Foxglove WebSocket protocol.
 * It manages a dedicated Web Worker to handle the connection, ensuring the main thread remains responsive.
 */
export class WSFoxgloveProvider implements ROSProvider {
    private worker: Worker | null = null;
    private state: ConnectionState = 'disconnected'
    private events: ConnectionEvents = {};


    /**
     * Assigns event handlers to be called for various connection events.
     * @param ev An object containing callback functions.
     */
    public setEvents(events: ConnectionEvents): void {
        this.events = events;
    }

    /**
     * Establishes a connection to the ROS bridge.
     * @param cfg Configuration object containing the connection URL.
     * @returns A promise that resolves when the connection is established and ready.
     */
    public async connect(cfg: { url?: string }): Promise<void> {
        if (this.state === 'connecting' || this.state === 'connected') {
            console.warn('Already connected or connecting. Disconnect first.');
            return;
        }

        console.log("Connecting to", cfg.url);
        this.updateState('connecting');

        return new Promise((resolve, reject) => {
            this.worker = new Worker(ConnectionWorkerUrl, { type: 'module' });
            this.worker.onmessage = this.handleWorkerMessage.bind(this);
            this.worker.onerror = (err) => {
                console.error('Connection worker error:', err);
                this.updateState('error', 'Worker error');
                this.cleanup();
                reject(new Error('Failed to establish connection due to a worker error.'));
            };

            // This specific handler resolves the connect() promise once the worker confirms it's ready.
            const readyListener = (e: MessageEvent) => {
                if (e.data.type === 'ready') {
                    this.worker?.removeEventListener('message', readyListener);
                    this.updateState('connected');
                    resolve();
                }
            };
            this.worker.addEventListener('message', readyListener);

            this.worker.postMessage({ type: 'connect', payload: cfg });
        });
    }

    /**
     * Handles all incoming messages from the connection worker.
     */
    private handleWorkerMessage(e: MessageEvent): void {
        const { type, payload, rid, ok, result, error } = e.data;

        switch (type) {
            case 'status':
                this.events.onStatus?.(payload);
                break;
            case 'topics':
                this.events.onTopics?.(payload as TopicInfo[]);
                break;
            case 'services':
                // this.events.onServices?.(payload as ServiceInfo[]);
                break;
            case 'actions':
                // this.events.onActions?.(payload as ActionInfo[]);
                break;
            case 'message':
                // this.events.onMessage?.(payload as IncomingMessage);
                break;
            case 'schemas':
                console.log("Schemas:", payload);
                // Notify listeners of new schemas with a fixed source field as "foxglove"
                this.events.onSchemas?.(payload as Array<{ messageType: string; definition: string; encoding: string; schema: string, source:string }>);
                // persistSchemas(payload as Array<{ messageType: string; definition: string; encoding: string }>);
                break;
            case 'rpc':
                // this._handleRpcResponse(rid, ok, result, error);
                break;
        }
    }


    /**
     * Updates the internal state and notifies listeners via onStatus.
     */
    private updateState(state: ConnectionState, info?: string): void {
        this.state = state;
        const connected = state === 'connected';
        this.events.onStatus?.({ connected, info: info || state });
    }


    /**
     * Terminates the connection and cleans up all resources.
     */
    public async disconnect(): Promise<void> {
        if (this.worker) {
            this.worker.terminate();
        }
        this.cleanup();
    }

    /**
     * Cleans up internal state when disconnecting or on error.
     */
    private cleanup(): void {
        // // Reject any RPC calls that were in flight
        // for (const [rid, promise] of this.pendingRpcs.entries()) {
        //     promise.reject(new Error('Connection closed before RPC could complete.'));
        // }
        // this.pendingRpcs.clear();
        this.worker = null;
        this.updateState('disconnected');
    }

}

