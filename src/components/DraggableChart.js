import React from "react";
import { useDrag, useDrop } from "react-dnd";

const DraggableChart = ({ chart, onDrop }) => {
  const [{ isDragging }, dragRef] = useDrag({
    type: "CHART",
    item: { id: chart.id, type: chart.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, dropRef] = useDrop({
    accept: "CHART",
    drop: (draggedChart) => onDrop(draggedChart, chart),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={(node) => dragRef(dropRef(node))}
      style={{
        padding: "10px",
        // border: "1px solid gray",
        backgroundColor: isOver ? "#f0f0f0" : "white",
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
      }}
    >
      {chart.component}
    </div>
  );
};

export default DraggableChart;
