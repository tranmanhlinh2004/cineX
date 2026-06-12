import { notFound } from "next/navigation";
import AdminCrudFormPage from "@/components/admin/AdminCrudFormPage";
import {
  getAdminCrudConfig,
  isAdminCrudModuleKey,
} from "../../admin-crud-config";

type AdminGenericCreatePageProps = {
  params: Promise<{ module: string }>;
};

export default async function AdminGenericCreatePage({
  params,
}: AdminGenericCreatePageProps) {
  const { module } = await params;

  if (!isAdminCrudModuleKey(module)) {
    notFound();
  }

  const config = getAdminCrudConfig(module);

  return <AdminCrudFormPage config={config} mode="create" />;
}
