import { useAuth } from "@/contexts/AuthContext";
import TenantHomeScreen from "@/app/(tabs)/TenantHomeScreen";
import LandlordHomeScreen from "@/app/(tabs)/LandlordHomeScreen";

export default function HomeScreen() {
  const { user } = useAuth();

  if (user?.role === "landlord") {
    return <LandlordHomeScreen />;
  }

  return <TenantHomeScreen />;
}
