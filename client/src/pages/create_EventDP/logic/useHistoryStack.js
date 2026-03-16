import { useMemo, useReducer } from 'react'

const MAX_HISTORY = 50

const initialHistoryState = (initialState) => ({
    history: [initialState],
    pointer: 0,
})

const historyReducer = (state, action) => {
    switch (action.type) {
        case 'push': {
            const trimmed = state.history.slice(0, state.pointer + 1)
            const appended = [...trimmed, action.payload]
            const history = appended.slice(-MAX_HISTORY)

            return {
                history,
                pointer: history.length - 1,
            }
        }

        case 'undo': {
            if (state.pointer <= 0) {
                return state
            }

            return {
                ...state,
                pointer: state.pointer - 1,
            }
        }

        case 'redo': {
            if (state.pointer >= state.history.length - 1) {
                return state
            }

            return {
                ...state,
                pointer: state.pointer + 1,
            }
        }

        default:
            return state
    }
}

const useHistoryStack = (initialState) => {
    const [{ history, pointer }, dispatch] = useReducer(
        historyReducer,
        initialState,
        initialHistoryState,
    )

    const canUndo = pointer > 0
    const canRedo = pointer < history.length - 1

    const current = useMemo(() => history[pointer], [history, pointer])

    const pushState = (nextState) => {
        dispatch({ type: 'push', payload: nextState })
    }

    const undo = () => {
        if (!canUndo) {
            return null
        }

        const next = history[pointer - 1]
        dispatch({ type: 'undo' })
        return next
    }

    const redo = () => {
        if (!canRedo) {
            return null
        }

        const next = history[pointer + 1]
        dispatch({ type: 'redo' })
        return next
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