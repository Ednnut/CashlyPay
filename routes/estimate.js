/*
Copyright 2020 Square Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const express = require('express');
const Joi = require('joi');
const { customersApi, locationsApi } = require('../util/square-client');
const serviceCatalog = require('../config/services');
const estimateStore = require('../util/estimate-store');

const router = express.Router();

const currencySchema = Joi.string().trim().uppercase().length(3);

const createEstimateSchema = Joi.object({
  customerId: Joi.string().required(),
  locationId: Joi.string().required(),
  serviceId: Joi.string().required(),
  amount: Joi.number().integer().positive().required(),
  currency: currencySchema.required(),
  discountPercent: Joi.number().min(0).max(100).default(0),
  depositPercentage: Joi.number().min(0).max(100).default(0),
  taxPercent: Joi.number().min(0).max(100).default(0),
  surchargeAmount: Joi.number().integer().min(0).default(0),
  notes: Joi.string().allow('').max(500).default(''),
});

const calculateTotals = ({
  amount,
  discountPercent,
  surchargeAmount,
  taxPercent,
  depositPercentage,
}) => {
  const discountAmount = Math.round((amount * discountPercent) / 100);
  const discountedSubtotal = amount - discountAmount;
  const taxedBase = discountedSubtotal + surchargeAmount;
  const taxAmount = Math.round((taxedBase * taxPercent) / 100);
  const totalAmount = taxedBase + taxAmount;
  const depositAmount = Math.round((totalAmount * depositPercentage) / 100);
  const balanceDue = totalAmount - depositAmount;

  return {
    discountAmount,
    discountedSubtotal,
    taxAmount,
    totalAmount,
    depositAmount,
    balanceDue,
  };
};

router.get('/new/:locationId/:customerId', async (req, res, next) => {
  const { locationId, customerId } = req.params;
  try {
    const [
      {
        result: { customer },
      },
      {
        result: { location },
      },
    ] = await Promise.all([
      customersApi.retrieveCustomer(customerId),
      locationsApi.retrieveLocation(locationId),
    ]);

    res.render('estimate', {
      customer,
      locationId,
      serviceItems: serviceCatalog.services,
      defaultCurrency: location.currency || 'USD',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/create', async (req, res, next) => {
  try {
    const payload = await createEstimateSchema.validateAsync(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const service = serviceCatalog.services.find((item) => item.id === payload.serviceId);
    if (!service) {
      const err = new Error('Selected service is no longer available.');
      err.status = 400;
      throw err;
    }

    const totals = calculateTotals(payload);

    const estimate = estimateStore.createEstimate({
      locationId: payload.locationId,
      customerId: payload.customerId,
      serviceId: payload.serviceId,
      serviceName: service.name,
      amount: payload.amount,
      currency: payload.currency,
      discountPercent: payload.discountPercent,
      depositPercentage: payload.depositPercentage,
      taxPercent: payload.taxPercent,
      surchargeAmount: payload.surchargeAmount,
      notes: payload.notes,
      ...totals,
    });

    res.redirect(`/management/${payload.locationId}/${payload.customerId}?estimate=${estimate.id}`);
  } catch (error) {
    if (error.isJoi) {
      error.status = 400;
      error.errors = error.details.map((detail) => detail.message);
    }
    next(error);
  }
});

module.exports = router;
