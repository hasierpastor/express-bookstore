process.env.NODE_ENV = 'test';
const db = require('../db');

const request = require('supertest');
const app = require('../app');

beforeEach(async function() {
  //seed with some data
  await db.query(
    `INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
    VALUES ('1', 'www.amazon.com/1', 'Juan Areces', 'spanish', 4, 
    'Princeton Press', 'Los Perros', 2018)`
  );
});

afterEach(async function() {
  await db.query('DELETE FROM books');
});

afterAll(async function() {
  await db.end();
});

describe('GET /:isbn ', function() {
  test('Should a book in the db', async function() {
    const response = await request(app).get('/books');
    expect(response.body).toEqual({
      books: [
        {
          isbn: '1',
          amazon_url: 'www.amazon.com/1',
          author: 'Juan Areces',
          language: 'spanish',
          pages: 4,
          publisher: 'Princeton Press',
          title: 'Los Perros',
          year: 2018
        }
      ]
    });
    expect(response.statusCode).toBe(200);
  });
});

describe('POST /books ', function() {
  test('Should make a new book in our db', async function() {
    const newBook = await request(app)
      .post('/books')
      .send({
        isbn: '2',
        amazon_url: 'www.amazon.com/goodbye',
        author: 'Juanito Areces',
        language: 'english',
        pages: 4234234,
        publisher: 'Princeton University Press',
        title: 'Viva Argentina',
        year: 2017
      });

    expect(newBook.body.book).toHaveProperty('isbn');
    expect(newBook.body.book.title).toBe('Viva Argentina');
    expect(newBook.statusCode).toBe(201);

    const response = await request(app).get('/books');
    expect(response.body.books.length).toBe(2);
  });
});

describe('PATCH /books/:isbn ', function() {
  test('Update a book in our db', async function() {
    const updatedBook = await request(app)
      .patch('/books/1')
      .send({
        amazon_url: 'www.amazon.com/goodbye',
        author: 'Juanito Areces',
        language: 'english',
        pages: 4234234,
        publisher: 'Princeton University Press',
        title: 'Viva Argentina',
        year: 2017
      });

    expect(updatedBook.body.book).toHaveProperty('isbn');
    expect(updatedBook.body.book.title).toBe('Viva Argentina');
    expect(updatedBook.statusCode).toBe(200);

    const response = await request(app).get('/books');
    expect(response.body.books.length).toBe(1);
  });
});

describe('DELETE /books/:isbn ', function() {
  test('delete a book in our db', async function() {
    const deletedBook = await request(app).delete('/books/1');

    expect(deletedBook.statusCode).toBe(200);

    const response = await request(app).get('/books');
    expect(response.body.books.length).toBe(0);
  });
});
