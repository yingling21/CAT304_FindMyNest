import { useAuth } from "@/contexts/AuthContext";
import TenantHomeScreen from "@/app/TenantHomeScreen";
import LandlordHomeScreen from "@/app/LandlordHomeScreen";

export default function HomeScreen() {
  const { user } = useAuth();

  if (user?.role === "landlord") {
    return <LandlordHomeScreen />;
  }

  return <TenantHomeScreen />;
}
