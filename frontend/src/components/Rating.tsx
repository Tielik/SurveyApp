import { cn } from "@/lib/utils"

interface RatingProps {
  value: number | null
  onChange?: (value: number) => void
  disabled?: boolean
  className?: string
}

export const Rating = ({ value, onChange, disabled = false, className }: RatingProps) => {
  const points = [1, 2, 3, 4, 5]

  return (
    <div className={cn("w-full max-w-sm flex flex-col gap-2", className)}>
      <div className="relative flex items-center justify-between px-2 py-4">
        
        <div className="absolute left-2 right-2 top-1/2 h-1 bg-slate-200 -z-10 rounded-full" />

        {points.map((point) => {
          const isSelected = value === point
          const isLower = value !== null && point < value

          return (
            <button
              key={point}
              type="button"
              disabled={disabled}
              onClick={() => onChange && onChange(point)}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
                disabled ? "cursor-default" : "cursor-pointer hover:scale-110",

                isSelected
                  ? "border-blue-600 bg-blue-600 text-white shadow-lg scale-110"
                  : isLower
                  ? "border-blue-400 bg-blue-50 text-blue-600"
                  : "border-slate-300 bg-white text-slate-500 hover:border-blue-400"
              )}
            >
              <span className="text-sm font-bold">{point}</span>
            </button>
          )
        })}
      </div>
      
      <div className="flex justify-between px-1 text-xs text-muted-foreground font-medium">
        <span>Bardzo źle</span>
        <span>Doskonale</span>
      </div>
    </div>
  )
}