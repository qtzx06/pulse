import { APPLICATION_MODE } from "@/lib/applicationModes";

import Visual, { type TVisualProps } from "./reactive";

const descriptor = {
  id: "audio-scope",
  name: "Audio Scope",
  supportedApplicationModes: new Set([APPLICATION_MODE.AUDIO_SCOPE]),
  controls: null,
  visual: Visual as React.FC<TVisualProps>,
};

export default descriptor;