import { notFound } from "next/navigation";
import AdminCrudFormPage from "@/components/admin/AdminCrudFormPage";
import {
  getAdminCrudConfig,
  getAdminCrudItem,
  isAdminCrudModuleKey,
} from "../../../admin-crud-config";

type AdminGenericEditPageProps = {
  params: Promise<{ module: string; id: string }>;
};

export default async function AdminGenericEditPage({
  params,
}: AdminGenericEditPageProps) {
  const { module, id } = await params;

  if (!isAdminCrudModuleKey(module)) {
    notFound();
  }

  const config = getAdminCrudConfig(module);
  const item = getAdminCrudItem(config, id);

  if (!item) {
    notFound();
  }

  return <AdminCrudFormPage config={config} mode="edit" item={item} />;
}
