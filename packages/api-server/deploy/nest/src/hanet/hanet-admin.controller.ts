import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ADMIN_ROUTES } from '../config/constants';

import { PERMISSIONS } from '../config/permissions';

import { Permissions } from '../common/permissions.decorator';

import { HanetAdminService } from './hanet-admin.service';

import type { HanetRegisterPersonByUrlInput } from './hanet-partner.types';



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



  @Get('places')

  @ApiOperation({ summary: 'POST /place/getPlaces — danh sách địa điểm HANET' })

  async listPlaces() {

    const data = await this.hanetAdminService.listPlaces();

    return { success: true, data };

  }



  @Get('profile')

  @ApiOperation({ summary: 'POST /profile/getProfile — thông tin tài khoản partner' })

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



  @Get('devices')

  @ApiOperation({ summary: 'POST /device/getListDeviceByPlace' })

  async listDevices(@Query('placeId') placeId?: string) {

    const data = await this.hanetAdminService.listDevices(placeId?.trim());

    return { success: true, data };

  }



  @Post('person/register-by-url')

  @ApiOperation({ summary: 'POST /person/registerByUrl — đăng ký khuôn mặt từ URL ảnh' })

  async registerPersonByUrl(@Body() body: HanetRegisterPersonByUrlInput) {

    const data = await this.hanetAdminService.registerPersonByUrl(body);

    return { success: true, data };

  }



  @Get('checkins')

  @ApiOperation({

    summary: 'POST /person/getCheckinByPlaceIdInDay — đối soát check-in theo ngày',

  })

  async getCheckins(

    @Query('placeId') placeId?: string,

    @Query('date') date?: string,

  ) {

    const day = date?.trim() || new Date().toISOString().slice(0, 10);

    const data = await this.hanetAdminService.getCheckinsByPlaceDay(

      placeId?.trim(),

      day,

    );

    return { success: true, data };

  }



  @Get('persons')

  @ApiOperation({

    summary: 'POST /person/getListPersonByPlace — danh sách person + avatar từ HANET',

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

    summary: 'Đồng bộ avatar HANET vào bảng face_data (getListPersonByPlace)',

  })

  async syncPersonAvatars(@Query('placeId') placeId?: string) {

    const data = await this.hanetAdminService.syncPersonAvatars(placeId?.trim());

    return { success: true, data };

  }



  @Post('cameras/ensure')

  @Permissions(PERMISSIONS.EVENTS_MANAGE)

  @ApiOperation({

    summary:

      'Tạo/cập nhật camera Hub từ deviceID HANET (trước khi gắn sự kiện)',

  })

  async ensureCamera(

    @Body() body: { deviceId: string; name?: string },

  ) {

    const data = await this.hanetAdminService.ensureCamera(body);

    return { success: true, data };

  }



  @Get('avatars')

  @ApiOperation({ summary: 'Danh sách avatar đã lưu local (face_data từ HANET)' })

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


