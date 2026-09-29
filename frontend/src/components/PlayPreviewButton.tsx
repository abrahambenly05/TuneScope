import { useRef, useState } from 'react'

export default function PlayPreviewButton( { src }: { src: string } ) {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)

    function toggle () {
        const audio = audioRef.current
        if (!audio) return
        if (isPlaying) {
            audio.pause()
        } else {
            audio.play()
        }
    }

    return (
        <>
         <audio
            ref={audioRef}
            src={src}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
         />
         <button
            type="button"
            onClick={toggle}
            className="flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 font-semibold text-white"
         >
                {isPlaying ? '❚❚ Pause' : '▶ Play Preview'}
            </button>   
        </>
    )
}