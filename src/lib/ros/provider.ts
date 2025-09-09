import type { TopicInfo } from "./types";

export type ConnectionEvents = {
	onTopics?: (topics: TopicInfo[]) => void;
	onStatus?: (s: { connected: boolean; info?: string }) => void;
	onSchemas?: (schemas: Array<{ messageType: string; definition: string; encoding: string; schema: string; source: string }>) => void;
};

export interface ROSProvider {
	connect(cfg: { url?: string }): Promise<void>;
	disconnect(): Promise<void>;
}
