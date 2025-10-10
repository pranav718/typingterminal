'use client'

interface CompletionCardProps {
  wpm: number;
  accuracy: number;
  errors: number;
  onNext: () => void;
}

export default function CompletionCard({ wpm, accuracy, errors, onNext }: CompletionCardProps) {
  return (
    <div className="mt-8 p-6 md:p-8 bg-gradient-to-br from-matrix-primary/20 to-matrix-primary/10 border-2 border-matrix-primary rounded-2xl text-center animate-slide-up relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-matrix-primary/10 to-transparent opacity-50 animate-pulse-slow" />
      
      <h3 className="text-2xl md:text-3xl font-bold text-matrix-primary mb-6 drop-shadow-glow-xl relative z-10">
        Passage Completed! 
      </h3>
      
      <div className="flex flex-col md:flex-row justify-around gap-4 mb-6 relative z-10">
        <div className="px-4 py-3 bg-matrix-primary/20 border border-matrix-primary/30 rounded-lg">
          <span className="text-base text-matrix-light font-medium">Final WPM: {wpm}</span>
        </div>
        <div className="px-4 py-3 bg-matrix-primary/20 border border-matrix-primary/30 rounded-lg">
          <span className="text-base text-matrix-light font-medium">Final Accuracy: {accuracy}%</span>
        </div>
        <div className="px-4 py-3 bg-matrix-primary/20 border border-matrix-primary/30 rounded-lg">
          <span className="text-base text-matrix-light font-medium">Total Errors: {errors}</span>
        </div>
      </div>
      
      <button
        onClick={onNext}
        className="px-8 py-3.5 bg-matrix-primary text-matrix-bg font-bold rounded-lg hover:-translate-y-1 hover:shadow-glow-hover transition-all relative z-10"
      >
        Next Passage
      </button>
    </div>
  );
}