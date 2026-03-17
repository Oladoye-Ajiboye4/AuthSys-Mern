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
    disabled,
}) => {
    const zoomPercent = `${Math.round(zoom * 100)}%`

    return (
        <div className='absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-white/85 backdrop-blur-md rounded-2xl border border-dusty-green/25 shadow-lg shadow-forest-green/15 z-30 animate-fade-in-up'>
            <div className='flex items-center gap-1 border-r border-dusty-green/20 pr-1 mr-1'>
                <button
                    type='button'
                    onClick={onUndo}
                    disabled={disabled || !canUndo}
                    className='p-2 text-dark-slate hover:bg-pale-sage rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
                >
                    <Icon icon='mdi:undo' width='18' height='18' />
                </button>
                <button
                    type='button'
                    onClick={onRedo}
                    disabled={disabled || !canRedo}
                    className='p-2 text-dark-slate hover:bg-pale-sage rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
                >
                    <Icon icon='mdi:redo' width='18' height='18' />
                </button>
            </div>

            <div className='flex items-center gap-1 border-r border-dusty-green/20 pr-1 mr-1'>
                <button
                    type='button'
                    onClick={onZoomIn}
                    disabled={disabled}
                    className='p-2 text-dark-slate hover:bg-pale-sage rounded-lg transition-colors'
                >
                    <Icon icon='mdi:magnify-plus-outline' width='18' height='18' />
                </button>
                <span className='text-xs font-bold text-dark-slate px-2 min-w-11 text-center'>{zoomPercent}</span>
                <button
                    type='button'
                    onClick={onZoomOut}
                    disabled={disabled}
                    className='p-2 text-dark-slate hover:bg-pale-sage rounded-lg transition-colors'
                >
                    <Icon icon='mdi:magnify-minus-outline' width='18' height='18' />
                </button>
            </div>

            <button
                type='button'
                onClick={onTogglePreview}
                disabled={disabled}
                aria-label={previewMode ? 'Switch to editing mode' : 'Switch to preview mode'}
                className={`relative flex items-center rounded-xl p-1 border transition-all ${previewMode
                    ? 'bg-dark-slate border-dark-slate text-white shadow-lg shadow-dark-slate/30'
                    : 'bg-forest-green/10 border-forest-green/30 text-dark-slate'}`}
            >
                <span className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wide uppercase transition-colors ${!previewMode
                    ? 'bg-forest-green text-white'
                    : 'text-white/70'}`}>
                    <Icon icon='mdi:pencil-outline' width='15' height='15' />
                    Edit
                </span>
                <span className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wide uppercase transition-colors ${previewMode
                    ? 'bg-white text-dark-slate'
                    : 'text-dark-slate/65'}`}>
                    <Icon icon='mdi:eye-outline' width='15' height='15' />
                    Preview
                </span>
            </button>
        </div>
    )
}

export default CanvasToolbar