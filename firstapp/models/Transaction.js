'use strict';
const mongoose = require( 'mongoose' );
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;

var transactionSchema = Schema( {
  description: String,
  amount: Number,
  category: String,
  date: Date,
  userId: {type: ObjectId, ref:'user' }
});

module.exports = mongoose.model( 'Transaction', transactionSchema );
