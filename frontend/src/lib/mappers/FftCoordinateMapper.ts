import { useFftStore } from '@/lib/store';
import { ICoordinateMapper } from '@/lib/mappers/coordinateMappers/common';

export class FftCoordinateMapper implements ICoordinateMapper {
  private _fftData: Uint8Array = new Uint8Array(0);
  public amplitude = 1;

  constructor() {
    useFftStore.subscribe((state) => {
      this._fftData = state.fftData;
    });
  }

  map(out: Float32Array, nPoints: number) {
    if (this._fftData.length === 0) {
      return;
    }

    for (let i = 0; i < nPoints; i++) {
      const fftIndex = Math.floor((i / nPoints) * this._fftData.length);
      const fftValue = this._fftData[fftIndex] / 255;

      const angle = (i / nPoints) * Math.PI * 2;
      const radius = 1 + fftValue * this.amplitude;

      out[i * 3] = Math.cos(angle) * radius;
      out[i * 3 + 1] = Math.sin(angle) * radius;
      out[i * 3 + 2] = 0;
    }
  }
}
