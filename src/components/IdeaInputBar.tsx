import { useCallback, useRef, useState } from 'react'
import { Mic, MicOff, Send } from 'lucide-react'
import { shellPanelClass } from './GridBackground'
import { processVoiceIdea } from '../lib/functions'
import { IdeaConfirmModal } from './IdeaConfirmModal'
import { createRoadmapItem } from '../hooks/useRoadmapItems'
import type { RoadmapItemInput } from '../types/roadmap'

type RecordingState = 'idle' | 'recording' | 'processing'

interface IdeaInputBarProps {
  isLoggedIn: boolean
  userId: string | null
  userEmail?: string | null
  itemCount: number
  onLoginRequired: () => void
}

export function IdeaInputBar({
  isLoggedIn,
  userId,
  userEmail,
  itemCount,
  onLoginRequired,
}: IdeaInputBarProps) {
  const [text, setText] = useState('')
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalInitial, setModalInitial] = useState({
    title: '',
    description: '',
    emoji: '💡',
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const openModal = useCallback((initial: { title: string; description: string; emoji?: string }) => {
    setModalInitial({
      title: initial.title,
      description: initial.description,
      emoji: initial.emoji ?? '💡',
    })
    setModalOpen(true)
  }, [])

  const handleTextSubmit = () => {
    if (!isLoggedIn) {
      onLoginRequired()
      return
    }
    if (!text.trim()) return

    const lines = text.trim().split('\n')
    openModal({
      title: lines[0].slice(0, 120),
      description: lines.slice(1).join('\n').trim() || lines[0],
      emoji: '💡',
    })
    setText('')
  }

  const startRecording = async () => {
    if (!isLoggedIn) {
      onLoginRequired()
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      const recorder = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: mimeType })
        await processRecording(blob, mimeType)
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setRecordingState('recording')
    } catch {
      setRecordingState('idle')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
      setRecordingState('processing')
    }
  }

  const processRecording = async (blob: Blob, mimeType: string) => {
    try {
      const base64 = await blobToBase64(blob)
      const result = await processVoiceIdea(base64, mimeType)
      openModal({
        title: result.title,
        description: result.description,
        emoji: result.emoji,
      })
    } catch {
      openModal({ title: 'New idea', description: 'Could not process voice. Please edit.', emoji: '💡' })
    } finally {
      setRecordingState('idle')
    }
  }

  const handleConfirm = async (input: RoadmapItemInput) => {
    if (!userId) return
    await createRoadmapItem(input, userId, itemCount, userEmail ?? undefined)
  }

  const toggleMic = () => {
    if (recordingState === 'recording') {
      stopRecording()
    } else if (recordingState === 'idle') {
      startRecording()
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4">
        <button
          type="button"
          onClick={onLoginRequired}
          className={`w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-[var(--border)] shadow-lg ${shellPanelClass} text-[var(--text-secondary)] hover:text-brand-500 transition-colors`}
        >
          Sign in to share your ideas
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4">
        <div
          className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border border-[var(--border)] shadow-lg ${shellPanelClass}`}
        >
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
            placeholder="Share an idea..."
            disabled={recordingState === 'processing'}
            className="flex-1 bg-transparent px-2 py-1.5 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
          />

          <button
            type="button"
            onClick={toggleMic}
            disabled={recordingState === 'processing'}
            className={`p-2.5 rounded-xl transition-colors ${
              recordingState === 'recording'
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-[var(--text-muted)] hover:text-brand-500 hover:bg-brand-500/10'
            }`}
            aria-label={recordingState === 'recording' ? 'Stop recording' : 'Start voice input'}
          >
            {recordingState === 'recording' ? (
              <MicOff className="w-5 h-5" />
            ) : recordingState === 'processing' ? (
              <span className="w-5 h-5 block border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          <button
            type="button"
            onClick={handleTextSubmit}
            disabled={!text.trim() || recordingState !== 'idle'}
            className="p-2.5 rounded-xl bg-brand-500 text-white hover:bg-brand-400 disabled:opacity-40 transition-colors"
            aria-label="Submit idea"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <IdeaConfirmModal
        open={modalOpen}
        initial={modalInitial}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  )
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
