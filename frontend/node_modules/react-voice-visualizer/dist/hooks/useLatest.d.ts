type UseLatestReturnType<T> = {
    readonly current: T;
};
export declare function useLatest<T>(value: T): UseLatestReturnType<T>;
export {};
