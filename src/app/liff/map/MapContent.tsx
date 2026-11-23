'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapContent({ lat, lng }: { lat?: number | string; lng?: number | string; name?: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [allCases, setAllCases] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/cases/list')
      .then(res => res.json())
      .then(setAllCases)
      .catch(err => console.error('Map fetch error:', err));
  }, []);

  const centerLat = lat ? Number(lat) : 8.0775;
  const centerLng = lng ? Number(lng) : 98.9164;

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current).setView([centerLat, centerLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(mapInstance.current);

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  // Обновление маркеров при изменении данных
  useEffect(() => {
    if (!mapInstance.current) return;

    const icon = L.icon({
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });

    allCases.forEach((c) => {
      const lat = parseFloat(c.lat);
      const lng = parseFloat(c.lng);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        L.marker([lat, lng], { icon })
          .addTo(mapInstance.current!)
          .bindPopup(`<b>${c.customer_name}</b><br/>${c.system_kw} kW System`);
      }
    });
  }, [allCases]);

  // Center map on the provided case if available, otherwise first case
  useEffect(() => {
    if (allCases.length > 0 && mapInstance.current) {
      const first = allCases[0];
      const cLat = parseFloat(first.lat);
      const cLng = parseFloat(first.lng);
      if (!isNaN(cLat) && !isNaN(cLng)) {
        mapInstance.current.setView([cLat, cLng], 13);
      }
    }
  }, [allCases]);

  return <div ref={mapRef} className="h-full w-full" />;
}
