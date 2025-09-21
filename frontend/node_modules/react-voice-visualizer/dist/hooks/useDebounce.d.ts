import { AnyFunction } from "../types/types.ts";
export declare const useDebounce: (func: AnyFunction, wait?: number) => (...args: any[]) => void;
