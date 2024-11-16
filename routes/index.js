import CaspioHelper from '../helpers/caspio';

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Test index' });
});

router.get('/users', async function(req, res, next) {
  const token = await CaspioHelper.getAccessToken();
  const rows = await CaspioHelper.getAll('tables', 'Users_ES', '',token);
  res.status(200).send(JSON.stringify(rows));
});

router.post('/users', async function (req, res, next) {
  const token = await CaspioHelper.getAccessToken();
  const {firstName, lastName, dateOfBirth, country, city, zipCode, address} = req.body;
  if (!firstName || !lastName || !dateOfBirth || !country || !city || !zipCode || !address) {
    res.status(400).json({message: 'All fields are required'});
  }
  const userData = {FirstName: firstName, LastName: lastName, DateOfBirth: dateOfBirth, Country: country, City: city, ZipCode: zipCode, Address: address};
  const response = await CaspioHelper.post('tables', 'Users_ES', userData, token);
  res.status(201).json({ message: 'User added successfully', user: response });
})

router.put('/users/:id', async function (req, res, next) {
  const token = await CaspioHelper.getAccessToken();
  const userID = req.params.id;
  if (!userID) {
    res.status(400).json({message: 'UserID is not specified'});
  }
  const {firstName, lastName, dateOfBirth, country, city, zipCode, address} = req.body;
  if (!firstName || !lastName || !dateOfBirth || !country || !city || !zipCode || !address) {
    res.status(400).json({message: 'All fields are required'});
  }
  const updateData = {FirstName: firstName, LastName: lastName, DateOfBirth: dateOfBirth, Country: country, City: city, ZipCode: zipCode, Address: address};
  const response = await CaspioHelper.put('tables', 'Users_ES', `q.where=UserID='${userID}'`, updateData, token);
  res.status(201).json({ message: 'User updated successfully', user: response });
})

router.delete('/users/:id', async function (req, res, next) {
  const token = await CaspioHelper.getAccessToken();
  const userID = req.params.id;
  if (!userID) {
    res.status(400).json({message: 'UserID is not specified'});
  }
  const response = await CaspioHelper.deleteRows('tables', 'Users_ES', `q.where=UserID='${userID}'`, token);
  res.status(201).json({ message: 'User deleted successfully', user: response });
})

module.exports = router;
