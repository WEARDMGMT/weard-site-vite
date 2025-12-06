import React from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";

export default function WorldMap({ geoUrl, offices, hoverCountry, setHoverCountry, position, setPosition }) {
  return (
    <ComposableMap projectionConfig={{ scale: 200 }} className="w-full h-full" style={{ width: "100%", height: "100%" }}>
      <ZoomableGroup
        center={position.coordinates}
        zoom={position.zoom}
        minZoom={1}
        maxZoom={3}
        translateExtent={[[-1000, -500], [1000, 500]]}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const nm = geo.properties.name;
              const active = hoverCountry && nm.toLowerCase().includes(hoverCountry.toLowerCase());
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => setHoverCountry(nm)}
                  onMouseLeave={() => setHoverCountry(null)}
                  style={{
                    default: {
                      fill: active ? "#E8E9FF" : "#F3F4F6",
                      stroke: "#D1D5DB",
                      strokeWidth: 0.6,
                      outline: "none",
                    },
                    hover: {
                      fill: "#E0E7FF",
                      cursor: "pointer",
                    },
                    pressed: { fill: "#C7D2FE" },
                  }}
                />
              );
            })
          }
        </Geographies>

        {offices.map((o) => (
          <Marker key={o.country} coordinates={o.coords} onClick={() => setPosition({ coordinates: o.coords, zoom: 2 })}>
            <g>
              <circle r={9} fill="rgba(99,102,241,0.22)">
                <animate attributeName="r" values="7;10;7" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle r={3.2} fill="rgba(99,102,241,1)" />
              <g transform="translate(10,-12)">
                <rect rx="6" ry="6" width="110" height="18" fill="rgba(17,24,39,0.75)"></rect>
                <text x="8" y="12" fontSize="10" fill="#fff">
                  {o.city}
                </text>
              </g>
            </g>
          </Marker>
        ))}
      </ZoomableGroup>
    </ComposableMap>
  );
}
