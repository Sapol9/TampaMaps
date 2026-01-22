import type { Theme } from "./applyTheme";

/**
 * Creates a custom Mapbox style JSON with only the layers we need,
 * using exact theme colors for a clean maptoposter-style aesthetic.
 *
 * This approach gives us complete control over rendering, unlike
 * trying to override Mapbox's pre-built styles.
 *
 * Available source layers in mapbox-streets-v8:
 * - admin, aeroway, building, landuse, landuse_overlay,
 * - road, structure, water, waterway
 */
export function createCustomStyle(theme: Theme): mapboxgl.Style {
  const { colors } = theme;

  return {
    version: 8,
    name: `TampaMaps - ${theme.name}`,
    sources: {
      "mapbox-streets": {
        type: "vector",
        url: "mapbox://mapbox.mapbox-streets-v8",
      },
    },
    glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
    layers: [
      // Background - this IS the land color
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": colors.bg,
        },
      },

      // Landuse - parks, forests, etc.
      {
        id: "landuse-park",
        type: "fill",
        source: "mapbox-streets",
        "source-layer": "landuse",
        filter: [
          "match",
          ["get", "class"],
          ["park", "grass", "pitch", "cemetery", "golf_course", "hospital", "school"],
          true,
          false,
        ],
        paint: {
          "fill-color": colors.parks,
        },
      },

      // Water fill
      {
        id: "water",
        type: "fill",
        source: "mapbox-streets",
        "source-layer": "water",
        paint: {
          "fill-color": colors.water,
        },
      },

      // Waterways (rivers, streams)
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
            1,
            14,
            3,
          ],
        },
      },

      // Buildings
      {
        id: "building",
        type: "fill",
        source: "mapbox-streets",
        "source-layer": "building",
        minzoom: 13,
        paint: {
          "fill-color": colors.parks,
          "fill-opacity": 0.6,
        },
      },

      // ===== ROADS =====
      // Order matters: draw from lowest to highest priority

      // Road - service/minor (smallest roads)
      {
        id: "road-service",
        type: "line",
        source: "mapbox-streets",
        "source-layer": "road",
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
          "line-color": colors.road_residential,
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            10,
            0.5,
            14,
            1,
            18,
            4,
          ],
        },
      },

      // Road - residential/minor streets
      {
        id: "road-residential",
        type: "line",
        source: "mapbox-streets",
        "source-layer": "road",
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
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            10,
            0.5,
            14,
            2,
            18,
            8,
          ],
        },
      },

      // Road - tertiary
      {
        id: "road-tertiary",
        type: "line",
        source: "mapbox-streets",
        "source-layer": "road",
        filter: ["==", ["get", "class"], "tertiary"],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": colors.road_tertiary,
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            10,
            0.5,
            14,
            3,
            18,
            12,
          ],
        },
      },

      // Road - secondary
      {
        id: "road-secondary",
        type: "line",
        source: "mapbox-streets",
        "source-layer": "road",
        filter: ["==", ["get", "class"], "secondary"],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": colors.road_secondary,
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            8,
            0.5,
            14,
            4,
            18,
            16,
          ],
        },
      },

      // Road - primary
      {
        id: "road-primary",
        type: "line",
        source: "mapbox-streets",
        "source-layer": "road",
        filter: ["==", ["get", "class"], "primary"],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": colors.road_primary,
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            6,
            0.5,
            14,
            5,
            18,
            20,
          ],
        },
      },

      // Road - trunk
      {
        id: "road-trunk",
        type: "line",
        source: "mapbox-streets",
        "source-layer": "road",
        filter: ["==", ["get", "class"], "trunk"],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": colors.road_motorway,
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            5,
            0.5,
            14,
            6,
            18,
            24,
          ],
        },
      },

      // Road - motorway (highways)
      {
        id: "road-motorway",
        type: "line",
        source: "mapbox-streets",
        "source-layer": "road",
        filter: ["==", ["get", "class"], "motorway"],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": colors.road_motorway,
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            5,
            1,
            14,
            8,
            18,
            28,
          ],
        },
      },

      // ===== BRIDGES =====
      // Draw bridges on top of regular roads

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
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            8,
            0.5,
            14,
            4,
            18,
            16,
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
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            6,
            0.5,
            14,
            5,
            18,
            20,
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
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            5,
            1,
            14,
            8,
            18,
            28,
          ],
        },
      },
    ],
  } as mapboxgl.Style;
}
