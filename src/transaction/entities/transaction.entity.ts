import { TransactionStatus } from '../../common/enums/transaction-status.enum';

export class Transaction {
  id: string;
  company_id: string;
  user_id: string;
  user_data: JSON;
  car_id: string;
  car_data: JSON;
  price: number;
  start_date: Date;
  end_date: Date;
  status: TransactionStatus;
  created_at: Date;
  last_edited_at: Date;
  created_by: string;
  last_edited_by: string;
}
