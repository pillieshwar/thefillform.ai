import { AUTH_CONFIG } from "@/src/config/auth-config";
import Login from "@/src/pages/Login";
import { Amplify } from "aws-amplify";
import "./App.css";
import "antd/dist/reset.css"; // AntD v5+ uses reset.css
import AccountSettings from "@/src/pages/AccountSettings";

Amplify.configure(AUTH_CONFIG);
function App() {
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  return showAccountSettings ? (
    <AccountSettings onBack={() => setShowAccountSettings(false)} />
  ) : (
    <Login onOpenAccount={() => setShowAccountSettings(true)} />
  );
}

export default App;
