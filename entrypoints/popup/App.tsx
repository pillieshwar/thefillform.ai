import { AUTH_CONFIG } from "@/src/config/auth-config";
import Login from "@/src/pages/Login";
import { Amplify } from "aws-amplify";
import "./App.css";

Amplify.configure(AUTH_CONFIG);
function App() {
  return (
    <>
      <h1>WXT + React</h1>
      {/* <RecordContainer /> */}
      <Login />
    </>
  );
}

export default App;
