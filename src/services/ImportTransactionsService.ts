import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { getRepository, In } from 'typeorm';

import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  filename: string;
}
interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  category: string;
  value: number;
}

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  category: string;
  value: number;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const csvFilePath = path.resolve(uploadConfig.directory, filename);
    const readCSVStream = fs.createReadStream(csvFilePath);
    const categoryRepository = getRepository(Category);
    const transactionRepository = getRepository(Transaction);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );
      if (!title || !type || !value) return;

      transactions.push({ title, type, category, value });
      categories.push(category);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const categoriesExisting = await categoryRepository.find({
      where: { title: In(categories) },
    });
    const categoriesTitleExisting = categoriesExisting.map(
      (category: Category) => category.title,
    );
    const categoriesTitleNotExisting = categories
      .filter(category => !categoriesTitleExisting.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);
    const newCategories = categoryRepository.create(
      categoriesTitleNotExisting.map(title => ({
        title,
      })),
    );

    await categoryRepository.save(newCategories);
    const finalcategories = [...newCategories, ...categoriesExisting];
    const createdTransactions = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalcategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );
    const transactionSaved = await transactionRepository.save(
      createdTransactions,
    );
    await fs.promises.unlink(csvFilePath);
    return transactionSaved;
    // TODO
  }
}

export default ImportTransactionsService;
