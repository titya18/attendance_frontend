import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as faceapi from "face-api.js";
import { api } from "../api/client";

type EmployeeOption = {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
};

export default function FaceEnrollPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);

  const [employeeId, setEmployeeId] = useState("");
  const [message, setMessage] = useState("");
  const [modelsReady, setModelsReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [descriptorJson, setDescriptorJson] = useState("");

  const employeesQuery = useQuery({
    queryKey: ["face-enroll-employees"],
    queryFn: async () => (await api.get("/employees")).data as EmployeeOption[],
  });

  const loadModels = async () => {
    try {
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
      setMessage("Failed to start camera");
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
  };

  const detectFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState < 2) {
      return;
    }

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

    const displaySize = {
      width: video.videoWidth || 640,
      height: video.videoHeight || 480,
    };

    faceapi.matchDimensions(canvas, displaySize);

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
      detectFace().catch(console.error);
    }, 700);

    setIsDetecting(true);
    setMessage("Face detection started");
  };

  const enroll = async () => {
    try {
      if (!employeeId) {
        setMessage("Please select an employee");
        return;
      }

      if (!descriptorJson) {
        setMessage("No face detected. Please face the camera clearly and try again.");
        return;
      }

      await api.put(`/employees/${employeeId}`, {
        faceDescriptor: descriptorJson,
      });

      setMessage("Face enrolled successfully");
    } catch (error) {
      console.error(error);
      setMessage("Face enroll failed");
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
      <h2 className="mb-4 text-2xl font-bold">Face Enroll</h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow">
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={loadModels}
              className="rounded bg-indigo-600 px-4 py-2 text-white"
            >
              Load Models
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
              <p className="mt-1 text-sm text-gray-500">
                Choose the employee from the list, not employee code manually.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Face Descriptor
              </label>
              <textarea
                className="h-40 w-full rounded border p-3"
                value={descriptorJson}
                readOnly
              />
            </div>

            <button
              onClick={enroll}
              disabled={!isDetecting || !descriptorJson || !employeeId}
              className="rounded bg-emerald-600 px-4 py-2 text-white disabled:opacity-60"
            >
              Enroll Face
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