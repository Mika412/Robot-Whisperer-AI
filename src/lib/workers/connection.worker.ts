/// <reference lib="webworker" />
import type {
  ServerMsg,
  SchemaIndex,
} from "../ros/protocol/foxglove";
import { parse, stringify } from "@foxglove/rosmsg";
import { MessageReader } from "@foxglove/rosmsg2-serialization";
import { decodeMessageFromJson, parseSchema } from "$lib/ros/encodings/cdr";

class ConnectionWorker {
  private ws: WebSocket | null = null;
  // TODO: Change this back to channel
  private schemas: SchemaIndex = { byId: new Map(), byTopic: new Map() };
  private topicWorkers = new Map<number, Worker>();

  constructor() {
    self.onmessage = this.handleMainThreadMessage.bind(this);
  }

  private handleMainThreadMessage(e: MessageEvent): void {
    const { type, id, cmd, payload } = e.data;
    switch (type) {
      case "connect":
        this.connect(payload.url || "ws://localhost:8765");
        break;
    }
  }

  private connect(url: string): void {
    this.teardown();
    this.ws = new WebSocket(url, "foxglove.websocket.v1");
    this.ws.binaryType = "arraybuffer";

    this.ws.onopen = () => this.post("status", { connected: true, info: "connected" });
    this.ws.onclose = () => this.post("status", { connected: false, info: "closed" });
    this.ws.onerror = () => this.post("status", { connected: false, info: "error" });
    this.ws.onmessage = (ev) => this.handleServerMessage(ev.data);
  }

  /**
   * Handles incoming messages from the WebSocket server.
   */
  private handleServerMessage(data: any): void {
    // --- THIS IS THE LOGGING YOU NEED ---
    console.log("WORKER RECEIVED:", data);
    // ------------------------------------

    if (typeof data === "string") {
      this.handleJsonMessage(JSON.parse(data));
    }
    
    // else if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
    //   this.handleBinaryMessage(data);
    // }
  }

  private handleJsonMessage(msg: ServerMsg): void {
    switch (msg.op) {
      case "serverInfo":
        this.post("ready");
        break;
      case "advertise":
        this.handleAdvertise(msg.channels);
        break;
      case "serviceResponse":
        // const resolver = this.rpcResolvers.get(String(msg.id));
        // if (resolver) {
        //     resolver(msg);
        //     this.rpcResolvers.delete(String(msg.id));
        // }
        break;
    }
  }

  private handleAdvertise(newChannels: Array<{ id: number; topic: string; schemaName: string; schema: string; encoding: string }>): void {
    for (const c of newChannels) {
        // console.log("ADVERTISED CHANNEL:", c.id, c.encoding, c.schemaName, c.topic);
        const schemaEncoding = c.encoding;
        const jsonSchema = parseSchema(c.schema);
        // TODO: REWRITE THIS HANDLE ADVERTISE SECTION TO MAP TO THE CORRECT PARSER
        // Parse schema and store json format
        // Check if CDR encoding
        // if (schemaEncoding === "cdr") {
        //   const cdrJsonSchema = parseSchema(c.schema);
        //   console.log("Parsed JSON Schema:", cdrJsonSchema);
        // }

        this.schemas.byId.set(c.id, {
          messageType: c.schemaName,
          encoding: schemaEncoding,
          definition: c.schema,
          schema: jsonSchema,
        });
        this.schemas.byTopic.set(c.topic, c.id);
        // console.log("Schema encoding is", schemaEncoding);
        const topics = newChannels.map((c) => ({ name: c.topic, type: c.schemaName }));
        
        // --- ADD THIS LOG TO BE SURE ---
        this.post("topics", topics);

        const schemas = newChannels.map((c) => ({
          messageType: c.schemaName,
          encoding: schemaEncoding,
          definition: c.schema,
          schema: jsonSchema,
        }));
        this.post("schemas", schemas);
    }

    // for (const c of newChannels) {
    //   const schemaEncoding = this.guessSchemaEncoding(c.schema);
    //   this.channels.byId.set(c.id, {
    //     topic: c.topic,
    //     type: c.schemaName,
    //     encoding: c.encoding,
    //     schema: c.schema,
    //     schemaEncoding,
    //   });
    //   this.channels.byTopic.set(c.topic, c.id);
    // }

    // const topics = newChannels.map((c) => ({ name: c.topic, type: c.schemaName }));
    
    // // --- ADD THIS LOG TO BE SURE ---
    // console.log("WORKER POSTING TOPICS:", topics);
    // this.post("topics", topics);

    // const schemas = newChannels.map((c) => ({
    //   messageType: c.schemaName,
    //   definition: c.schema,
    //   encoding: this.guessSchemaEncoding(c.schema),
    // }));
    // this.post("schemas", schemas);
  }


  private teardown(): void {
    this.ws?.close();
    this.ws = null;
    for (const [, worker] of this.topicWorkers) worker.terminate();
    this.topicWorkers.clear();
    this.schemas.byId.clear();
    this.schemas.byTopic.clear();
  }

    private post(type: string, payload?: any): void {
    (self as any).postMessage({ type, payload });
  }
}

new ConnectionWorker();
