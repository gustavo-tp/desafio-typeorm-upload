import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  transaction_id: string;
}

class DeleteTransactionService {
  public async execute({ transaction_id }: Request): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transaction = await transactionsRepository.findOne(transaction_id);

    if (!transaction) {
      throw new AppError('Transaction does not exist');
    }

    await transactionsRepository.remove(transaction);
  }
}

export default DeleteTransactionService;
