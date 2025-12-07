'use client'

interface BookProgressProps {
  title: string
  currentPassage: number
  totalPassages: number
  isUploaded: boolean
}

export default function BookProgress({ title, currentPassage, totalPassages, isUploaded }: BookProgressProps) {
  const safeTotal = totalPassages || 1
  const progress = Math.min(100, Math.round(((currentPassage + 1) / safeTotal) * 100))

  return (
    <div className="terminal-window p-4 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="text-xs text-[#7bff9a]/60 mb-1">CURRENT BOOK:</div>
          <div className="font-bold text-[#41ff5f] text-shadow-glow">{title}</div>
          <div className="text-sm text-[#7bff9a]/80 mt-1 font-mono">
            Passage {currentPassage + 1} of {totalPassages}
          </div>
        </div>

        <div className="w-full md:w-64">
          <div className="flex justify-between text-xs text-[#7bff9a]/60 mb-1 font-mono">
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-[#41ff5f20] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#41ff5f] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}