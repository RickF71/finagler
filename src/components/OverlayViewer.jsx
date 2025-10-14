import { useEffect, useState, useRef } from "react";
import { geoPath, geoNaturalEarth1, select, geoArea } from "d3";
import * as topojson from "topojson-client";

export default function OverlayViewer() {
  const [geojson, setGeojson] = useState(null);
  const svgRef = useRef();

  // 🧩 Load map data
  useEffect(() => {
    async function loadMap() {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/terra/map?nocache=${Date.now()}`, {
        cache: "no-store"
      });
      const text = await res.text();
      const data = JSON.parse(text);

      let features;
      if (data.type === "Topology") {
        const firstKey = Object.keys(data.objects)[0];
        features = topojson.feature(data, data.objects[firstKey]);
        console.log("Converted TopoJSON → GeoJSON:", firstKey);
      } else {
        features = data;
        console.log("Loaded GeoJSON features:", data.features?.length);
      }

      // ✅ Keep normalization in case of stragglers
      const normalized = {
        ...features,
        features: features.features
          .map(f => normalizeFeature(f))
          .filter(f => f && f.geometry && f.geometry.coordinates)
      };

      setGeojson(normalized);
    }
    loadMap();
  }, []);

  // 🧭 Normalize longitudes and clamp latitudes
  function normalizeFeature(feature) {
    if (!feature.geometry || !feature.geometry.coordinates) return feature;
    function fixCoord(coord) {
      const [lon, lat] = coord;
      const safeLon = lon > 180 ? lon - 360 : lon < -180 ? lon + 360 : lon;
      const safeLat = Math.max(-85, Math.min(85, lat));
      return [safeLon, safeLat];
    }
    function recurse(coords) {
      if (typeof coords[0] === "number") return fixCoord(coords);
      return coords.map(recurse);
    }
    return { ...feature, geometry: { ...feature.geometry, coordinates: recurse(feature.geometry.coordinates) } };
  }

  // 🗺️ Render map
  useEffect(() => {
    if (!geojson) return;
    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 1000;
    const height = 600;

    // 🌐 Use Natural Earth projection – no dateline issues
    const projection = geoNaturalEarth1()
      .scale(180)
      .translate([width / 2, height / 2]);

    const path = geoPath(projection);

    console.log("🌍 Feature count:", geojson.features.length);

    // ---- Stable draw order ----
    const sorted = [...geojson.features].sort((a, b) => geoArea(a) - geoArea(b));

    svg
      .selectAll("path.country")
      .data(sorted)
      .join("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#00B97A")
      .attr("stroke-width", 0.6);

    // 🟥 Bounding box for reference
    const [[x0, y0], [x1, y1]] = path.bounds(geojson);
    svg.append("rect")
      .attr("x", x0)
      .attr("y", y0)
      .attr("width", x1 - x0)
      .attr("height", y1 - y0)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 1);

    // 🟢 Probe dots
    const probePoints = [[0, 0], [10, 0], [0, 10], [10, 10], [20, 0]];
    const probes = probePoints.map(p => ({ lon: p[0], lat: p[1], proj: projection(p) }));
    svg.selectAll("circle.probe")
      .data(probes)
      .join("circle")
      .attr("class", "probe")
      .attr("cx", d => d.proj[0])
      .attr("cy", d => d.proj[1])
      .attr("r", 3)
      .attr("fill", "#22c55e");

    console.log("Rendered bounds:", path.bounds(geojson));
  }, [geojson]);

  return (
    <div className="flex justify-center mt-6">
      <svg ref={svgRef} width="1000" height="600" className="border bg-white" />
    </div>
  );
}
