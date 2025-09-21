import { useFftStore } from '@/lib/store';
import { ITextureMapper } from './textureMappers/textureMapper';
import { DataTexture } from 'three';

export class FftTextureMapper implements ITextureMapper {
  private _timeData: Uint8Array = new Uint8Array(0);
  public texture: DataTexture;

  constructor() {
    useFftStore.subscribe((state) => {
      this._timeData = state.timeData;
    });

    this.texture = new DataTexture(new Uint8Array(0), 0, 0);
  }

  update() {
    if (this._timeData.length === 0) {
      return;
    }

    this.texture.image.data = this._timeData;
    this.texture.needsUpdate = true;
  }
}
