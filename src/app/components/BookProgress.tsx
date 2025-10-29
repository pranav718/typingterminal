'use client'

interface BookProgressProps {
  title: string
  currentPassage: number
  totalPassages: number
  isUploaded: boolean
}

export default function BookProgress({ title, currentPassage, totalPassages, isUploaded }: BookProgressProps) {
  const progress = Math.round(((currentPassage + 1) / totalPassages) * 100)

  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-matrix-primary/10 to-matrix-primary/5 border border-matrix-primary/20 rounded-lg backdrop-blur-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{isUploaded ? '📄' : '📖'}</span>
            <h3 className="text-base md:text-lg font-semibold text-matrix-primary">{title}</h3>
          </div>
          <div className="text-sm text-matrix-light">
            Passage {currentPassage + 1} of {totalPassages}
          </div>
        </div>

        <div className="w-full md:w-48">
          <div className="flex justify-between text-xs text-matrix-light mb-1">
                        <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-matrix-primary/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-matrix-primary to-cyan-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}