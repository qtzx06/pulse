import { useMemo } from "react";
import BaseScopeVisual from "./R3FVisualizer/audioScope/base";
import { WaveformTextureMapper } from "@/lib/mappers/WaveformTextureMapper";
import { Color } from "three";

const WaveformVisualizer = () => {
  const textureMapper = useMemo(() => new WaveformTextureMapper(), []);

  return (
    <BaseScopeVisual
      textureMapper={textureMapper}
      usePoints={true}
      interpolate={false}
      color={new Color("white")}
    />
  );
};

export default WaveformVisualizer;
