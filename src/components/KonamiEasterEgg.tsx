import { useEffect, useState, useRef } from "react";

const KonamiEasterEgg = () => {
  const [active, setActive] = useState(false);

  const konamiCode = [
    "ArrowUp", "ArrowUp",
    "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight",
    "ArrowLeft", "ArrowRight",
    "b", "a"
  ];

  const keysPressed = useRef<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed.current.push(event.key);

      // Mantener solo los últimos N
      if (keysPressed.current.length > konamiCode.length) {
        keysPressed.current.shift();
      }

      // Comparar
      if (JSON.stringify(keysPressed.current) === JSON.stringify(konamiCode)) {
        setActive(true);

        // (Opcional) reproducir sonido 🎵
        const audio = new Audio("/5SOS.mp3");
         audio.play().catch(() => {});
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {active && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl text-center max-w-md shadow-xl">
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              🎉 ¡Easter Egg desbloqueado!
            </h2>
            <p className="mb-4">
              Fan de <strong>5SOS</strong> detectado 💚  
              Sabemos que amas LOTR, Legos y viajar 🌍
            </p>
            <button
              onClick={() => setActive(false)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default KonamiEasterEgg;
