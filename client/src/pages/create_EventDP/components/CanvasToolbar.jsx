import React from 'react'
import { Icon } from '@iconify/react'

const CanvasToolbar = ({
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    zoom,
    onZoomIn,
    onZoomOut,
    previewMode,
    onTogglePreview,
}) => {
    const zoomPercent = `${Math.round(zoom * 100)}%`

    return (
        <div className='absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-white/85 backdrop-blur-md rounded-2xl border border-dusty-green/25 shadow-lg shadow-forest-green/15 z-30 animate-fade-in-up'>
            <div className='flex items-center gap-1 border-r border-dusty-green/20 pr-1 mr-1'>
                <button
                    type='button'
                    onClick={onUndo}
                    disabled={!canUndo}
                    className='p-2 text-dark-slate hover:bg-pale-sage rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
                >
                    <Icon icon='mdi:undo' width='18' height='18' />
                </button>
                <button
                    type='button'
                    onClick={onRedo}
                    disabled={!canRedo}
                    className='p-2 text-dark-slate hover:bg-pale-sage rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
                >
                    <Icon icon='mdi:redo' width='18' height='18' />
                </button>
            </div>

            <div className='flex items-center gap-1 border-r border-dusty-green/20 pr-1 mr-1'>
                <button
                    type='button'
                    onClick={onZoomIn}
                    className='p-2 text-dark-slate hover:bg-pale-sage rounded-lg transition-colors'
                >
                    <Icon icon='mdi:magnify-plus-outline' width='18' height='18' />
                </button>
                <span className='text-xs font-bold text-dark-slate px-2 min-w-11 text-center'>{zoomPercent}</span>
                <button
                    type='button'
                    onClick={onZoomOut}
                    className='p-2 text-dark-slate hover:bg-pale-sage rounded-lg transition-colors'
                >
                    <Icon icon='mdi:magnify-minus-outline' width='18' height='18' />
                </button>
            </div>

            <button
                type='button'
                onClick={onTogglePreview}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${previewMode ? 'bg-dark-slate text-white' : 'bg-forest-green text-white hover:bg-dark-slate'}`}
            >
                <Icon icon='mdi:eye-outline' width='18' height='18' />
                <span>{previewMode ? 'Editing' : 'Preview'}</span>
            </button>
        </div>
    )
}

export default CanvasToolbar