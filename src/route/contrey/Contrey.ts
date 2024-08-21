import { Router } from 'express';
import mysql from 'mysql2/promise';
import connection from './../../database/database';

const CountryRouter = Router();

// إعداد الاتصال بقاعدة البيانات

// إنشاء بلد جديد
CountryRouter.post('/createcountries', async (req, res) => {
  const { countryName } = req.body;
  try {
    const [result]:any= await connection.execute(
      'INSERT INTO country (countryName) VALUES (?)',
      [countryName]
    );
    res.status(201).json({ id: result.insertId, countryName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء البلد' });
  }
});

// قراءة جميع البلدان
CountryRouter.get('/countries', async (req, res) => {
  try {
    const [countries]:any = await connection.execute('SELECT * FROM country');
    res.status(200).json(countries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء استرجاع البلدان' });
  }
});

// قراءة بلد واحد حسب المعرف
CountryRouter.get('/countries/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [countries]:any = await connection.execute(
      'SELECT * FROM country WHERE id = ?',
      [parseInt(id)]
    );
    if (countries.length > 0) {
      res.status(200).json(countries[0]);
    } else {
      res.status(404).json({ error: 'البلد غير موجود' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء استرجاع البلد' });
  }
});

// تحديث بلد حسب المعرف
CountryRouter.put('/countriesupdeta/:id', async (req, res) => {
  const { id } = req.params;
  const { countryName } = req.body;
  try {
    const [result]:any = await connection.execute(
      'UPDATE country SET countryName = ? WHERE id = ?',
      [countryName, parseInt(id)]
    );
    if (result.affectedRows > 0) {
      res.status(200).json({ id, countryName });
    } else {
      res.status(404).json({ error: 'البلد غير موجود' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث البلد' });
  }
});

// حذف بلد حسب المعرف
CountryRouter.delete('/deletecountries/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result]:any = await connection.execute(
      'DELETE FROM country WHERE id = ?',
      [parseInt(id)]
    );
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'تم حذف البلد بنجاح' });
    } else {
      res.status(404).json({ error: 'البلد غير موجود' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف البلد' });
  }
});

// إنشاء مدينة جديدة وربطها ببلد
CountryRouter.post('/countries/:countryId/createcities', async (req, res) => {
  const { countryId } = req.params;
  const { cityName } = req.body;
  try {
    const [result]:any = await connection.execute(
      'INSERT INTO city (cityName, countryId) VALUES (?, ?)',
      [cityName, parseInt(countryId)]
    );
    res.status(201).json({ id: result.insertId, cityName, countryId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء المدينة' });
  }
});

// قراءة جميع المدن في بلد معين
CountryRouter.get('/countries/:countryId/cities', async (req, res) => {
  const { countryId } = req.params;
  try {
    const [cities]:any = await connection.execute(
      'SELECT * FROM city WHERE countryId = ?',
      [parseInt(countryId)]
    );
    res.status(200).json(cities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء استرجاع المدن' });
  }
});

// قراءة جميع البلدان والمدن المرتبطة بها
CountryRouter.get('/getcountriesandcities', async (req, res) => {
  try {
    const [countriesAndCities]:any = await connection.execute(`
      SELECT country.id AS countryId, country.countryName, city.id AS cityId, city.cityName
      FROM country
      LEFT JOIN city ON country.id = city.countryId
    `);
    res.status(200).json(countriesAndCities);
  } catch (error) {
    console.error('Error fetching countries and cities:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء استرجاع البلدان والمدن' });
  }
});

export default CountryRouter;
