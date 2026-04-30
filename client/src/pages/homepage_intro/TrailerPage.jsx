import { Suspense, useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scroll, ScrollControls, useProgress } from '@react-three/drei';
import TrailerScene from './components/trailer/TrailerScene';
import TrailerPreloader from './components/trailer/TrailerPreloader';
import TrailerOverlay from './components/trailer/TrailerOverlay';

function TrailerProgressBridge({ onChange }) {
    const progressState = useProgress()

    useEffect(() => {
        onChange?.(progressState)
    }, [onChange, progressState.active, progressState.item, progressState.loaded, progressState.progress, progressState.total])

    return null
}

export default function TrailerPage() {
    const [isMobile, setIsMobile] = useState(false);
    const [progressState, setProgressState] = useState({
        active: true,
        progress: 0,
        loaded: 0,
        total: 0,
        item: '',
    })
    const [allowPreloaderHide, setAllowPreloaderHide] = useState(false)

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const sync = () => setIsMobile(mediaQuery.matches);

        sync();
        mediaQuery.addEventListener('change', sync);

        return () => mediaQuery.removeEventListener('change', sync);
    }, []);

    useEffect(() => {
        const timerId = window.setTimeout(() => {
            setAllowPreloaderHide(true)
        }, 1200)

        return () => window.clearTimeout(timerId)
    }, [])

    const shouldShowPreloader = useMemo(() => {
        if (!allowPreloaderHide) {
            return true
        }

        return progressState.active || progressState.progress < 100
    }, [allowPreloaderHide, progressState.active, progressState.progress])

    return (
        <div className="w-full h-screen bg-slate-950 text-white font-sans overflow-hidden selection:bg-emerald-500 selection:text-white">
            <TrailerPreloader
                visible={shouldShowPreloader}
                progress={progressState.progress}
                loaded={progressState.loaded}
                total={progressState.total}
                item={progressState.item}
            />
            <Canvas
                dpr={isMobile ? [1, 1.3] : [1, 2]}
                gl={{ antialias: !isMobile, powerPreference: isMobile ? 'low-power' : 'high-performance' }}
            >
                <TrailerProgressBridge onChange={setProgressState} />
                <Suspense fallback={null}>
                    <ScrollControls pages={5} damping={isMobile ? 0.28 : 0.35}>
                        <TrailerScene isMobile={isMobile} />
                        <Scroll html style={{ width: '100%' }}>
                            <TrailerOverlay />
                        </Scroll>
                    </ScrollControls>
                </Suspense>
            </Canvas>
        </div>
    );
}
