import type { Theme } from "./applyTheme";

/**
 * Creates a custom Mapbox style JSON for the Architectural Signature Series.
 *
 * Design Rules:
 * - Zero Text Labels: Remove 100% of labels, street names, and icons
 * - Pure Vector Logic: No 3D buildings, shadows, or satellite imagery
 * - Standardized Line Weights at zoom 13:
 *   - Motorways: 1.8px
 *   - Primary Roads: 1.2px
 *   - Residential/Secondary: 0.4px
 *
 * Available source layers in mapbox-streets-v8:
 * - admin, aeroway, building, landuse, landuse_overlay,
 * - road, structure, water, waterway
 */
export function createCustomStyle(theme: Theme): mapboxgl.Style {
  const { colors } = theme;
  const roadOpacity = colors.road_opacity ?? 0.8;

  return {
    version: 8,
    name: `MapMarked - ${theme.name}`,
    sources: {
      "mapbox-streets": {
        type: "vector",
        url: "mapbox://mapbox.mapbox-streets-v8",
      },
    },
    // No glyphs needed - zero text labels
    layers: [
      // Background - this IS the land color
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": colors.bg,
        },
      },

      // Water fill - subtle differentiation from land
      {
        id: "water",
        type: "fill",
        source: "mapbox-streets",
        "source-layer": "water",
        paint: {
          "fill-color": colors.water,
        },
      },

      // Waterways (rivers, streams) - subtle lines
      {
        id: "waterway",
        type: "line",
        source: "mapbox-streets",
        "source-layer": "waterway",
        paint: {
          "line-color": colors.water,
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8,
            0.5,
            13,
            1,
            18,
            2,
          ],
        },
      },

      // ===== ROADS - THE ARCHITECTURAL SKELETON =====
      // Standardized line weights: Motorway 1.8px, Primary 1.2px, Secondary/Residential 0.4px at zoom 13
      // Order: draw from lowest to highest priority

      // Road - service/minor (smallest roads)
      {
        id: "road-service",
        type: "line",
        source: "mapbox-streets",
        "source-layer": "road",
        minzoom: 14,
        filter: [
          "match",
          ["get", "class"],
          ["service", "track", "path", "pedestrian"],
          true,
          false,
        ],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": colors.road_default,
          "line-opacity": roadOpacity * 0.6,
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            14,
            0.2,
            18,
            1.5,
          ],
        },
      },

      // Road - residential/minor streets
      {
        id: "road-residential",
        type: "line",
        source: "mapbox-streets",
        "source-layer": "road",
        minzoom: 12,
        filter: [
          "match",
          ["get", "class"],
          ["street", "street_limited"],
          true,
          false,
        ],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": colors.road_residential,
          "line-opacity": roadOpacity * 0.7,
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            10,
            0.1,
            13,
            0.4, // 0.4px at zoom 13
            18,
            3,
          ],
        },
      },

      // Road - tertiary
      {
        id: "road-tertiary",
        type: "line",
        source: "mapbox-streets",
        "source-layer": "road",
        minzoom: 11,
        filter: ["==", ["get", "class"], "tertiary"],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": colors.road_tertiary,
          "line-opacity": roadOpacity * 0.8,
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            10,
            0.2,
            13,
            0.4, // 0.4px at zoom 13
            18,
            5,
          ],
        },
      },

      // Road - secondary
      {
        id: "road-secondary",
        type: "line",
        source: "mapbox-streets",
        "source-layer": "road",
        minzoom: 9,
        filter: ["==", ["get", "class"], "secondary"],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": colors.road_secondary,
          "line-opacity": roadOpacity * 0.9,
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            8,
            0.2,
            13,
            0.4, // 0.4px at zoom 13
            18,
            8,
          ],
        },
      },

      // Road - primary
      {
        id: "road-primary",
        type: "line",
        source: "mapbox-streets",
        "source-layer": "road",
        minzoom: 7,
        filter: ["==", ["get", "class"], "primary"],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": colors.road_primary,
          "line-opacity": roadOpacity,
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            6,
            0.3,
            13,
            1.2, // 1.2px at zoom 13
            18,
            12,
          ],
        },
      },

      // Road - trunk
      {
        id: "road-trunk",
        type: "line",
        source: "mapbox-streets",
        "source-layer": "road",
        minzoom: 5,
        filter: ["==", ["get", "class"], "trunk"],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": colors.road_motorway,
          "line-opacity": roadOpacity,
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            5,
            0.4,
            13,
            1.5, // Slightly smaller than motorway
            18,
            16,
          ],
        },
      },

      // Road - motorway (highways) - The dominant arteries
      {
        id: "road-motorway",
        type: "line",
        source: "mapbox-streets",
        "source-layer": "road",
        minzoom: 4,
        filter: ["==", ["get", "class"], "motorway"],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": colors.road_motorway,
          "line-opacity": roadOpacity,
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            4,
            0.5,
            13,
            1.8, // 1.8px at zoom 13
            18,
            20,
          ],
        },
      },

      // ===== BRIDGES =====
      // Draw bridges on top of regular roads with same styling

      // Bridge - secondary
      {
        id: "bridge-secondary",
        type: "line",
        source: "mapbox-streets",
        "source-layer": "road",
        filter: [
          "all",
          ["==", ["get", "class"], "secondary"],
          ["==", ["get", "structure"], "bridge"],
        ],
        layout: {
          "line-cap": "butt",
          "line-join": "round",
        },
        paint: {
          "line-color": colors.road_secondary,
          "line-opacity": roadOpacity * 0.9,
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            8,
            0.2,
            13,
            0.4,
            18,
            8,
          ],
        },
      },

      // Bridge - primary
      {
        id: "bridge-primary",
        type: "line",
        source: "mapbox-streets",
        "source-layer": "road",
        filter: [
          "all",
          ["==", ["get", "class"], "primary"],
          ["==", ["get", "structure"], "bridge"],
        ],
        layout: {
          "line-cap": "butt",
          "line-join": "round",
        },
        paint: {
          "line-color": colors.road_primary,
          "line-opacity": roadOpacity,
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            6,
            0.3,
            13,
            1.2,
            18,
            12,
          ],
        },
      },

      // Bridge - motorway/trunk
      {
        id: "bridge-motorway",
        type: "line",
        source: "mapbox-streets",
        "source-layer": "road",
        filter: [
          "all",
          [
            "match",
            ["get", "class"],
            ["motorway", "trunk"],
            true,
            false,
          ],
          ["==", ["get", "structure"], "bridge"],
        ],
        layout: {
          "line-cap": "butt",
          "line-join": "round",
        },
        paint: {
          "line-color": colors.road_motorway,
          "line-opacity": roadOpacity,
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            4,
            0.5,
            13,
            1.8,
            18,
            20,
          ],
        },
      },
    ],
  } as mapboxgl.Style;
}
