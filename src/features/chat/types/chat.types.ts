export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

export interface StreamChunk {
  delta: string;
  done: boolean;
}
