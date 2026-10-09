interface StarRatingProps {
    value: number
    onChange?: (rating: number) => void
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

const SIZE_CLASSES = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
}

export default function StarRating({
    value,
    onChange,
    size = 'md',
    className = '',
}: StarRatingProps) {
    const isInteractive = Boolean(onChange)

    return (
        <div className={`flex items-center gap-0.5 ${className}`}>
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= Math.round(value)
                const starClass = `${SIZE_CLASSES[size]} leading-none ${
                    filled ? 'text-amber-400' : 'text-slate-300'
                }`

                if (!isInteractive) {
                    return (
                        <span key={star} className={starClass} aria-hidden="true">
                            ★
                        </span>
                    )
                }

                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange?.(star)}
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        className={`${starClass} transition hover:scale-110`}
                    >
                        ★
                    </button>
                )
            })}
        </div>
    )
}