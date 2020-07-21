import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const incomeTransactions = transactions.filter(
      transaction => transaction.type === 'income',
    );

    const outcomeTransactions = transactions.filter(
      transaction => transaction.type === 'outcome',
    );

    const totalIncome = incomeTransactions.reduce(
      (amount, transaction) => amount + Number(transaction.value),
      0,
    );

    const totalOutcome = outcomeTransactions.reduce(
      (amount, transaction) => amount + Number(transaction.value),
      0,
    );

    const balance = {
      income: totalIncome,
      outcome: totalOutcome,
      total: totalIncome - totalOutcome,
    };

    return balance;
  }
}

export default TransactionsRepository;
