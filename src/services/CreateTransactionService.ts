import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateCategoryService from './CreateCategoryService';

interface Resquest {
  title: string;

  value: number;

  type: 'income' | 'outcome';

  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    category,
    value,
  }: Resquest): Promise<Transaction> {
    const transactionsBalance = getCustomRepository(TransactionsRepository);
    if (type === 'outcome') {
      const { total } = await transactionsBalance.getBalance();
      if (value > total) {
        throw new AppError('Value outcome greater than the balance.');
      }
    }

    const transactionRepository = getRepository(Transaction);
    const createCategoryService = new CreateCategoryService();
    const { id } = await createCategoryService.execute({ title: category });
    const transaction = transactionRepository.create({
      title,
      type,
      category_id: id,
      value,
    });
    await transactionRepository.save(transaction);
    return transaction;

    // TODO
  }
}

export default CreateTransactionService;
