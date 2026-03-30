import { useRef, useState, useCallback, useEffect } from "react";
import { useMediaPipe } from "./hooks/useMediaPipe";
import { recognizeGesture } from "./utils/geometry";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Estados independentes para cada mão
  const [leftGesture, setLeftGesture] = useState("Nenhuma");
  const [rightGesture, setRightGesture] = useState("Nenhuma");

  const onResults = useCallback((results) => {
    if (!canvasRef.current) return;
    const canvasCtx = canvasRef.current.getContext("2d");

    // Prepara o Canvas e desenha o frame da câmera [cite: 73, 85]
    canvasCtx.save();
    canvasCtx.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height,
    );
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height,
    );

    // Variáveis temporárias para atualizar o estado apenas uma vez por frame
    let currentLeft = "Nenhuma";
    let currentRight = "Nenhuma";

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      // Itera sobre as mãos detectadas para processar cada uma separadamente [cite: 6, 73]
      results.multiHandLandmarks.forEach((landmarks, index) => {
        // Identifica se a mão é Esquerda ou Direita (Handedness)
        const handedness = results.multiHandedness[index].label;
        const gesture = recognizeGesture(landmarks); // Lógica de geometria [cite: 74, 90]

        // Mapeia o gesto para a mão correta
        if (handedness === "Left") currentLeft = gesture;
        if (handedness === "Right") currentRight = gesture;

        // Desenha as conexões e os 21 pontos (landmarks) no canvas [cite: 73, 85]
        window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, {
          color: "#00FFFF", // Ciano para o tema Connect Pro
          lineWidth: 5,
        });
        window.drawLandmarks(canvasCtx, landmarks, {
          color: "#FF0000",
          lineWidth: 2,
        });
      });
    }

    setLeftGesture(currentLeft);
    setRightGesture(currentRight);
    canvasCtx.restore();
  }, []);

  // Hook personalizado para integrar com MediaPipe Hands [cite: 69]
  useMediaPipe(videoRef, onResults);

  return (
    <div className="bg-slate-900 h-screen w-full flex flex-col items-center justify-center text-white p-4">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-black text-cyan-400 tracking-tighter">
          Libras-Connect <span className="text-white">Vision Core</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Prova de Conceito (PoC) • Sistema Bimanual
        </p>
      </header>

      {/* Container de Vídeo e Canvas [cite: 73, 85] */}
      <div className="relative rounded-2xl overflow-hidden border-4 border-cyan-500 shadow-2xl shadow-cyan-500/20">
        <video
          ref={videoRef}
          className="w-full max-w-2xl"
          autoPlay
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          width={640}
          height={480}
        />
      </div>

      {/* Dashboard de Status (Duplicado para bimanualidade)  */}
      <div className="mt-8 flex gap-4 w-full max-w-2xl">
        <div className="flex-1 p-6 bg-slate-800 rounded-2xl border-b-4 border-cyan-500 text-center shadow-lg">
          <p className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-1">
            Mão Esquerda
          </p>
          <p className="text-4xl font-black text-white">{leftGesture}</p>
        </div>

        <div className="flex-1 p-6 bg-slate-800 rounded-2xl border-b-4 border-cyan-500 text-center shadow-lg">
          <p className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-1">
            Mão Direita
          </p>
          <p className="text-4xl font-black text-white">{rightGesture}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
