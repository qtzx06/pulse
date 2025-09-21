import { GetDataForCanvasParams } from "../types/types.ts";
export declare const initialCanvasSetup: ({ canvas, backgroundColor, }: GetDataForCanvasParams) => {
    context: CanvasRenderingContext2D;
    height: number;
    width: number;
    halfWidth: number;
} | null;
