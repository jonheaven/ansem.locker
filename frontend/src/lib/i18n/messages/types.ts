import { en } from './en';

export type MessageTree = { [key: string]: string | MessageTree };

export type Messages = typeof en;
