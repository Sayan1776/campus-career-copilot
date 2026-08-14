'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet's default marker icons reference image paths that break under
// Next.js's bundler. This rebuilds them from the CDN so pins actually render.
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const campusIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [41, 41],
  className: 'campus-marker',
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
      zoom={12}
      style={{ height: '400px', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[campusLat, campusLng]} icon={campusIcon}>
        <Popup>
          <b>{campusName}</b>
          <br />
          Placement Cell Office
        </Popup>
      </Marker>
      {visits.map((v) => (
        <Marker key={v.id} position={[v.location_lat, v.location_lng]} icon={defaultIcon}>
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
