import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Dashboard from "./components/Dashboard.js";

function App() {
  return (
    <Router>
      <Switch>
      <DndProvider backend={HTML5Backend}>
        <Route exact path="/" component={Dashboard} />
        </DndProvider>
      </Switch>
    </Router>
  );
}

export default App;
