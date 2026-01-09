import { useAuth } from "@/contexts/AuthContext";
import TenantHomeScreen from "../TenantHomeScreen";
import LandlordHomeScreen from "../LandlordHomeScreen";

export default function HomeScreen() {
  const { user } = useAuth();

  if (user?.role === "landlord") {
    return <LandlordHomeScreen />;
  }

  return <TenantHomeScreen />;
}
