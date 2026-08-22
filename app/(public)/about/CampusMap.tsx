'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Authored pins: ink circles for companies, instrument red for the campus
// station. Built as divIcons so nothing loads from a CDN.
function companyIcon(name: string) {
  return L.divIcon({
    className: '',
    html: `<div class="cc-pin-co" aria-hidden>${name.charAt(0).toUpperCase()}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
  });
}

const campusIcon = L.divIcon({
  className: '',
  html: '<div class="cc-pin-campus" aria-hidden>CC<span class="cc-pin-pulse" aria-hidden></span></div>',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -34],
});

interface CompanyVisit {
  id: string;
  company_name: string;
  visit_date: string | null;
  location_lat: number;
  location_lng: number;
}

interface Props {
  campusLat: number;
  campusLng: number;
  campusName: string;
  visits: CompanyVisit[];
}

export default function CampusMap({ campusLat, campusLng, campusName, visits }: Props) {
  return (
    <MapContainer
      center={[campusLat, campusLng]}
      zoom={15}
      style={{ height: '480px', width: '100%' }}
      aria-label={`Map of campus placement drives around ${campusName}`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[campusLat, campusLng]} icon={campusIcon} title={campusName}>
        <Popup>
          <b>{campusName}</b>
          <br />
          Placement Cell Office
        </Popup>
      </Marker>
      {visits.map((v) => (
        <Marker
          key={v.id}
          position={[v.location_lat, v.location_lng]}
          icon={companyIcon(v.company_name)}
          title={v.company_name}
        >
          <Popup>
            <b>{v.company_name}</b>
            {v.visit_date && (
              <>
                <br />
                Visiting: {new Date(v.visit_date).toLocaleDateString()}
              </>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
