import React, { useEffect, useRef, useState } from 'react'
import { Icon } from '@iconify/react'

/**
 * Form component for guests to submit their content (images or text)
 * Handles file uploads for photo zones and text input for text zones
 */
const GuestSubmissionForm = ({
    selectedZoneIndex,
    onPhotoSubmit,
    onTextSubmit,
    onClose,
    isLoading,
    initialText,
}) => {
    const CROP_VIEW_SIZE = 280
    const [photoFile, setPhotoFile] = useState(null)
    const [photoPreview, setPhotoPreview] = useState(null)
    const [photoMeta, setPhotoMeta] = useState({ width: 0, height: 0 })
    const [photoZoom, setPhotoZoom] = useState(1)
    const [photoOffsetX, setPhotoOffsetX] = useState(0)
    const [photoOffsetY, setPhotoOffsetY] = useState(0)
    const [photoRotation, setPhotoRotation] = useState(0)
    const [processingPhoto, setProcessingPhoto] = useState(false)
    const [textInput, setTextInput] = useState('')
    const [formError, setFormError] = useState(null)
    const fileInputRef = useRef(null)

    const isPhotoZone = selectedZoneIndex === 'photo'
    const isTextZone = typeof selectedZoneIndex === 'string' && selectedZoneIndex.startsWith('text-')

    useEffect(() => {
        if (!isTextZone) {
            return
        }

        setTextInput(initialText || '')
        setFormError(null)
    }, [initialText, isTextZone, selectedZoneIndex])

    const loadImageElement = (src) => new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = reject
        image.src = src
    })

    const resetPhotoEditor = () => {
        setPhotoZoom(1)
        setPhotoOffsetX(0)
        setPhotoOffsetY(0)
        setPhotoRotation(0)
    }

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setFormError('Please select a valid image file')
            return
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            setFormError('File size must be less than 10MB')
            return
        }

        setPhotoFile(file)
        setFormError(null)
        resetPhotoEditor()

        // Create preview
        const reader = new FileReader()
        reader.onload = async (event) => {
            const previewSrc = event.target?.result
            setPhotoPreview(previewSrc)

            try {
                const image = await loadImageElement(previewSrc)
                setPhotoMeta({ width: image.width, height: image.height })
            } catch {
                setPhotoMeta({ width: 0, height: 0 })
            }
        }
        reader.readAsDataURL(file)
    }

    const buildCroppedPhotoFile = async () => {
        if (!photoPreview || !photoFile) {
            return null
        }

        const image = await loadImageElement(photoPreview)
        const canvas = document.createElement('canvas')
        canvas.width = CROP_VIEW_SIZE
        canvas.height = CROP_VIEW_SIZE

        const ctx = canvas.getContext('2d')
        if (!ctx) {
            return null
        }

        const baseScale = Math.max(CROP_VIEW_SIZE / image.width, CROP_VIEW_SIZE / image.height)
        const totalScale = baseScale * photoZoom
        const drawWidth = image.width * totalScale
        const drawHeight = image.height * totalScale
        const rotationInRadians = (photoRotation * Math.PI) / 180

        ctx.clearRect(0, 0, CROP_VIEW_SIZE, CROP_VIEW_SIZE)
        ctx.translate((CROP_VIEW_SIZE / 2) + photoOffsetX, (CROP_VIEW_SIZE / 2) + photoOffsetY)
        ctx.rotate(rotationInRadians)
        ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)

        const blob = await new Promise((resolve) => {
            canvas.toBlob(resolve, photoFile.type || 'image/jpeg', 0.92)
        })

        if (!blob) {
            return null
        }

        const originalExt = photoFile.name.includes('.')
            ? photoFile.name.split('.').pop()
            : 'jpg'

        return new File([blob], `cropped-${Date.now()}.${originalExt}`, {
            type: blob.type || photoFile.type || 'image/jpeg',
            lastModified: Date.now(),
        })
    }

    const handlePhotoSubmit = async () => {
        if (!photoFile) {
            setFormError('Please select a photo')
            return
        }

        setProcessingPhoto(true)

        try {
            const editedPhoto = await buildCroppedPhotoFile()
            const submissionFile = editedPhoto || photoFile

            onPhotoSubmit?.(submissionFile, () => {
                setPhotoFile(null)
                setPhotoPreview(null)
                setPhotoMeta({ width: 0, height: 0 })
                setFormError(null)
                resetPhotoEditor()
            })
        } catch {
            setFormError('Could not prepare this image. Please try another photo.')
        } finally {
            setProcessingPhoto(false)
        }
    }

    const handleTextSubmit = () => {
        const trimmedText = textInput.trim()
        if (!trimmedText) {
            setFormError('Please enter some text')
            return
        }

        if (trimmedText.length > 500) {
            setFormError('Text must be 500 characters or less')
            return
        }

        const textZoneIndex = parseInt(selectedZoneIndex.split('-')[1])
        onTextSubmit?.(textZoneIndex, trimmedText, () => {
            setTextInput('')
            setFormError(null)
        })
    }

    if (!isPhotoZone && !isTextZone) {
        return (
            <div className='absolute inset-0 flex items-center justify-center'>
                <div className='text-center text-dark-slate/60'>
                    <p className='text-sm'>Select a zone to submit content</p>
                </div>
            </div>
        )
    }

    return (
        <div className='absolute inset-0 flex items-end justify-center p-4 pointer-events-none'>
            {/* Submission Panel */}
            <div className='bg-white rounded-t-2xl shadow-2xl border border-dusty-green/20 w-full max-w-md pointer-events-auto overflow-hidden animate-slide-up'>
                {/* Header */}
                <div className='flex items-center justify-between p-4 border-b border-dusty-green/10'>
                    <div>
                        <h3 className='text-sm font-bold text-dark-slate'>
                            {isPhotoZone ? 'Upload Photo' : 'Add Text'}
                        </h3>
                        <p className='text-xs text-dark-slate/60 mt-0.5'>
                            {isPhotoZone ? 'Share your photo' : 'Write your message'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className='text-dark-slate/50 hover:text-dark-slate transition-colors'
                        aria-label='Close'
                    >
                        <Icon icon='mdi:close' width='20' height='20' />
                    </button>
                </div>

                {/* Content */}
                <div className='p-4 space-y-3'>
                    {/* Photo Zone Form */}
                    {isPhotoZone && (
                        <>
                            {photoPreview ? (
                                <div className='space-y-3'>
                                    <div className='relative rounded-lg overflow-hidden bg-gray-100 aspect-square'>
                                        <div className='absolute inset-0 pointer-events-none border-[3px] border-white/75 z-10' />
                                        <img
                                            src={photoPreview}
                                            alt='Preview'
                                            className='w-full h-full object-cover'
                                            style={{
                                                transform: `translate(${photoOffsetX}px, ${photoOffsetY}px) scale(${photoZoom}) rotate(${photoRotation}deg)`,
                                                transformOrigin: 'center center',
                                            }}
                                        />
                                        <button
                                            onClick={() => {
                                                setPhotoFile(null)
                                                setPhotoPreview(null)
                                                setPhotoMeta({ width: 0, height: 0 })
                                                resetPhotoEditor()
                                                if (fileInputRef.current) fileInputRef.current.value = ''
                                            }}
                                            className='absolute top-2 right-2 h-8 w-8 rounded-full bg-dark-slate/80 text-white flex items-center justify-center hover:bg-dark-slate transition-colors z-20'
                                            aria-label='Remove'
                                        >
                                            <Icon icon='mdi:close' width='16' height='16' />
                                        </button>
                                    </div>

                                    <div className='grid grid-cols-2 gap-2 text-[11px] text-dark-slate/70'>
                                        <label className='space-y-1'>
                                            <span>Zoom</span>
                                            <input
                                                type='range'
                                                min='1'
                                                max='3'
                                                step='0.05'
                                                value={photoZoom}
                                                onChange={(event) => setPhotoZoom(Number(event.target.value))}
                                                className='w-full accent-forest-green'
                                            />
                                        </label>
                                        <label className='space-y-1'>
                                            <span>Rotate</span>
                                            <input
                                                type='range'
                                                min='-30'
                                                max='30'
                                                step='1'
                                                value={photoRotation}
                                                onChange={(event) => setPhotoRotation(Number(event.target.value))}
                                                className='w-full accent-forest-green'
                                            />
                                        </label>
                                        <label className='space-y-1'>
                                            <span>Move X</span>
                                            <input
                                                type='range'
                                                min='-120'
                                                max='120'
                                                step='1'
                                                value={photoOffsetX}
                                                onChange={(event) => setPhotoOffsetX(Number(event.target.value))}
                                                className='w-full accent-forest-green'
                                            />
                                        </label>
                                        <label className='space-y-1'>
                                            <span>Move Y</span>
                                            <input
                                                type='range'
                                                min='-120'
                                                max='120'
                                                step='1'
                                                value={photoOffsetY}
                                                onChange={(event) => setPhotoOffsetY(Number(event.target.value))}
                                                className='w-full accent-forest-green'
                                            />
                                        </label>
                                    </div>

                                    <p className='text-[10px] text-dark-slate/55'>
                                        Crop is exported as a square focus area.
                                        {photoMeta.width && photoMeta.height ? ` Source: ${photoMeta.width} x ${photoMeta.height}px.` : ''}
                                    </p>
                                </div>
                            ) : (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className='relative rounded-lg border-2 border-dashed border-dusty-green/30 hover:border-forest-green/50 bg-pale-sage/20 hover:bg-pale-sage/40 transition-all py-6 flex flex-col items-center justify-center gap-2 text-dark-slate/60 hover:text-forest-green'
                                >
                                    <Icon icon='mdi:cloud-upload-outline' width='28' height='28' />
                                    <div className='text-xs font-medium'>Click to upload</div>
                                    <div className='text-[10px]'>or drag and drop</div>
                                </button>
                            )}
                            <input
                                ref={fileInputRef}
                                type='file'
                                accept='image/*'
                                className='hidden'
                                onChange={handleFileSelect}
                                disabled={isLoading}
                            />
                        </>
                    )}

                    {/* Text Zone Form */}
                    {isTextZone && (
                        <textarea
                            value={textInput}
                            onChange={(e) => {
                                setTextInput(e.target.value)
                                setFormError(null)
                            }}
                            placeholder='Write your message here...'
                            maxLength={500}
                            className='w-full h-24 p-3 rounded-lg border border-dusty-green/20 focus:border-forest-green focus:ring-2 focus:ring-forest-green/20 outline-none resize-none text-sm text-dark-slate placeholder:text-dark-slate/40'
                            disabled={isLoading}
                        />
                    )}

                    {/* Character Count */}
                    {isTextZone && (
                        <div className='text-xs text-dark-slate/50 text-right'>
                            {textInput.length}/500
                        </div>
                    )}

                    {/* Error Message */}
                    {formError && (
                        <div className='flex gap-2 items-start p-2 rounded-lg bg-red-50 border border-red-200'>
                            <Icon icon='mdi:alert-circle-outline' width='16' height='16' className='text-red-600 mt-0.5 shrink-0' />
                            <p className='text-xs text-red-600'>{formError}</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className='flex gap-2 p-4 border-t border-dusty-green/10 bg-pale-sage/30'>
                    <button
                        onClick={onClose}
                        className='flex-1 px-4 py-2 rounded-lg border border-dusty-green/20 text-dark-slate font-medium text-sm hover:bg-white/50 transition-colors'
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={isPhotoZone ? handlePhotoSubmit : handleTextSubmit}
                        disabled={isLoading || processingPhoto || (isPhotoZone ? !photoFile : !textInput.trim())}
                        className='flex-1 px-4 py-2 rounded-lg bg-forest-green text-white font-medium text-sm hover:bg-forest-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2'
                    >
                        {(isLoading || processingPhoto) && <Icon icon='mdi:loading' width='16' height='16' className='animate-spin' />}
                        {isLoading ? 'Uploading...' : (processingPhoto ? 'Preparing...' : 'Submit')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GuestSubmissionForm
