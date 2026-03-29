import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as faceapi from "face-api.js";
import { api } from "../api/client";
import { toArray } from "../utils/api";

type EmployeeOption = {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
};

export default function FaceAttendancePage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);

  const [employeeId, setEmployeeId] = useState("");
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [message, setMessage] = useState("");
  const [descriptorJson, setDescriptorJson] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);

  const employeesQuery = useQuery({
    queryKey: ["face-attendance-employees"],
    queryFn: async () => {
      const res = await api.get("/employees");
      return toArray(res.data);
    },
  });

  const loadModels = async () => {
    try {
      setLoadingModels(true);
      setMessage("Loading face models...");
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);
      setModelsReady(true);
      setMessage("Face models loaded successfully");
    } catch (error) {
      console.error(error);
      setMessage("Failed to load face models");
    } finally {
      setLoadingModels(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraReady(true);
      setMessage("Camera started");
    } catch (error) {
      console.error(error);
      setMessage("Failed to access camera");
    }
  };

  const stopCamera = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraReady(false);
    setIsDetecting(false);
    setDescriptorJson("");
    setMessage("Camera stopped");
  };

  const drawDetection = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState < 2) {
      return;
    }

    const displaySize = {
      width: video.videoWidth || 640,
      height: video.videoHeight || 480,
    };

    faceapi.matchDimensions(canvas, displaySize);

    const detection = await faceapi
      .detectSingleFace(
        video,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.3,
        })
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!detection) {
      setDescriptorJson("");
      return;
    }

    const resized = faceapi.resizeResults(detection, displaySize);
    faceapi.draw.drawDetections(canvas, resized);
    faceapi.draw.drawFaceLandmarks(canvas, resized);

    setDescriptorJson(JSON.stringify(Array.from(detection.descriptor)));
  };

  const startDetection = () => {
    if (!modelsReady) {
      setMessage("Please load models first");
      return;
    }

    if (!cameraReady) {
      setMessage("Please start camera first");
      return;
    }

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      drawDetection().catch(console.error);
    }, 700);

    setIsDetecting(true);
    setMessage("Face detection started");
  };

  const submitAttendance = async () => {
    try {
      if (!employeeId) {
        setMessage("Please select an employee");
        return;
      }

      if (!descriptorJson) {
        setMessage("No face detected. Please look at the camera.");
        return;
      }

      const descriptor = JSON.parse(descriptorJson);

      const res = await api.post("/face/check-in", {
        employeeId,
        descriptor,
      });

      setMessage(
        res.data?.distance !== undefined
          ? `${res.data.message} (distance: ${Number(res.data.distance).toFixed(4)})`
          : res.data.message || "Face attendance success"
      );
    } catch (error: any) {
      console.error(error);
      setMessage(error.response?.data?.message || "Face attendance failed");
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const employees = employeesQuery.data || [];

  return (
    <div className="max-w-5xl">
      <h2 className="mb-4 text-2xl font-bold">Face Attendance</h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow">
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={loadModels}
              disabled={loadingModels}
              className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-60"
            >
              {loadingModels ? "Loading Models..." : "Load Models"}
            </button>

            <button
              onClick={startCamera}
              disabled={!modelsReady}
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
            >
              Start Camera
            </button>

            <button
              onClick={startDetection}
              disabled={!cameraReady}
              className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-60"
            >
              Start Detection
            </button>

            <button
              onClick={stopCamera}
              className="rounded bg-red-600 px-4 py-2 text-white"
            >
              Stop Camera
            </button>
          </div>

          <div className="relative overflow-hidden rounded-xl border bg-black">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-auto w-full"
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute left-0 top-0 h-full w-full"
            />
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Employee</label>
              <select
                className="w-full rounded border p-3"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              >
                <option value="">Select employee</option>
                {employees.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.employeeCode} - {item.firstName} {item.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Detected Descriptor
              </label>
              <textarea
                className="h-40 w-full rounded border p-3"
                value={descriptorJson}
                readOnly
              />
            </div>

            <button
              onClick={submitAttendance}
              disabled={!isDetecting || !descriptorJson || !employeeId}
              className="rounded bg-purple-600 px-4 py-2 text-white disabled:opacity-60"
            >
              Submit Face Attendance
            </button>

            {message && (
              <div className="rounded border bg-slate-50 p-3 text-sm">
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}