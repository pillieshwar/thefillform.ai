import { useState } from "react";
import reactLogo from "@/assets/react.svg";
import wxtLogo from "/wxt.svg";
import "./App.css";
import RecordContainer from "@/src/record/RecordContainer";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>WXT + React</h1>
      <RecordContainer />
    </>
  );
}

export default App;
