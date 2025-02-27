import React, { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { createClient } from "@supabase/supabase-js";
import ".././App.css"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

const LineView = () => {
  const [chartData, setChartData] = useState(null);
  const [totalViews, setTotalViews] = useState(0);
  const chartRef = useRef(null);
  const ctxFlag = useRef(false);

  const getGradient = (ctx, width) => {
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "rgba(0, 123, 255, 1)");
    gradient.addColorStop(1, "rgba(0, 255, 123, 1)");
    return gradient;
  };

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SUPABASE_URL}/rest/v1/single_page_views?order=created_at.asc`,
        {
          headers: {
            "apikey": process.env.REACT_APP_SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
          },
        }
      );
  
      const data = await response.json();
      const labels = data.map((entry) =>
        new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(new Date(entry.created_at))
      );
  
      const timeSpent = data.map((entry) => entry.views);

      const total = data.reduce((sum, entry) => sum + entry.views, 0);
      setTotalViews(total);
  
      setChartData({
        labels,
        datasets: [
          {
            label: "Time Spent on Home Page (Hours)",
            data: timeSpent,
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            tension: 0.4,
          },
        ],
      });
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };
  

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("realtime-page-views")
      .on("postgres_changes", { event: "*", schema: "public", table: "single_page_views" }, fetchData)
      .subscribe();

    return () => {
      (async () => {
        try {
          await supabase.removeChannel(channel);
        } catch (error) {
          console.error("Error removing Supabase channel:", error);
        }
      })();
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current || !chartRef.current.canvas || ctxFlag.current) return;
    const ctx = chartRef.current.canvas.getContext("2d");
    const width = chartRef.current.canvas.width;

    if (chartData && ctx) {
      ctxFlag.current = true;

      setChartData((prevData) => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          datasets: prevData.datasets.map((dataset) => ({
            ...dataset,
            borderColor: getGradient(ctx, width),
          })),
        };
      });
    }
  }, [chartData]);

  return (
    <div className="container-div">
      <div className="head-div">
      <h5 className="mg-h2">Single Page Views</h5>
      <span className="span-text">{totalViews}</span>
      </div>
      {chartData ? (
        <Line
          ref={chartRef}
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              x: {
                ticks: {
                  autoSkip: false,
                  maxRotation: 0,
                  minRotation: 0,
                  callback: function (value, index, values) {
                    const totalLabels = chartData.labels.length;
                    if (totalLabels <= 5) return chartData.labels[index];
                    const step = Math.ceil(totalLabels / 5);
                    return index % step === 0 || index === totalLabels - 1 ? chartData.labels[index] : "";
                  },
                },
                grid: { display: false, drawBorder: false },
              },
              y: { grid: { display: false, drawBorder: false } },
            },
          }}
        />
      ) : (
        <p>Loading chart...</p>
      )}
    </div>
  );
};

export default LineView;
