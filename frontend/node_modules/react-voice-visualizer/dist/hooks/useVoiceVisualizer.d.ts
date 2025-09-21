import { Controls, useVoiceVisualizerParams } from "../types/types.ts";
declare function useVoiceVisualizer({ onStartRecording, onStopRecording, onPausedRecording, onResumedRecording, onClearCanvas, onEndAudioPlayback, onStartAudioPlayback, onPausedAudioPlayback, onResumedAudioPlayback, onErrorPlayingAudio, shouldHandleBeforeUnload, }?: useVoiceVisualizerParams): Controls;
export default useVoiceVisualizer;
