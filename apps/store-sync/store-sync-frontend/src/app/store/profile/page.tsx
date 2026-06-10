"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldSet,
  FieldSetContent,
  FieldSectionField,
  FieldSectionLegend,
} from "@ui/components/field";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { Textarea } from "@ui/components/textarea";
import {
  AdminListPageHeader,
  AdminPageLoading,
  AdminPageSection,
} from "@ui/components/admin";
import { Loader2, MapPin, Save } from "lucide-react";
import {
  useChangeStoreAccountPassword,
  useStoreAccountProfile,
  useUpdateStoreAccountProfile,
} from "@/hooks/queries";
import { useSession } from "@/hooks/use-session";
import { patchStoreSession } from "@/lib/store-auth";
import { StoreProfileSidebar } from "./_component/store-profile-sidebar";
import {
  formatProfileDateTime,
  PROFILE_ACTION_BAR_CLASS,
  PROFILE_FIELD_CLASS,
  PROFILE_TEXTAREA_CLASS,
  profileInitials,
} from "./_component/profile-utils";

function StoreProfilePageInner() {
  const session = useSession();
  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useStoreAccountProfile(!!session);
  const updateProfile = useUpdateStoreAccountProfile();
  const changePw = useChangeStoreAccountPassword();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatar, setAvatar] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const email = profile?.email ?? session?.username ?? "";

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.name ?? "");
    setPhone(profile.phone ?? "");
    setAddress(profile.address ?? "");
    setAvatar(profile.avatar ?? "");
  }, [profile]);

  const handleSaveProfile = async () => {
    const name = fullName.trim();
    if (!name) {
      toast.error("Vui lòng nhập họ tên");
      return;
    }
    try {
      const updated = await updateProfile.mutateAsync({
        name,
        phone: phone.trim() || null,
        address: address.trim() || null,
        avatar: avatar.trim() || null,
      });
      patchStoreSession({ displayName: updated.name ?? name });
    } catch {
      /* toast trong mutation */
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error("Nhập mật khẩu hiện tại");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới tối thiểu 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Nhập lại mật khẩu mới không khớp");
      return;
    }
    try {
      await changePw.mutateAsync({
        currentPassword,
        password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      /* toast trong mutation */
    }
  };

  if (!session) {
    return null;
  }

  if (isLoading && !profile) {
    return <AdminPageLoading variant="list" />;
  }

  return (
    <AdminPageSection>
      <AdminListPageHeader
        title="Hồ sơ cửa hàng"
        subtitle="Cập nhật tên, liên hệ, địa chỉ giao hàng và mật khẩu đăng nhập đại lý."
      />

      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Không tải được hồ sơ"}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.20fr)_minmax(0,0.80fr)]">
        <div className="space-y-6">
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={MapPin}
              title="Thông tin liên hệ & địa chỉ"
              description="Cập nhật thông tin liên hệ để đồng bộ cho đơn hàng và giao nhận."
            />
            <FieldSetContent variant="section" className="space-y-5">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <div className="flex flex-col gap-2.5">
                  <div className="relative aspect-[3/4] w-40 shrink-0 sm:w-52">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt=""
                        className="h-full w-full rounded-lg border-2 border-border/60 object-cover shadow-sm"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-border/60 bg-muted text-lg font-bold text-muted-foreground">
                        {fullName ? profileInitials(fullName) : "?"}
                      </div>
                    )}
                  </div>
                  {profile ? (
                    <div className="flex w-full flex-col gap-2.5">
                      <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                        <p className="text-xs tracking-wide text-muted-foreground uppercase">
                          Trạng thái
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          {profile.isActive ? "Đang hoạt động" : "Đã khoá"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                        <p className="text-xs tracking-wide text-muted-foreground uppercase">
                          Cập nhật lần cuối
                        </p>
                        <p className="mt-1 truncate text-sm font-medium">
                          {formatProfileDateTime(profile.updatedAt)}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="store-avatar-url">URL ảnh đại diện</Label>
                    <Input
                      id="store-avatar-url"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      disabled={isLoading || !profile}
                      placeholder="https://example.com/avatar.jpg"
                      className={PROFILE_FIELD_CLASS}
                    />
                  </div>

                  <FieldSectionField label="Email">
                    <span className="font-mono text-sm">{email}</span>
                  </FieldSectionField>
                  <p className="-mt-2 text-xs leading-relaxed text-muted-foreground">
                    Email đăng nhập được quản lý tập trung — không chỉnh tại
                    màn này.
                  </p>

                  <Field>
                    <FieldLabel htmlFor="store-fullName">Họ và tên</FieldLabel>
                    <FieldContent>
                      <Input
                        id="store-fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={isLoading || !profile}
                        placeholder="Nguyễn Văn A"
                        className={PROFILE_FIELD_CLASS}
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="store-phone">Số điện thoại</FieldLabel>
                    <FieldContent>
                      <Input
                        id="store-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={isLoading || !profile}
                        placeholder="VD: 0901234567"
                        className={PROFILE_FIELD_CLASS}
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="store-address">
                      Địa chỉ giao hàng / cửa hàng
                    </FieldLabel>
                    <FieldContent>
                      <Textarea
                        id="store-address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        disabled={isLoading || !profile}
                        placeholder="Địa chỉ nhận hàng hoặc cửa hàng (không bắt buộc)"
                        className={PROFILE_TEXTAREA_CLASS}
                      />
                    </FieldContent>
                  </Field>

                  <div className={PROFILE_ACTION_BAR_CLASS}>
                    <Button
                      type="button"
                      className="min-w-32 rounded-lg"
                      onClick={() => void handleSaveProfile()}
                      disabled={isLoading || !profile || updateProfile.isPending}
                    >
                      {updateProfile.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Save className="size-4" />
                      )}
                      <span className="ml-2">Lưu hồ sơ</span>
                    </Button>
                  </div>
                </div>
              </div>
            </FieldSetContent>
          </FieldSet>
        </div>

        <StoreProfileSidebar
          profile={profile}
          sessionRole={session.role}
          currentPassword={currentPassword}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          changingPassword={changePw.isPending}
          onCurrentPasswordChange={setCurrentPassword}
          onNewPasswordChange={setNewPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onChangePassword={() => void handleChangePassword()}
        />
      </div>
    </AdminPageSection>
  );
}

export default function StoreProfilePage() {
  return <StoreProfilePageInner />;
}
