import { Controller, Post, Get, Param, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('s3')
@Controller('s3')
@UseGuards(JwtAuthGuard)
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file to S3' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: { buffer: Buffer; mimetype: string; originalname: string }) {
    const key = `test/${Date.now()}-${file.originalname}`;
    await this.s3Service.uploadFile(file, key);
    const url = await this.s3Service.getSignedUrl(key);
    return { key, url };
  }

  @Get('url/:key')
  @ApiOperation({ summary: 'Get signed URL for a file' })
  async getSignedUrl(@Param('key') key: string) {
    const url = await this.s3Service.getSignedUrl(key);
    return { url };
  }
}