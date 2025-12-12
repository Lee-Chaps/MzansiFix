
import React from 'react';
import { Phone, Mail, Globe, ExternalLink, Shield, Droplets, Zap, Trash2, TreePine, Home, Stethoscope, Wrench, Ambulance } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  phone: string;
  email: string;
  website: string;
  color: string;
  social: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

const DEPARTMENTS: Department[] = [
  {
    id: 'jra',
    name: 'Johannesburg Roads Agency (JRA)',
    description: 'Responsible for the design, maintenance, and repair of the city\'s road infrastructure, storm water drains, and traffic lights.',
    icon: <Wrench size={32} />,
    color: 'bg-orange-100 text-orange-600',
    phone: '0860 562 874',
    email: 'hotline@jra.org.za',
    website: 'https://www.jra.org.za',
    social: {
      twitter: 'MyJRA',
      facebook: 'JohannesburgRoadsAgency'
    }
  },
  {
    id: 'jw',
    name: 'Joburg Water',
    description: 'Provides water and sanitation services, manages burst pipes, water meters, and sewage infrastructure.',
    icon: <Droplets size={32} />,
    color: 'bg-blue-100 text-blue-600',
    phone: '0800 000 004',
    email: 'waterCalls@jwater.co.za',
    website: 'https://www.johannesburgwater.co.za',
    social: {
      twitter: 'JHBWater',
      facebook: 'Johannesburg Water',
      instagram: 'joburgwater'
    }
  },
  {
    id: 'cp',
    name: 'City Power',
    description: 'Ensures reliable energy supply, maintains streetlights, and resolves power outages across the municipality.',
    icon: <Zap size={32} />,
    color: 'bg-yellow-100 text-yellow-600',
    phone: '011 490 7484',
    email: 'estimations@citypower.co.za',
    website: 'https://www.citypower.co.za',
    social: {
      twitter: 'CityPowerJhb',
      facebook: 'City Power Johannesburg'
    }
  },
  {
    id: 'pikitup',
    name: 'Pikitup',
    description: 'The official waste management service provider, handling refuse collection, illegal dumping, and recycling.',
    icon: <Trash2 size={32} />,
    color: 'bg-green-100 text-green-600',
    phone: '0800 742 786',
    email: 'call.centre@pikitup.co.za',
    website: 'https://www.pikitup.co.za',
    social: {
      twitter: 'CleanerJoburg',
      facebook: 'Pikitup Johannesburg'
    }
  },
  {
    id: 'jmpd',
    name: 'JMPD',
    description: 'Johannesburg Metropolitan Police Department. Enforces traffic laws, bylaws, and ensures crime prevention.',
    icon: <Shield size={32} />,
    color: 'bg-slate-100 text-slate-700',
    phone: '011 375 5911',
    email: 'complaints@jmpd.org.za',
    website: 'https://www.joburg.org.za',
    social: {
      twitter: 'JoburgMPD',
      facebook: 'Joburg Metropolitan Police Department'
    }
  },
  {
    id: 'jcpz',
    name: 'City Parks & Zoo',
    description: 'Maintains parks, cemeteries, conservation areas, and street trees to keep the city green and livable.',
    icon: <TreePine size={32} />,
    color: 'bg-emerald-100 text-emerald-600',
    phone: '011 712 6600',
    email: 'trees@jhbcityparks.com',
    website: 'https://www.jhbcityparksandzoo.com',
    social: {
      twitter: 'JoburgParksZoo',
      facebook: 'Johannesburg City Parks and Zoo'
    }
  },
  {
    id: 'housing',
    name: 'Housing Department',
    description: 'Manages RDP housing, informal settlement upgrades, and public housing stock issues.',
    icon: <Home size={32} />,
    color: 'bg-indigo-100 text-indigo-600',
    phone: '011 358 3400',
    email: 'info@joburg.org.za',
    website: 'https://www.joburg.org.za',
    social: {}
  },
  {
    id: 'health',
    name: 'Environmental Health',
    description: 'Addresses public health risks, pest control, food safety, and hazardous waste concerns.',
    icon: <Stethoscope size={32} />,
    color: 'bg-rose-100 text-rose-600',
    phone: '011 407 7523',
    email: 'info@joburg.org.za',
    website: 'https://www.joburg.org.za',
    social: {}
  },
  {
    id: 'ems',
    name: 'Emergency Services (EMS)',
    description: 'Fire and Rescue services for life-threatening emergencies, fires, and major accidents.',
    icon: <Ambulance size={32} />,
    color: 'bg-red-100 text-red-600',
    phone: '112', // Mobile emergency
    email: 'info@joburg.org.za',
    website: 'https://www.joburg.org.za',
    social: {
      twitter: 'CityofJoburgEMS'
    }
  }
];

const XLogo = ({ size = 18, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface DepartmentDirectoryProps {
  onBack: () => void;
}

export const DepartmentDirectory: React.FC<DepartmentDirectoryProps> = ({ onBack }) => {
  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Department Directory</h2>
          <p className="text-slate-500 text-sm">Official MzansiFix Partners</p>
        </div>
        <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-800 underline">
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEPARTMENTS.map((dept) => (
          <div key={dept.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${dept.color} group-hover:scale-110 transition-transform`}>
                  {dept.icon}
                </div>
                {dept.website && (
                  <a 
                    href={dept.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    title="Visit Website"
                  >
                    <ExternalLink size={20} />
                  </a>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-2">{dept.name}</h3>
              <p className="text-sm text-slate-600 mb-6 line-clamp-3">{dept.description}</p>

              <div className="space-y-3">
                <a 
                  href={`tel:${dept.phone.replace(/[^\d]/g, '')}`} 
                  className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-slate-50"
                >
                  <Phone size={16} />
                  <span className="font-medium">{dept.phone}</span>
                </a>
                
                <a 
                  href={`mailto:${dept.email}`}
                  className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-slate-50"
                >
                  <Mail size={16} />
                  <span className="truncate">{dept.email}</span>
                </a>
              </div>
            </div>

            {/* Footer with Website and Socials */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between">
              {dept.website ? (
                 <a 
                   href={dept.website} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
                 >
                   <Globe size={14} />
                   <span>Visit Website</span>
                 </a>
              ) : <span />}

              {dept.social.twitter ? (
                 <a 
                   href={`https://twitter.com/${dept.social.twitter}`} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-xs font-medium"
                 >
                   <XLogo size={14} />
                   <span>@{dept.social.twitter}</span>
                 </a>
              ) : (
                 <span className="text-xs text-slate-400 italic"></span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
