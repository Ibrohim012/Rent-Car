import { IsUUID, IsEnum, IsNumber, IsJSON, IsDateString } from 'class-validator';
import { TransactionStatus } from '../../common/enums/transaction-status.enum';

export class CreateTransactionDto {
  @IsUUID()
  company_id: string;

  @IsUUID()
  user_id: string;

  @IsJSON()
  user_data: string;

  @IsUUID()
  car_id: string;

  @IsJSON()
  car_data: string;

  @IsNumber()
  price: number;

  @IsDateString()
  start_date: Date;

  @IsDateString()
  end_date: Date;

  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @IsUUID()
  created_by: string;

  @IsUUID()
  last_edited_by: string;
}
