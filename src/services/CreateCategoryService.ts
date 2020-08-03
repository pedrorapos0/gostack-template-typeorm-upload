import { getRepository } from 'typeorm';

import Category from '../models/Category';

interface Request {
  title: string;
}

class CreateCategoryService {
  public async execute({ title }: Request): Promise<Category> {
    const categoryRepository = getRepository(Category);
    const category = await categoryRepository.findOne({
      where: { title },
    });
    if (category) {
      return category;
    }
    const newCategory = categoryRepository.create({ title });
    await categoryRepository.save(newCategory);
    return newCategory;
  }
}

export default CreateCategoryService;
