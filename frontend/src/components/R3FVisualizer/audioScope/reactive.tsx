import { ITextureMapper } from "@/lib/mappers/textureMappers/textureMapper";
import BaseScopeVisual from "./base";
import { Color } from "three";

export default ({ textureMapper }: { textureMapper: ITextureMapper }) => {
  return (
    <BaseScopeVisual
      textureMapper={textureMapper}
      usePoints={true}
      interpolate={false}
      color={new Color("white")}
    />
  );
};
