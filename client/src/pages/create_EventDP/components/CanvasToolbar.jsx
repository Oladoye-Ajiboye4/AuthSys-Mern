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
        <div className='absolute top-3 left-1/2 -translate-x-1/2 w-[calc(100%-0.75rem)] sm:w-auto max-w-[620px] flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 p-1.5 bg-white/85 backdrop-blur-md rounded-2xl border border-dusty-green/25 shadow-lg shadow-forest-green/15 z-30 animate-fade-in-up overflow-x-auto'>
            <div className='flex items-center gap-1 border-r border-dusty-green/20 pr-1 mr-0.5 sm:mr-1 shrink-0'>
                <button
                    type='button'
                    onClick={onUndo}
                    disabled={disabled || !canUndo}
                    className='p-1.5 sm:p-2 min-h-9 min-w-9 text-dark-slate hover:bg-pale-sage rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
                >
                    <Icon icon='mdi:undo' width='16' height='16' className='sm:w-[18px] sm:h-[18px]' />
                </button>
                <button
                    type='button'
                    onClick={onRedo}
                    disabled={disabled || !canRedo}
                    className='p-1.5 sm:p-2 min-h-9 min-w-9 text-dark-slate hover:bg-pale-sage rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
                >
                    <Icon icon='mdi:redo' width='16' height='16' className='sm:w-[18px] sm:h-[18px]' />
                </button>
            </div>

            <div className='flex items-center gap-1 border-r border-dusty-green/20 pr-1 mr-0.5 sm:mr-1 shrink-0'>
                <button
                    type='button'
                    onClick={onZoomIn}
                    disabled={disabled}
                    className='p-1.5 sm:p-2 min-h-9 min-w-9 text-dark-slate hover:bg-pale-sage rounded-lg transition-colors'
                >
                    <Icon icon='mdi:magnify-plus-outline' width='16' height='16' className='sm:w-[18px] sm:h-[18px]' />
                </button>
                <span className='text-[11px] sm:text-xs font-bold text-dark-slate px-1.5 sm:px-2 min-w-10 sm:min-w-11 text-center'>{zoomPercent}</span>
                <button
                    type='button'
                    onClick={onZoomOut}
                    disabled={disabled}
                    className='p-1.5 sm:p-2 min-h-9 min-w-9 text-dark-slate hover:bg-pale-sage rounded-lg transition-colors'
                >
                    <Icon icon='mdi:magnify-minus-outline' width='16' height='16' className='sm:w-[18px] sm:h-[18px]' />
                </button>
            </div>

            <button
                type='button'
                onClick={onTogglePreview}
                disabled={disabled}
                aria-label={previewMode ? 'Switch to editing mode' : 'Switch to preview mode'}
                className={`relative flex items-center rounded-xl p-1 border transition-all shrink-0 ${previewMode
                    ? 'bg-dark-slate border-dark-slate text-white shadow-lg shadow-dark-slate/30'
                    : 'bg-forest-green/10 border-forest-green/30 text-dark-slate'}`}
            >
                <span className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold tracking-wide uppercase transition-colors ${!previewMode
                    ? 'bg-forest-green text-white'
                    : 'text-white/70'}`}>
                    <Icon icon='mdi:pencil-outline' width='14' height='14' className='sm:w-[15px] sm:h-[15px]' />
                    Edit
                </span>
                <span className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold tracking-wide uppercase transition-colors ${previewMode
                    ? 'bg-white text-dark-slate'
                    : 'text-dark-slate/65'}`}>
                    <Icon icon='mdi:eye-outline' width='14' height='14' className='sm:w-[15px] sm:h-[15px]' />
                    Preview
                </span>
            </button>
        </div>
    )
}

export default CanvasToolbar