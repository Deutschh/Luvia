import { useRef, useState, useCallback, useEffect } from "react";
import { useMediaPipe } from "./hooks/useMediaPipe";
import { recognizeGesture, checkBimanualGesture } from "./utils/geometry";
import { speak } from "./services/speech";

// Dados do dicionário para consulta do usuário
const GESTURE_DICTIONARY = [
  {
    name: "Letra A",
    type: "Estático",
    desc: "Feche a mão com o polegar ao lado do indicador.",
  },
  {
    name: "Letra B",
    type: "Estático",
    desc: "Mão aberta, quatro dedos juntos e polegar dobrado na palma.",
  },
  {
    name: "Letra L",
    type: "Estático",
    desc: "Estique apenas o polegar e o indicador formando um 'L'.",
  },
  {
    name: "Oi!",
    type: "Dinâmico",
    desc: "Faça a letra 'I' (dedinho) e balance a mão lateralmente.",
  },
  {
    name: "Casa",
    type: "Bimanual",
    desc: "Una as pontas dos dedos das duas mãos abertas em formato de telhado.",
  },
];

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Estados de Interface
  const [isMirrored, setIsMirrored] = useState(true);
  const [selectedGestureInfo, setSelectedGestureInfo] = useState(null);

  // Estados de Tradução
  const [leftGesture, setLeftGesture] = useState("Nenhuma");
  const [rightGesture, setRightGesture] = useState("Nenhuma");
  const [history, setHistory] = useState([]);
  const [progress, setProgress] = useState({ Left: 0, Right: 0 });

  const gestureCounters = useRef({ Left: 0, Right: 0 });
  const currentActiveGestures = useRef({ Left: "", Right: "" });
  const movementBuffer = useRef({ Left: [], Right: [] });
  const lastSpoken = useRef({ Left: "", Right: "" });
  const speechCooldown = useRef(false);

  const CONFIRMATION_THRESHOLD = 20;

  const onResults = useCallback(
    (results) => {
      if (!canvasRef.current) return;
      const canvasCtx = canvasRef.current.getContext("2d");

      canvasCtx.save();
      canvasCtx.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );

      // Aplica espelhamento no desenho se o estado estiver ativo
      if (isMirrored) {
        canvasCtx.translate(canvasRef.current.width, 0);
        canvasCtx.scale(-1, 1);
      }

      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );

      let newProgress = { Left: 0, Right: 0 };
      let currentLeft = "Nenhuma";
      let currentRight = "Nenhuma";
      let landmarksByHand = { Left: null, Right: null };

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        results.multiHandLandmarks.forEach((landmarks, index) => {
          const handedness = results.multiHandedness[index].label;
          landmarksByHand[handedness] = landmarks;

          const history = movementBuffer.current[handedness];
          history.push(landmarks[20]);
          if (history.length > 15) history.shift();

          const detectedGesture = recognizeGesture(landmarks, history);
          const isDynamicGesture = detectedGesture.includes("!");

          if (
            detectedGesture !== "Nenhuma" &&
            detectedGesture !== "Mão Detectada"
          ) {
            if (isDynamicGesture) {
              if (
                detectedGesture !== lastSpoken.current[handedness] &&
                !speechCooldown.current
              ) {
                speak(detectedGesture);
                lastSpoken.current[handedness] = detectedGesture;
                addToHistory(detectedGesture, handedness);
                speechCooldown.current = true;
                setTimeout(() => {
                  speechCooldown.current = false;
                }, 1000);
              }
              newProgress[handedness] = 0;
            } else {
              if (
                detectedGesture === currentActiveGestures.current[handedness]
              ) {
                gestureCounters.current[handedness]++;
              } else {
                gestureCounters.current[handedness] = 0;
                currentActiveGestures.current[handedness] = detectedGesture;
              }
              newProgress[handedness] = Math.min(
                (gestureCounters.current[handedness] / CONFIRMATION_THRESHOLD) *
                  100,
                100,
              );
              if (
                gestureCounters.current[handedness] === CONFIRMATION_THRESHOLD
              ) {
                speak(detectedGesture);
                addToHistory(detectedGesture, handedness);
              }
            }
          } else {
            gestureCounters.current[handedness] = 0;
          }

          if (handedness === "Left") currentLeft = detectedGesture;
          if (handedness === "Right") currentRight = detectedGesture;

          // Desenho com a cor Luvia (Azul Royal)
          window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, {
            color: "#0066FF",
            lineWidth: 4,
          });
          window.drawLandmarks(canvasCtx, landmarks, {
            color: "#FFFFFF",
            lineWidth: 1,
            radius: 3,
          });
        });

        const bimanualResult = checkBimanualGesture(
          landmarksByHand.Left,
          landmarksByHand.Right,
        );
        if (bimanualResult === "Casa") {
          currentLeft = "Casa";
          currentRight = "Casa";
          gestureCounters.current.Left++;
          gestureCounters.current.Right++;
          const prog = Math.min(
            (gestureCounters.current.Left / CONFIRMATION_THRESHOLD) * 100,
            100,
          );
          newProgress.Left = prog;
          newProgress.Right = prog;
          if (gestureCounters.current.Left === CONFIRMATION_THRESHOLD) {
            speak("Casa");
            addToHistory("Casa", "Ambas");
          }
        }
      }

      setProgress(newProgress);
      setLeftGesture(currentLeft);
      setRightGesture(currentRight);
      canvasCtx.restore();
    },
    [isMirrored],
  );

  const addToHistory = (text, hand) => {
    setHistory((prev) =>
      [
        {
          id: Date.now(),
          text,
          hand,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        ...prev,
      ].slice(0, 5),
    );
  };

  useMediaPipe(videoRef, onResults);

  return (
    <div className="bg-[#F2F4F7] min-h-screen w-full flex flex-col items-center p-6 font-sans text-[#1D2939]">
      {/* Header Estilo Luvia */}
      <header className="w-full max-w-6xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#0066FF] rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-white font-bold text-xl">L</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0066FF] tracking-tight">
            luvia
          </h1>
        </div>
        <button
          onClick={() => setIsMirrored(!isMirrored)}
          className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all flex items-center gap-2 text-sm font-semibold"
        >
          {isMirrored ? "🔄 Normal" : "🪞 Espelhar"}
        </button>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-6xl">
        {/* Coluna Esquerda: Câmera e Dicionário */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Container da Câmera */}
          <div className="relative rounded-[2.5rem] overflow-hidden bg-white shadow-xl shadow-slate-200/50 border-8 border-white min-h-[480px]">
            <video
              ref={videoRef}
              style={{ transform: isMirrored ? "scaleX(-1)" : "none" }}
              className="w-full h-full object-cover"
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
            <div className="absolute top-6 left-6 bg-blue-600/90 text-white px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm shadow-lg">
              SISTEMA ATIVO
            </div>
          </div>

          {/* Dicionário Interativo */}
          <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-50">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-blue-600">📚</span> Dicionário de Gestos
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {GESTURE_DICTIONARY.map((g) => (
                <div
                  key={g.name}
                  onMouseEnter={() => setSelectedGestureInfo(g)}
                  onClick={() => setSelectedGestureInfo(g)}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-help group"
                >
                  <p className="font-bold text-sm group-hover:text-blue-600">
                    {g.name}
                  </p>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    {g.type}
                  </span>
                </div>
              ))}
            </div>
            {selectedGestureInfo && (
              <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
                <p className="text-sm text-blue-800">
                  <span className="font-bold">Como fazer:</span>{" "}
                  {selectedGestureInfo.desc}
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Coluna Direita: Status e Histórico */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Status Bimanual (Baseado nos Círculos do Wireframe) */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "ESQUERDA", val: leftGesture, prog: progress.Left },
              { label: "DIREITA", val: rightGesture, prog: progress.Right },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex flex-col items-center text-center relative overflow-hidden"
              >
                <p className="text-[10px] font-black text-slate-400 tracking-widest mb-2">
                  {item.label}
                </p>
                <h2 className="text-2xl font-black text-blue-600 truncate w-full">
                  {item.val === "Nenhuma" ? "---" : item.val}
                </h2>
                <div className="absolute bottom-0 left-0 h-1.5 bg-slate-100 w-full">
                  <div
                    className="h-full bg-blue-600 transition-all duration-150"
                    style={{ width: `${item.prog}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Histórico "Luvia Style" */}
          <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-50 flex-grow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800">Últimas Frases</h3>
              <button
                onClick={() => setHistory([])}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                Limpar
              </button>
            </div>
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-2 opacity-20">💬</div>
                  <p className="text-slate-400 text-sm italic">
                    Aguardando sinais...
                  </p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-blue-600 text-xs font-bold mb-1">
                        {item.hand === "Ambas"
                          ? "🙌 BIMANUAL"
                          : `🧤 MÃO ${item.hand.toUpperCase()}`}
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {item.text}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {item.time}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Footer/Nav do App Adaptado */}
          <nav className="bg-white p-4 rounded-full shadow-sm border border-slate-50 flex justify-around items-center">
            <button className="text-blue-600 text-xl">🏠</button>
            <button className="text-slate-300 text-xl">📖</button>
            <button className="text-slate-300 text-xl">🧤</button>
            <button className="text-slate-300 text-xl">⚙️</button>
          </nav>
        </div>
      </main>
    </div>
  );
}

export default App;
