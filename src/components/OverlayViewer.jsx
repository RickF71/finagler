import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { geoPath, select, geoArea, geoEquirectangular } from "d3";
import * as topojson from "topojson-client";
import * as d3 from "d3";

/**
 * OverlayViewer
 * Terra map + DIS overlay visualizer with zoom/pan, hover pop, scope dropdown + toggle
 */
export default function OverlayViewer({ region: regionProp, domain = "domain.terra" }) {
  const [geojson, setGeojson] = useState(null);
  const [overlay, setOverlay] = useState(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [scope, setScope] = useState("authority");
  const svgRef = useRef();
  const location = useLocation();

  const region = (() => {
    if (regionProp) return regionProp;
    const path = location.pathname.toLowerCase();
    if (path.endsWith("/civic/world/usa")) return "usa_states";
    if (path.includes("/civic/world") || path.endsWith("/world")) return "world";
    return "world";
  })();

  // 🧩 Load Terra map
  useEffect(() => {
    async function loadMap() {
      const url = `${import.meta.env.VITE_API_BASE}/api/terra/map?region=${region}&nocache=${Date.now()}`;
      console.log(`🗺️ Loading region: ${region}`);
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      let features;
      if (data.type === "Topology") {
        const firstKey = Object.keys(data.objects)[0];
        features = topojson.feature(data, data.objects[firstKey]);
      } else features = data;

      const normalized = {
        ...features,
        features: features.features
          .map(f => normalizeFeature(f))
          .filter(f => f && f.geometry && f.geometry.coordinates),
      };
      setGeojson(normalized);
    }
    loadMap();
  }, [region]);

  // 🧭 Normalize longitudes / clamp latitudes
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

  // 🌐 Fetch overlay
  useEffect(() => {
    async function loadOverlay() {
      try {
        const url = `${import.meta.env.VITE_API_BASE}/api/overlay/${domain}/${scope}`;
        console.log(`🔍 Loading overlay: ${domain}/${scope}`);
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setOverlay(data.data);
      } catch (err) {
        console.error("Overlay fetch failed:", err);
        setOverlay(null);
      }
    }
    loadOverlay();
  }, [domain, scope]);

  // 🗺️ Render map + overlay + zoom/pan
  useEffect(() => {
    if (!geojson) return;
    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 1000;
    const height = 600;
    const projection = geoEquirectangular()
      .rotate([-25, 0])
      .fitExtent([[40, 0], [width - 40, height]], geojson);

    const path = geoPath(projection);

    // Base layer
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#A9C9C2");

    // 🗺️ Create zoomable group
    const mapGroup = svg.append("g").attr("class", "map-layer");

    const sorted = [...geojson.features].sort((a, b) => geoArea(a) - geoArea(b));

    const paths = mapGroup
      .selectAll("path.feature")
      .data(sorted)
      .join("path")
      .attr("d", path)
      .attr("fill", "#5E7466")
      .attr("stroke", "#324139")
      .attr("stroke-width", region === "world" ? 0.6 : 0.8)
      .attr("pointer-events", "all");

    // ✨ Shadow filter for hover “pop”
    const defs = svg.append("defs");
    const filter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-50%").attr("y", "-50%")
      .attr("width", "200%").attr("height", "200%");
    filter.append("feDropShadow")
      .attr("dx", 0).attr("dy", 1).attr("stdDeviation", 2)
      .attr("flood-color", "#000000").attr("flood-opacity", 0.35);

    // 🪶 Tooltip
    const container = select(svgRef.current.parentNode);
    let tooltip = container.select(".map-tooltip");
    if (tooltip.empty()) {
      tooltip = container.append("div")
        .attr("class", "map-tooltip")
        .style("position", "absolute")
        .style("background", "#0B0F14")
        .style("color", "#E2E8F0")
        .style("border-radius", "10px")
        .style("box-shadow", "0 4px 10px rgba(0,0,0,0.3)")
        .style("pointer-events", "none")
        .style("font-size", "0.8rem")
        .style("overflow", "hidden")
        .style("opacity", 0)
        .style("z-index", 50);
    }

    // 🧭 Hover + tooltip (fixed positioning)
    paths
      .on("mousemove", function (event, d) {
        const props = d.properties || {};
        const name = props.ADMIN || props.name || "Unknown";
        const iso = props.ISO_A3 || "";
        const pop = props.POP_EST ? props.POP_EST.toLocaleString() : "N/A";
        const gdp = props.GDP_MD_EST ? `$${props.GDP_MD_EST.toLocaleString()}M` : "N/A";
        const continent = props.CONTINENT || "Unknown";
        const subregion = props.SUBREGION || "Unknown";

        d3.select(this)
          .raise()
          .attr("fill", "#8FAE9A")
          .attr("filter", "url(#glow)");

        // Tooltip position based on true mouse location in screen space
        const { clientX, clientY } = event;
        tooltip
          .style("left", `${clientX + 15}px`)
          .style("top", `${clientY - 20}px`)
          .style("opacity", 1)
          .html(`
            <div style="background:#00B97A;color:#0B0F14;padding:4px 8px;font-weight:bold;font-size:0.85rem;border-top-left-radius:10px;border-top-right-radius:10px;">
              ${name} ${iso ? `(${iso})` : ""}
            </div>
            <div style="padding:6px 10px;line-height:1.4;">
              <div><strong>Population:</strong> ${pop}</div>
              <div><strong>Continent:</strong> ${continent}</div>
              <div><strong>Subregion:</strong> ${subregion}</div>
            </div>
          `);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("fill", "#5E7466").attr("filter", null);
        tooltip.style("opacity", 0);
      });

    // 🌐 Overlay layer
    if (showOverlay && overlay?.nodes && overlay?.edges) {
      const nodeScale = d3.scaleLinear().domain([0, overlay.nodes.length]).range([100, width - 100]);
      const centerY = height - 80;

      mapGroup.selectAll("line.overlay-edge")
        .data(overlay.edges)
        .join("line")
        .attr("class", "overlay-edge")
        .attr("x1", d => nodeScale(overlay.nodes.findIndex(n => n.id === d.from)))
        .attr("x2", d => nodeScale(overlay.nodes.findIndex(n => n.id === d.to)))
        .attr("y1", centerY)
        .attr("y2", centerY)
        .attr("stroke", "#22c55e")
        .attr("stroke-width", 2)
        .attr("opacity", 0.7);

      mapGroup.selectAll("circle.overlay-node")
        .data(overlay.nodes)
        .join("circle")
        .attr("class", "overlay-node")
        .attr("cx", (_, i) => nodeScale(i))
        .attr("cy", centerY)
        .attr("r", 8)
        .attr("fill", "#00B97A")
        .attr("stroke", "#0B0F14")
        .attr("stroke-width", 1.6)
        .append("title")
        .text(d => `${d.label} (${d.id})`);
    }

    // 🧭 Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        mapGroup.attr("transform", event.transform);
      });

    svg.call(zoom);

    return () => d3.selectAll(".map-tooltip").remove();
  }, [geojson, overlay, region, showOverlay]);

  // 🧭 UI
  return (
    <div className="flex justify-center mt-6 relative">
      <svg ref={svgRef} width="1000" height="600" className="border shadow-md rounded bg-[#A9C9C2]" />
      <div className="absolute top-4 right-6 flex gap-2">
        <select
          value={scope}
          onChange={e => setScope(e.target.value)}
          className="bg-[#0B0F14] text-[#00B97A] border border-[#00B97A] rounded-xl px-2 py-1 text-sm shadow-lg focus:outline-none"
        >
          <option value="authority">Authority</option>
          <option value="trust">Trust</option>
          <option value="consent">Consent</option>
          <option value="freeze">Freeze</option>
        </select>

        <button
          onClick={() => setShowOverlay(!showOverlay)}
          className="bg-[#0B0F14] text-[#00B97A] border border-[#00B97A] hover:bg-[#00B97A] hover:text-[#0B0F14] transition-all rounded-xl px-3 py-1 text-sm shadow-lg"
        >
          {showOverlay ? "Hide Overlay" : "Show Overlay"}
        </button>
      </div>
    </div>
  );
}
