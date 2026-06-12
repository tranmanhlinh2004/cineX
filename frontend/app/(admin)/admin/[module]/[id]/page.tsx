import { notFound } from "next/navigation";
import AdminCrudDetailPage from "@/components/admin/AdminCrudDetailPage";
import {
  getAdminCrudConfig,
  getAdminCrudItem,
  isAdminCrudModuleKey,
} from "../../admin-crud-config";

type AdminGenericDetailPageProps = {
  params: Promise<{ module: string; id: string }>;
};

export default async function AdminGenericDetailPage({
  params,
}: AdminGenericDetailPageProps) {
  const { module, id } = await params;

  if (!isAdminCrudModuleKey(module)) {
    notFound();
  }

  const config = getAdminCrudConfig(module);
  const item = getAdminCrudItem(config, id);

  if (!item) {
    notFound();
  }

  return <AdminCrudDetailPage config={config} item={item} />;
}
