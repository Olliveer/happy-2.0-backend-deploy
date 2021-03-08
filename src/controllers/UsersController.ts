import crypto from 'crypto';
import { Request, Response } from "express";
import { resolve } from 'path';
import { getCustomRepository } from "typeorm";
import jwt from 'jsonwebtoken';
import * as Yup from "yup";
import { AppError } from "../errors/AppError";
import { UsersRepository } from "../repositories/UsersRepository";
import SendMailService from '../services/SendMailService';
import PasswordHash from "../utils/passwordHash";
import usersView from "../views/users_view";


export default {
  async authenticate(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    const schema = Yup.object().shape({
      password: Yup.string().required(),
      email: Yup.string().required(),
    });

    try {
      await schema.validate(req.body, { abortEarly: true });
    } catch (err) {
      throw new AppError(err.errors[0])
    }

    const userRepository = getCustomRepository(UsersRepository);

    const user = await userRepository.findOne({ email });

    if (!user) {
      throw new AppError('Incorrect email or password');
    }

    if (!(await PasswordHash.checkHash(password, user.password))) {
      throw new AppError('Incorrect email or password');
    }

    return res.json({
      token: user.generateToken(),
    });
  },

  async forgot(req: Request, res: Response) {
    const { email } = req.body;

    const schema = Yup.object().shape({
      email: Yup.string().required(),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
      throw new AppError(err.errors[0]);
    }

    const userRepository = getCustomRepository(UsersRepository);

    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      throw new AppError('User not found');
    }

    const token = crypto.randomBytes(20).toString('hex');

    const now = new Date();
    now.setHours(now.getHours() + 1);

    await userRepository.update(user.id, {
      password_reset_token: token,
      password_reset_expires: now,
    });

    const npsPath = resolve(__dirname, '..', 'resources', 'mail', 'auth', 'forgotPassword.hbs');

    const variables = {
      name: user.name,
      title: 'Recovery password',
      description: 'Clique no link para criar uma nova senha',
      token: token,
      email: user.email,
      link: process.env.MAIL_URL
    }

    await SendMailService.execute(email, 'RESET', variables, npsPath);
    res.status(200).json({ message: 'Verify your e-mail :D' });
  },

  async reset(req: Request, res: Response) {
    const { password, token } = req.body;

    console.log(token)
    const schema = Yup.object().shape({
      password: Yup.string().required(),
    });

    try {
      await schema.validate(req.body, { abortEarly: true });
    } catch (err) {
      throw new AppError(err.errors[0])
    }

    const userRepository = getCustomRepository(UsersRepository);

    const user = await userRepository.findOne({ password_reset_token: token });

    if (!user) {
      throw new AppError('User not found');
    }

    if (token !== user.password_reset_token) {
      throw new AppError('Token invalid');
    }

    const now = new Date();

    if (now > user.password_reset_expires) {
      throw new AppError('Token expired, generate a new one');
    }

    const hashedPassword: string = await PasswordHash.hash(password);

    await userRepository.update(user.id, { password: hashedPassword, password_reset_token: '' });
    res.status(200).json({ message: 'password reseted successfully :)' })
  },

  async show(req: Request, res: Response) {
    const { id } = req.params;
    const userRepository = getCustomRepository(UsersRepository);

    const user = await userRepository.findOneOrFail(id);

    return res.json(usersView.render(user));
  },

  async index(req: Request, res: Response) {
    const usersRepository = getCustomRepository(UsersRepository);

    const users = await usersRepository.find();

    return res.json(usersView.renderMany(users));
  },

  async create(req: Request, res: Response) {
    const { name, email, password, admin } = req.body;

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
      password: Yup.string().required(),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
      throw new AppError(err.errors[0])
    }

    const userRepository = getCustomRepository(UsersRepository);

    const userExists = await userRepository.findOne({ where: { email } });

    if (userExists) {
      throw new AppError('User already exists');
    }

    const hashedPassword: string = await PasswordHash.hash(password);

    const data = {
      name,
      email,
      password: hashedPassword,
    };

    const user = await userRepository.create(data);

    await userRepository.save(user);
    res.status(200).json({ password: undefined, msg: 'User registred' });
  },

  async update(req: Request, res: Response) {
    const {
      id,
      name,
      email,
      password
    } = req.body;

    const schema = Yup.object().shape({
      id: Yup.string().required(),
      name: Yup.string().required(),
      email: Yup.string().required(),
      password: Yup.string(),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
      throw new AppError(err.errors[0])
    }

    const userRepository = getCustomRepository(UsersRepository);

    const user = await userRepository.findOne(id);

    const hashedPassword: string = await PasswordHash.hash(password);

    if (user) {
      await userRepository.update(
        { id },
        {
          name,
          email,
          password: (password === '') ? user?.password : hashedPassword
        }
      );

      res.status(200).json({ message: `User ${name} updated` });
    } else {
      throw new AppError('Update error');
    }
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const userRepository = getCustomRepository(UsersRepository);

    const user = await userRepository.findOneOrFail(id);

    userRepository.delete(user);

    return res.status(200).json({ message: 'User deleted' });
  },
};

