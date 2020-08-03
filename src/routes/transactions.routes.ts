import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import uploadConfig from '../config/upload';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionRepository.find({
    relations: ['category'],
  });
  transactions.map(
    transaction => (transaction.value = Number(transaction.value)),
  );
  const balance = await transactionRepository.getBalance();
  return response.json({ transactions, balance });
  // TODO
});

transactionsRouter.post('/', async (request, response) => {
  const { title, type, category, value } = request.body;
  const createTransactionService = new CreateTransactionService();
  const transaction = await createTransactionService.execute({
    title,
    type,
    category,
    value,
  });

  return response.json(transaction);

  // TODO
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute({ id });
  return response.status(204).send();
  // TODO
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const { filename } = request.file;
    const importTransactionsService = new ImportTransactionsService();
    const transactions = await importTransactionsService.execute({ filename });
    return response.json(transactions);
    // TODO
  },
);

export default transactionsRouter;
