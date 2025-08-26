import React from 'react';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import { PhoneIcon, EnvelopeIcon, PublicIcon } from '../ui/Icons';
import { MapPinIcon } from '../ui/Icons';
export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
}

interface Municipality {
  name: string;
  info: string;
  address?: string; // Added address
  contact: ContactInfo;
}

export interface MunicipalityCardProps {
  municipality: Municipality;
}

const MunicipalityCard: React.FC<MunicipalityCardProps> = ({ municipality }) => {
  return (
    <GlassCard className="p-6 flex flex-col md:flex-row items-center"> {/* Use flex and items-center for horizontal alignment */}
      <div className="w-32 md:w-48 flex justify-center items-center flex-shrink-0 h-full overflow-hidden rounded-lg mb-4 md:mb-0 md:mr-6"> {/* Fixed width section for logo, removed padding, added overflow-hidden and rounded-lg */}
        <img src="/images/delftlogo.webp" alt="Gemeente Delft logo" className="h-full w-full object-cover" /> {/* Fill container and crop */}
      </div>
      <div className="flex-grow md:ml-6"> {/* Section for text content, occupying remaining space */}
        <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">{municipality.name}</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm md:text-base">{municipality.info}</p>

        {/* Display address and email again */}
        {municipality.address && (
          <div className="flex items-center text-gray-700 dark:text-gray-300 mb-2 text-sm">
            {/* Assuming you have a MapPinIcon */}
            <span>{municipality.address}</span>
          </div>
        )}
        {municipality.contact.email && (
          <div className="flex items-center text-gray-700 dark:text-gray-300 mb-4 text-sm">
             <EnvelopeIcon className="w-4 h-4 mr-2" />
            <span>{municipality.contact.email}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          {municipality.contact.phone && (
            <Button variant="secondary" size="sm" as="a" href={`tel:${municipality.contact.phone}`}>
              <PhoneIcon className="w-4 h-4 mr-2" /> Bel ons
            </Button>
          )}
           {municipality.contact.website && (
            <Button variant="secondary" size="sm" as="a" href={municipality.contact.website} target="_blank" rel="noopener noreferrer">
              <PublicIcon className="w-4 h-4 mr-2" /> Website
            </Button>
          )}
        </div>

      </div>
    </GlassCard>
  );
};

export default MunicipalityCard;