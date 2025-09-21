/// <reference types="react" />
import { UseWebWorkerParams } from "../types/types";
export declare function useWebWorker<T, V>({ fn, initialValue, onMessageReceived, }: UseWebWorkerParams<T>): {
    result: T;
    setResult: import("react").Dispatch<import("react").SetStateAction<T>>;
    run: (value: V) => void;
};
