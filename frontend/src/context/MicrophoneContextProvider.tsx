"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

enum MicrophoneState {
  NotReady = "NOT_READY",
  Ready = "READY",
  Open = "OPEN",
  Error = "ERROR",
}

enum MicrophoneEvents {
  DataAvailable = "dataavailable",
  Error = "error",
  Pause = "pause",
  Resume = "resume",
  Start = "start",
  Stop = "stop",
}

interface MicrophoneContext {
  microphone: MediaRecorder | undefined;
  startMicrophone: () => void;
  stopMicrophone: () => void;
  setupMicrophone: () => void;
  microphoneState: MicrophoneState;
}

const MicrophoneContext = createContext<MicrophoneContext>({
  microphone: undefined,
  startMicrophone: () => {},
  stopMicrophone: () => {},
  setupMicrophone: () => {},
  microphoneState: MicrophoneState.NotReady,
});

const MicrophoneContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [microphone, setMicrophone] = useState<MediaRecorder | undefined>();
  const [microphoneState, setMicrophoneState] = useState<MicrophoneState>(
    MicrophoneState.NotReady
  );

  const setupMicrophone = useCallback(async () => {
    try {
      const userMedia = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
        },
      });

      const microphone = new MediaRecorder(userMedia);
      setMicrophone(microphone);
      setMicrophoneState(MicrophoneState.Ready);
    } catch (error) {
      console.error(error);
      setMicrophoneState(MicrophoneState.Error);
    }
  }, []);

  const startMicrophone = useCallback(() => {
    if (!microphone) return;

    microphone.start(500);

    microphone.addEventListener(MicrophoneEvents.Start, () => {
      setMicrophoneState(MicrophoneState.Open);
    });

    microphone.addEventListener(MicrophoneEvents.Stop, () => {
      setMicrophoneState(MicrophoneState.Ready);
    });
  }, [microphone]);

  const stopMicrophone = useCallback(() => {
    if (!microphone) return;

    microphone.stop();
  }, [microphone]);

  return (
    <MicrophoneContext.Provider
      value={{
        microphone,
        startMicrophone,
        stopMicrophone,
        setupMicrophone,
        microphoneState,
      }}
    >
      {children}
    </MicrophoneContext.Provider>
  );
};

const useMicrophone = () => useContext(MicrophoneContext);

export {
  MicrophoneContextProvider,
  useMicrophone,
  MicrophoneState,
  MicrophoneEvents,
};
