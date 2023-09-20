import { useRef, useEffect } from "react";
import "./App.css";
import * as faceapi from "face-api.js";

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // load from useeffect
  useEffect(() => {
    startVideo();
    videoRef && loadModels();
  }, []);

  // Open Your Face Webcam
  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((currentStream) => {
        videoRef.current
          ? (videoRef.current.srcObject = currentStream)
          : console.log("no current video");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Load Models From Face Api
  const loadModels = () => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    ]).then(() => {
      faceMyDetect();
    });
  };

  const faceMyDetect = () => {
    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(
          videoRef.current!,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceExpressions();

      // Draw your face on web cam
      if (canvasRef.current) {
        const context = canvasRef.current.getContext("2d");
        if (context) {
          const canvas = faceapi.createCanvasFromMedia(videoRef.current!);
          canvasRef.current.innerHTML = "";
          canvasRef.current.appendChild(canvas);
        }
      }
      faceapi.matchDimensions(canvasRef.current!, {
        width: 940,
        height: 650,
      });

      const resized = faceapi.resizeResults(detections, {
        width: 940,
        height: 650,
      });

      faceapi.draw.drawDetections(canvasRef.current!, resized);
      faceapi.draw.drawFaceLandmarks(canvasRef.current!, resized);
      faceapi.draw.drawFaceExpressions(canvasRef.current!, resized);
    }, 1000);
  };

  return (
    <div className="myapp">
      <h1>Face Detection</h1>
      <div className="appvide">
        <video
          id="video"
          crossOrigin="anonymous"
          ref={videoRef}
          autoPlay
        ></video>
      </div>
      <canvas ref={canvasRef} width="940" height="650" className="appcanvas" />
    </div>
  );
}

export default App;
