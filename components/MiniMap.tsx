
import React from 'react';
import { ExternalLink, MapPin } from 'lucide-react';

interface MiniMapProps {
  latitude: number;
  longitude: number;
}

export const MiniMap: React.FC<MiniMapProps> = ({ latitude, longitude }) => {
  // We use OpenStreetMap for the visual embed because the provided API key is restricted 
  // to Gemini services and cannot be used for the Google Maps Embed API.
  // We still link out to Google Maps for navigation.

  // Calculate a bounding box for the map (approx 200m radius)
  const delta = 0.002;
  const bbox = `${longitude - delta},${latitude - delta},${longitude + delta},${latitude + delta}`;
  
  // Note: We remove the 'marker' param from OSM embed because we are providing a custom UI pin 
  // that looks better and is always centered.
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <div className="relative w-full h-full min-h-[150px] bg-slate-100 group overflow-hidden">
      <iframe
        key={embedUrl} // Force re-render when location changes to prevent stale map
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        src={embedUrl}
        title="Location Map"
        className="absolute inset-0 w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
      ></iframe>
      
      {/* Centered Pin Point Overlay */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-3 pointer-events-none drop-shadow-xl z-10 flex flex-col items-center justify-end">
        <MapPin size={42} className="text-red-600 fill-white animate-bounce" strokeWidth={2.5} />
        <div className="w-3 h-1.5 bg-black/20 rounded-full blur-[2px]"></div>
      </div>
      
      {/* Overlay controls */}
      <a 
        href={googleMapsUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-slate-700 hover:text-blue-600 px-3 py-1.5 rounded-lg shadow-sm text-xs font-bold flex items-center gap-1.5 transition-colors z-20 border border-slate-200"
      >
        Open Maps <ExternalLink size={12} />
      </a>
      
      {/* Inner Border */}
      <div className="absolute inset-0 pointer-events-none border-2 border-slate-900/5 rounded-lg"></div>
    </div>
  );
};
