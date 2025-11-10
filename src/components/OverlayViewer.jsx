import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { geoArea, geoEquirectangular } from "d3";
import { getOverlay, getTerraOverlay } from "../lib/api.js";
import DomainModal from "@/components/DomainModal";

/**
 * OverlayViewer
 * Terra map + DIS overlay visualizer (NO zoom/pan), instant click modal, 50ms tooltip delay
 */
export default function OverlayViewer({ region: regionProp, domain = "domain.terra" }) {
  const width = 1000;
  const height = 500;
  const svgRef = useRef();
  const location = useLocation();

  const region = (() => {
    if (regionProp) return regionProp;
    const path = location.pathname.toLowerCase();
    if (path.endsWith("/civic/world/usa")) return "usa_states";
    if (path.includes("/civic/world") || path.endsWith("/world")) return "world";
    return "world";
  })();

  const [geojson, setGeojson] = useState(null);
  const [overlay, setOverlay] = useState(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [scope, setScope] = useState("authority");
  const [selectedCode, setSelectedCode] = useState(null);

  // Normalize coordinates (wrap lon, clamp lat)
  function normalizeFeature(feature) {
    if (!feature.geometry || !feature.geometry.coordinates) return feature;
    const fixCoord = ([lon, lat]) => {
      const safeLon = lon > 180 ? lon - 360 : lon < -180 ? lon + 360 : lon;
      const safeLat = Math.max(-85, Math.min(85, lat));
      return [safeLon, safeLat];
    };
    const recurse = (coords) => (typeof coords[0] === "number" ? fixCoord(coords) : coords.map(recurse));
    return { ...feature, geometry: { ...feature.geometry, coordinates: recurse(feature.geometry.coordinates) } };
  }

  // Load Terra map
  useEffect(() => {
    async function loadMap() {
      try {
        const data = await getTerraOverlay(region);
        let features;
        if (data.type === "Topology") {
          const firstKey = Object.keys(data.objects)[0];
          features = topojson.feature(data, data.objects[firstKey]);
        } else {
          features = data;
        }
        if (!features || !features.features || !Array.isArray(features.features)) {
          console.error("Map features missing or invalid:", features);
          setGeojson(null);
          return;
        }
        const normalized = {
          ...features,
          features: features.features.map(f => normalizeFeature(f)),
        };
        setGeojson(normalized);
      } catch (err) {
        console.error("Load map failed:", err);
        setGeojson(null);
      }
    }
    loadMap();
  }, [region]);

  // Load overlay
  useEffect(() => {
    async function loadOverlay() {
      try {
        const data = await getOverlay(domain, scope);
        setOverlay(data.data || data);
      } catch (err) {
        console.error("Overlay fetch failed:", err);
        setOverlay(null);
      }
    }
    loadOverlay();
  }, [domain, scope]);

  useEffect(() => {
  const es = new EventSource("/api/events/live");
  es.addEventListener("domain.update", (e) => {
    const ev = JSON.parse(e.data);
    const payload = JSON.parse(ev.payload);
    if (payload.domain === "domain.usa") {
      setMapColor(
        payload.state === "domain.freeze.v1" ? "#ff4444" :
        payload.state === "domain.unfreeze.v1" ? "#44ff44" : "#00b97a"
      );
    }
  });
  return () => es.close();
}, []);

  // Draw map (no zoom/pan)
  useEffect(() => {
    if (!geojson) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const projection = geoEquirectangular().fitExtent([[0, 0], [width, height]], { type: "Sphere" });
    const path = d3.geoPath(projection);

    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#A9C9C2");

    // Map group
    const mapGroup = svg.append("g").attr("class", "map-layer");

    // Countries
    const sorted = [...geojson.features].sort((a, b) => geoArea(a) - geoArea(b));
    const paths = mapGroup
      .selectAll("path.feature")
      .data(sorted)
      .join("path")
      .attr("class", "feature")
      .attr("d", path)
      .attr("fill", d => (d?.properties?.ISO3 && d.properties.ISO3 !== "UNK") ? "#228B22" : "#6B8F71")
      .attr("stroke", "#324139")
      .attr("stroke-width", region === "world" ? 0.6 : 0.8)
      .attr("pointer-events", "all")
      .attr("cursor", d => (d?.properties?.ISO3 && d.properties.ISO3 !== "UNK") ? "pointer" : "default");

    // Tooltip (50ms delay)
    const container = d3.select(svgRef.current.parentNode);
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
        .style("opacity", 0)
        .style("z-index", 50);
    }

    const TOOLTIP_OFFSET_X = 285;
    const TOOLTIP_OFFSET_Y = 15;

    paths
      .on("mouseenter", function (event, d) {
        const self = this;
        self.__tooltipTimeout = setTimeout(() => {
          const props = d.properties || {};
          const name = props.ADMIN || props.name || "Unknown";
          const iso = props.ISO_A3 || "";
          const pop = props.POP_EST ? props.POP_EST.toLocaleString() : "N/A";
          const continent = props.CONTINENT || "Unknown";
          const subregion = props.SUBREGION || "Unknown";
          const rect = svgRef.current.getBoundingClientRect();
          const x = event.clientX - rect.left + TOOLTIP_OFFSET_X;
          const y = event.clientY - rect.top + TOOLTIP_OFFSET_Y;

          const iso3 = d?.properties?.ISO3;
          if (iso3 && iso3 !== "UNK") {
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
          } else {
            tooltip
              .style("left", `${x}px`)
              .style("top", `${y}px`)
              .style("opacity", 1)
              .html(`
                <div style="background:#CBD5E1;color:#64748B;padding:4px 8px;font-weight:normal;font-size:0.85rem;border-top-left-radius:10px;border-top-right-radius:10px;">
                  ${name}
                </div>
                <div style="padding:6px 10px;line-height:1.4;">
                  <div style="color:#94A3B8;">No additional data available.</div>
                </div>
              `);
          }
        }, 50);
      })
      .on("mousemove", function (event) {
        const rect = svgRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left + TOOLTIP_OFFSET_X;
        const y = event.clientY - rect.top + TOOLTIP_OFFSET_Y;
        tooltip.style("left", `${x}px`).style("top", `${y}px`);
      })
      .on("mouseleave", function () {
        if (this.__tooltipTimeout) {
          clearTimeout(this.__tooltipTimeout);
          this.__tooltipTimeout = null;
        }
        tooltip.interrupt().transition().duration(0).style("opacity", 0);
      });

    // Simple, deterministic click → modal (no zoom/pan to interfere)
    paths.on("click", function (_event, d) {
      const iso3 = d?.properties?.ISO3;
      if (iso3 && iso3 !== "UNK") {
        requestAnimationFrame(() => setSelectedCode(iso3));
      }
    });

    // Optional: draw overlay (nodes/edges) if present
    if (
      showOverlay &&
      overlay?.nodes?.length &&
      overlay.nodes[0]?.lat !== undefined &&
      overlay.nodes[0]?.lon !== undefined
    ) {
      // Edges
      mapGroup.selectAll("line.overlay-edge")
        .data(overlay.edges || [])
        .join("line")
        .attr("class", "overlay-edge")
        .attr("x1", d => projection([overlay.nodes.find(n => n.id === d.from).lon, overlay.nodes.find(n => n.id === d.from).lat])[0])
        .attr("y1", d => projection([overlay.nodes.find(n => n.id === d.from).lon, overlay.nodes.find(n => n.id === d.from).lat])[1])
        .attr("x2", d => projection([overlay.nodes.find(n => n.id === d.to).lon, overlay.nodes.find(n => n.id === d.to).lat])[0])
        .attr("y2", d => projection([overlay.nodes.find(n => n.id === d.to).lon, overlay.nodes.find(n => n.id === d.to).lat])[1])
        .attr("stroke", "#22c55e")
        .attr("stroke-width", 2)
        .attr("opacity", 0.7);

      // Nodes
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

    // Cleanup
    return () => {
      svg.selectAll("*").interrupt();
    };
  }, [geojson, overlay, region, showOverlay]);

  // UI
  return (
    <>
      <div className="center" style={{ marginTop: '24px', position: 'relative' }}>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          style={{ border: '1px solid #ccc', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', borderRadius: '8px', backgroundColor: '#A9C9C2' }}
        />
        <div className="toolbar gap-sm" style={{ position: 'absolute', top: '16px', right: '24px' }}>
          <select
            value={scope}
            onChange={e => setScope(e.target.value)}
            className="field"
            style={{ fontSize: '0.875rem', borderRadius: '12px', padding: '4px 8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
          >
            <option value="authority">Authority</option>
            <option value="trust">Trust</option>
            <option value="consent">Consent</option>
            <option value="freeze">Freeze</option>
          </select>

          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className="button"
            style={{ fontSize: '0.875rem', borderRadius: '12px', padding: '4px 12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', transition: 'all 0.2s' }}
          >
            {showOverlay ? "Hide Overlay" : "Show Overlay"}
          </button>
        </div>
      </div>

      {selectedCode && (
        <div className="center" style={{ position: 'absolute', inset: '0', zIndex: '1000' }}>
          <DomainModal code={selectedCode} onClose={() => setSelectedCode(null)} />
        </div>
      )}
    </>
  );
}
