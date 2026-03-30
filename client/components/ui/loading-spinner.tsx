'use client';

export default function LoadingSpinner({ fullscreen = false }: { fullscreen?: boolean }) {
    if (fullscreen) {
        return (
            <div className="loading-overlay">
                <div className="spinner" />
            </div>
        );
    }

    return <div className="spinner" />;
}
