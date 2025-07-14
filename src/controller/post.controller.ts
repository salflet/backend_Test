import { Request, Response } from "express";
import { Post } from "../interface/interface";
import { pool } from "../database";
import jwt, { JwtPayload } from "jsonwebtoken";

declare module jsonwebtoken {
  export interface JwtPayload {
    user_id: string;
  }
}

export async function createPost(req: Request, res: Response) {
  try {
    const { body } = req;
    const headerToken = req.headers["authorization"];
    if (headerToken) {
      const bearerToken = headerToken?.slice(7);
      const tokenData = (await jwt.decode(bearerToken)) as JwtPayload;
      const { rows: author } = await pool.query(
        "SELECT username FROM user WHERE user_id = $1",
        [tokenData?.user_id]
      );
      //VERIFICAR SI EXISTE EL TITULO
      const { rows: exist } = await pool.query(
        "SELECT * FROM post WHERE title = $1",
        [body.title]
      );
      if (exist.length > 0) {
        return res.status(200).json({ message: "Title already exist" });
      }
      const post: Post = {
        title: body.title,
        post: body.post,
        author: author[0]?.username,
      };
      // CREAR POST
      await pool.query(
        "INSERT INTO post (title, post, author) VALUES ($1, $2, $3)",
        [post.title, post.post, post.author]
      );
      res
        .status(201)
        .json({ message: "Post created successfully", post: post });
    }
  } catch (error: any) {
    return res.status(400).json(error.message);
  }
}

export async function getPost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { rows: post } = await pool.query(
      "SELECT * FROM post WHERE post_id = $1",
      [id]
    );

    if (post.length === 0) {
      return res
        .status(204)
        .json({ message: `Post id_ ${id} no existe en nuestra Base de Datos` });
    }

    return res.status(200).json(post[0]);
  } catch (err: any) {
    return res.status(400).json(err.message);
  }
}

export async function getPosts(_req: Request, res: Response) {
  try {
    const { rows: posts } = await pool.query("SELECT * FROM post");

    if (posts.length == 0) {
      return res.json("Sin datos");
    } else {
      return res.status(200).json(posts);
    }
  } catch (error: any) {
    return res.status(400).json(error.message);
  }
}

export async function updatePost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { body } = req;
    const { rows: post } = await pool.query(
      "SELECT * FROM post WHERE post_id = $1",
      [id]
    );
    if (post.length === 0) {
      return res.status(204).json({ message: "Post Not Found" });
    }
    await pool.query(
      "UPDATE post SET title = $1, post = $2 WHERE post_id = $3",
      [body.title, body.post, id]
    );
    return res
      .status(200)
      .json({ message: `Post id: ${id} updated successfully` });
  } catch (error: any) {
    return res.status(400).json(error.message);
  }
}

export async function deletePost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { rows: post } = await pool.query(
      "SELECT * FROM post WHERE post_id = $1",
      [id]
    );
    if (post.length === 0) {
      return res.status(204).json({ message: "Post Not Found" });
    }
    await pool.query("DELETE FROM post WHERE post_id = $1 ", [id]);
    return res
      .status(200)
      .json({ message: `Post id: ${id} deleted successfully` });
  } catch (error: any) {
    return res.status(400).json(error.message);
  }
}