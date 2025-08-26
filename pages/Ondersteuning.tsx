import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import GlassCard from '../components/ui/GlassCard';
import data from '../data/ondersteuning.json';
import MunicipalityCard from '../components/ondersteuning/MunicipalityCard';
import OrganizationCard from '../components/ondersteuning/OrganizationCard';

interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
}

interface Organization {
  name: string;
  description: string;
  location: string;
  address?: string;
  contact: ContactInfo;
  logo?: string; // URL to logo image
}

interface Municipality {
  name: string;
  info: string;
  address?: string;
  contact: ContactInfo;
}

interface OndersteuningData {
  municipality: Municipality;
  organizations: Organization[];
}

const ondersteuningData: OndersteuningData = data;

const OndersteuningPage: React.FC = () => {
  return (
    <div className="space-y-6 sm:space-y-8 font-light container mx-auto">
      {/* Municipality Info Header */}
      <MunicipalityCard municipality={ondersteuningData.municipality} />

      {/* Support Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {ondersteuningData.organizations.map((org) => (
          <OrganizationCard key={org.name} organization={org} />
        ))}
      </div>
    </div>
  );
};

export default OndersteuningPage;