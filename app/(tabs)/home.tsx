import { useAuth } from "@/contexts/AuthContext";
import TenantHomeScreen from "@/components/tenant/TenantHomeScreen";
import LandlordHomeScreen from "@/components/landlord/LandlordHomeScreen";

export default function HomeScreen() {
  const { user } = useAuth();

  if (user?.role === "landlord") {
    return <LandlordHomeScreen />;
  }

  return <TenantHomeScreen />;
}
