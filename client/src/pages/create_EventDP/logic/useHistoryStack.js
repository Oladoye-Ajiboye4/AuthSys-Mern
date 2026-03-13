import { useMemo, useState } from 'react'

const MAX_HISTORY = 50

const useHistoryStack = (initialState) => {
    const [history, setHistory] = useState([initialState])
    const [pointer, setPointer] = useState(0)

    const canUndo = pointer > 0
    const canRedo = pointer < history.length - 1

    const current = useMemo(() => history[pointer], [history, pointer])

    const pushState = (nextState) => {
        setHistory((prev) => {
            const trimmed = prev.slice(0, pointer + 1)
            const appended = [...trimmed, nextState]
            return appended.slice(-MAX_HISTORY)
        })
        setPointer((prev) => {
            const candidate = prev + 1
            return candidate >= MAX_HISTORY ? MAX_HISTORY - 1 : candidate
        })
    }

    const undo = () => {
        if (!canUndo) {
            return null
        }
        const nextPointer = pointer - 1
        setPointer(nextPointer)
        return history[nextPointer]
    }

    const redo = () => {
        if (!canRedo) {
            return null
        }
        const nextPointer = pointer + 1
        setPointer(nextPointer)
        return history[nextPointer]
    }

    return {
        current,
        canUndo,
        canRedo,
        pushState,
        undo,
        redo,
    }
}

export default useHistoryStack