import React from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface CameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: () => void;
    videoRef: React.RefObject<HTMLVideoElement>;
    canvasRef: React.RefObject<HTMLCanvasElement>;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture, videoRef, canvasRef }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Maak een foto" size="lg">
            <div className="space-y-4 font-light">
                <div className="w-full flex justify-center">
                    <div className="relative w-full max-w-[280px] aspect-[9/16] rounded-xl overflow-hidden bg-black shadow-lg border border-black/20 dark:border-white/20">
                        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline autoPlay muted />
                    </div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex justify-center gap-4">
                    <Button variant="secondary" onClick={onClose}>Annuleren</Button>
                    <Button variant="primary" onClick={onCapture}>Maak Foto</Button>
                </div>
            </div>
        </Modal>
    );
};

export default CameraModal;
