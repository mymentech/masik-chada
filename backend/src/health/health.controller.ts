import { Controller, Get, HttpCode, HttpStatus, ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from './health.service';
import { LivenessResponse, ReadinessResponse } from './health.types';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  @HttpCode(HttpStatus.OK)
  live(): LivenessResponse {
    return this.healthService.live();
  }

  @Get('ready')
  async ready(): Promise<ReadinessResponse> {
    const response = await this.healthService.ready();
    if (response.status === 'not_ready') {
      throw new ServiceUnavailableException(response);
    }

    return response;
  }
}
