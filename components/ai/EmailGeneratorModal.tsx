import React, { useState } from 'react';
import { Debt } from '@/types';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { TextArea } from '@/components/ui/Input';
import { formatCurrency } from '@/utils/helpers';

interface EmailGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    debts: Debt[];
    onSubmit: (prompt: string) => void;
}

const EmailGeneratorModal: React.FC<EmailGeneratorModalProps> = ({ isOpen, onClose, debts, onSubmit }) => {
    const [targetDebtId, setTargetDebtId] = useState<string | null>(null);
    const [purpose, setPurpose] = useState('uitstel van betaling aanvragen');
    const [context, setContext] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetDebtId) {
            // This case should ideally be prevented by form validation
            return;
        }
        const targetDebt = debts.find(d => d.id === targetDebtId);
        if (!targetDebt) return;

        const prompt = `Genereer een professionele, empathische e-mail.
        Doel: ${purpose}.
        Schuld betreft: ${targetDebt.creditorName} voor een bedrag van ${formatCurrency(targetDebt.totalAmount)}.
        Extra context van gebruiker: ${context}.
        Gebruik de email generator output structuur.`;
        
        onSubmit(prompt);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="E-mail Genereren" size="lg">
            <form onSubmit={handleSubmit} className="space-y-4 font-light">
                <Select
                    label="Over welke schuld gaat het?"
                    options={debts.map(d => ({ value: d.id, label: d.creditorName }))}
                    value={targetDebtId || ''}
                    onChange={(val) => setTargetDebtId(val as string)}
                    required
                    labelClassName="font-medium"
                />
                <Select
                    label="Wat is het doel van de e-mail?"
                    options={[
                        { value: 'uitstel van betaling aanvragen', label: 'Uitstel van betaling aanvragen' },
                        { value: 'een betalingsregeling voorstellen', label: 'Een betalingsregeling voorstellen' },
                        { value: 'informatie opvragen over de schuld', label: 'Informatie opvragen over de schuld' },
                        { value: 'bezwaar maken tegen de schuld', label: 'Bezwaar maken tegen de schuld' },
                    ]}
                    value={purpose}
                    onChange={(val) => setPurpose(val as string)}
                    labelClassName="font-medium"
                />
                <TextArea
                    label="Extra context (optioneel)"
                    labelClassName="font-medium"
                    placeholder="Geef hier extra details die belangrijk zijn voor de e-mail, bv. waarom je uitstel nodig hebt of welk bedrag je per maand kunt missen."
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    rows={4}
                />
                <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Annuleren</Button>
                    <Button type="submit" disabled={!targetDebtId}>Genereer E-mail</Button>
                </div>
            </form>
        </Modal>
    );
};

export default EmailGeneratorModal;
