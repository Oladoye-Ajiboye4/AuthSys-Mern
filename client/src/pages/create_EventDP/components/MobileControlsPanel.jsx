import React, { useState } from 'react'
import { Icon } from '@iconify/react'

const MobileControlsPanel = ({
    zoneShape,
    zoneShapes,
    onSelectZoneShape,
    backgroundOpacity,
    onOpacityChange,
    cornerRadius,
    onRadiusChange,
    snapToGrid,
    onToggleSnap,
    disabled,
}) => {
    const [open, setOpen] = useState(false)

    return (
        <div className='xl:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] sm:w-115'>
            <button
                type='button'
                disabled={disabled}
                onClick={() => setOpen((prev) => !prev)}
                className='w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/90 backdrop-blur border border-dusty-green/25 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed'
            >
                <span className='text-sm font-semibold'>Quick Controls</span>
                <Icon icon={open ? 'mdi:chevron-down' : 'mdi:chevron-up'} width='20' height='20' />
            </button>

            {open && (
                <fieldset disabled={disabled} className='mt-2 rounded-2xl bg-white/95 backdrop-blur border border-dusty-green/20 p-4 space-y-4 animate-fade-in-up'>
                    {/* Zone shape selector */}
                    <div className='space-y-2'>
                        <span className='text-xs font-bold text-dark-slate uppercase tracking-wide'>Guest Photo Zone Shape</span>
                        <div className='grid grid-cols-2 gap-2'>
                            {Object.entries(zoneShapes).map(([key, shape]) => (
                                <button
                                    key={key}
                                    type='button'
                                    onClick={() => onSelectZoneShape(key)}
                                    className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs font-semibold transition-colors ${zoneShape === key ? 'bg-forest-green text-white' : 'bg-pale-sage text-dark-slate'}`}
                                >
                                    <Icon icon={shape.icon} width='16' height='16' />
                                    {shape.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Corner radius — only for square */}
                    {zoneShape === 'square' && (
                        <div>
                            <div className='flex items-center justify-between text-xs mb-1'>
                                <span>Corner Radius</span>
                                <span>{cornerRadius}px</span>
                            </div>
                            <input
                                type='range'
                                min='0'
                                max='52'
                                value={cornerRadius}
                                onChange={(event) => onRadiusChange(Number(event.target.value))}
                                className='w-full accent-forest-green h-1.5'
                            />
                        </div>
                    )}

                    <div>
                        <div className='flex items-center justify-between text-xs mb-1'>
                            <span>Background Opacity</span>
                            <span>{backgroundOpacity}%</span>
                        </div>
                        <input
                            type='range'
                            min='25'
                            max='100'
                            value={backgroundOpacity}
                            onChange={(event) => onOpacityChange(Number(event.target.value))}
                            className='w-full accent-forest-green h-1.5'
                        />
                    </div>

                    <button
                        type='button'
                        onClick={onToggleSnap}
                        className={`w-full py-2 rounded-lg text-xs font-semibold ${snapToGrid ? 'bg-forest-green text-white' : 'bg-pale-sage text-dark-slate'}`}
                    >
                        Snap to Grid: {snapToGrid ? 'On' : 'Off'}
                    </button>
                </fieldset>
            )}
        </div>
    )
}

export default MobileControlsPanel