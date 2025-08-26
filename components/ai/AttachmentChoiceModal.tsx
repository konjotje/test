import React from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { AttachFileIcon, CameraIcon, EnvelopeIcon } from '@/components/ui/Icons';

interface AttachmentChoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFileSelect: () => void;
    onCameraSelect: () => void;
    onEmailSelect: () => void;
}

const AttachmentChoiceModal: React.FC<AttachmentChoiceModalProps> = ({ isOpen, onClose, onFileSelect, onCameraSelect, onEmailSelect }) => {
    
    const handleSelect = (callback: () => void) => {
        onClose();
        callback();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Bijlage toevoegen" size="sm">
            <div className="flex flex-col space-y-3 font-light">
                <Button variant="primary" fullWidth onClick={() => handleSelect(onFileSelect)}>
                    <AttachFileIcon className="mr-2" /> Afbeelding of PDF
                </Button>
                <Button variant="secondary" fullWidth onClick={() => handleSelect(onCameraSelect)}>
                    <CameraIcon className="mr-2" /> Camera gebruiken
                </Button>
                <Button variant="secondary" fullWidth onClick={() => handleSelect(onEmailSelect)}>
                    <EnvelopeIcon className="mr-2" /> E-mail plakken
                </Button>
            </div>
        </Modal>
    );
};

export default AttachmentChoiceModal;
