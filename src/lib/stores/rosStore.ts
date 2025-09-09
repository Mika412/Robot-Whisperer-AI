import { writable, derived, get } from "svelte/store";
import { requests, updateRequest } from "$lib/stores/requestStore";
import { settings } from "$lib/stores/settingsStore.svelte";
import { WSFoxgloveProvider } from "$lib/ros/wsFoxgloveProvider";
import type { TopicInfo, SchemaRecord } from "$lib/ros/types";
import type { RosRequest } from "$lib/db";
import { hashString } from "three/src/nodes/core/NodeUtils.js";

export const topics = writable<TopicInfo[]>([]);
export const connectionStatus = writable<{ connected: boolean; info?: string }>({ connected: false });
export const allSchemas = writable<SchemaRecord[]>([]); // This will now be populated live


const provider = new WSFoxgloveProvider();

provider.setEvents({
    onStatus: (s) => connectionStatus.set(s),
    onSchemas: (schemas) => processSchemas(schemas),
    onTopics: (t) => topics.set(t),
});

/**
 * Connects the shared provider to a WebSocket URL.
 * @param url The WebSocket URL of the Foxglove bridge.
 */
export async function connect() {
    if (get(connectionStatus).connected) {
        await provider.disconnect();
    }
    await provider.connect({ url: settings.websocketUrl });
}

                // this.events.onSchemas?.(payload as Array<{ messageType: string; definition: string; encoding: string; schema: string, source: "foxglove" }>);
export async function processSchemas(schemas: Array<{ messageType: string; definition: string; encoding: string; schema: string, source: string }>) {
    const currentSchemas = get(allSchemas);
    const newSchemas: SchemaRecord[] = [];

    const now = Date.now();
    console.log("Processing Schemas:", schemas);
    for (const schema of schemas) {
        const key = `${schema.messageType}|${hashString(schema.definition)}`;
        if (!currentSchemas.find((s) => s.key === key)) {
            newSchemas.push({
                key,
                messageType: schema.messageType,
                encoding: schema.encoding as SchemaRecord["encoding"],
                definition: schema.definition,
                schema: schema.schema,
                source: "foxglove",
                createdAt: now,
            });
        }
    }
    if (newSchemas.length > 0) {
        allSchemas.update(current => [...current, ...newSchemas]);
    }
}