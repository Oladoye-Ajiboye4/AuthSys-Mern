import React, { useRef } from 'react'
import { Icon } from '@iconify/react'
import useZoneSelector from '../logic/useZoneSelector'

const HANDLE_CONFIG = [
    { key: 'n', className: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize' },
    { key: 's', className: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize' },
    { key: 'e', className: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize' },
    { key: 'w', className: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize' },
    { key: 'ne', className: 'right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize' },
    { key: 'nw', className: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize' },
    { key: 'se', className: 'right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize' },
    { key: 'sw', className: 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize' },
]

// Renders selection zone and resize handles.
const ZoneOverlay = ({ rect, shape, cornerRadius, isInteracting, showHandles }) => {
    if (!rect || rect.width < 2 || rect.height < 2) return null

    const borderColor = isInteracting ? 'rgba(90,120,99,0.8)' : '#5A7863'
    const fillColor = isInteracting ? 'rgba(90,120,99,0.17)' : 'rgba(90,120,99,0.13)'

    const style = {
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        border: `2px dashed ${borderColor}`,
        backgroundColor: fillColor,
        pointerEvents: 'auto',
        transition: isInteracting ? 'none' : 'all 0.2s ease',
        cursor: 'move',
    }

    if (shape === 'circle') {
        style.borderRadius = '50%'
    } else {
        style.borderRadius = `${cornerRadius}px`
    }

    return (
        <div style={style}>
            {showHandles && HANDLE_CONFIG.map((handle) => (
                <span
                    key={handle.key}
                    data-resize-handle={handle.key}
                    className={`absolute h-3 w-3 rounded-full bg-white border border-forest-green shadow ${handle.className}`}
                />
            ))}
        </div>
    )
}

const CanvasStage = ({
    uploadedImage,
    onUpload,
    onRemove,
    backgroundOpacity,
    cornerRadius,
    displayedCanvasSize,
    canvasDimensions,
    previewMode,
    // zone
    zoneShape,
    committedZone,
    onZoneCommit,
    onClearZone,
}) => {
    const fileInputRef = useRef(null)

    const { canvasRef, isInteracting, activeRect, pointerHandlers } = useZoneSelector({
        zoneShape,
        committedZone,
        onZoneCommit,
    })

    const handleFilePick = (event) => {
        const [file] = event.target.files || []
        onUpload(file)
        event.target.value = ''
    }

    const canDraw = !!uploadedImage && !previewMode

    return (
        <div className='flex-1 relative overflow-hidden'>
            {/* Dotted workspace background */}
            <div className='absolute inset-0 bg-[radial-gradient(rgba(144,171,139,0.35)_0.8px,transparent_0.8px)] bg-size-[20px_20px]' />

            <div className='relative h-full w-full flex items-center justify-center p-6 sm:p-10 lg:p-16'>
                {/* Canvas frame */}
                <div
                    className='bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden transition-all duration-500 animate-scale-in select-none'
                    style={{
                        width: `${displayedCanvasSize.width}px`,
                        height: `${displayedCanvasSize.height}px`,
                        borderRadius: '14px',
                        cursor: canDraw ? 'crosshair' : 'default',
                        position: 'relative',
                        touchAction: 'none',
                    }}
                    ref={canvasRef}
                    {...(canDraw ? pointerHandlers : {})}
                >
                    {/* Background image or upload prompt */}
                    {uploadedImage ? (
                        <>
                            <img
                                src={uploadedImage.src}
                                alt={uploadedImage.name}
                                draggable={false}
                                className='h-full w-full object-cover pointer-events-none'
                                style={{ opacity: backgroundOpacity / 100 }}
                            />
                            {!previewMode && (
                                <div className='absolute inset-0 bg-black/25 pointer-events-none mix-blend-multiply' />
                            )}
                        </>
                    ) : (
                        <button
                            type='button'
                            onClick={() => fileInputRef.current?.click()}
                            className='h-full w-full flex flex-col items-center justify-center text-forest-green/50 hover:text-forest-green hover:bg-pale-sage/40 transition-colors'
                        >
                            <Icon icon='mdi:upload-outline' width='66' height='66' />
                            <span className='mt-3 text-sm font-semibold'>Upload your image</span>
                        </button>
                    )}

                    {activeRect && (
                        <ZoneOverlay
                            rect={activeRect}
                            shape={zoneShape}
                            cornerRadius={cornerRadius}
                            isInteracting={isInteracting}
                            showHandles={!previewMode && !!committedZone}
                        />
                    )}

                    {/* Remove image button */}
                    {uploadedImage && !previewMode && (
                        <button
                            data-zone-control='true'
                            type='button'
                            onClick={onRemove}
                            className='absolute top-3 right-3 h-9 w-9 rounded-full bg-dark-slate/80 text-white flex items-center justify-center hover:bg-dark-slate transition-colors'
                            aria-label='Remove image'
                        >
                            <Icon icon='mdi:close' width='18' height='18' />
                        </button>
                    )}

                    {/* Clear zone button */}
                    {committedZone && !previewMode && (
                        <button
                            data-zone-control='true'
                            type='button'
                            onClick={onClearZone}
                            className='absolute top-3 left-3 h-7 px-2 rounded-full bg-dark-slate/75 text-white text-[10px] font-semibold flex items-center gap-1 hover:bg-dark-slate transition-colors'
                            aria-label='Clear zone'
                        >
                            <Icon icon='mdi:selection-remove' width='13' height='13' />
                            Clear zone
                        </button>
                    )}

                    {/* Canvas info badge */}
                    {!previewMode && (
                        <div className='absolute left-3 bottom-3 rounded-md bg-dark-slate/70 text-white text-[10px] px-2 py-1 tracking-wide pointer-events-none'>
                            {canvasDimensions.width} × {canvasDimensions.height}px
                            {canDraw && !committedZone && ' • drag to place zone'}
                            {canDraw && committedZone && ' • drag to move, handles to resize'}
                        </div>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={handleFilePick}
                />
            </div>

            {/* Draw-mode hint ribbon */}
            {canDraw && !committedZone && (
                <div className='absolute bottom-4 left-1/2 -translate-x-1/2 bg-dark-slate/80 text-white text-xs font-medium px-4 py-2 rounded-full pointer-events-none animate-fade-in-up'>
                    Drag on the image to mark where guests upload their photo
                </div>
            )}
        </div>
    )
}

export default CanvasStage