import React, { useEffect, useRef, useState } from "react";
import { Chart as ChartJS, registerables } from "chart.js";
import { FunnelController, TrapezoidElement } from "chartjs-chart-funnel";
import { createClient } from "@supabase/supabase-js";
import ".././App.css";

ChartJS.register(...registerables, FunnelController, TrapezoidElement);

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const FunnelChart = () => {
  const [chartData, setChartData] = useState(null);
  const [totalViews, setTotalViews] = useState(0);
  const [singleViews, setSingleViews] = useState(0);
  const [leads, setLeads] = useState(0);

  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SUPABASE_URL}/rest/v1/analytics?order=value.desc`,
        {
          method: "GET",
          headers: {
            apikey: process.env.REACT_APP_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data) {
        setTotalViews(data[0]?.value)
        setSingleViews(data[1]?.value)
        setLeads(data[2]?.value)
        const labels = data.map((item) => item.metric);
        const values = data.map((item) => item.value);



        setChartData({
          labels,
          datasets: [
            {
              label: "Funnel Data",
              data: values,
              backgroundColor: ["#1E56D9", "#2E85FF", "#64D2A6"],
              hoverBackgroundColor: ["#1B4FC1", "#2574D9", "#5EC399"],
              borderRadius: 20,
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("realtime-page-views")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "analytics" },
        fetchData 
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (chartData && chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy(); 
      }

      chartInstanceRef.current = new ChartJS(chartRef.current, {
        type: "funnel",
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (tooltipItem) => `${tooltipItem.raw} views`,
              },
            },
          },
        },
      });
    }
  }, [chartData]);

  return (
    <div className="funnel-main">
      <div style={{ display: "flex" }}>
        <div className="one-third">
          <h5 className="mg-h2">Total Page Views</h5>
          <p className="span-text-funnel">{totalViews}</p>
        </div>
        <div className="one-third">
          <h5 className="mg-h2"> Single Page Views</h5>
          <p className="span-text-funnel">{singleViews}</p>
        </div>
        <div className="one-third">
          <h5 className="mg-h2">Leads</h5>
          <p className="span-text-funnel">{leads}</p>
        </div>
      </div>
      <div className="chart-container">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default FunnelChart;
