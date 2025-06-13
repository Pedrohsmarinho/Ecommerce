import { Controller, Get, Post, Body, UseGuards, Request, Delete, Patch, Param, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmailVerificationDto } from './dto/email-verification.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { UserType } from '@prisma/client';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { CreateUserDTO } from './dto/create-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async create(@Body() createUserDto: CreateUserDTO) {
    return this.userService.create(createUserDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Return user profile' })
  async getProfile(@Request() req) {
    return this.userService.findOne(req.user.id);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify user email' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  async verifyEmail(@Body() dto: EmailVerificationDto) {
    return this.userService.verifyEmail(dto.token);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.userService.resendVerification(dto.email);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @Permissions('view:users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @Permissions('view:users')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, description: 'Return user by id' })
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @Permissions('delete:user')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @Permissions('update:user')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.userService.update(id, updateUserDto);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.CLIENT)
  @ApiOperation({ summary: 'Update client profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDTO) {
    return this.userService.updateProfile(req.user.id, updateProfileDto);
  }

  @Post('client-profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.CLIENT)
  @ApiOperation({ summary: 'Create client profile for existing CLIENT user' })
  @ApiResponse({ status: 201, description: 'Client profile created successfully' })
  async createClientProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDTO) {
    return this.userService.createClientProfile(req.user.id, updateProfileDto);
  }
}