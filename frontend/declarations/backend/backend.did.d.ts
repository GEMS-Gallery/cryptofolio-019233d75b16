import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface TokenInfo {
  'balance' : number,
  'name' : string,
  'price' : number,
  'symbol' : string,
}
export interface _SERVICE {
  'getTokens' : ActorMethod<[], Array<[string, TokenInfo]>>,
  'getTotalValue' : ActorMethod<[], number>,
  'updateTokenInfo' : ActorMethod<[string, string, number, number], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
