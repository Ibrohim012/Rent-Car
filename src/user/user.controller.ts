// import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Put } from '@nestjs/common';
// import { UserService } from './user.service';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../common/guards/roles.guard';
// import { Roles } from '../common/decorators/roles.decorator';
// import { Role } from '../common/enums/role.enum';

// @Controller('users')
// export class UserController {
//   constructor(private readonly userService: UserService) {}

//   @Post()
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(Role.Admin, Role.Owner)
//   create(@Body() createUserDto: CreateUserDto) {
//     return this.userService.create(createUserDto);
//   }

//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(Role.Admin, Role.Owner) 
//   @Get()
//   findAll() {
//     return this.userService.findAll();
//   }

//   @Get(':id')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(Role.Admin, Role.Owner)
//   findOne(@Param('id') id: string) {
//     return this.userService.findOne(id);
//   }

//   @Patch(':id')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(Role.Admin, Role.Owner)
//   update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
//     return this.userService.update(id, updateUserDto);
//   }

//   @Put(':id/role')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(Role.Admin)
//   async updateUserRole(@Param('id') userId: string, @Body('role') role: Role) {
//     return this.userService.updateUserRole(userId, role);
//   }

//   @Delete(':id')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(Role.Admin)
//   remove(@Param('id') id: string) {
//     return this.userService.remove(id);
//   }

//   @Get()
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(Role.Admin)
//   getUsers() {
//     return this.userService.findAll();
//   }
// }


import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(Role.Admin, Role.Owner)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles(Role.Admin, Role.Owner)
  findAll() {
    return this.userService.findAll();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin) 
  getUsers() {
    return this.userService.findAll();
  }

  @Get(':id')
  @Roles(Role.Admin, Role.Owner)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.Owner)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Put(':id/role')
  @Roles(Role.Admin)
  async updateUserRole(@Param('id') userId: string, @Body('role') role: Role) {
    return this.userService.updateUserRole(userId, role);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
