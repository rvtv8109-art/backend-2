@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Poppins", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Poppins", sans-serif;
  --font-headline: "Poppins", sans-serif;
  
  --color-cyber-black: #050505;
  --color-cyber-red: #FF003C;
  --color-cyber-orange: #FF4E00;
  --color-cyber-dark-blue: #080911;
  --theme-color: #FF4E00; /* Kesari/Orange */
}

@layer base {
  body {
    @apply bg-cyber-black text-white font-sans overflow-x-hidden selection:bg-cyber-red selection:text-white;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

@layer utilities {
  .glass-card {
    @apply bg-white/[0.03] border border-white/5 rounded-xl;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    will-change: transform, opacity;
  }
  
  .shadow-2x-strong {
    box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.7), 0 30px 60px -30px rgba(0, 0, 0, 0.5);
  }

  .text-border-glow {
    text-shadow: 0 0 20px rgba(255, 0, 60, 0.4);
  }
  
  .bg-noise {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    opacity: 0.05;
    pointer-events: none;
  }

  .perspective-1000 {
    perspective: 1000px;
  }

  .preserve-3d {
    transform-style: preserve-3d;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    height: 4px;
    width: 4px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    @apply bg-transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-white/10 rounded-full hover:bg-white/20;
  }
}

/* Custom scrollbar - Global reset */
::-webkit-scrollbar {
  width: 0px;
  height: 0px;
  background: transparent;
}

* {
  scrollbar-width: none;
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

.animate-pulse-slow {
  animation: pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes scanline {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

.scanline-effect::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 10%;
  background: linear-gradient(to bottom, transparent, rgba(255, 0, 60, 0.05), transparent);
  animation: scanline 6s linear infinite;
  pointer-events: none;
  z-index: 5;
}

@keyframes shimmer-fast {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer-fast {
  animation: shimmer-fast 2s linear infinite;
}

@keyframes tilt {
  0%, 100% { transform: rotate3d(1, 1, 0, 0deg); }
  50% { transform: rotate3d(1, 1, 0, 10deg); }
}

.animate-tilt {
  animation: tilt 10s ease-in-out infinite;
}
