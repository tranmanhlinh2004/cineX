import AdminModulePage from "@/components/admin/AdminModulePage";
import { adminMenuPageConfigs } from "@/components/admin/admin-menu-page-configs";

export default function AdminSeatTypesPage() {
  return <AdminModulePage {...adminMenuPageConfigs.seatTypes} />;
}
