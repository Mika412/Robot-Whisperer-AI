export interface TopicInfo {
	name: string;
	type: string;
}

export interface SchemaRecord {
	key: string; // `${messageType}|${hash}`
	messageType: string;
	encoding: "ros2msg" | "ros2idl" | "jsonschema" | "protobuf" | "flatbuffers" | "unknown";
	definition: string;
	schema: string;
	source?: "foxglove" | "system";
	createdAt?: number;
}

