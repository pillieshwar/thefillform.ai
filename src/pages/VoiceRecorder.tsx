// src/components/VoiceRecorder.tsx
import { useState, useRef } from "react";
import { Button, Typography } from "antd";
import { AudioOutlined, StopOutlined } from "@ant-design/icons";

const { Text } = Typography;

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(",")[1]; // strip "data:..."
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleRecordClick = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          setAudioUrl(URL.createObjectURL(blob));
          chunksRef.current = [];

          // Convert to Base64 for API
          const base64Audio = await blobToBase64(blob);
          console.log("Base64 audio length:", base64Audio.length);

          // Save in localStorage or pass back via props
          (chrome || browser).storage.local.set({ recordedAudio: base64Audio });
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);
      } catch (err) {
        console.error("Microphone access denied:", err);
      }
    } else {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "1rem" }}>
      <Button
        type="primary"
        shape="circle"
        size="small"
        icon={
          isRecording ? (
            <StopOutlined style={{ fontSize: "28px" }} />
          ) : (
            <AudioOutlined style={{ fontSize: "28px" }} />
          )
        }
        style={{
          background: isRecording ? "red" : "#854ee0",
          borderColor: isRecording ? "red" : "#854ee0",
          width: "64px",
          height: "64px",
        }}
        onClick={handleRecordClick}
      />
      <div style={{ marginTop: "0.75rem" }}>
        <Text type="secondary">
          {isRecording ? "Recording..." : "Tap to start recording"}
        </Text>
      </div>

      {audioUrl && !isRecording && (
        <div style={{ marginTop: "1.5rem" }}>
          <audio controls src={audioUrl} />
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
