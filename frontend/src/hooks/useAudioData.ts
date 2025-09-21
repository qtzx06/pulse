import { useEffect } from 'react';
import { useFftStore } from '@/lib/store';

export const useAudioData = (fftData: Uint8Array, timeData: Uint8Array) => {
  const setFftData = useFftStore((state: any) => state.setFftData);
  const setTimeData = useFftStore((state: any) => state.setTimeData);

  useEffect(() => {
    setFftData(fftData);
    setTimeData(timeData);
  }, [fftData, timeData, setFftData, setTimeData]);
};
