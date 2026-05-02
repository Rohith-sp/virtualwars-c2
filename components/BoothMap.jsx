'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function BoothMap({ lat, lon, address }) {
  const t = useTranslations('boothLocator');
  useEffect(() => {
    // Fix for default marker icon in leaflet + nextjs
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  return (
    <MapContainer center={[lat, lon]} zoom={15} style={{ height: '300px', width: '100%', borderRadius: 'var(--radius-md)', zIndex: 0 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lon]}>
        <Popup>
          <strong>{t('nearestBooth')}</strong><br/>
          {address || t('primarySchool')}
        </Popup>
      </Marker>
    </MapContainer>
  );
}
