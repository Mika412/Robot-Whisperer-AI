import { parse } from "@foxglove/rosmsg";
import { type MessageDefinition } from "@foxglove/message-definition";
import { MessageReader } from "@foxglove/rosmsg2-serialization";

export function parseSchema(schemaText: string): string {
  const messageDefinition = parse(schemaText, { ros2: true });
  return JSON.stringify(messageDefinition, null, 2);
}

export function decodeMessageFromJson(
  schemaJson: string,
  buf: ArrayBuffer,
): any {
  const messageDefinition: MessageDefinition[] = JSON.parse(schemaJson);
  const reader = new MessageReader(messageDefinition);

  const uint8Array = new Uint8Array(buf);

  try {
    const message = reader.readMessage(uint8Array);
    return message;
  } catch (e) {
    console.error(`Failed to decode CDR message from JSON schema:`, e);
    throw e;
  }
}