import { getCustomRepository, In } from 'typeorm';
import csvParse from 'csv-parse';
import fs from 'fs';

import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoriesRepository from '../repositories/CategoriesRepository';
import Category from '../models/Category';

interface Request {
  file: string;
}

interface ParsedCsvPDO {
  title: string;
  type: 'income' | 'outcome';
  value: string;
  category: string;
}

class ImportTransactionsService {
  async execute({ file }: Request): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getCustomRepository(CategoriesRepository);

    const contactsReadStream = fs.createReadStream(
      `${uploadConfig.directory}/${file}`,
    );

    const parsers = csvParse({ from_line: 2, trim: true });

    const parseCSV = contactsReadStream.pipe(parsers);

    const transactions: ParsedCsvPDO[] = [];
    const categories: string[] = [];

    parseCSV.on('data', row => {
      const [title, type, value, category] = row;

      if (!title || !type || !value) return;

      transactions.push({ title, type, value, category });
      categories.push(category);
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const distinctCategories = categories.filter(
      (value, index, self) => self.indexOf(value) === index,
    );

    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(distinctCategories),
      },
    });

    const existentCategoriesTitle = existentCategories.map(
      category => category.title,
    );

    const addCategoryTitle = distinctCategories.filter(
      category => !existentCategoriesTitle.includes(category),
    );

    let newCategories: Category[] = [];

    if (addCategoryTitle.length > 0) {
      newCategories = categoriesRepository.create(
        addCategoryTitle.map(title => ({ title })),
      );

      await categoriesRepository.save(newCategories);
    }

    const allCategories = [...existentCategories, ...newCategories];

    const addTransactions = transactions.map(transaction => {
      const categoryFound = allCategories.find(
        category => category.title === transaction.category,
      );

      return {
        ...transaction,
        value: Number(transaction.value),
        category: categoryFound,
      };
    });

    const newTransactions = transactionsRepository.create(addTransactions);

    await transactionsRepository.save(newTransactions);

    return newTransactions;
  }
}

export default ImportTransactionsService;
