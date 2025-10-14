import { useEffect, useState } from "react";
import { geoPath, geoMercator, select } from "d3";
import * as topojson from "topojson-client";

export default function OverlayViewer() {
  const [geojson, setGeojson] = useState(null);

  useEffect(() => {
    async function loadMap() {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/terra/map?nocache=${Date.now()}`, {
        cache: "no-store"
      });
      const text = await res.text();
      const data = JSON.parse(text);

      // ✅ auto-detect and convert TopoJSON if needed
      if (data.type === "Topology") {
        const firstKey = Object.keys(data.objects)[0];
        const converted = topojson.feature(data, data.objects[firstKey]);
        console.log("Detected TopoJSON → converted to GeoJSON:", firstKey);
        setGeojson(converted);
      } else {
        setGeojson(data);
      }
    }
    loadMap();
  }, []);

  useEffect(() => {
    if (!geojson) return;
    const svg = select("#terra-map");
    svg.selectAll("*").remove();

    const width = 1000;
    const height = 600;

    // --- Projection roughly centered over your region ---
    const projection = geoMercator()
      .center([96.3, 27.3])   // [longitude, latitude]
      .scale(20000)           // zoom in strongly
      .translate([width / 2, height / 2]);

    const path = geoPath(projection);

    // --- Diagnostic info ---
    console.log("GeoJSON summary:", geojson.type, geojson.features?.length);
    if (geojson.features && geojson.features.length > 0) {
      console.log("First feature example:", geojson.features[0]);
    } else {
      console.warn("No features found or not a FeatureCollection");
    }

    // --- Draw your coordinate box ---
    const boxCoords = [
      [96.19, 27.26],
      [96.67, 27.34]
    ];

    // project and log corners
    const projected = boxCoords.map(c => {
      const p = projection(c);
      console.log("Projected", c, "→", p);
      return p;
    });

    // draw a red rectangle for those coordinates
    svg.append("rect")
      .attr("x", projected[0][0])
      .attr("y", projected[1][1])
      .attr("width", projected[1][0] - projected[0][0])
      .attr("height", projected[0][1] - projected[1][1])
      .attr("stroke", "red")
      .attr("fill", "none")
      .attr("stroke-width", 2);

    // --- Draw the map itself ---
    svg.selectAll("path")
      .data(geojson.features || [])
      .join("path")
      .attr("d", path)
      .attr("fill", "rgba(0,185,122,0.3)")
      .attr("stroke", "#00B97A")
      .attr("stroke-width", 0.4);

    // --- Print bounding box of full GeoJSON for reference ---
    console.log("GeoJSON bounds:", path.bounds(geojson));

    // 🟢 --- Add Projection Probe Overlay ---
    const probePoints = [
      [96.19, 27.26],
      [96.3, 27.3],
      [96.4, 27.33],
      [96.5, 27.29],
      [96.67, 27.34]
    ];

    const probes = probePoints.map(p => ({
      lon: p[0],
      lat: p[1],
      proj: projection(p)
    }));

    // Draw small circles at projected locations
    svg.selectAll("circle.probe")
      .data(probes)
      .join("circle")
      .attr("class", "probe")
      .attr("cx", d => d.proj[0])
      .attr("cy", d => d.proj[1])
      .attr("r", 4)
      .attr("fill", "#00B97A")
      .attr("stroke", "#0f172a")
      .attr("stroke-width", 0.8);

    // Add labels near each probe
    svg.selectAll("text.probe-label")
      .data(probes)
      .join("text")
      .attr("class", "probe-label")
      .attr("x", d => d.proj[0] + 6)
      .attr("y", d => d.proj[1] - 4)
      .attr("font-size", "11px")
      .attr("fill", "#0f172a")
      .text(d => `${d.lon.toFixed(2)},${d.lat.toFixed(2)}`);

    console.log("Probe projections:", probes);
  }, [geojson]);

  return (
    <div className="flex justify-center mt-6">
      <svg id="terra-map" width="1000" height="600" />
    </div>
  );
}

