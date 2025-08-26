import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { TextArea } from '@/components/ui/Input';

interface ParseEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (emailText: string) => void;
}

const ParseEmailModal: React.FC<ParseEmailModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [emailToParse, setEmailToParse] = useState('');

    const handleSubmit = () => {
        onSubmit(emailToParse);
        setEmailToParse('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Analyseer E-mail" size="lg">
            <div className="space-y-4 font-light">
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Plak de volledige tekst van de e-mail hieronder. Schuldhulpje zal proberen de relevante gegevens te extraheren om een nieuwe schuld aan te maken.
                </p>
                <TextArea
                    value={emailToParse}
                    onChange={(e) => setEmailToParse(e.target.value)}
                    rows={10}
                    placeholder="Plak hier de e-mailtekst..."
                />
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={onClose}>Annuleren</Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={!emailToParse.trim()}>Analyseer</Button>
                </div>
            </div>
        </Modal>
    );
};

export default ParseEmailModal;
