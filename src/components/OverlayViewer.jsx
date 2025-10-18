import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { geoPath, select, geoArea, geoEquirectangular } from "d3";
import * as topojson from "topojson-client";
import * as d3 from "d3";
import { getOverlay, getTerraOverlay } from "../lib/api.js";
import iso2to3 from "../lib/iso3166.js";
import DomainModal from "@/components/DomainModal";

/**
 * OverlayViewer
 * Terra map + DIS overlay visualizer with zoom/pan, hover pop, scope dropdown + toggle
 */
export default function OverlayViewer({ region: regionProp, domain = "domain.terra" }) {
  const [geojson, setGeojson] = useState(null);
  const [overlay, setOverlay] = useState(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [scope, setScope] = useState("authority");
  const [selectedCode, setSelectedCode] = useState(null);
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
      try {
        console.log(`🗺️ Loading region: ${region}`);
        const data = await getTerraOverlay(region);

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
      } catch (err) {
        console.error("Load map failed:", err);
        setGeojson(null);
      }
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
        console.log(`🔍 Loading overlay: ${domain}/${scope}`);
        const data = await getOverlay(domain, scope);
        setOverlay(data.data || data);
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
    const height = 500;

    // 🌍 Fit full globe, no gaps
    const projection = geoEquirectangular()
      .fitExtent([[0, 0], [width, height]], { type: "Sphere" });

    const path = d3.geoPath(projection);

    // Base background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#A9C9C2");

    // 🗺️ Map layer
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

    // ✨ Drop shadow filter
    const defs = svg.append("defs");
    const filter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    filter.append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 1)
      .attr("stdDeviation", 2)
      .attr("flood-color", "#000000")
      .attr("flood-opacity", 0.35);

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

    // 🧭 Tooltip offset (screen-space positioning)
    const TOOLTIP_OFFSET_X = 285;  // distance right of cursor
    const TOOLTIP_OFFSET_Y = 15;   // distance below cursor

    // 🧭 Hover + tooltip
    paths
      .on("mousemove", function (event, d) {
        const props = d.properties || {};
        const name = props.ADMIN || props.name || "Unknown";
        const iso = props.ISO_A3 || "";
        const pop = props.POP_EST ? props.POP_EST.toLocaleString() : "N/A";
        const continent = props.CONTINENT || "Unknown";
        const subregion = props.SUBREGION || "Unknown";

        d3.select(this)
          .raise()
          .attr("fill", "#8FAE9A")
          .attr("filter", "url(#glow)");

        const rect = svgRef.current.getBoundingClientRect();

        // Ensure CSS variables exist (only needed once)
        document.documentElement.style.setProperty("--tooltip-offset-x", 285);
        document.documentElement.style.setProperty("--tooltip-offset-y", 15);
        const computed = getComputedStyle(document.documentElement);
        const offsetX = parseFloat(computed.getPropertyValue("--tooltip-offset-x")) || TOOLTIP_OFFSET_X;
        const offsetY = parseFloat(computed.getPropertyValue("--tooltip-offset-y")) || TOOLTIP_OFFSET_Y;
        const x = event.clientX - rect.left + offsetX;
        const y = event.clientY - rect.top + offsetY;

        tooltip
          .style("left", `${x}px`)
          .style("top", `${y}px`)
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
        tooltip
          .interrupt()
          .transition().duration(0)
          .style("opacity", 0);
      });

    // click -> open domain modal using ISO_A3 code
    // stop propagation so other listeners or default behaviors don't intercept the first click
    // use canonical mapping file for ISO-2 -> ISO-3

    paths.on("click", (event, d) => {
      try {
        if (event && event.stopPropagation) event.stopPropagation();
        if (event && event.preventDefault) event.preventDefault();
      } catch (e) {
        // ignore
      }

      const rawIso = d.properties?.ISO_A3 || d.properties?.ISO_A2 || d.properties?.iso_a3 || d.properties?.iso_a2 || null;
      if (!rawIso) return;
      const candidate = String(rawIso).toUpperCase();
      let iso = candidate;
      if (candidate.length === 2 && iso2to3[candidate]) {
        iso = iso2to3[candidate];
      }
      console.log("Country clicked raw:", candidate, "mapped:", iso);
      // avoid re-setting the same code which can cause unnecessary re-renders
      setSelectedCode(prev => (prev === iso ? prev : iso));
    });

    // 🌐 Overlay layer — only render if geographic
    if (
      showOverlay &&
      overlay?.nodes?.length &&
      overlay.nodes[0]?.lat !== undefined &&
      overlay.nodes[0]?.lon !== undefined
    ) {
      // Draw edges
      mapGroup.selectAll("line.overlay-edge")
        .data(overlay.edges)
        .join("line")
        .attr("class", "overlay-edge")
        .attr("x1", d => projection([overlay.nodes.find(n => n.id === d.from).lon, overlay.nodes.find(n => n.id === d.from).lat])[0])
        .attr("y1", d => projection([overlay.nodes.find(n => n.id === d.from).lon, overlay.nodes.find(n => n.id === d.from).lat])[1])
        .attr("x2", d => projection([overlay.nodes.find(n => n.id === d.to).lon, overlay.nodes.find(n => n.id === d.to).lat])[0])
        .attr("y2", d => projection([overlay.nodes.find(n => n.id === d.to).lon, overlay.nodes.find(n => n.id === d.to).lat])[1])
        .attr("stroke", "#22c55e")
        .attr("stroke-width", 2)
        .attr("opacity", 0.7);

      // Draw nodes
      mapGroup.selectAll("circle.overlay-node")
        .data(overlay.nodes)
        .join("circle")
        .attr("class", "overlay-node")
        .attr("cx", d => projection([d.lon, d.lat])[0])
        .attr("cy", d => projection([d.lon, d.lat])[1])
        .attr("r", 6)
        .attr("fill", "#00B97A")
        .attr("stroke", "#0B0F14")
        .attr("stroke-width", 1.6)
        .append("title")
        .text(d => `${d.label} (${d.id})`);
    }

    // 🧭 Proper zoom/pan with mouse-centered zoom and edge clamping
    const [[x0, y0], [x1, y1]] = path.bounds({ type: "Sphere" });
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        const { transform } = event;
        mapGroup.attr("transform", transform);

        const k = transform.k;
        const dx = (x1 - x0) * k;
        const dy = (y1 - y0) * k;

        const minX = Math.min(0, width - dx);
        const minY = Math.min(0, height - dy);
        const maxX = 0;
        const maxY = 0;

        const clampedX = Math.max(minX, Math.min(transform.x, maxX));
        const clampedY = Math.max(minY, Math.min(transform.y, maxY));

        if (clampedX !== transform.x || clampedY !== transform.y) {
          svg.transition().duration(0)
            .call(zoom.transform, d3.zoomIdentity.translate(clampedX, clampedY).scale(k));
        }
      });

    svg.call(zoom).call(zoom.transform, d3.zoomIdentity);

    // Double-click reset
    svg.on("dblclick.zoom", null);
    svg.on("dblclick", () => {
      svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
    });

    return () => d3.selectAll(".map-tooltip").remove();
  }, [geojson, overlay, region, showOverlay]);

  // 🧭 UI
  return (
    <>
    <div className="flex justify-center mt-6 relative">
      <svg ref={svgRef} width="1000" height="500" className="border shadow-md rounded bg-[#A9C9C2]" />
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
    {selectedCode && (
      <div className="absolute inset-0 flex items-center justify-center z-[1000]">
        <DomainModal code={selectedCode} onClose={() => setSelectedCode(null)} />
      </div>
    )}
    </>
  );
}
