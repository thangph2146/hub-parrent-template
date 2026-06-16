import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ADMIN_ROUTES } from '../config/constants';

import { PERMISSIONS } from '../config/permissions';

import { Permissions } from '../common/permissions.decorator';

import { HanetAdminService } from './hanet-admin.service';

import type {
  HanetCreatePlaceInput,
  HanetRegisterPersonByUrlInput,
  HanetSetDeviceMqttInput,
  HanetTakeFacePictureInput,
  HanetUpdateDeviceInput,
  HanetUpdateFaceImageInput,
  HanetUpdateFaceUrlInput,
  HanetUpdatePartnerTokenInput,
  HanetUpdatePlaceInput,
} from './hanet-partner.types';
import type { HanetPersonHubInput } from './hanet-partner-params';
import { formatHanetCheckinDayDate } from './hanet-partner.response';

@ApiTags('HANET Admin')
@Permissions(PERMISSIONS.EVENTS_VIEW)
@Controller(ADMIN_ROUTES.HANET)
export class HanetAdminController {
  constructor(private readonly hanetAdminService: HanetAdminService) {}

  @Get('status')
  @ApiOperation({ summary: 'Trạng thái cấu hình HANET + URL webhook' })
  getStatus(@Query('eventId') eventId?: string) {
    return {
      success: true,

      data: this.hanetAdminService.getStatus(eventId?.trim() || undefined),
    };
  }

  @Post('test-connection')
  @ApiOperation({ summary: 'Kiểm tra OAuth / access token HANET' })
  async testConnection() {
    const data = await this.hanetAdminService.testConnection();

    return { success: true, data };
  }

  @Post('test-partner')
  @ApiOperation({
    summary: 'Gọi partner API HANET (profile/getProfile) — kiểm returnCode=1',
  })
  async testPartner() {
    const data = await this.hanetAdminService.testPartnerApi();

    return { success: true, data };
  }

  @Get('partner/users')
  @ApiOperation({
    summary: 'POST /partner/getListUserPartner — app partner đã liên kết',
  })
  async listPartnerUsers() {
    const data = await this.hanetAdminService.listPartnerUsers();

    return { success: true, data };
  }

  @Delete('partner/users')
  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @ApiOperation({ summary: 'POST /partner/removeUserPartner' })
  async removePartnerUser(@Query('clientId') clientId?: string) {
    const data = await this.hanetAdminService.removePartnerUser({
      clientId: clientId?.trim() ?? '',
    });

    return { success: true, data };
  }

  @Post('partner/update-token')
  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @ApiOperation({
    summary: 'POST /partner/updateToken — body = field HANET (ngoài token)',
  })
  async updatePartnerToken(@Body() body?: HanetUpdatePartnerTokenInput) {
    const data = await this.hanetAdminService.updatePartnerToken(body);

    return { success: true, data };
  }

  @Get('places')
  @ApiOperation({ summary: 'POST /place/getPlaces — danh sách địa điểm HANET' })
  async listPlaces() {
    const data = await this.hanetAdminService.listPlaces();

    return { success: true, data };
  }

  @Get('places/info')
  @ApiOperation({ summary: 'POST /place/getPlaceInfo — chi tiết địa điểm' })
  async getPlaceInfo(@Query('placeId') placeId?: string) {
    const data = await this.hanetAdminService.getPlaceInfo(
      placeId?.trim() ?? '',
    );

    return { success: true, data };
  }

  @Post('places')
  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @ApiOperation({ summary: 'POST /place/addPlace + gắn app partner' })
  async createPlace(@Body() body: HanetCreatePlaceInput) {
    const data = await this.hanetAdminService.createPlace(body);

    return { success: true, data };
  }

  @Patch('places')
  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @ApiOperation({ summary: 'POST /place/updatePlace' })
  async updatePlace(@Body() body: HanetUpdatePlaceInput) {
    const data = await this.hanetAdminService.updatePlace(body);

    return { success: true, data };
  }

  @Delete('places')
  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @ApiOperation({ summary: 'POST /place/removePlace (+ gỡ partner nếu có)' })
  async removePlace(@Query('placeId') placeId?: string) {
    const data = await this.hanetAdminService.removePlace({
      placeId: placeId?.trim() ?? '',
    });

    return { success: true, data };
  }

  @Get('profile')
  @ApiOperation({
    summary: 'POST /profile/getProfile — thông tin tài khoản partner',
  })
  async getProfile() {
    const data = await this.hanetAdminService.getProfile();

    return { success: true, data };
  }

  @Get('devices/connection-status')
  @ApiOperation({ summary: 'POST /device/getConnectionStatus' })
  async deviceConnectionStatus(@Query('deviceId') deviceId?: string) {
    const data = await this.hanetAdminService.getDeviceConnectionStatus(
      deviceId?.trim() ?? '',
    );

    return { success: true, data };
  }

  @Get('devices/info')
  @ApiOperation({ summary: 'POST /device/getDeviceInfo' })
  async getDeviceInfo(@Query('deviceId') deviceId?: string) {
    const data = await this.hanetAdminService.getDeviceInfo(
      deviceId?.trim() ?? '',
    );

    return { success: true, data };
  }

  @Patch('devices')
  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @ApiOperation({ summary: 'POST /device/updateDevice' })
  async updateDevice(@Body() body: HanetUpdateDeviceInput) {
    const data = await this.hanetAdminService.updateDevice(body);

    return { success: true, data };
  }

  @Post('devices/mqtt')
  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @ApiOperation({ summary: 'POST /device/setDeviceMQTT' })
  async setDeviceMqtt(@Body() body: HanetSetDeviceMqttInput) {
    const data = await this.hanetAdminService.setDeviceMqtt(body);

    return { success: true, data };
  }

  @Get('devices')
  @ApiOperation({ summary: 'POST /device/getListDeviceByPlace' })
  async listDevices(@Query('placeId') placeId?: string) {
    const data = await this.hanetAdminService.listDevices(placeId?.trim());

    return { success: true, data };
  }

  @Post('person/register-by-url')
  @ApiOperation({
    summary: 'POST /person/registerByUrl — đăng ký khuôn mặt từ URL ảnh',
  })
  async registerPersonByUrl(@Body() body: HanetRegisterPersonByUrlInput) {
    const data = await this.hanetAdminService.registerPersonByUrl(body);

    return { success: true, data };
  }

  @Post('person/face/update-by-url')
  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @ApiOperation({ summary: 'POST /person/updateByFaceUrl' })
  async updatePersonFaceByUrl(@Body() body: HanetUpdateFaceUrlInput) {
    const data = await this.hanetAdminService.updatePersonFaceByUrl(body);

    return { success: true, data };
  }

  @Post('person/face/update-by-url-by-alias-id')
  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @ApiOperation({ summary: 'POST /person/updateByFaceUrlByAliasID' })
  async updatePersonFaceByUrlAlias(@Body() body: HanetUpdateFaceUrlInput) {
    const data = await this.hanetAdminService.updatePersonFaceByUrlAlias(body);

    return { success: true, data };
  }

  @Post('person/face/update-by-url-by-person-id')
  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @ApiOperation({ summary: 'POST /person/updateByFaceUrlByPersonID' })
  async updatePersonFaceByUrlPersonId(@Body() body: HanetUpdateFaceUrlInput) {
    const data =
      await this.hanetAdminService.updatePersonFaceByUrlPersonId(body);

    return { success: true, data };
  }

  @Post('person/face/update-by-image')
  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @ApiOperation({ summary: 'POST /person/updateByFaceImage (multipart file)' })
  async updatePersonFaceByImage(@Body() body: HanetUpdateFaceImageInput) {
    const data = await this.hanetAdminService.updatePersonFaceByImage(body);

    return { success: true, data };
  }

  @Post('person/face/update-by-image-by-alias-id')
  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @ApiOperation({ summary: 'POST /person/updateByFaceImageByAliasID' })
  async updatePersonFaceByImageAlias(@Body() body: HanetUpdateFaceImageInput) {
    const data =
      await this.hanetAdminService.updatePersonFaceByImageAlias(body);

    return { success: true, data };
  }

  @Post('person/face/update-by-image-by-person-id')
  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @ApiOperation({ summary: 'POST /person/updateByFaceImageByPersonID' })
  async updatePersonFaceByImagePersonId(
    @Body() body: HanetUpdateFaceImageInput,
  ) {
    const data =
      await this.hanetAdminService.updatePersonFaceByImagePersonId(body);

    return { success: true, data };
  }

  @Post('person/face/take-picture')
  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @ApiOperation({ summary: 'POST /person/takeFacePicture' })
  async takePersonFacePicture(@Body() body: HanetTakeFacePictureInput) {
    const data = await this.hanetAdminService.takePersonFacePicture(body);

    return { success: true, data };
  }

  @Post('person/register')
  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @ApiOperation({ summary: 'POST /person/register' })
  async registerPerson(@Body() body: HanetPersonHubInput) {
    const data = await this.hanetAdminService.registerPerson(body);

    return { success: true, data };
  }

  @Get('person/by-alias-all')
  @ApiOperation({ summary: 'POST /person/getListByAliasIDAllPlace' })
  async listPersonByAliasAll(@Query('aliasId') aliasId?: string) {
    const data = await this.hanetAdminService.getListPersonByAliasAllPlace(
      aliasId?.trim() ?? '',
    );

    return { success: true, data };
  }

  @Get('person/by-alias')
  @ApiOperation({ summary: 'POST /person/getListByAliasID' })
  async listPersonByAlias(
    @Query('aliasId') aliasId?: string,

    @Query('placeId') placeId?: string,
  ) {
    const data = await this.hanetAdminService.getListPersonByAlias({
      aliasId: aliasId?.trim(),

      placeId: placeId?.trim(),
    });

    return { success: true, data };
  }

  @Get('person/user-by-alias')
  @ApiOperation({ summary: 'POST /person/getUserInfoByAliasID' })
  async getUserInfoByAlias(
    @Query('aliasId') aliasId?: string,

    @Query('placeId') placeId?: string,
  ) {
    const data = await this.hanetAdminService.getUserInfoByAlias({
      aliasId: aliasId?.trim(),

      placeId: placeId?.trim(),
    });

    return { success: true, data };
  }

  @Get('person/user-by-id')
  @ApiOperation({ summary: 'POST /person/getUserInfoByPersonID' })
  async getUserInfoByPersonId(
    @Query('personId') personId?: string,

    @Query('placeId') placeId?: string,
  ) {
    const data = await this.hanetAdminService.getUserInfoByPersonId({
      personId: personId?.trim(),

      placeId: placeId?.trim(),
    });

    return { success: true, data };
  }

  @Patch('person')
  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @ApiOperation({ summary: 'POST /person/update' })
  async updatePerson(@Body() body: HanetPersonHubInput) {
    const data = await this.hanetAdminService.updatePerson(body);

    return { success: true, data };
  }

  @Patch('person/info')
  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @ApiOperation({ summary: 'POST /person/updateInfo' })
  async updatePersonInfo(@Body() body: HanetPersonHubInput) {
    const data = await this.hanetAdminService.updatePersonInfo(body);

    return { success: true, data };
  }

  @Patch('person/alias-id')
  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @ApiOperation({ summary: 'POST /person/updateAliasID' })
  async updatePersonAliasId(@Body() body: HanetPersonHubInput) {
    const data = await this.hanetAdminService.updatePersonAliasId(body);

    return { success: true, data };
  }

  @Delete('person')
  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @ApiOperation({ summary: 'POST /person/remove' })
  async removePerson(
    @Query('personId') personId?: string,

    @Query('placeId') placeId?: string,
  ) {
    const data = await this.hanetAdminService.removePerson({
      personId: personId?.trim(),

      placeId: placeId?.trim(),
    });

    return { success: true, data };
  }

  @Delete('person/by-place')
  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @ApiOperation({ summary: 'POST /person/removeByPlace' })
  async removePersonByPlace(
    @Query('aliasId') aliasId?: string,

    @Query('placeId') placeId?: string,
  ) {
    const data = await this.hanetAdminService.removePersonByPlace({
      aliasId: aliasId?.trim(),

      placeId: placeId?.trim(),
    });

    return { success: true, data };
  }

  @Post('person/remove-by-alias-ids')
  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @ApiOperation({ summary: 'POST /person/removePersonByListAliasID' })
  async removePersonsByAliasIds(@Body() body: HanetPersonHubInput) {
    const data = await this.hanetAdminService.removePersonsByAliasIds(body);

    return { success: true, data };
  }

  @Delete('person/in-place')
  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @ApiOperation({ summary: 'POST /person/removeAllPersonInPlace' })
  async removeAllPersonsInPlace(@Query('placeId') placeId?: string) {
    const data = await this.hanetAdminService.removeAllPersonsInPlace(
      placeId?.trim(),
    );

    return { success: true, data };
  }

  @Delete('person/by-id')
  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @ApiOperation({ summary: 'POST /person/removePersonByID' })
  async removePersonById(
    @Query('personId') personId?: string,

    @Query('placeId') placeId?: string,
  ) {
    const data = await this.hanetAdminService.removePersonById({
      personId: personId?.trim(),

      placeId: placeId?.trim(),
    });

    return { success: true, data };
  }

  @Get('checkins/timestamp')
  @ApiOperation({
    summary:
      'POST /person/getCheckinByPlaceIdInTimestamp + getTotalCheckinByPlaceIdInTimestamp',
  })
  async getCheckinsByTimestamp(
    @Query('placeId') placeId?: string,

    @Query('from') from?: string,

    @Query('to') to?: string,
  ) {
    const data = await this.hanetAdminService.getCheckinsByPlaceTimestamp(
      placeId?.trim(),

      from?.trim() ?? '',

      to?.trim() ?? '',
    );

    return { success: true, data };
  }

  @Get('checkins')
  @ApiOperation({
    summary:
      'POST /person/getCheckinByPlaceIdInDay — đối soát check-in theo ngày',
  })
  async getCheckins(
    @Query('placeId') placeId?: string,

    @Query('date') date?: string,
  ) {
    const day = date?.trim() || formatHanetCheckinDayDate(new Date());

    const data = await this.hanetAdminService.getCheckinsByPlaceDay(
      placeId?.trim(),

      day,
    );

    return { success: true, data };
  }

  @Get('persons')
  @ApiOperation({
    summary: 'POST /person/getListByPlace — danh sách person + avatar từ HANET',
  })
  async listPersons(
    @Query('placeId') placeId?: string,

    @Query('pageIndex') pageIndex?: string,

    @Query('pageSize') pageSize?: string,
  ) {
    const data = await this.hanetAdminService.listPersonsFromHanet(
      placeId?.trim(),

      pageIndex != null ? Number.parseInt(pageIndex, 10) : undefined,

      pageSize != null ? Number.parseInt(pageSize, 10) : undefined,
    );

    return { success: true, data };
  }

  @Post('persons/sync')
  @ApiOperation({
    summary: 'Đồng bộ avatar HANET vào bảng face_data (getListByPlace)',
  })
  async syncPersonAvatars(@Query('placeId') placeId?: string) {
    const data = await this.hanetAdminService.syncPersonAvatars(
      placeId?.trim(),
    );

    return { success: true, data };
  }

  @Post('cameras/ensure')
  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @ApiOperation({
    summary:
      'Tạo/cập nhật camera Hub từ deviceID HANET (trước khi gắn sự kiện)',
  })
  async ensureCamera(
    @Body()
    body: {
      deviceId: string;
      name?: string;
      placeId?: string;
      placeName?: string;
    },
  ) {
    const data = await this.hanetAdminService.ensureCamera(body);

    return { success: true, data };
  }

  @Get('avatars')
  @ApiOperation({
    summary: 'Danh sách avatar đã lưu local (face_data từ HANET)',
  })
  async listStoredAvatars(
    @Query('page') page?: string,

    @Query('limit') limit?: string,

    @Query('search') search?: string,
  ) {
    const data = await this.hanetAdminService.listStoredAvatars({
      page: page != null ? Number.parseInt(page, 10) : undefined,

      limit: limit != null ? Number.parseInt(limit, 10) : undefined,

      search: search?.trim(),
    });

    return { success: true, data };
  }
}
