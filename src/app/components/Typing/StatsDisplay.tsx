'use client'

interface StatsDisplayProps {
  wpm: number;
  accuracy: number;
  errors: number;
}

export default function StatsDisplay({ wpm, accuracy, errors }: StatsDisplayProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl">
      <div className="flex flex-col md:flex-row md:flex-col items-center justify-between md:justify-center gap-2 p-4 md:p-5 bg-gradient-to-br from-matrix-primary/10 to-matrix-primary/5 border-2 border-matrix-primary/30 rounded-xl transition-all hover:border-matrix-primary hover:-translate-y-1 hover:shadow-glow-lg">
        <span className="text-xs uppercase tracking-wider text-matrix-light/80 font-semibold">WPM</span>
        <span className="text-3xl md:text-4xl font-bold text-matrix-primary drop-shadow-glow-lg">
          {wpm}
        </span>
      </div>
      
      <div className="flex flex-col md:flex-row md:flex-col items-center justify-between md:justify-center gap-2 p-4 md:p-5 bg-gradient-to-br from-matrix-primary/10 to-matrix-primary/5 border-2 border-matrix-primary/30 rounded-xl transition-all hover:border-matrix-primary hover:-translate-y-1 hover:shadow-glow-lg">
        <span className="text-xs uppercase tracking-wider text-matrix-light/80 font-semibold">Accuracy</span>
        <span className="text-3xl md:text-4xl font-bold text-matrix-primary drop-shadow-glow-lg">
          {accuracy}%
        </span>
      </div>
      
      <div className="flex flex-col md:flex-row md:flex-col items-center justify-between md:justify-center gap-2 p-4 md:p-5 bg-gradient-to-br from-matrix-primary/10 to-matrix-primary/5 border-2 border-matrix-primary/30 rounded-xl transition-all hover:border-matrix-primary hover:-translate-y-1 hover:shadow-glow-lg">
        <span className="text-xs uppercase tracking-wider text-matrix-light/80 font-semibold">Errors</span>
        <span className="text-3xl md:text-4xl font-bold text-matrix-primary drop-shadow-glow-lg">
          {errors}
        </span>
      </div>
    </div>
  );
}