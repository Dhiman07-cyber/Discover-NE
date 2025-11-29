import { useEffect, useRef } from 'react';

const InteractiveMap = ({ type, data }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    // Check if Leaflet is available
    if (typeof window !== 'undefined' && window.L) {
      initMap();
    }

    return () => {
      // Properly clean up the map instance
      if (mapInstance.current) {
        try {
          mapInstance.current.remove();
        } catch (error) {
          console.warn('Error removing map instance:', error);
        }
        mapInstance.current = null;
      }
    };
  }, [type, data]);

  const initMap = () => {
    if (!mapRef.current) return;

    // Remove existing map if any
    if (mapInstance.current) {
      try {
        mapInstance.current.remove();
      } catch (error) {
        console.warn('Error removing existing map instance:', error);
      }
    }

    // Define boundaries for Northeast India
    const northeastBounds = [
      [22.0, 88.0],  // Southwest corner (latitude, longitude)
      [29.0, 97.0]   // Northeast corner (latitude, longitude)
    ];

    let center = [26.2006, 92.9376]; // Default to Assam
    let zoom = 7;
    let minZoom = 6;
    let maxBounds = null;

    switch (type) {
      case 'overview':
        center = [26.2006, 92.9376];
        zoom = 7;
        minZoom = 6;
        maxBounds = northeastBounds;
        break;
      case 'state':
        center = [data.state.coords.lat, data.state.coords.lng];
        zoom = 8;
        minZoom = 7;
        // Set bounds to a slightly larger area around the state
        maxBounds = [
          [data.state.coords.lat - 2, data.state.coords.lng - 3],
          [data.state.coords.lat + 2, data.state.coords.lng + 3]
        ];
        break;
      case 'city':
        center = [data.city.coords.lat, data.city.coords.lng];
        zoom = 12;
        minZoom = 10;
        // Set bounds to a larger area around the city
        maxBounds = [
          [data.city.coords.lat - 0.5, data.city.coords.lng - 0.5],
          [data.city.coords.lat + 0.5, data.city.coords.lng + 0.5]
        ];
        break;
      default:
        break;
    }

    // Initialize Leaflet map
    try {
      mapInstance.current = window.L.map(mapRef.current, {
        center: center,
        zoom: zoom,
        minZoom: minZoom,
        maxZoom: 18,
        maxBounds: maxBounds,
        maxBoundsViscosity: 1.0  // Prevent dragging outside bounds
      });

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);

      // Add zoom control
      window.L.control.zoom({
        position: 'topright'
      }).addTo(mapInstance.current);

      // Restrict the view to the defined bounds
      if (maxBounds) {
        mapInstance.current.setMaxBounds(maxBounds);
      }

      // Add state boundaries for overview map
      if (type === 'overview') {
        addStateBoundaries();
      }

      // Add accurate state boundary for state maps
      if (type === 'state') {
        addAccurateStateBoundary();
      }

      // Add elegant boundaries for state and city maps
      if (type === 'state' || type === 'city') {
        addContextBoundaries();
      }

      // Add markers based on type
      addMarkers();
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const addStateBoundaries = () => {
    if (!mapInstance.current || !data.states) return;

    // Define approximate boundaries for each state (simplified polygons)
    // Adjusted to reduce overlapping
    const stateBoundaries = {
      'assam': [
        [26.8, 94.5], [26.5, 95.0], [26.0, 95.2], [25.5, 95.0], 
        [25.0, 94.8], [24.8, 94.2], [24.5, 93.5], [24.7, 93.0],
        [25.0, 92.5], [25.5, 92.0], [26.0, 91.8], [26.5, 92.0],
        [26.8, 92.5], [27.0, 93.0], [27.2, 93.8], [27.0, 94.2],
        [26.8, 94.5]
      ],
      'arunachal-pradesh': [
        [29.0, 97.0], [28.5, 97.0], [28.0, 96.8], [27.5, 96.5],
        [27.0, 96.0], [26.8, 95.5], [26.5, 95.0], [26.8, 94.5],
        [27.0, 94.0], [27.5, 93.8], [28.0, 94.0], [28.5, 94.2],
        [28.8, 94.5], [29.0, 95.0], [29.2, 95.8], [29.3, 96.5],
        [29.2, 96.8], [29.0, 97.0]
      ],
      'meghalaya': [
        [25.8, 92.3], [25.6, 92.6], [25.3, 92.6], [25.0, 92.3],
        [24.8, 92.0], [24.8, 91.6], [25.0, 91.3], [25.3, 91.0],
        [25.6, 91.0], [25.8, 91.3], [25.9, 91.6], [25.9, 92.0],
        [25.8, 92.3]
      ],
      'manipur': [
        [24.8, 94.0], [24.6, 94.2], [24.3, 94.0], [24.1, 93.8],
        [23.8, 93.5], [24.0, 93.2], [24.3, 93.0], [24.6, 93.2],
        [24.8, 93.5], [25.0, 93.8], [25.0, 94.0], [24.8, 94.0]
      ],
      'mizoram': [
        [23.8, 93.0], [23.6, 93.2], [23.3, 93.0], [23.1, 92.8],
        [22.8, 92.5], [23.0, 92.2], [23.3, 92.0], [23.6, 92.2],
        [23.8, 92.5], [24.0, 92.8], [24.0, 93.0], [23.8, 93.0]
      ],
      'nagaland': [
        [26.8, 95.0], [26.6, 95.2], [26.3, 95.0], [26.1, 94.8],
        [25.8, 94.5], [26.0, 94.2], [26.3, 94.0], [26.6, 94.2],
        [26.8, 94.5], [27.0, 94.8], [27.0, 95.0], [26.8, 95.0]
      ],
      'sikkim': [
        [27.8, 88.5], [27.6, 88.8], [27.3, 88.5], [27.1, 88.2],
        [26.8, 88.0], [27.0, 87.8], [27.3, 87.5], [27.6, 87.8],
        [27.8, 88.0], [28.0, 88.2], [28.0, 88.5], [27.8, 88.5]
      ],
      'tripura': [
        [24.2, 92.0], [24.0, 92.2], [23.7, 92.0], [23.5, 91.8],
        [23.2, 91.5], [23.4, 91.2], [23.7, 91.0], [24.0, 91.2],
        [24.2, 91.5], [24.4, 91.8], [24.4, 92.0], [24.2, 92.0]
      ]
    };

    // Add boundaries for each state
    Object.keys(stateBoundaries).forEach(stateSlug => {
      const boundary = stateBoundaries[stateSlug];
      if (boundary && boundary.length > 0) {
        const polygon = window.L.polygon(boundary, {
          color: '#3f51b5',
          fillColor: '#3f51b5',
          fillOpacity: 0.1,
          weight: 2,
          dashArray: '3, 6'
        }).addTo(mapInstance.current);

        // Find the state data to get the name
        const stateData = data.states.find(state => state.slug === stateSlug);
        if (stateData) {
          // Add a label at the center of the polygon
          const center = polygon.getBounds().getCenter();
          const label = window.L.marker(center, {
            interactive: false,
            icon: window.L.divIcon({
              className: 'state-boundary-label',
              html: `<div style="background: rgba(63, 81, 181, 0.8); color: white; padding: 3px 8px; border-radius: 12px; font-weight: bold; font-size: 12px;">${stateData.name}</div>`,
              iconSize: [150, 30]
            })
          }).addTo(mapInstance.current);
        }
      }
    });
  };

  const addAccurateStateBoundary = () => {
    if (!mapInstance.current || !data.state) return;

    // Define more accurate boundaries for each state
    const accurateBoundaries = {
      'assam': [
        [26.9, 95.0], [26.8, 95.2], [26.5, 95.3], [26.2, 95.2], 
        [26.0, 95.0], [25.8, 94.8], [25.5, 94.7], [25.2, 94.5],
        [25.0, 94.3], [24.8, 94.0], [24.7, 93.7], [24.6, 93.3],
        [24.7, 93.0], [24.8, 92.7], [25.0, 92.5], [25.3, 92.3],
        [25.6, 92.2], [25.9, 92.0], [26.2, 91.9], [26.5, 92.0],
        [26.8, 92.2], [27.0, 92.5], [27.1, 92.8], [27.2, 93.2],
        [27.2, 93.6], [27.1, 94.0], [27.0, 94.3], [26.9, 94.7],
        [26.9, 95.0]
      ],
      'arunachal-pradesh': [
        [29.0, 97.0], [28.8, 97.2], [28.5, 97.3], [28.2, 97.2],
        [28.0, 97.0], [27.8, 96.8], [27.6, 96.5], [27.4, 96.2],
        [27.2, 96.0], [27.0, 95.7], [26.9, 95.3], [26.8, 95.0],
        [26.8, 94.7], [26.9, 94.3], [27.0, 94.0], [27.2, 93.8],
        [27.5, 93.7], [27.8, 93.8], [28.0, 94.0], [28.2, 94.3],
        [28.4, 94.6], [28.6, 94.9], [28.8, 95.2], [28.9, 95.6],
        [29.0, 96.0], [29.1, 96.4], [29.1, 96.8], [29.0, 97.0]
      ],
      'meghalaya': [
        [25.9, 92.4], [25.8, 92.6], [25.6, 92.7], [25.4, 92.6],
        [25.2, 92.5], [25.0, 92.3], [24.9, 92.1], [24.8, 91.8],
        [24.8, 91.5], [24.9, 91.2], [25.1, 91.0], [25.3, 90.9],
        [25.6, 91.0], [25.8, 91.2], [25.9, 91.5], [26.0, 91.8],
        [26.0, 92.1], [25.9, 92.4]
      ],
      'manipur': [
        [24.9, 94.0], [24.8, 94.2], [24.6, 94.3], [24.4, 94.2],
        [24.2, 94.1], [24.0, 93.9], [23.9, 93.7], [23.8, 93.4],
        [23.8, 93.1], [23.9, 92.8], [24.1, 92.6], [24.3, 92.5],
        [24.5, 92.6], [24.7, 92.8], [24.8, 93.1], [24.9, 93.4],
        [24.9, 93.7], [24.9, 94.0]
      ],
      'mizoram': [
        [23.9, 93.0], [23.8, 93.2], [23.6, 93.3], [23.4, 93.2],
        [23.2, 93.1], [23.0, 92.9], [22.9, 92.7], [22.8, 92.4],
        [22.8, 92.1], [22.9, 91.8], [23.1, 91.6], [23.3, 91.5],
        [23.5, 91.6], [23.7, 91.8], [23.8, 92.1], [23.9, 92.4],
        [23.9, 92.7], [23.9, 93.0]
      ],
      'nagaland': [
        [26.9, 95.0], [26.8, 95.2], [26.6, 95.3], [26.4, 95.2],
        [26.2, 95.1], [26.0, 94.9], [25.9, 94.7], [25.8, 94.4],
        [25.8, 94.1], [25.9, 93.8], [26.1, 93.6], [26.3, 93.5],
        [26.5, 93.6], [26.7, 93.8], [26.8, 94.1], [26.9, 94.4],
        [26.9, 94.7], [26.9, 95.0]
      ],
      'sikkim': [
        [27.9, 88.5], [27.8, 88.7], [27.6, 98.8], [27.4, 88.7],
        [27.2, 88.6], [27.0, 88.4], [26.9, 88.2], [26.8, 87.9],
        [26.8, 87.6], [26.9, 87.3], [27.1, 87.1], [27.3, 87.0],
        [27.5, 87.1], [27.7, 87.3], [27.8, 87.6], [27.9, 87.9],
        [27.9, 88.2], [27.9, 88.5]
      ],
      'tripura': [
        [24.3, 92.0], [24.2, 92.2], [24.0, 92.3], [23.8, 92.2],
        [23.6, 92.1], [23.4, 91.9], [23.3, 91.7], [23.2, 91.4],
        [23.2, 91.1], [23.3, 90.8], [23.5, 90.6], [23.7, 90.5],
        [23.9, 90.6], [24.1, 90.8], [24.2, 91.1], [24.3, 91.4],
        [24.3, 91.7], [24.3, 92.0]
      ]
    };

    const stateSlug = data.state.slug;
    const boundary = accurateBoundaries[stateSlug];
    
    if (boundary && boundary.length > 0) {
      // Create a more accurate polygon boundary for the state
      const polygon = window.L.polygon(boundary, {
        color: '#4CAF50', // Green color for state boundaries
        fillColor: '#4CAF50',
        fillOpacity: 0.15, // Slightly more opaque for better visibility
        weight: 3,
        dashArray: '5, 10' // More distinct dash pattern
      }).addTo(mapInstance.current);

      // Add state label at the center
      const center = polygon.getBounds().getCenter();
      window.L.marker(center, {
        interactive: false,
        icon: window.L.divIcon({
          className: 'state-accurate-label',
          html: `<div style="background: rgba(76, 175, 80, 0.9); color: white; padding: 6px 12px; border-radius: 16px; font-weight: bold; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${data.state.name.toUpperCase()}</div>`,
          iconSize: [200, 40]
        })
      }).addTo(mapInstance.current);
    }
  };

  const addContextBoundaries = () => {
    if (!mapInstance.current) return;

    switch (type) {
      case 'state':
        // Add a circular boundary around the state (already handled by accurate boundary)
        break;
        
      case 'city':
        // Add a circular boundary around the city
        window.L.circle(
          [data.city.coords.lat, data.city.coords.lng],
          {
            color: '#FF9800',
            fillColor: '#FF9800',
            fillOpacity: 0.05,
            radius: 10000, // 10km radius
            weight: 2,
            dashArray: '5, 5'
          }
        ).addTo(mapInstance.current);
        
        // Add city label
        window.L.marker(
          [data.city.coords.lat, data.city.coords.lng],
          {
            interactive: false,
            icon: window.L.divIcon({
              className: 'city-context-label',
              html: `<div style="background: rgba(255, 152, 0, 0.9); color: white; padding: 5px 10px; border-radius: 15px; font-weight: bold; font-size: 14px;">${data.city.name.toUpperCase()}</div>`,
              iconSize: [200, 40]
            })
          }
        ).addTo(mapInstance.current);
        break;
        
      default:
        break;
    }
  };

  const addMarkers = () => {
    if (!mapInstance.current) return;

    switch (type) {
      case 'overview':
        addStateMarkers();
        break;
      case 'state':
        addCityMarkers();
        break;
      case 'city':
        addPOIMarkers();
        break;
      default:
        break;
    }
  };

  const addStateMarkers = () => {
    if (!data.states || !mapInstance.current) return;

    data.states.forEach(state => {
      const marker = window.L.marker(
        [state.coords.lat, state.coords.lng],
        {
          title: state.name,
          alt: state.name
        }
      ).addTo(mapInstance.current);

      // Add popup that opens on hover
      const popupContent = `
        <div class="map-popup">
          <h4>${state.name}</h4>
          <p>${state.description}</p>
          <a href="/state/${state.slug}" class="map-popup-link explore-state-link">Explore State →</a>
        </div>
      `;
      
      const popup = window.L.popup({
        closeButton: true,
        autoClose: false,
        closeOnClick: false
      }).setContent(popupContent);

      // Track popup state
      let popupOpen = false;
      let closeTimeout = null;

      // Open popup on hover
      marker.on('mouseover', function() {
        if (closeTimeout) {
          clearTimeout(closeTimeout);
          closeTimeout = null;
        }
        marker.openPopup();
        popupOpen = true;
      });

      // Handle popup mouse events
      marker.on('popupopen', function() {
        const popupElement = document.querySelector('.leaflet-popup');
        if (popupElement) {
          popupElement.addEventListener('mouseover', function() {
            if (closeTimeout) {
              clearTimeout(closeTimeout);
              closeTimeout = null;
            }
            popupOpen = true;
          });
          
          popupElement.addEventListener('mouseout', function() {
            popupOpen = false;
            closeTimeout = setTimeout(() => {
              if (!popupOpen) {
                marker.closePopup();
              }
            }, 300);
          });
        }
      });

      // Close popup when mouse leaves marker
      marker.on('mouseout', function() {
        popupOpen = false;
        closeTimeout = setTimeout(() => {
          if (!popupOpen) {
            marker.closePopup();
          }
        }, 300);
      });

      marker.bindPopup(popup);
    });
  };

  const addCityMarkers = () => {
    if (!data.cities || !mapInstance.current) return;

    // Add state marker
    const stateMarker = window.L.marker(
      [data.state.coords.lat, data.state.coords.lng],
      {
        title: `${data.state.name} (Capital: ${data.state.capital})`,
        alt: data.state.name
      }
    ).addTo(mapInstance.current);

    const statePopupContent = `
      <div class="map-popup">
        <h4>${data.state.name}</h4>
        <p>Capital: ${data.state.capital}</p>
        <p>${data.state.description}</p>
      </div>
    `;
    stateMarker.bindPopup(statePopupContent);

    // Add city markers
    data.cities.forEach(city => {
      const marker = window.L.marker(
        [city.coords.lat, city.coords.lng],
        {
          title: city.name,
          alt: city.name
        }
      ).addTo(mapInstance.current);

      // Add popup
      const popupContent = `
        <div class="map-popup">
          <h4>${city.name}</h4>
          <p>${city.summary}</p>
          <a href="/city/${city.slug}" class="map-popup-link">Explore City →</a>
        </div>
      `;
      marker.bindPopup(popupContent);

      // Add click handler
      marker.on('click', () => {
        window.location.href = `/city/${city.slug}`;
      });
    });
  };

  const addPOIMarkers = () => {
    if (!data.city.pois || !mapInstance.current) return;

    // Add city center marker
    const cityMarker = window.L.marker(
      [data.city.coords.lat, data.city.coords.lng],
      {
        title: `${data.city.name} City Center`,
        alt: data.city.name
      }
    ).addTo(mapInstance.current);

    const cityPopupContent = `
      <div class="map-popup">
        <h4>${data.city.name} City Center</h4>
        <p>${data.city.summary}</p>
      </div>
    `;
    cityMarker.bindPopup(cityPopupContent);

    // Add POI markers
    data.city.pois.forEach(poi => {
      const marker = window.L.marker(
        [poi.coords.lat, poi.coords.lng],
        {
          title: poi.title,
          alt: poi.title
        }
      ).addTo(mapInstance.current);

      // Add popup
      const popupContent = `
        <div class="map-popup">
          <h4>${poi.title}</h4>
          <p>${poi.desc}</p>
        </div>
      `;
      marker.bindPopup(popupContent);
    });
  };

  return (
    <div ref={mapRef} className="interactive-map" style={{ width: '100%', height: '500px' }}>
      {/* Map will be initialized here */}
    </div>
  );
};

export default InteractiveMap;