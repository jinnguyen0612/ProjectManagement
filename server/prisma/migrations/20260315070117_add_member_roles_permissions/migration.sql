-- CreateTable
CREATE TABLE "member_roles_permissions" (
    "role" "member_role" NOT NULL,
    "permission_id" BIGINT NOT NULL,

    CONSTRAINT "member_roles_permissions_pkey" PRIMARY KEY ("role","permission_id")
);

-- CreateIndex
CREATE INDEX "member_roles_permissions_permission_id_idx" ON "member_roles_permissions"("permission_id");

-- AddForeignKey
ALTER TABLE "member_roles_permissions" ADD CONSTRAINT "member_roles_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
