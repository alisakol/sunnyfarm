import React, { useMemo } from 'react';
import { WeatherType } from '../types/game';

interface WeatherOverlayProps {
  weather: WeatherType;
}

export const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ weather }) => {
  // Pre-generate stable positions for particles
  const rainDrops = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: `${(i * 3.6 + Math.random() * 2) % 100}%`,
      animationDelay: `${(i * 0.08).toFixed(2)}s`,
      duration: `${(0.6 + (i % 5) * 0.08).toFixed(2)}s`,
      opacity: 0.35 + (i % 4) * 0.15,
    }));
  }, []);

  const puddles = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      left: `${15 + (i * 14) % 70}%`,
      top: `${50 + (i * 8) % 40}%`,
      delay: `${(i * 0.4).toFixed(1)}s`,
    }));
  }, []);

  const sunRays = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      rotate: -35 + i * 14,
      width: `${60 + i * 15}px`,
      opacity: 0.12 + (i % 2) * 0.06,
    }));
  }, []);

  const fireflies = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${10 + (i * 7.5) % 80}%`,
      top: `${35 + (i * 9) % 55}%`,
      delay: `${(i * 0.3).toFixed(1)}s`,
      duration: `${2.5 + (i % 3) * 0.6}s`,
    }));
  }, []);

  const sunSparkles = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: `${12 + (i * 11) % 76}%`,
      top: `${20 + (i * 9) % 65}%`,
      delay: `${(i * 0.4).toFixed(1)}s`,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-15 select-none transition-all duration-700">
      {/* 1. SUNNY: Volumetric Sunbeams & Golden Dust */}
      {weather === 'sunny' && (
        <>
          {/* Warm Amber Tint */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-400/10 via-yellow-300/5 to-transparent transition-opacity duration-700" />

          {/* Sun Core in top-right corner */}
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-gradient-to-br from-yellow-200 via-amber-300 to-amber-500 blur-xl opacity-40 animate-pulse" />

          {/* Golden Sun Rays Beams */}
          <div className="absolute -top-20 -right-20 w-96 h-96 overflow-hidden">
            {sunRays.map((ray) => (
              <div
                key={ray.id}
                className="absolute top-0 right-0 origin-top-right h-[550px] bg-gradient-to-b from-yellow-200/30 via-amber-300/15 to-transparent blur-sm"
                style={{
                  width: ray.width,
                  transform: `rotate(${ray.rotate}deg)`,
                  opacity: ray.opacity,
                }}
              />
            ))}
          </div>

          {/* Floating Sunlight Sparkles */}
          {sunSparkles.map((sp) => (
            <div
              key={sp.id}
              className="absolute w-2 h-2 rounded-full bg-yellow-200/80 shadow-[0_0_8px_rgba(253,224,71,0.8)] animate-bounce-mini"
              style={{
                left: sp.left,
                top: sp.top,
                animationDelay: sp.delay,
              }}
            />
          ))}
        </>
      )}

      {/* 2. RAIN: Falling Water Streaks & Ground Ripples */}
      {weather === 'rain' && (
        <>
          {/* Cool Teal/Cyan Mist Layer */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-900/25 via-cyan-950/15 to-sky-950/20 backdrop-blur-[0.3px]" />

          {/* Rain Streaks */}
          {rainDrops.map((drop) => (
            <div
              key={drop.id}
              className="absolute w-[1.5px] h-9 bg-gradient-to-b from-transparent via-sky-200/70 to-sky-100 rounded-full"
              style={{
                left: drop.left,
                top: '-36px',
                opacity: drop.opacity,
                animation: `rainFall ${drop.duration} linear infinite`,
                animationDelay: drop.animationDelay,
                transform: 'rotate(12deg)',
              }}
            />
          ))}

          {/* Ground Ripple Splashes */}
          {puddles.map((p) => (
            <div
              key={p.id}
              className="absolute w-5 h-2.5 rounded-full border border-sky-300/40 animate-ping opacity-60"
              style={{
                left: p.left,
                top: p.top,
                animationDelay: p.delay,
                animationDuration: '1.8s',
              }}
            />
          ))}
        </>
      )}

      {/* 3. RAINBOW: Arch of Nature & Sparkles */}
      {weather === 'rainbow' && (
        <>
          {/* Soft Pearlescent Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-pink-300/10 via-purple-300/5 to-transparent" />

          {/* Rainbow Arc in Upper Sky */}
          <div className="absolute -top-32 inset-x-0 h-64 flex justify-center opacity-75">
            <div className="w-[120%] h-full rounded-b-full border-[18px] border-transparent bg-gradient-to-b from-transparent via-transparent to-transparent shadow-[0_12px_24px_rgba(236,72,153,0.3)] opacity-70"
              style={{
                background: 'radial-gradient(ellipse at 50% 0%, transparent 60%, rgba(239,68,68,0.25) 63%, rgba(249,115,22,0.25) 66%, rgba(234,179,8,0.25) 69%, rgba(34,197,94,0.25) 72%, rgba(59,130,246,0.25) 75%, rgba(168,85,247,0.25) 78%, transparent 81%)',
              }}
            />
          </div>

          {/* Sparkling Floating Stars */}
          {sunSparkles.map((sp) => (
            <div
              key={sp.id}
              className="absolute text-sm animate-pulse filter drop-shadow"
              style={{
                left: sp.left,
                top: sp.top,
                animationDelay: sp.delay,
              }}
            >
              ✨
            </div>
          ))}
        </>
      )}

      {/* 4. SUNSET: Golden-Hour Embers */}
      {weather === 'sunset' && (
        <>
          {/* Rich Amber-Rose Sunset Veil */}
          <div className="absolute inset-0 bg-gradient-to-b from-rose-600/15 via-amber-600/10 to-transparent" />

          {/* Horizon Sunset Glow */}
          <div className="absolute top-1/4 -left-10 -right-10 h-32 bg-gradient-to-t from-orange-500/20 to-transparent blur-xl pointer-events-none" />

          {/* Floating Warm Golden Embers */}
          {sunSparkles.map((sp) => (
            <div
              key={sp.id}
              className="absolute w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,146,60,0.9)] animate-float-slow opacity-80"
              style={{
                left: sp.left,
                top: sp.top,
                animationDelay: sp.delay,
              }}
            />
          ))}
        </>
      )}

      {/* 5. NIGHT: Dark Blue Sky & Pulsing Fireflies */}
      {weather === 'night' && (
        <>
          {/* Twilight Deep Indigo Film */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/40 via-blue-950/30 to-emerald-950/40" />

          {/* Crescent Moon in top sky */}
          <div className="absolute top-3 right-6 text-xl animate-float-slow filter drop-shadow-[0_0_8px_rgba(254,240,138,0.8)]">
            🌙
          </div>

          {/* Twinkling Fireflies Floating over Plots */}
          {fireflies.map((ff) => (
            <div
              key={ff.id}
              className="absolute w-2 h-2 rounded-full bg-lime-300 shadow-[0_0_10px_rgba(190,242,100,0.9)] animate-pulse"
              style={{
                left: ff.left,
                top: ff.top,
                animationDelay: ff.delay,
                animationDuration: ff.duration,
              }}
            />
          ))}
        </>
      )}

      {/* Inline Keyframes for falling rain */}
      <style>{`
        @keyframes rainFall {
          0% {
            transform: translateY(0) rotate(12deg);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(680px) rotate(12deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
