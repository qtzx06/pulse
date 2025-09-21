import { create } from 'zustand';

interface FftStore {
  fftData: Uint8Array;
  timeData: Uint8Array;
  setFftData: (fftData: Uint8Array) => void;
  setTimeData: (timeData: Uint8Array) => void;
}

export const useFftStore = create<FftStore>((set) => ({
  fftData: new Uint8Array(0),
  timeData: new Uint8Array(0),
  setFftData: (fftData) => set({ fftData }),
  setTimeData: (timeData) => set({ timeData }),
}));