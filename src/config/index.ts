import 'dotenv/config';

export default module.exports = {
  port: process.env.PORT || 8000,
  jwtSecret: process.env.JWT_SECRET || 'somesecrettoken',
};
