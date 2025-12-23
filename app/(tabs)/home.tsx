import { useAuth } from "@/contexts/AuthContext";
import TenantHomeScreen from "@/app/tenant-home";
import LandlordHomeScreen from "@/app/landlord-home";

export default function HomeScreen() {
  const { user } = useAuth();

  if (user?.role === "landlord") {
    return <LandlordHomeScreen />;
  }

  return <TenantHomeScreen />;
}
