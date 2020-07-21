import { getCustomRepository } from 'typeorm';

// import AppError from '../errors/AppError';

import Category from '../models/Category';

import CategoriesRepository from '../repositories/CategoriesRepository';

interface Request {
  title: string;
}

class CreateCategoryService {
  public async execute({ title }: Request): Promise<Category> {
    const categoriesRepository = getCustomRepository(CategoriesRepository);

    const findCategory = await categoriesRepository.findByTitle(title);

    if (findCategory) {
      return findCategory;
    }

    const category = categoriesRepository.create({ title });

    await categoriesRepository.save(category);

    return category;
  }
}

export default CreateCategoryService;
