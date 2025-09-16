import { Router, Request, Response } from 'express';
import db from '../libs/db';
import { User } from '../types';
import { deleteUserLimiter } from '../middleware';

const router = Router();

/**
 * GET /users - List all users
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const users = db.prepare('SELECT * FROM users').all();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
    });
  }
});

/**
 * GET /users/:id - Get a user by ID
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const user = db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      error: 'Failed to fetch user',
    });
  }
});

/**
 * POST /users - Create a new user
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, email } = req.body as User;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({
        error: 'Name and email are required',
      });
    }

    const result = db
      .prepare('INSERT INTO users (name, email) VALUES (?, ?)')
      .run(name, email);

    const newUser: User = {
      id: result.lastInsertRowid as number,
      name,
      email,
    };

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      error: 'Failed to create user',
    });
  }
});

/**
 * PUT /users/:id - Update an existing user
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { name, email } = req.body as User;
    const id = req.params.id;

    // Validate input
    if (!name && !email) {
      return res.status(400).json({
        error: 'At least one field (name or email) is required for update',
      });
    }

    // Check if user exists
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Update only the fields that are provided
    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }

    if (email) {
      updates.push('email = ?');
      values.push(email);
    }

    if (updates.length > 0) {
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      values.push(id);

      db.prepare(query).run(...values);

      const updatedUser = db
        .prepare('SELECT * FROM users WHERE id = ?')
        .get(id);
      return res.json(updatedUser);
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      error: 'Failed to update user',
    });
  }
});

/**
 * DELETE /users/:id - Delete a user
 */
router.delete('/:id', deleteUserLimiter, (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    // Check if user exists
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    res.status(200).json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      error: 'Failed to delete user',
    });
  }
});

export default router;
