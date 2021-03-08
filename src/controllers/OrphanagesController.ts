import { NextFunction, Request, Response } from "express";
import { getCustomRepository, getRepository } from "typeorm";
import * as Yup from "yup";
import { AppError } from "../errors/AppError";
import Image from "../models/Image";
import { OrphanagesRepository } from "../repositories/OrphanagesRepository";
import orphanageView from "../views/orphanages_view";

interface MulterFile {
  key?: string;
  location?: string;
}

export default {
  async show(req: Request, res: Response) {
    const { id } = req.params;
    const orphanagesRepository = getCustomRepository(OrphanagesRepository);

    const orphanage = await orphanagesRepository.findOneOrFail(id, {
      relations: ["images"],
    });

    return res.json(orphanageView.render(orphanage));
  },

  async index(req: Request, res: Response) {
    const orphanagesRepository = getCustomRepository(OrphanagesRepository);

    const orphanages = await orphanagesRepository.find({
      where: { accept: true },
      relations: ["images"],
    });

    if (orphanages) {
      return res.json(orphanageView.renderMany(orphanages));
    } else {
      throw new AppError('There is no orphanage accepted or available');
    }
  },

  async indexPending(req: Request, res: Response) {
    const orphanagesRepository = getCustomRepository(OrphanagesRepository);

    const orphanages = await orphanagesRepository.find({
      where: { accept: false },
      relations: ["images"],
    });

    if (orphanages) {
      return res.json(orphanageView.renderMany(orphanages));
    } else {
      throw new AppError('There is no orphanage available');
    }
  },

  async pending(req: Request, res: Response) {
    const { id } = req.params;
    const orphanagesRepository = getCustomRepository(OrphanagesRepository);

    const data = {
      accept: true,
    };

    await orphanagesRepository.update(id, data);
    return res.status(200).json({ id: id, message: "Orphanage Accepted" });
  },

  async create(req: Request & { file: MulterFile }, res: Response) {
    const {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
    } = req.body;

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      latitude: Yup.number().required(),
      longitude: Yup.number().required(),
      about: Yup.string().required().max(300),
      instructions: Yup.string().required(),
      opening_hours: Yup.string().required(),
      open_on_weekends: Yup.boolean().required(),
      images: Yup.array(
        Yup.object().shape({
          path: Yup.string().required(),
        })
      ),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
      throw new AppError(err.errors[0])
    }

    const orphanagesRepository = getCustomRepository(OrphanagesRepository);

    const requestImages = req.files as Express.Multer.File[];

    const images = requestImages.map((image) => {
      return {
        name: image.originalname,
        size: image.size,
        key: image.filename,
        url: image.path || ''
      };
    });

    const orphanageExists = await orphanagesRepository.findOne({ where: { name } });

    if (orphanageExists) {
      throw new AppError('Orphanage already exists');
    }

    const data = {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends: open_on_weekends === "true",
      accept: false,
      images,
    };

    const orphanage = await orphanagesRepository.create(data);

    await orphanagesRepository.save(orphanage);
    return res.status(201).json(orphanage);
  },

  async update(req: Request, res: Response, next: NextFunction) {
    const {
      id,
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
      accept,
      id_images_remove,
    } = req.body;

    const orphanagesRepository = getCustomRepository(OrphanagesRepository);
    const imageRepository = getRepository(Image);

    // delete images 
    if (id_images_remove) {
      const images_keys = Array.isArray(id_images_remove)
        ? id_images_remove
        : Array(id_images_remove);

      images_keys.forEach(async (image) => {
        await imageRepository.delete(image);
      });
    }

    //new images
    const requestImages = req.files as Express.Multer.File[];
    if (requestImages) {
      requestImages.forEach(async (image) => {
        const img = imageRepository.create({
          name: image.originalname,
          size: image.size,
          key: image.filename,
          url: image.path || '',
          orphanage: id,
        });
        await imageRepository.save(img);
      });
    }

    // Update only data
    await orphanagesRepository.update(
      { id },
      {
        name,
        latitude,
        longitude,
        about,
        instructions,
        opening_hours,
        open_on_weekends: open_on_weekends === 'true',
        accept: accept === true,
      }
    );

    return res
      .status(204)
      .json({ message: 'Orphanage updated' });
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const orphanageRepository = getCustomRepository(OrphanagesRepository);

    await orphanageRepository.delete(id);

    return res.status(200).json({ message: 'Orphanage deleted' })
  },
};
