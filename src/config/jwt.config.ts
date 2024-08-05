import { ConfigService } from '@nestjs/config';

export const jwtConfig = {
  provide: 'JWT_SECRET',
  useFactory: (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'),
  }),
  inject: [ConfigService],
};
