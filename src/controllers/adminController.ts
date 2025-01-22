import { Request, Response } from "express";

export const addUser = async (req: Request, res: Response) => {
  try {
    const user = req.params.user;
    res.status(201).json({ message: user });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
  } catch (error) {}
};
