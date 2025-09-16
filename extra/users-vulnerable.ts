import { Router, Request, Response } from 'express';
import db from '../libs/db';
import { User } from '../types';
import { deleteUserLimiter } from '../middleware';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

// Hardcoded secrets - CodeQL detectará esto como una vulnerabilidad
const API_KEY = 'sk_test_51HV4nEJIbSIx3vIhjh8zsGnVW7MBDy';
const DB_PASSWORD = 'super_secret_password123!';
const JWT_SECRET = 'my_very_secret_key_for_jwt_tokens';

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

/**
 * GET /users/search - Search users by name or email
 * Vulnerable to SQL Injection
 */
router.get('/search', (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.q;
    // VULNERABLE: SQL Injection - concatenación directa de parámetros
    const query = `SELECT * FROM users WHERE name LIKE '%${searchTerm}%' OR email LIKE '%${searchTerm}%'`;
    const users = db.prepare(query).all();
    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

/**
 * POST /users/check-system - Verifica si un usuario existe en el sistema operativo
 * Vulnerable a Command Injection
 */
router.post('/check-system', (req: Request, res: Response) => {
  const { username } = req.body;
  // VULNERABLE: Command Injection - usando entrada de usuario directamente en exec
  exec(
    `whoami && echo Checking if ${username} exists`,
    (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ error: stderr });
      }
      res.json({ result: stdout });
    },
  );
});

/**
 * GET /users/file/:name - Obtiene el contenido de un archivo
 * Vulnerable a Path Traversal
 */
router.get('/file/:name', (req: Request, res: Response) => {
  const fileName = req.params.name;
  // VULNERABLE: Path Traversal - uso inseguro de entrada de usuario en rutas de archivos
  const filePath = path.join(__dirname, '../../../public/users', fileName);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    res.send(content);
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

/**
 * POST /users/eval - Evalúa una expresión JavaScript
 * Vulnerable a uso inseguro de eval
 */
router.post('/eval', (req: Request, res: Response) => {
  const { code } = req.body;
  try {
    // VULNERABLE: Uso inseguro de eval - evaluación dinámica de código
    const result = eval(code);
    res.json({ result });
  } catch (error) {
    res.status(400).json({ error: 'Invalid code' });
  }
});

export default router;
