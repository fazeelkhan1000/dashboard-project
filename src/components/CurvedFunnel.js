import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";

const SankeyChart = () => {
  const ref = useRef();

  useEffect(() => {
    const width = 600, height = 300;

    const svg = d3.select(ref.current)
      .attr("width", width)
      .attr("height", height);

    const data = {
      nodes: [
        { name: "Total Page Views" },
        { name: "Single Page Views" },
        { name: "Leads" },
      ],
      links: [
        { source: 0, target: 1, value: 34560 },
        { source: 1, target: 2, value: 4560 },
      ],
    };

    const sankeyLayout = sankey()
      .nodeWidth(15)
      .nodePadding(30)
      .extent([[1, 1], [width - 1, height - 5]]);

    const { nodes, links } = sankeyLayout({
      nodes: data.nodes.map((d) => ({ ...d })),
      links: data.links.map((d) => ({ ...d })),
    });

    // Draw links (curved paths)
    svg.append("g")
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("fill", "none")
      .attr("stroke", (d) => `rgba(0, 102, 255, ${d.value / 34560})`)
      .attr("stroke-width", (d) => Math.max(1, d.width));

    // Draw nodes
    svg.append("g")
      .selectAll("rect")
      .data(nodes)
      .join("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("width", sankeyLayout.nodeWidth())
      .attr("fill", "#1E56D9");

  }, []);

  return <svg ref={ref} />;
};

export default SankeyChart;
