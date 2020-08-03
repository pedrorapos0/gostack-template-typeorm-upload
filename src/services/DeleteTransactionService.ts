import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

interface Request {
  id: string;
}
class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionRepository = getRepository(Transaction);
    const transactionExist = await transactionRepository.findOne(id);
    if (!transactionExist) {
      throw new AppError('Transaction not exist.');
    }
    await transactionRepository.delete(id);
    // TODO
  }
}

export default DeleteTransactionService;
