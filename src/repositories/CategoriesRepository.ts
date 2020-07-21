import { EntityRepository, Repository } from 'typeorm';

import Category from '../models/Category';

@EntityRepository(Category)
class CategoriesRespositorie extends Repository<Category> {
  public async findByTitle(category: string): Promise<Category | null> {
    const findCategory = await this.findOne({ where: { title: category } });

    return findCategory || null;
  }
}

export default CategoriesRespositorie;
