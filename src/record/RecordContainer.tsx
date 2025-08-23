import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { FaMicrophone } from "react-icons/fa";

function RecordContainer(): ReactElement {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedMimeType, setRecordedMimeType] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getFileExtensionForMime = useCallback((mime: string | null): string => {
    if (!mime) return ".webm";
    if (mime.includes("webm")) return ".webm";
    if (mime.includes("ogg")) return ".ogg";
    if (mime.includes("mp4")) return ".m4a";
    if (mime.includes("aac")) return ".aac";
    if (mime.includes("wav")) return ".wav";
    return ".webm";
  }, []);

  const getSupportedMimeType = useCallback((): string | undefined => {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/ogg",
      "audio/mp4",
      "audio/aac",
      "audio/wav",
    ];
    for (const type of candidates) {
      if (
        typeof MediaRecorder !== "undefined" &&
        MediaRecorder.isTypeSupported(type)
      ) {
        return type;
      }
    }
    return undefined;
  }, []);

  const stopRecording = useCallback((): void => {
    try {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    } catch (error) {
      console.error("Failed to stop MediaRecorder", error);
    }
    try {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error("Failed to stop media tracks", error);
    }
    mediaRecorderRef.current = null;
    mediaStreamRef.current = null;
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(async (): Promise<void> => {
    try {
      if (
        !("mediaDevices" in navigator) ||
        typeof navigator.mediaDevices.getUserMedia !== "function"
      ) {
        console.error("getUserMedia is not supported in this environment");
        return;
      }

      setErrorMessage(null);
      setRecordedUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setRecordedMimeType(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event: BlobEvent): void => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = (): void => {
        try {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
          chunksRef.current = [];
          const objectUrl = URL.createObjectURL(blob);
          setRecordedMimeType(recorder.mimeType);
          setRecordedUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return objectUrl;
          });
          console.log("Recorded audio ready", {
            type: blob.type,
            size: blob.size,
            objectUrl,
          });
        } catch (error) {
          console.error("Failed to assemble recording", error);
          setErrorMessage("Failed to prepare recorded audio");
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Unable to start recording", error);
      setErrorMessage("Unable to access microphone or start recording");
      stopRecording();
    }
  }, [getSupportedMimeType, stopRecording]);

  useEffect(() => {
    return () => {
      try {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state !== "inactive"
        ) {
          mediaRecorderRef.current.stop();
        }
      } catch (error) {
        console.error("Cleanup: failed to stop MediaRecorder", error);
      }
      try {
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      } catch (error) {
        console.error("Cleanup: failed to stop media tracks", error);
      }
      try {
        setRecordedUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
      } catch {}
    };
  }, []);

  const handleRecordClick = useCallback((): void => {
    if (typeof MediaRecorder === "undefined") {
      console.error("MediaRecorder is not supported in this browser.");
      return;
    }
    if (isRecording) {
      stopRecording();
    } else {
      void startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const downloadName = `recording-${new Date().toISOString()}${getFileExtensionForMime(
    recordedMimeType
  )}`;

  return (
    <div>
      <button
        type="button"
        onClick={handleRecordClick}
        aria-label={isRecording ? "Stop recording" : "Record audio"}
        title={isRecording ? "Stop recording" : "Record audio"}
        aria-pressed={isRecording}
      >
        <FaMicrophone
          aria-hidden="true"
          color={isRecording ? "green" : undefined}
        />
      </button>
      <div aria-live="polite">
        {isRecording ? "Recording…" : "Not recording"}
      </div>
      {errorMessage && <div role="alert">{errorMessage}</div>}
      {recordedUrl && (
        <div>
          <audio controls src={recordedUrl} />
          <div>
            <a href={recordedUrl} download={downloadName}>
              Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecordContainer;
