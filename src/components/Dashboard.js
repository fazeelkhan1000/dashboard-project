import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; // Import Supabase client
import DraggableChart from "./DraggableChart";
import LineChart from "./LineChartTime";
import LineView from "./LineChartViews";
import FunnelChart from "./FunnelChart";
import SankeyChart from "./CurvedFunnel";


const defaultCharts = [
  { id: 1, component: <LineView />, type: "lineView" },
  { id: 2, component: <LineChart />, type: "lineChart" },
];

const Dashboard = () => {
  const [charts, setCharts] = useState([]);

  // Fetch chart order from Supabase
  useEffect(() => {
    const fetchChartOrder = async () => {
      const { data, error } = await supabase
        .from("chart_preferences")
        .select("chart_order")
        .eq("id", 1)
        .single();

      if (error || !data) {
        console.warn("No chart preference found, inserting default order...");

        // Insert default chart order
        const { error: insertError } = await supabase
          .from("chart_preferences")
          .insert([{ id: 1, chart_order: [1, 2] }]);

        if (insertError) {
          console.error("Error inserting default chart order:", insertError);
        }

        setCharts(defaultCharts);
      } else {
        const order = data.chart_order;

        // Sort charts based on stored order
        const sortedCharts = order.map((id) =>
          defaultCharts.find((chart) => chart.id === id)
        );
        setCharts(sortedCharts);
      }
    };

    fetchChartOrder();
  }, []);

  // Function to update chart order in Supabase
  const updateChartOrder = async (newOrder) => {
    const { error } = await supabase
      .from("chart_preferences")
      .upsert([{ id: 1, chart_order: newOrder }]);

    if (error) {
      console.error("Error updating chart order:", error);
    }
  };

  // Handle drag and drop
  const handleDrop = (draggedChart, targetChart) => {
    const newCharts = [...charts];
    const draggedIndex = newCharts.findIndex((chart) => chart.id === draggedChart.id);
    const targetIndex = newCharts.findIndex((chart) => chart.id === targetChart.id);

    // Swap elements
    [newCharts[draggedIndex], newCharts[targetIndex]] = [newCharts[targetIndex], newCharts[draggedIndex]];

    setCharts(newCharts);

    // Update Supabase with new order
    updateChartOrder(newCharts.map((chart) => chart.id));
  };

  return (
    <div style={{display: "flex", justifyContent: "center"}}>
        <section style={{maxWidth: "1300px"}}>
        <h1>Dashboard</h1>
      <FunnelChart/>
      {/* <SankeyChart/> */}
      <div style={{ display: "flex", width: "100%", justifyContent: "center" }}>
        {charts.map((chart) => (
          <DraggableChart key={chart.id} chart={chart} onDrop={handleDrop} />
        ))}
      </div>
        </section>
    </div>
  );
};

export default Dashboard;
