import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { listDomains, getDomainLinks } from "../lib/api";

export default function DomainGraphView() {
  const svgRef = useRef(null);
  const [domains, setDomains] = useState([]);
  const [links, setLinks] = useState([]);

  // -------------------------------
  // Fetch domains + links using centralized API
  // -------------------------------
  useEffect(() => {
    Promise.all([
      listDomains(),
      getDomainLinks().catch(() => []),
    ]).then(([domains, links]) => {
      setDomains(domains);
      setLinks(links || []);
    });
  }, []);

  // -------------------------------
  // Initialize D3 force layout
  // -------------------------------
  useEffect(() => {
    if (!domains.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // clear old

    const width = window.innerWidth;
    const height = window.innerHeight;

    const simulation = d3.forceSimulation(domains)
      .force("link", d3.forceLink(links).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append("g")
      .attr("stroke", "#888")
      .attr("stroke-opacity", 0.4)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1.5);

    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(domains)
      .join("circle")
      .attr("r", 25)
      .attr("fill", "#223")
      .attr("stroke", "#FFD60A")
      .call(drag(simulation));

    const label = svg
      .append("g")
      .selectAll("text")
      .data(domains)
      .join("text")
      .text(d => d.name)
      .attr("text-anchor", "middle")
      .attr("fill", "#FFD60A")
      .attr("font-size", 12)
      .attr("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      label
        .attr("x", d => d.x)
        .attr("y", d => d.y + 40);
    });

    // DRAG LOGIC
    function drag(simulation) {
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }
      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
    }
  }, [domains, links]);

  return (
    <div className="w-full h-full bg-[#001020] text-white overflow-hidden">
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
}
