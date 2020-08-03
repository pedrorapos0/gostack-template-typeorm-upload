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
    const incomes = await this.find({
      where: { type: 'income' },
    });
    const outcomes = await this.find({
      where: { type: 'outcome' },
    });

    const sumIncome = incomes.reduce((sum, income) => {
      sum += Number(income.value);
      return sum;
    }, 0);

    const sumOutcome = outcomes.reduce((sum, outcome) => {
      sum += Number(outcome.value);
      return sum;
    }, 0);

    return {
      income: sumIncome,
      outcome: sumOutcome,
      total: sumIncome - sumOutcome,
    };
    // TODO
  }
}

export default TransactionsRepository;
