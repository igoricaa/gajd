import { ResourceCategory } from './db/schema';

export interface ActionResult {
  message: string | null | undefined;
}

export interface EmailVerificationRequest {
  id: string;
  userId: number;
  code: string;
  email: string;
  expiresAt: Date;
}

export type Category = ResourceCategory & {
  subcategories: ResourceCategory[];
};

export interface LexicalNode {
  text?: string;
  format?: number;
  detail?: number;
  mode?: string;
  style?: string;
  version?: number;
  children?: LexicalNode[];
}

export interface LexicalChild {
  children?: LexicalNode[];
  direction?: string;
  format?: string;
  indent?: number;
  type?: string;
  version?: number;
  listType?: 'bullet' | 'number';
}

export interface LexicalRoot {
  root: {
    children: LexicalChild[];
    direction: string;
    format: string;
    indent: number;
    type: string;
    version: number;
  };
}

export type LexicalContent = LexicalRoot | null; 