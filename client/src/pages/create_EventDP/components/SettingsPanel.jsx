import React from 'react'
import { Icon } from '@iconify/react'
import { BORDER_STYLES } from '../constants'

const SettingsPanel = ({
    // zone shape
    zoneShapes,
    zoneShape,
    onSelectZoneShape,
    committedZone,
    onClearZone,
    // canvas info
    canvasDimensions,
    // frame settings
    bleedGuides,
    onToggleBleed,
    backgroundOpacity,
    onOpacityChange,
    cornerRadius,
    onRadiusChange,
    borderStyle,
    onBorderStyleChange,
    snapToGrid,
    onToggleSnap,
    // guest fields
    guestFields,
    onToggleGuestField,
}) => {
    const zoneEntries = Object.entries(zoneShapes)

    return (
        <aside className='w-80 bg-white border-l border-dusty-green/25 flex-col overflow-y-auto hidden xl:flex animate-slide-in-right'>
            <div className='p-6 border-b border-dusty-green/15'>
                <p className='text-[10px] font-bold text-forest-green tracking-[0.15em] uppercase mb-1'>Design Properties</p>
                <h3 className='font-bold text-2xl text-dark-slate'>Template Settings</h3>
            </div>

            {/* ── Guest Photo Zone ────────────────────────────────────────── */}
            <div className='p-6 border-b border-dusty-green/15 space-y-4'>
                <div>
                    <label className='text-xs font-bold text-dark-slate uppercase tracking-wider'>Guest Photo Zone</label>
                    <p className='text-[11px] text-dark-slate/55 mt-1'>
                        Pick a shape, then drag on your uploaded image to mark where guests will place their photo.
                    </p>
                </div>

                {/* shape picker */}
                <div className='grid grid-cols-2 gap-2'>
                    {zoneEntries.map(([key, shape]) => {
                        const isActive = zoneShape === key
                        return (
                            <button
                                key={key}
                                type='button'
                                onClick={() => onSelectZoneShape(key)}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-colors ${isActive
                                    ? 'border-2 border-forest-green bg-forest-green/10 text-forest-green'
                                    : 'border-dusty-green/35 text-dark-slate/70 hover:bg-pale-sage'}`}
                            >
                                <Icon icon={shape.icon} width='20' height='20' />
                                <span className='mt-1'>{shape.label}</span>
                            </button>
                        )
                    })}
                </div>

                {/* radius — only relevant for square */}
                {zoneShape === 'square' && (
                    <div className='space-y-2 pt-1'>
                        <div className='flex justify-between text-[11px] text-dark-slate'>
                            <span>Corner Radius</span>
                            <span className='font-bold'>{cornerRadius}px</span>
                        </div>
                        <div className='flex items-center gap-3'>
                            <div className='p-2 bg-pale-sage rounded-lg'>
                                <Icon icon='mdi:rounded-corner' width='18' height='18' />
                            </div>
                            <input
                                type='range'
                                min='0'
                                max='52'
                                value={cornerRadius}
                                onChange={(event) => onRadiusChange(Number(event.target.value))}
                                className='flex-1 accent-forest-green h-1.5'
                            />
                        </div>
                    </div>
                )}

                {committedZone && (
                    <button
                        type='button'
                        onClick={onClearZone}
                        className='text-[11px] text-dark-slate/65 underline hover:text-dark-slate'
                    >
                        Clear selected zone
                    </button>
                )}

                {/* canvas dimensions for reference */}
                <div className='grid grid-cols-2 gap-3 pt-1'>
                    <div className='space-y-1'>
                        <span className='text-[10px] text-dark-slate/60'>Image Width</span>
                        <div className='bg-pale-sage p-2 rounded-lg text-xs font-mono text-center'>{canvasDimensions.width}px</div>
                    </div>
                    <div className='space-y-1'>
                        <span className='text-[10px] text-dark-slate/60'>Image Height</span>
                        <div className='bg-pale-sage p-2 rounded-lg text-xs font-mono text-center'>{canvasDimensions.height}px</div>
                    </div>
                </div>
            </div>

            {/* ── Bleed & Guides ──────────────────────────────────────────── */}
            <div className='p-6 border-b border-dusty-green/15 space-y-5'>
                <div className='flex items-center justify-between'>
                    <label className='text-xs font-bold text-dark-slate uppercase tracking-wider'>Bleed & Guides</label>
                    <button
                        type='button'
                        onClick={onToggleBleed}
                        className={`w-9 h-5 rounded-full relative transition-colors ${bleedGuides ? 'bg-forest-green' : 'bg-gray-300'}`}
                    >
                        <span className={`absolute top-0.5 h-4 w-4 bg-white rounded-full transition-transform ${bleedGuides ? 'translate-x-4' : 'translate-x-0.5'}`}></span>
                    </button>
                </div>

                <div className='space-y-3'>
                    <div className='flex justify-between items-center text-[11px] text-dark-slate'>
                        <span>Background Opacity</span>
                        <span className='font-bold'>{backgroundOpacity}%</span>
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
            </div>

            {/* ── Media Zone Parameters ───────────────────────────────────── */}
            <div className='p-6 border-b border-dusty-green/15 space-y-4'>
                <label className='text-xs font-bold text-dark-slate uppercase tracking-wider'>Media Zone Parameters</label>

                <div className='space-y-3 pt-2'>
                    <span className='text-[11px] text-dark-slate/70 font-medium'>Border Style</span>
                    <div className='flex gap-2'>
                        {BORDER_STYLES.map((style) => {
                            const isActive = borderStyle === style.id
                            return (
                                <button
                                    key={style.id}
                                    type='button'
                                    onClick={() => onBorderStyleChange(style.id)}
                                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${isActive
                                        ? 'border-2 border-forest-green bg-forest-green/10 text-forest-green'
                                        : 'border border-dusty-green/40 text-dark-slate/75'}`}
                                >
                                    {style.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className='flex items-center justify-between pt-2'>
                    <span className='text-[11px] text-dark-slate/70 font-medium'>Snap-to-Grid</span>
                    <button
                        type='button'
                        onClick={onToggleSnap}
                        className={`w-9 h-5 rounded-full relative transition-colors ${snapToGrid ? 'bg-forest-green' : 'bg-gray-300'}`}
                    >
                        <span className={`absolute top-0.5 h-4 w-4 bg-white rounded-full transition-transform ${snapToGrid ? 'translate-x-4' : 'translate-x-0.5'}`}></span>
                    </button>
                </div>
            </div>

            {/* ── Guest Form Fields ───────────────────────────────────────── */}
            <div className='p-6 space-y-4'>
                <label className='text-xs font-bold text-dark-slate uppercase tracking-wider'>Guest Form Fields</label>
                <div className='space-y-2'>
                    {guestFields.map((field) => (
                        <div key={field.id} className='flex items-center justify-between p-3 bg-pale-sage rounded-xl border border-dusty-green/15'>
                            <div className='flex items-center gap-3'>
                                <Icon icon='mdi:drag-vertical' width='19' height='19' className='text-dark-slate/55' />
                                <span className='text-sm font-medium text-dark-slate'>{field.label}</span>
                            </div>
                            <button
                                type='button'
                                onClick={() => onToggleGuestField(field.id)}
                                className={`w-9 h-5 rounded-full relative transition-colors ${field.enabled ? 'bg-forest-green' : 'bg-gray-300'}`}
                            >
                                <span className={`absolute top-0.5 h-4 w-4 bg-white rounded-full transition-transform ${field.enabled ? 'translate-x-4' : 'translate-x-0.5'}`}></span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    )
}

export default SettingsPanel