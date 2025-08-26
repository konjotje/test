import React from 'react';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import { Phone, Mail, Globe, MapPin } from 'lucide-react';

interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
}

interface Organization {
  name: string;
  description: string;
  location: string;
  address?: string; // Added address field
  contact: ContactInfo;
  logo?: string; // URL to logo image
}

interface OrganizationCardProps {
  organization: Organization;
}

const OrganizationCard: React.FC<OrganizationCardProps> = ({ organization }) => {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center mb-4">
        {organization.logo && (
          <img src={organization.logo} alt={`${organization.name} logo`} className="w-12 h-12 object-contain mr-4" />
        )}
        <div>
          <h3 className="text-lg font-semibold">{organization.name}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{organization.location}</p>
        </div>
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-4">{organization.description}</p>

      {organization.address && (
        <div className="flex items-center text-gray-700 dark:text-gray-300 mb-4">
          <MapPin size={18} className="mr-2 flex-shrink-0" />
          <span>{organization.address}</span>
        </div>
      )}

      <div className="space-y-2 mb-4">
      </div>

      <div className="flex flex-wrap gap-4">
        {organization.contact.phone && (
          <Button variant="secondary" size="sm" as="a" href={`tel:${organization.contact.phone}`}>
            <Phone size={16} className="mr-2" /> Bel ons
          </Button>
        )}
        {organization.contact.email && (
          <Button variant="secondary" size="sm" as="a" href={`mailto:${organization.contact.email}`}>
            <Mail size={16} className="mr-2" /> E-mail
          </Button>
        )}
        {organization.contact.website && (
          <Button variant="secondary" size="sm" as="a" href={organization.contact.website} target="_blank" rel="noopener noreferrer">
            <Globe size={16} className="mr-2" /> Website
          </Button>
        )}
      </div>
    </GlassCard>
  );
};

export default OrganizationCard;