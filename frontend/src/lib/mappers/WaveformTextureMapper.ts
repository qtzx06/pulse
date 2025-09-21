import { useFftStore } from '@/lib/store';
import { ITextureMapper } from './textureMappers/textureMapper';
import { DataTexture, RGBAFormat } from 'three';

export class WaveformTextureMapper implements ITextureMapper {
  private _timeData: Uint8Array = new Uint8Array(0);
  public texture: DataTexture;

  constructor() {
    useFftStore.subscribe((state) => {
      if (state.timeData.length > 0) {
        this._timeData = state.timeData;
        this.texture.image.data = this._timeData;
        this.texture.needsUpdate = true;
      }
    });

    this.texture = new DataTexture(new Uint8Array(1024), 1024, 1, RGBAFormat);
  }

  update() {
    // The update is handled by the store subscription
  }
}
