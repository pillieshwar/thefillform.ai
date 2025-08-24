import { AUTH_CONFIG } from "@/src/config/auth-config";
import Login from "@/src/pages/Login";
import { Amplify } from "aws-amplify";
import "./App.css";
import "antd/dist/reset.css"; // AntD v5+ uses reset.css

Amplify.configure(AUTH_CONFIG);
function App() {
  return (
    <>
      {/* <RecordContainer /> */}
      <Login />
    </>
  );
}

export default App;
