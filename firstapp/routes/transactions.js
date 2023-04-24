const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

isLoggedIn = (req,res,next) => {
  if (res.locals.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

/**
 * Redirect to the transactions page
 */
router.get('/transactions', isLoggedIn, async (req, res) => {
  const sortBy = req.query.sortBy;
  let transactions = [];
  if (sortBy) {
    transactions = await Transaction.find({ userId: req.user._id }).sort({ [sortBy]: 1 });
  } else {
    transactions = await Transaction.find({ userId: req.user._id });
  }
  console.log("sort by: ", sortBy);
  // console.log('transaction: ', transactions);
  return res.render('transactions', { transactions });
});

/**
 * Handle transaction sorting by category
 */
router.get('/transaction/byCategory', isLoggedIn, async (req, res) => {
  const transactionByCategory = await Transaction.aggregate(
    [ 
      {
        $match: { userId: req.user._id }
            },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { amount: -1 } },              
    ]
  );
  console.log("transactionByCategory: ", transactionByCategory);
  res.render('transactionByCategory', { transactionByCategory });
});

/**
 * Handle the transaction form submit event
 */
router.post('/transactions', isLoggedIn, async (req, res) => {
  console.log(req.body);
  const { description, amount, category, date } = req.body;
  const transaction = {
    description,
    amount,
    category,
    date,
    userId: req.user._id
  };
  await Transaction.insertMany([transaction]);
  res.redirect('/transactions');
});

/**
 * Handle delete transaction
 */
router.get('/transactions/remove/:id', isLoggedIn, async (req, res) => {
  await Transaction.deleteOne({ _id: req.params.id });
  res.redirect('/transactions');
});

/**
 * redirect transaction editing page
 */
router.get('/transactions/edit/:id', isLoggedIn, async (req, res) => {
  const transaction = await Transaction.findOne({ _id: req.params.id });
  res.render('editTransaction', { transaction });
});

/**
 * Handle the editing transaction submit event
 */
router.post('/transactions/edit/:id', isLoggedIn, async (req, res) => {
  const { description, amount, category, date } = req.body;
  await Transaction.findOneAndUpdate(
    {
    _id: req.params.id
    },
    {
      $set: {
        description,
        amount,
        category,
        date
      }
    }
  );
  res.redirect('/transactions');
});

module.exports = router;